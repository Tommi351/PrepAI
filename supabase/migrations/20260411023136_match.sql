create extension if not exists vector with schema extensions;

create or replace function match_document_sections(
  embedding extensions.vector(384),
  match_threshold float
)
returns setof document_sections
language plpgsql
as $$
#variable_conflict use_variable
begin
  return query
  select *
  from document_sections
  where document_sections.embedding <#> embedding < -match_threshold
  and document_sections.document_id = input_document_id
	order by document_sections.embedding <#> embedding;
end;
$$;