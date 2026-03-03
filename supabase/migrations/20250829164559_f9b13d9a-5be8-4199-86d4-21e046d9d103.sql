-- Force complete schema refresh by updating the database metadata
UPDATE pg_database SET datname = datname WHERE datname = current_database();

-- Refresh the schema cache more aggressively
SELECT pg_notify('pgrst', 'reload schema');

-- Ensure the patients table is properly recognized
COMMENT ON TABLE patients IS 'Patient information table - refreshed at ' || now()::text;