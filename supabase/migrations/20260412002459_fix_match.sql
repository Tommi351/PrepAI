create extension if not exists vector with schema extensions;

-- 1️⃣ Drop old versions to refresh the schema cache
drop function if exists match_document_sections(extensions.vector, float);
drop function if exists match_document_sections(extensions.vector, float, bigint);

-- 2️⃣ The High-Performance Version
create or replace function match_document_sections(
  embedding extensions.vector(384),
  match_threshold float,
  input_document_id bigint 
)
returns table (
  id bigint,
  document_id bigint,
  content text,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_variable
begin
  return query
  select
    ds.id,
    ds.document_id,
    ds.content,
    -- Negative Inner Product logic:
    -- (ds.embedding <#> embedding) returns a negative value (e.g., -0.85)
    -- Multiplying by -1 turns it back into a positive similarity (0.85)
    (ds.embedding <#> embedding) * -1 as similarity
  from document_sections ds
  where ds.document_id = input_document_id
    -- Only return rows that beat the threshold (e.g., 0.85 > 0.75)
    and (ds.embedding <#> embedding) * -1 > match_threshold
  order by ds.embedding <#> embedding; -- Order by lowest negative (most similar)
end;
$$;