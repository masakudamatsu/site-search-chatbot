-- Create a function to search for documents
-- NOTE: Embedding dimension is set to 768 to match BAAI/bge-base-en-v1.5.
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  url text,
  title text,
  description text,
  last_modified text,
  chunk_index integer,
  similarity float
)
language plpgsql
set search_path = public, extensions
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.url,
    documents.title,
    documents.description,
    documents.last_modified,
    documents.chunk_index,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
