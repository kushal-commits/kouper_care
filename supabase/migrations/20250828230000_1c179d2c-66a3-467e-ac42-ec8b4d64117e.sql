-- Temporarily add a permissive policy for demo purposes
-- This allows any authenticated user to view patients for demo/testing
CREATE POLICY "Demo - Allow viewing all patients for authenticated users" ON public.patients
FOR SELECT
USING (true);