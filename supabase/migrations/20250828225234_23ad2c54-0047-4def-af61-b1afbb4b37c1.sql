-- Complete the security fix for remaining tables

-- Fix assessments table
DROP POLICY IF EXISTS "Authenticated users can create assessments" ON public.assessments;

CREATE POLICY "Admins can view all assessments" ON public.assessments
FOR SELECT
USING (public.get_current_user_role() IN ('admin', 'supervisor'));

CREATE POLICY "Clinical staff can view assessments for assigned patients" ON public.assessments
FOR SELECT
USING (
  public.get_current_user_role() IN ('nurse', 'clinical_coordinator', 'case_manager')
  AND public.is_user_assigned_to_patient(patient_id)
);

CREATE POLICY "Clinical staff can create assessments" ON public.assessments
FOR INSERT 
WITH CHECK (
  public.get_current_user_role() IN ('nurse', 'clinical_coordinator', 'case_manager')
  AND public.is_user_assigned_to_patient(patient_id)
);