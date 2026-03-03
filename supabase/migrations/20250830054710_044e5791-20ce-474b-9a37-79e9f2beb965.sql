-- Enable RLS on existing tables that don't have it
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Add missing RLS policies for alerts table
CREATE POLICY "Admins can view all alerts" 
ON public.alerts 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'supervisor'::text]));

CREATE POLICY "Clinical staff can view alerts for assigned patients" 
ON public.alerts 
FOR SELECT 
USING ((get_current_user_role() = ANY (ARRAY['nurse'::text, 'clinical_coordinator'::text, 'case_manager'::text])) AND is_user_assigned_to_patient(patient_id));