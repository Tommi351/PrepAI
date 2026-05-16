alter table documents 
add column status text default 'pending';

create or replace view documents_with_storage_path 
with (security_invoker = true) as 
select 
  id, 
  name, 
  created_by, 
  created_at,
  storage_path, 
  status
from documents;

