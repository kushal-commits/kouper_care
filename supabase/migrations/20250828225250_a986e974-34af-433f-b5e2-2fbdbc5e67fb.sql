-- Create policies for assessments table
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

-- Create policies for interventions table
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

-- Create policies for alerts table
CREATE POLICY "Admins can view all alerts" ON public.alerts
FOR SELECT
USING (public.get_current_user_role() IN ('admin', 'supervisor'));

CREATE POLICY "Clinical staff can view alerts for assigned patients" ON public.alerts
FOR SELECT
USING (
  public.get_current_user_role() IN ('nurse', 'clinical_coordinator', 'case_manager') 
  AND public.is_user_assigned_to_patient(patient_id)
);

CREATE POLICY "Clinical staff can create alerts" ON public.alerts
FOR INSERT 
WITH CHECK (
  public.get_current_user_role() IN ('nurse', 'clinical_coordinator', 'case_manager')
  AND public.is_user_assigned_to_patient(patient_id)
);

CREATE POLICY "Clinical staff can update alerts" ON public.alerts
FOR UPDATE
USING (
  public.get_current_user_role() IN ('admin', 'supervisor') OR
  (public.get_current_user_role() IN ('nurse', 'clinical_coordinator', 'case_manager')
   AND public.is_user_assigned_to_patient(patient_id))
);