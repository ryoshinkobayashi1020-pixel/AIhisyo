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

function scoreText(queryGrams, targetText) {
  if (!queryGrams.length) return 0;
  const targetGrams = bigrams(targetText);
  if (!targetGrams.length) return 0;
  const targetSet = new Map();
  for (const gram of targetGrams) targetSet.set(gram, (targetSet.get(gram) || 0) + 1);
  let hits = 0;
  for (const gram of queryGrams) {
    if (targetSet.has(gram)) hits += 1;
  }
  return hits / queryGrams.length;
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

export async function searchKnowledge(query, limit = 5) {
  const supabase = getClient();
  if (!supabase) throw new Error("Supabaseが設定されていません。");
  const queryGrams = bigrams(query);
  if (!queryGrams.length) return [];

  const { data: chunks, error: chunkError } = await supabase
    .from("liver_chunks")
    .select("id, document_id, page, content")
    .eq("staff_id", STAFF_ID)
    .limit(4000);
  if (chunkError) throw new Error(`資料内容の検索に失敗しました：${chunkError.message}`);

  const { data: documents, error: docError } = await supabase
    .from("liver_documents")
    .select("id, category, file_name, file_ext")
    .eq("staff_id", STAFF_ID);
  if (docError) throw new Error(`資料一覧の取得に失敗しました：${docError.message}`);
  const documentMap = new Map((documents || []).map(doc => [doc.id, doc]));

  const scored = [];
  for (const chunk of chunks || []) {
    const doc = documentMap.get(chunk.document_id);
    if (!doc) continue;
    const titleBoost = scoreText(queryGrams, `${doc.category} ${doc.file_name}`) * 0.6;
    const contentScore = scoreText(queryGrams, chunk.content);
    const total = contentScore + titleBoost;
    if (total <= 0) continue;
    scored.push({ chunk, doc, score: total });
  }

  // ファイル名・カテゴリだけで一致する資料（画像など本文チャンクが無いもの）も候補に含める
  for (const doc of documents || []) {
    const titleScore = scoreText(queryGrams, `${doc.category} ${doc.file_name}`);
    if (titleScore <= 0) continue;
    const alreadyIncluded = scored.some(item => item.doc.id === doc.id);
    if (alreadyIncluded) continue;
    scored.push({ chunk: { page: 0, content: "" }, doc, score: titleScore * 0.6 });
  }

  scored.sort((a, b) => b.score - a.score);

  const seenDocuments = new Set();
  const results = [];
  for (const item of scored) {
    if (seenDocuments.has(item.doc.id)) continue;
    seenDocuments.add(item.doc.id);
    results.push({
      documentId: item.doc.id,
      category: item.doc.category,
      fileName: item.doc.file_name,
      fileExt: item.doc.file_ext,
      page: item.chunk.page,
      snippet: item.chunk.content ? buildSnippet(item.chunk.content, queryGrams) : "",
      // 回答文生成のためにAIへ渡す抜粋。資料全文ではなく該当箇所の周辺だけに絞る。
      excerpt: item.chunk.content ? buildSnippet(item.chunk.content, queryGrams, 700) : "",
      score: item.score,
    });
    if (results.length >= limit) break;
  }
  return results;
}
