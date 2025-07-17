-- Migration: Add branch_name column to processing_batch table
-- This allows users to give human-readable names to their batches

-- Add branch_name column
alter table public.processing_batch
  add column if not exists branch_name text;

-- Add index for quick dashboard lookup
create index if not exists processing_batch_branch_name_idx
  on public.processing_batch(branch_name);

-- Add comment for documentation
comment on column public.processing_batch.branch_name is 'Human-readable name for the batch (e.g. "glucose-labs-july")'; 