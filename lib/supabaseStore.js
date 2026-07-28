import { createClient } from "@supabase/supabase-js";

// サーバー側専用のSupabaseクライアント。service_roleキーはRLSを無視するため、
// ブラウザには絶対に渡さない（NEXT_PUBLIC_を付けていないので露出しない）。
let client = null;
function getClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  client = createClient(url, serviceKey, { auth: { persistSession: false } });
  return client;
}

export function isSupabaseConfigured() {
  return Boolean(getClient());
}

// app_data テーブル（key text primary key, value jsonb）をシンプルなドキュメントストアとして使う。
// 既存の各lib（accounting / staff-settings / points / shared-room）が持っていた
// 「読み込み→デフォルトとマージ→書き込み」というロジックはそのまま活かし、
// 保存先だけをローカルJSONファイルからここへ差し替える。
export async function getStoreValue(key) {
  const supabase = getClient();
  if (!supabase) throw new Error("Supabaseが設定されていません（NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY を確認してください）。");
  const { data, error } = await supabase.from("app_data").select("value").eq("key", key).maybeSingle();
  if (error) throw new Error(`Supabase読み込みエラー（${key}）：${error.message}`);
  return data?.value ?? null;
}

export async function setStoreValue(key, value) {
  const supabase = getClient();
  if (!supabase) throw new Error("Supabaseが設定されていません（NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY を確認してください）。");
  const { error } = await supabase
    .from("app_data")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error(`Supabase書き込みエラー（${key}）：${error.message}`);
  return value;
}
