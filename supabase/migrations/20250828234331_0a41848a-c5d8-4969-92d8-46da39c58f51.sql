-- Remove anonymous access policies for patient data (SECURITY FIX)
-- This fixes the critical security vulnerability that exposed patient medical records to anonymous users

DROP POLICY IF EXISTS "Demo - Allow anonymous viewing of patients" ON public.patients;
DROP POLICY IF EXISTS "Demo - Allow viewing all patients for authenticated users" ON public.patients;

-- The remaining policies ensure only authenticated healthcare staff can access patient data:
-- 1. Admins can view all patients
-- 2. Clinical staff can view assigned patients 
-- 3. Clinical staff can create patients
-- 4. Admins can update all patients
-- 5. Clinical staff can update assigned patients

-- Verify that proper authentication-based policies remain in place
-- (These policies already exist and will continue to work)