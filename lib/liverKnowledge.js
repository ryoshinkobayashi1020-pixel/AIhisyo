import { createClient } from "@supabase/supabase-js";

const BUCKET = "materials";
const STAFF_ID = "liver_assistant";

let client = null;
function getClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  client = createClient(url, serviceKey, { auth: { persistSession: false } });
  return client;
}

export function isLiverKnowledgeConfigured() {
  return Boolean(getClient());
}

export async function saveDocument({ category, fileName, fileExt, buffer, contentType, pageCount = 0 }) {
  const supabase = getClient();
  if (!supabase) throw new Error("Supabaseが設定されていません。");
  const { data: doc, error: insertError } = await supabase
    .from("liver_documents")
    .insert({ staff_id: STAFF_ID, category, file_name: fileName, file_ext: fileExt, storage_path: "", page_count: pageCount })
    .select("id")
    .single();
  if (insertError) throw new Error(`資料の登録に失敗しました：${insertError.message}`);

  const storagePath = `${doc.id}.${fileExt}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: true,
  });
  if (uploadError) throw new Error(`資料のアップロードに失敗しました：${uploadError.message}`);

  const { error: updateError } = await supabase.from("liver_documents").update({ storage_path: storagePath }).eq("id", doc.id);
  if (updateError) throw new Error(`資料の保存先更新に失敗しました：${updateError.message}`);

  return doc.id;
}

export async function saveChunks(documentId, chunks) {
  if (!chunks.length) return;
  const supabase = getClient();
  if (!supabase) throw new Error("Supabaseが設定されていません。");
  const rows = chunks.map(chunk => ({
    document_id: documentId,
    staff_id: STAFF_ID,
    page: chunk.page,
    content: chunk.content,
  }));
  // 大量ページのPDFでも1回のリクエストが大きくなりすぎないよう分割して挿入する
  for (let i = 0; i < rows.length; i += 200) {
    const batch = rows.slice(i, i + 200);
    const { error } = await supabase.from("liver_chunks").insert(batch);
    if (error) throw new Error(`資料内容の保存に失敗しました：${error.message}`);
  }
}

export async function getMaterialSignedUrl(documentId, expiresInSeconds = 60 * 10) {
  const supabase = getClient();
  if (!supabase) throw new Error("Supabaseが設定されていません。");
  const { data: doc, error: docError } = await supabase
    .from("liver_documents")
    .select("storage_path")
    .eq("id", documentId)
    .single();
  if (docError) throw new Error(`資料が見つかりませんでした：${docError.message}`);
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.storage_path, expiresInSeconds);
  if (error) throw new Error(`資料URLの発行に失敗しました：${error.message}`);
  return data.signedUrl;
}

// 日本語は単語間にスペースが無いため、文字2-gram(バイグラム)の重なりで
// 簡易的な関連度スコアを付ける。外部AIを使わず、資料内検索だけで完結させる。
function bigrams(text) {
  const clean = String(text || "").replace(/\s+/g, "");
  const grams = [];
  for (let i = 0; i < clean.length - 1; i++) grams.push(clean.slice(i, i + 2));
  if (grams.length === 0 && clean.length > 0) grams.push(clean);
  return grams;
}

// 全ページに入っている定型の著作権・秘密保持表記は検索ノイズになるだけなので取り除く。
function stripBoilerplate(text) {
  return String(text || "")
    .replace(/Copyright\s*©\s*Ni-ni\s*create/gi, " ")
    .replace(/当資料は秘密保持に沿って[^。]*。/g, " ")
    .replace(/公開が確認できた場合は[^。]*。/g, " ")
    .replace(/損害賠償請求とさせて頂くため[^。]*。/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// 「〜について教えてください」のような、どの資料にも当てはまる言い回しは
// 検索語から外して、内容語だけで一致を見る。
function normalizeQuery(query) {
  return String(query || "")
    .replace(/(について|に関して|を教えて|教えて|ください|下さい|ですか|でしょうか|かな|かねる|しますか|したい|とは|って|なの|ますか|です|ます|お願いします)/g, " ")
    .replace(/[、。？?！!・「」（）()\s]+/g, " ")
    .trim();
}

// 珍しい語ほど重く見る(IDF)。「ライバー」「配信」のようにどの資料にも出る語で
// 埋もれず、「バディ制度」「レベニュー」のような固有語が効くようにする。
function buildIdf(queryGrams, chunkGramSets, totalChunks) {
  const idf = new Map();
  for (const gram of queryGrams) {
    let df = 0;
    for (const set of chunkGramSets) if (set.has(gram)) df += 1;
    idf.set(gram, Math.log(1 + totalChunks / (1 + df)));
  }
  return idf;
}

function weightedScore(queryGrams, idf, targetSet) {
  let hit = 0;
  let total = 0;
  for (const gram of queryGrams) {
    const weight = idf.get(gram) || 0;
    total += weight;
    if (targetSet.has(gram)) hit += weight;
  }
  return total > 0 ? hit / total : 0;
}

function buildSnippet(content, queryGrams, maxLength = 160) {
  const clean = String(content || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  // クエリのbigramが最初に現れる位置の周辺を抜粋する
  let bestIndex = 0;
  for (const gram of queryGrams) {
    const idx = clean.indexOf(gram);
    if (idx >= 0) {
      bestIndex = Math.max(0, idx - 40);
      break;
    }
  }
  const excerpt = clean.slice(bestIndex, bestIndex + maxLength);
  return `${bestIndex > 0 ? "…" : ""}${excerpt}${bestIndex + maxLength < clean.length ? "…" : ""}`;
}

// Supabaseから全チャンクを毎回取り直すと遅いので、同じサーバーインスタンス内では短時間キャッシュする。
let corpusCache = null;
const CORPUS_TTL_MS = 5 * 60 * 1000;

async function loadCorpus() {
  if (corpusCache && Date.now() - corpusCache.loadedAt < CORPUS_TTL_MS) return corpusCache;
  const supabase = getClient();
  if (!supabase) throw new Error("Supabaseが設定されていません。");

  const chunks = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("liver_chunks")
      .select("id, document_id, page, content")
      .eq("staff_id", STAFF_ID)
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`資料内容の検索に失敗しました：${error.message}`);
    chunks.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }

  const { data: documents, error: docError } = await supabase
    .from("liver_documents")
    .select("id, category, file_name, file_ext")
    .eq("staff_id", STAFF_ID);
  if (docError) throw new Error(`資料一覧の取得に失敗しました：${docError.message}`);

  const prepared = chunks.map(chunk => {
    const text = stripBoilerplate(chunk.content);
    return { ...chunk, text, gramSet: new Set(bigrams(text)) };
  });

  corpusCache = {
    loadedAt: Date.now(),
    chunks: prepared,
    documents: documents || [],
    documentMap: new Map((documents || []).map(doc => [doc.id, doc])),
  };
  return corpusCache;
}

// 1資料あたり最大何ページまで回答の根拠として拾うか。
// 報酬表のように表が複数ページにまたがる資料でも中身が欠けないようにする。
const MAX_PAGES_PER_DOCUMENT = 3;

export async function searchKnowledge(query, limit = 8) {
  const normalized = normalizeQuery(query);
  const queryGrams = [...new Set(bigrams(normalized || query))];
  if (!queryGrams.length) return [];

  const corpus = await loadCorpus();
  const idf = buildIdf(queryGrams, corpus.chunks.map(chunk => chunk.gramSet), corpus.chunks.length);

  const titleScores = new Map();
  for (const doc of corpus.documents) {
    const titleSet = new Set(bigrams(`${doc.category} ${doc.file_name}`));
    titleScores.set(doc.id, weightedScore(queryGrams, idf, titleSet));
  }

  const scored = [];
  for (const chunk of corpus.chunks) {
    const doc = corpus.documentMap.get(chunk.document_id);
    if (!doc) continue;
    const contentScore = weightedScore(queryGrams, idf, chunk.gramSet);
    const base = contentScore + (titleScores.get(doc.id) || 0) * 0.5;
    if (base <= 0) continue;
    // 表紙や見出しだけのページが上位を占めないよう、本文量のあるページを優先する
    const lengthFactor = 0.55 + 0.45 * Math.min(1, chunk.text.length / 300);
    scored.push({ chunk, doc, score: base * lengthFactor });
  }

  // 画像など本文が無い資料は、ファイル名・カテゴリの一致だけで候補に入れる
  for (const doc of corpus.documents) {
    const titleScore = titleScores.get(doc.id) || 0;
    if (titleScore <= 0) continue;
    if (scored.some(item => item.doc.id === doc.id)) continue;
    scored.push({ chunk: { page: 0, text: "" }, doc, score: titleScore * 0.5 });
  }

  scored.sort((a, b) => b.score - a.score);

  const perDocument = new Map();
  const results = [];
  for (const item of scored) {
    const used = perDocument.get(item.doc.id) || 0;
    if (used >= MAX_PAGES_PER_DOCUMENT) continue;
    perDocument.set(item.doc.id, used + 1);
    results.push({
      documentId: item.doc.id,
      category: item.doc.category,
      fileName: item.doc.file_name,
      fileExt: item.doc.file_ext,
      page: item.chunk.page,
      snippet: item.chunk.text ? buildSnippet(item.chunk.text, queryGrams) : "",
      // 回答文生成のためにAIへ渡す本文。ヒットしたページの全文を渡すことで、
      // 表や金額のように文中に散らばる情報も答えられるようにする。
      excerpt: item.chunk.text || "",
      score: item.score,
    });
    if (results.length >= limit) break;
  }
  return results;
}
