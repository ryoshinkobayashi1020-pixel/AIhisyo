import { createClient } from "@supabase/supabase-js";

const BUCKET = "invoices";
let client = null;
function getClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  client = createClient(url, serviceKey, { auth: { persistSession: false } });
  return client;
}

export function isStorageConfigured() {
  return Boolean(getClient());
}

// 請求書PNGをSupabase Storageへアップロードする。Vercelのサーバーレス環境では
// ローカルディスクへの書き込みが次回リクエストまで残らないため、ここに保存する。
export async function uploadInvoiceImage(id, buffer) {
  const supabase = getClient();
  if (!supabase) throw new Error("Supabase Storageが設定されていません。");
  const { error } = await supabase.storage.from(BUCKET).upload(`${id}.png`, buffer, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) throw new Error(`請求書画像のアップロードに失敗しました：${error.message}`);
  return `${BUCKET}/${id}.png`;
}

// 非公開バケットなので、必要なときだけ期限付きURLを発行する（LINEへの画像送信、ダウンロード両方で使う）。
export async function getInvoiceImageSignedUrl(id, expiresInSeconds = 60 * 60 * 24) {
  const supabase = getClient();
  if (!supabase) throw new Error("Supabase Storageが設定されていません。");
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(`${id}.png`, expiresInSeconds);
  if (error) throw new Error(`請求書画像のURL発行に失敗しました：${error.message}`);
  return data.signedUrl;
}

export async function downloadInvoiceImage(id) {
  const supabase = getClient();
  if (!supabase) throw new Error("Supabase Storageが設定されていません。");
  const { data, error } = await supabase.storage.from(BUCKET).download(`${id}.png`);
  if (error) throw new Error(`請求書画像の取得に失敗しました：${error.message}`);
  return Buffer.from(await data.arrayBuffer());
}
