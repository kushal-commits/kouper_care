-- Fix interventions table
DROP POLICY IF EXISTS "Authenticated users can create interventions" ON public.interventions;
DROP POLICY IF EXISTS "Authenticated users can update interventions" ON public.interventions;

CREATE POLICY "Admins can view all interventions" ON public.interventions  
FOR SELECT
USING (public.get_current_user_role() IN ('admin', 'supervisor'));

CREATE POLICY "Clinical staff can view interventions for assigned patients" ON public.interventions
FOR SELECT  
USING (
  public.get_current_user_role() IN ('nurse', 'clinical_coordinator', 'case_manager')
  AND public.is_user_assigned_to_patient(patient_id)
);

CREATE POLICY "Clinical staff can create interventions" ON public.interventions
FOR INSERT 
WITH CHECK (
  public.get_current_user_role() IN ('nurse', 'clinical_coordinator', 'case_manager')
  AND public.is_user_assigned_to_patient(patient_id)
);

CREATE POLICY "Clinical staff can update interventions" ON public.interventions
FOR UPDATE
USING (
  public.get_current_user_role() IN ('admin', 'supervisor') OR
  (public.get_current_user_role() IN ('nurse', 'clinical_coordinator', 'case_manager')
   AND public.is_user_assigned_to_patient(patient_id))
);