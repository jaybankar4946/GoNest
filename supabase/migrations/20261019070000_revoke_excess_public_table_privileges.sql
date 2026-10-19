-- Least-privilege hardening for exposed public-schema tables.
-- The application uses SELECT/INSERT/UPDATE/DELETE where allowed by RLS;
-- it does not need TRUNCATE, REFERENCES, or TRIGGER privileges through API roles.
REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;

-- Keep future tables from inheriting these unnecessary API privileges.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM PUBLIC, anon, authenticated;
