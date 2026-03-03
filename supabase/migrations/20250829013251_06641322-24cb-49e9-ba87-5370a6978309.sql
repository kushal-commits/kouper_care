-- Allow public viewing of patients for demo purposes
DROP POLICY IF EXISTS "Admins can view all patients" ON public.patients;
DROP POLICY IF EXISTS "Clinical staff can view assigned patients" ON public.patients;

CREATE POLICY "Allow public to view patients" 
ON public.patients FOR SELECT 
USING (true);

-- Also allow public to insert patients for demo
DROP POLICY IF EXISTS "Clinical staff can create patients" ON public.patients;

CREATE POLICY "Allow public to insert patients" 
ON public.patients FOR INSERT 
WITH CHECK (true);

-- Allow viewing profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Allow public to view profiles" 
ON public.profiles FOR SELECT 
USING (true);