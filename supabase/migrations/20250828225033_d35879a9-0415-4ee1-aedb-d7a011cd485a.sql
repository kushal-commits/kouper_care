-- Step 2: Create security definer functions and new HIPAA-compliant policies

-- Create security definer functions to avoid RLS recursion issues
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_user_assigned_to_patient(patient_uuid uuid)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.episodes 
    WHERE patient_id = patient_uuid 
    AND (primary_nurse_id = auth.uid() OR coordinator_id = auth.uid())
    AND status = 'active'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

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

-- Create policies for episodes table
CREATE POLICY "Admins can view all episodes" ON public.episodes
FOR SELECT
USING (public.get_current_user_role() IN ('admin', 'supervisor'));

CREATE POLICY "Clinical staff can view assigned episodes" ON public.episodes
FOR SELECT
USING (
  public.get_current_user_role() IN ('nurse', 'clinical_coordinator', 'case_manager')
  AND (primary_nurse_id = auth.uid() OR coordinator_id = auth.uid())
);

-- Restore other necessary policies for episodes
CREATE POLICY "Clinical staff can create episodes" ON public.episodes
FOR INSERT 
WITH CHECK (public.get_current_user_role() IN ('admin', 'supervisor', 'nurse', 'clinical_coordinator'));

CREATE POLICY "Clinical staff can update episodes" ON public.episodes
FOR UPDATE
USING (
  public.get_current_user_role() IN ('admin', 'supervisor') OR
  (public.get_current_user_role() IN ('nurse', 'clinical_coordinator', 'case_manager') 
   AND (primary_nurse_id = auth.uid() OR coordinator_id = auth.uid()))
);

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