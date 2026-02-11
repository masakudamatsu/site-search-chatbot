-- Create 'extensions' schema if it doesn't exist
create schema if not exists extensions;

-- Enable the pgvector extension to work with embedding vectors in the 'extensions' schema
create extension if not exists vector with schema extensions;

-- Set the search path to include public and extensions
-- This ensures that the vector type can be found by your application
alter database postgres set search_path to "$user", public, extensions;

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

-- Enable RLS
alter table documents enable row level security;
