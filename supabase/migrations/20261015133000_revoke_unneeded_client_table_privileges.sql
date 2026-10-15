-- Least-privilege cleanup for client-facing database roles.
-- PostgREST clients do not need schema-level maintenance privileges.
-- This does not change row-level security policies or application CRUD grants.

revoke truncate, references, trigger
  on all tables in schema public
  from anon, authenticated;

-- Prevent the same broad privileges from being inherited by future tables
-- created by the migration owner.
alter default privileges for role postgres in schema public
  revoke truncate, references, trigger on tables from anon, authenticated;
