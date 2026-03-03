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