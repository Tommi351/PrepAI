/* When it comes to embedding dimensions and choosing models for that, higher-dimensions = BAD! Due to more space in DB and memory. 
Takes longer to create indexes when you scale. Unless you need it  */

create extension if not exists pg_net with schema extensions; -- Allows HTTP requests within Postgres DBs itself
create extension if not exists vector with schema extensions;

-- 2️⃣ Drop dependent objects first
drop view if exists documents_with_storage_path;

-- 3️⃣ Remove old column (storage_object_id)
alter table documents drop column if exists storage_object_id;

-- 4️⃣ Add new column for canonical storage path
alter table documents add column if not exists storage_path text not null;

create or replace view documents_with_storage_path
with (security_invoker=true)
as
  select * from documents;
