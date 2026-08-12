// ライバー部署アシスタント(ひなた)の知識ベースへ、ローカルフォルダの資料を
// まとめて一度だけ取り込むスクリプト。
//
// 使い方: node scripts/import-liver-materials.mjs "<フォルダパス>" ["<フォルダパス2>" ...]
// 事前に .env.local に NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要。
// scripts/supabase-schema-liver.sql を先にSupabaseへ適用しておくこと。

import { readFileSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { extractText, getDocumentProxy } from "unpdf";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  try {
    const text = readFileSync(envPath, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (key && !(key in process.env)) process.env[key] = value;
    }
  } catch {
    // .env.local が無ければ環境変数だけを使う
  }
}
loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が .env.local にありません。");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const STAFF_ID = "liver_assistant";
const BUCKET = "materials";
const CONTENT_TYPES = { pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg" };

const roots = process.argv.slice(2);
if (!roots.length) {
  console.error('取り込み対象フォルダを指定してください。例: node scripts/import-liver-materials.mjs "/Users/apple/Downloads/①TikTok資料"');
  process.exit(1);
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

function categoryFor(root, filePath) {
  const rel = path.relative(path.dirname(root), path.dirname(filePath));
  return rel.split(path.sep).join(" / ");
}

// PDFから抽出したテキストにはヌル文字や孤立サロゲートが混ざることがあり、
// そのままではPostgresのtext型へ保存できない（unsupported Unicode escape sequence）。
function sanitizeText(text) {
  return String(text || "")
    .split(String.fromCharCode(0)).join("")
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, "")
    .replace(/(^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "$1")
    .trim();
}

async function alreadyImported(fileName, category) {
  const { data, error } = await supabase
    .from("liver_documents")
    .select("id")
    .eq("staff_id", STAFF_ID)
    .eq("file_name", fileName)
    .eq("category", category)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}

async function importFile(root, filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    console.log(`スキップ（未対応形式）: ${filePath}`);
    return;
  }
  const fileName = path.basename(filePath, path.extname(filePath));
  const category = categoryFor(root, filePath);

  if (await alreadyImported(fileName, category)) {
    console.log(`スキップ（登録済み）: ${category} / ${fileName}`);
    return;
  }

  const buffer = await readFile(filePath);
  let pageCount = 0;
  let pages = [];
  if (ext === "pdf") {
    try {
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const result = await extractText(pdf, { mergePages: false });
      pageCount = result.totalPages;
      pages = result.text
        .map((content, index) => ({ page: index + 1, content: sanitizeText(content) }))
        .filter(item => item.content.length > 0);
    } catch (error) {
      console.error(`  文字抽出に失敗（画像PDFの可能性）: ${filePath} — ${error.message}`);
    }
  }

  const { data: doc, error: insertError } = await supabase
    .from("liver_documents")
    .insert({ staff_id: STAFF_ID, category, file_name: fileName, file_ext: ext, storage_path: "", page_count: pageCount })
    .select("id")
    .single();
  if (insertError) throw new Error(`資料登録に失敗: ${filePath} — ${insertError.message}`);

  const storagePath = `${doc.id}.${ext}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, { contentType, upsert: true });
  if (uploadError) throw new Error(`アップロード失敗: ${filePath} — ${uploadError.message}`);

  const { error: updateError } = await supabase.from("liver_documents").update({ storage_path: storagePath }).eq("id", doc.id);
  if (updateError) throw new Error(`保存先更新に失敗: ${filePath} — ${updateError.message}`);

  let savedPages = 0;
  if (pages.length) {
    const rows = pages.map(page => ({ document_id: doc.id, staff_id: STAFF_ID, page: page.page, content: page.content }));
    for (let i = 0; i < rows.length; i += 200) {
      const batch = rows.slice(i, i + 200);
      const { error } = await supabase.from("liver_chunks").insert(batch);
      if (error) {
        // 1ページでも保存できない文字が混ざっていた場合、そのまとまりだけ1件ずつ試して
        // 保存できるページだけ残す（1ファイルの失敗で全体を止めない）。
        for (const row of batch) {
          const { error: rowError } = await supabase.from("liver_chunks").insert(row);
          if (rowError) console.error(`  ページ${row.page}の本文を保存できませんでした: ${rowError.message}`);
          else savedPages += 1;
        }
        continue;
      }
      savedPages += batch.length;
    }
  }

  console.log(`取り込み完了: ${category} / ${fileName}.${ext}（${savedPages}ページ分の本文）`);
}

async function main() {
  let total = 0;
  for (const root of roots) {
    const info = await stat(root).catch(() => null);
    if (!info) {
      console.error(`見つかりません: ${root}`);
      continue;
    }
    const files = info.isDirectory() ? await walk(root) : [root];
    for (const file of files) {
      try {
        await importFile(root, file);
      } catch (error) {
        console.error(`失敗: ${file} — ${error.message}`);
      }
      total += 1;
    }
  }
  console.log(`\n処理対象ファイル数: ${total}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
