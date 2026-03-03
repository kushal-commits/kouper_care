-- Force PostgREST to reload schema by making a small change
NOTIFY pgrst, 'reload schema';

-- Verify RLS policies exist for patients table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'patients';