-- Create the table (if you haven't already, otherwise skip this part)
create table if not exists crawl_status (
  id bigserial primary key,
  completed_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table crawl_status enable row level security;

-- (Optional) If you ever need public read access, you can add a policy like:
-- create policy "Allow public read access" on crawl_status for select using (true);