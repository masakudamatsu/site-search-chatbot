-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table documents (
  id bigserial primary key,
  content text,
  url text,
  title text,
  description text,
  last_modified text,
  chunk_index integer,
  embedding vector(1024)
);
