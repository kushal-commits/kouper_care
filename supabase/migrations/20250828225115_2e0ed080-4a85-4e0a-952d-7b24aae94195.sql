-- Create new restrictive policies for patients table (HIPAA compliant)
CREATE POLICY "Admins can view all patients" ON public.patients
FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'supervisor'));

CREATE POLICY "Clinical staff can view assigned patients" ON public.patients  
FOR SELECT
USING (
  public.get_current_user_role() IN ('nurse', 'clinical_coordinator', 'case_manager') 
  AND public.is_user_assigned_to_patient(id)
);

CREATE POLICY "Clinical staff can create patients" ON public.patients
FOR INSERT 
WITH CHECK (public.get_current_user_role() IN ('admin', 'supervisor', 'nurse', 'clinical_coordinator'));

CREATE POLICY "Admins can update all patients" ON public.patients
FOR UPDATE
USING (public.get_current_user_role() IN ('admin', 'supervisor'));

CREATE POLICY "Clinical staff can update assigned patients" ON public.patients
FOR UPDATE  
USING (
  public.get_current_user_role() IN ('nurse', 'clinical_coordinator', 'case_manager')
  AND public.is_user_assigned_to_patient(id)
);