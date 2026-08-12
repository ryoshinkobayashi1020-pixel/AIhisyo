-- ライバー部署アシスタント（ひなた）用: 資料の知識ベース
-- Supabaseダッシュボード → SQL Editor に貼り付けて実行してください。

create table if not exists liver_documents (
  id uuid primary key default gen_random_uuid(),
  staff_id text not null default 'liver_assistant',
  category text not null default '',
  file_name text not null,
  file_ext text not null,
  storage_path text not null,
  page_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists liver_chunks (
  id bigserial primary key,
  document_id uuid not null references liver_documents(id) on delete cascade,
  staff_id text not null default 'liver_assistant',
  page int not null default 0,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists liver_documents_staff_idx on liver_documents(staff_id);
create index if not exists liver_chunks_staff_idx on liver_chunks(staff_id);
create index if not exists liver_chunks_document_idx on liver_chunks(document_id);

alter table liver_documents enable row level security;
alter table liver_chunks enable row level security;
-- service_role キーはRLSを無視してアクセスできるため、
-- ブラウザ（anon）向けのポリシーはあえて追加していません
-- （サーバー側APIからのみ読み書きする想定）。

-- 資料の原本（PDF・画像）を保存する非公開バケット
insert into storage.buckets (id, name, public)
values ('materials', 'materials', false)
on conflict (id) do nothing;
