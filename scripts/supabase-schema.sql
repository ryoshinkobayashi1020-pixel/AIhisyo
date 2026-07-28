-- AI社員オフィス: Supabase初期セットアップ
-- Supabaseダッシュボード → SQL Editor に貼り付けて実行してください。

-- 経理・スタッフ設定・ポイント・共有ルームをまとめて保存するシンプルなKVストア
create table if not exists app_data (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table app_data enable row level security;
-- service_role キーはRLSを無視してアクセスできるため、
-- ブラウザ（anon）向けのポリシーはあえて追加していません
-- （このテーブルはサーバー側APIからのみ読み書きする想定）。

-- 請求書PNG画像を保存する非公開バケット
insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;
