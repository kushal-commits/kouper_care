-- Add policy for anonymous users to view patients (for demo purposes)
CREATE POLICY "Demo - Allow anonymous viewing of patients" ON public.patients
FOR SELECT
TO anon
USING (true);