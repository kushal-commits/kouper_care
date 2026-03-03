-- Refresh the schema cache by updating the table
COMMENT ON TABLE public.patients IS 'Patient records for healthcare management';

-- Ensure the table has the correct structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'patients' 
ORDER BY ordinal_position;