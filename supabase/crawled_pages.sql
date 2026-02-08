-- Create a table to track crawled pages for smart ingestion
create table if not exists crawled_pages (
  id bigserial primary key,
  url text not null unique,
  last_crawled_at timestamptz not null default now(),
  last_modified text, -- Stores the Last-Modified HTTP header
  content_hash text not null -- Stores SHA-256 hash of the content
);

-- Create an index on URL for fast lookups
create index if not exists idx_crawled_pages_url on crawled_pages(url);
