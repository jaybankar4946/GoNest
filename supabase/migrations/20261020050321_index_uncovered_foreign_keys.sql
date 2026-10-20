-- Add leading-column indexes for public-schema foreign keys that lacked coverage.
-- This is a performance-only change; it does not alter row access policies or data.
DO $$
DECLARE
  fk record;
  idx_name text;
  col_list text;
BEGIN
  FOR fk IN
    SELECT c.oid, c.conrelid, c.conname, c.conkey
    FROM pg_constraint c
    WHERE c.contype = 'f'
      AND c.connamespace = 'public'::regnamespace
      AND NOT EXISTS (
        SELECT 1
        FROM pg_index i
        WHERE i.indrelid = c.conrelid
          AND i.indisvalid
          AND i.indpred IS NULL
          AND (
            SELECT array_agg(k.attnum::int ORDER BY k.ordinality)
            FROM unnest(i.indkey) WITH ORDINALITY AS k(attnum, ordinality)
            WHERE k.ordinality <= cardinality(c.conkey)
          ) = c.conkey::int[]
      )
  LOOP
    SELECT string_agg(format('%I', a.attname), ', ' ORDER BY k.ordinality)
      INTO col_list
    FROM unnest(fk.conkey) WITH ORDINALITY AS k(attnum, ordinality)
    JOIN pg_attribute a ON a.attrelid = fk.conrelid AND a.attnum = k.attnum;

    idx_name := left(
      (SELECT relname FROM pg_class WHERE oid = fk.conrelid) || '_' ||
      replace(fk.conname, '_fkey', '') || '_fk_idx',
      63
    );

    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %s (%s)',
      idx_name, fk.conrelid::regclass, col_list);
  END LOOP;
END
$$;
