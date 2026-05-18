create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists vector;

create table if not exists resume_variants (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  focus_ids text[] not null default '{}',
  variant jsonb not null,
  analysis jsonb,
  created_at timestamptz not null default now()
);

create index if not exists resume_variants_focus_ids_idx
  on resume_variants using gin (focus_ids);

create table if not exists jd_requests (
  id uuid primary key default gen_random_uuid(),
  focus_ids text[] not null default '{}',
  raw_text text,
  extraction jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists jd_requests_focus_ids_idx
  on jd_requests using gin (focus_ids);

create table if not exists project_fragments (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,
  fragment_kind text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  search_document tsvector generated always as (
    to_tsvector('english', coalesce(content, ''))
  ) stored,
  created_at timestamptz not null default now()
);

create index if not exists project_fragments_project_id_idx
  on project_fragments (project_id);

create index if not exists project_fragments_search_document_idx
  on project_fragments using gin (search_document);

create index if not exists project_fragments_content_trgm_idx
  on project_fragments using gin (content gin_trgm_ops);

comment on extension vector is
  'Enabled now so pgvector is available when embeddings are added later.';

comment on table project_fragments is
  'Use lexical and trigram search first. Add an embedding vector column once the local embedding model dimension is chosen.';
