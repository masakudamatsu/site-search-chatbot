-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Drop the table if it exists (useful for schema updates/resets)
drop table if exists documents;

-- Create a table to store your documents
-- NOTE: Embedding dimension is set to 768 to match BAAI/bge-base-en-v1.5.
-- If you change the embedding model, you must update this dimension and recreate the table.
create table documents (
  id bigserial primary key,
  content text,
  url text,
  title text,
  description text,
  last_modified text,
  chunk_index integer,
  embedding vector(768)
);
