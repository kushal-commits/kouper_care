-- Fix HIPAA violation: Implement role-based access control for patient medical records
-- This replaces the overly permissive "view all patients" policy with restricted access

-- First, create security definer functions to avoid RLS recursion issues
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_user_assigned_to_patient(patient_uuid uuid)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.episodes 
    WHERE patient_id = patient_uuid 
    AND (primary_nurse_id = auth.uid() OR coordinator_id = auth.uid())
    AND status = 'active'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view all patients" ON public.patients;

-- Create new restrictive policies based on roles and care assignments
CREATE POLICY "Admins can view all patients" ON public.patients
FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'supervisor'));

CREATE POLICY "Clinical staff can view assigned patients" ON public.patients  
FOR SELECT
USING (
  public.get_current_user_role() IN ('nurse', 'clinical_coordinator', 'case_manager') 
  AND public.is_user_assigned_to_patient(id)
);

-- Allow clinical staff to create patients (with proper validation)
DROP POLICY IF EXISTS "Authenticated users can create patients" ON public.patients;
CREATE POLICY "Clinical staff can create patients" ON public.patients
FOR INSERT 
WITH CHECK (public.get_current_user_role() IN ('admin', 'supervisor', 'nurse', 'clinical_coordinator'));

-- Allow updates only for assigned patients or admins
DROP POLICY IF EXISTS "Authenticated users can update patients" ON public.patients;
CREATE POLICY "Admins can update all patients" ON public.patients
FOR UPDATE
USING (public.get_current_user_role() IN ('admin', 'supervisor'));

CREATE POLICY "Clinical staff can update assigned patients" ON public.patients
FOR UPDATE  
USING (
  public.get_current_user_role() IN ('nurse', 'clinical_coordinator', 'case_manager')
  AND public.is_user_assigned_to_patient(id)
);

-- Apply similar restrictions to related tables for consistency

-- Fix episodes table policies
DROP POLICY IF EXISTS "Authenticated users can view all episodes" ON public.episodes;

CREATE POLICY "Admins can view all episodes" ON public.episodes
FOR SELECT
USING (public.get_current_user_role() IN ('admin', 'supervisor'));

CREATE POLICY "Clinical staff can view assigned episodes" ON public.episodes
FOR SELECT
USING (
  public.get_current_user_role() IN ('nurse', 'clinical_coordinator', 'case_manager')
  AND (primary_nurse_id = auth.uid() OR coordinator_id = auth.uid())
);

-- Fix assessments table policies  
DROP POLICY IF EXISTS "Authenticated users can view all assessments" ON public.assessments;

CREATE POLICY "Admins can view all assessments" ON public.assessments
FOR SELECT
USING (public.get_current_user_role() IN ('admin', 'supervisor'));

CREATE POLICY "Clinical staff can view assessments for assigned patients" ON public.assessments
FOR SELECT
USING (
  public.get_current_user_role() IN ('nurse', 'clinical_coordinator', 'case_manager')
  AND public.is_user_assigned_to_patient(patient_id)
);

-- Fix interventions table policies
DROP POLICY IF EXISTS "Authenticated users can view all interventions" ON public.interventions;

CREATE POLICY "Admins can view all interventions" ON public.interventions  
FOR SELECT
USING (public.get_current_user_role() IN ('admin', 'supervisor'));

CREATE POLICY "Clinical staff can view interventions for assigned patients" ON public.interventions
FOR SELECT  
USING (
  public.get_current_user_role() IN ('nurse', 'clinical_coordinator', 'case_manager')
  AND public.is_user_assigned_to_patient(patient_id)
);

-- Fix alerts table policies
DROP POLICY IF EXISTS "Authenticated users can view all alerts" ON public.alerts;

CREATE POLICY "Admins can view all alerts" ON public.alerts
FOR SELECT
USING (public.get_current_user_role() IN ('admin', 'supervisor'));

CREATE POLICY "Clinical staff can view alerts for assigned patients" ON public.alerts
FOR SELECT
USING (
  public.get_current_user_role() IN ('nurse', 'clinical_coordinator', 'case_manager') 
  AND public.is_user_assigned_to_patient(patient_id)
);