// 既存の .data/*.json (ローカルJSON保存) を Supabase の app_data テーブルへ
// 一度だけ移す移行スクリプト。実データを消さず「そのままコピー」するだけ。
//
// 使い方: node scripts/migrate-to-supabase.mjs
// 事前に .env.local に NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要。

import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

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

const targets = [
  { file: ".data/accounting.json", key: "accounting" },
  { file: ".data/staff-settings.json", key: "staff-settings" },
  { file: ".data/points.json", key: "points" },
  { file: ".data/shared-room.json", key: "shared-room" },
];

async function main() {
  for (const { file, key } of targets) {
    const filePath = path.join(process.cwd(), file);
    let value;
    try {
      value = JSON.parse(await readFile(filePath, "utf8"));
    } catch (error) {
      if (error?.code === "ENOENT") {
        console.log(`スキップ（ファイルなし）: ${file}`);
        continue;
      }
      throw error;
    }
    const { error } = await supabase
      .from("app_data")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) {
      console.error(`失敗: ${key} — ${error.message}`);
      process.exitCode = 1;
      continue;
    }
    console.log(`移行完了: ${file} → app_data[${key}]`);
  }
}

main();
