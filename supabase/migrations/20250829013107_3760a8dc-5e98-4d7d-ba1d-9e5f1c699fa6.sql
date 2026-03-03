-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'nurse',
  phone TEXT,
  license_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mrn TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  phone TEXT,
  primary_diagnosis TEXT,
  secondary_diagnoses TEXT[],
  address JSONB,
  emergency_contact JSONB,
  insurance_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create episodes table
CREATE TABLE public.episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  episode_number TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  primary_nurse_id UUID,
  coordinator_id UUID,
  discharge_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on episodes
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Create assessments table
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  episode_id UUID,
  assessment_type TEXT NOT NULL,
  assessment_date DATE NOT NULL,
  assessor_id UUID,
  bathing_score INTEGER,
  dressing_upper_score INTEGER,
  dressing_lower_score INTEGER,
  grooming_score INTEGER,
  eating_score INTEGER,
  toileting_score INTEGER,
  transferring_score INTEGER,
  ambulation_score INTEGER,
  medication_mgmt_score INTEGER,
  total_adl_score INTEGER,
  risk_level TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on assessments
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Create interventions table
CREATE TABLE public.interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  episode_id UUID,
  intervention_type TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_date DATE,
  completed_date DATE,
  assigned_to_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on interventions
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  episode_id UUID,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by_id UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on alerts
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at
    BEFORE UPDATE ON public.episodes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interventions_updated_at
    BEFORE UPDATE ON public.interventions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate ADL metrics
CREATE OR REPLACE FUNCTION public.calculate_adl_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate total ADL score
    NEW.total_adl_score := COALESCE(NEW.bathing_score, 0) + 
                          COALESCE(NEW.dressing_upper_score, 0) + 
                          COALESCE(NEW.dressing_lower_score, 0) + 
                          COALESCE(NEW.grooming_score, 0) + 
                          COALESCE(NEW.eating_score, 0) + 
                          COALESCE(NEW.toileting_score, 0) + 
                          COALESCE(NEW.transferring_score, 0) + 
                          COALESCE(NEW.ambulation_score, 0) + 
                          COALESCE(NEW.medication_mgmt_score, 0);
    
    -- Calculate risk level based on total score
    IF NEW.total_adl_score >= 36 THEN
        NEW.risk_level := 'low';
    ELSIF NEW.total_adl_score >= 27 THEN
        NEW.risk_level := 'medium';
    ELSIF NEW.total_adl_score >= 18 THEN
        NEW.risk_level := 'high';
    ELSE
        NEW.risk_level := 'critical';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ADL calculation
CREATE TRIGGER calculate_adl_metrics_trigger
    BEFORE INSERT OR UPDATE ON public.assessments
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_adl_metrics();

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
        COALESCE(NEW.raw_user_meta_data ->> 'role', 'nurse')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create helper functions for RLS policies
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_user_assigned_to_patient(patient_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.episodes 
    WHERE patient_id = patient_uuid 
    AND (primary_nurse_id = auth.uid() OR coordinator_id = auth.uid())
    AND status = 'active'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- RLS Policies for patients
CREATE POLICY "Admins can view all patients" 
ON public.patients FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin', 'supervisor']));

CREATE POLICY "Clinical staff can view assigned patients" 
ON public.patients FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['nurse', 'clinical_coordinator', 'case_manager']) AND is_user_assigned_to_patient(id));

CREATE POLICY "Clinical staff can create patients" 
ON public.patients FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin', 'supervisor', 'nurse', 'clinical_coordinator']));

CREATE POLICY "Admins can update all patients" 
ON public.patients FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['admin', 'supervisor']));

CREATE POLICY "Clinical staff can update assigned patients" 
ON public.patients FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['nurse', 'clinical_coordinator', 'case_manager']) AND is_user_assigned_to_patient(id));

-- RLS Policies for episodes
CREATE POLICY "Admins can view all episodes" 
ON public.episodes FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin', 'supervisor']));

CREATE POLICY "Clinical staff can view assigned episodes" 
ON public.episodes FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['nurse', 'clinical_coordinator', 'case_manager']) AND (primary_nurse_id = auth.uid() OR coordinator_id = auth.uid()));

CREATE POLICY "Clinical staff can create episodes" 
ON public.episodes FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin', 'supervisor', 'nurse', 'clinical_coordinator']));

CREATE POLICY "Clinical staff can update episodes" 
ON public.episodes FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['admin', 'supervisor']) OR (get_current_user_role() = ANY (ARRAY['nurse', 'clinical_coordinator', 'case_manager']) AND (primary_nurse_id = auth.uid() OR coordinator_id = auth.uid())));

-- RLS Policies for assessments
CREATE POLICY "Admins can view all assessments" 
ON public.assessments FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin', 'supervisor']));

CREATE POLICY "Clinical staff can view assessments for assigned patients" 
ON public.assessments FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['nurse', 'clinical_coordinator', 'case_manager']) AND is_user_assigned_to_patient(patient_id));

CREATE POLICY "Clinical staff can create assessments" 
ON public.assessments FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['nurse', 'clinical_coordinator', 'case_manager']) AND is_user_assigned_to_patient(patient_id));

-- RLS Policies for interventions
CREATE POLICY "Admins can view all interventions" 
ON public.interventions FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin', 'supervisor']));

CREATE POLICY "Clinical staff can view interventions for assigned patients" 
ON public.interventions FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['nurse', 'clinical_coordinator', 'case_manager']) AND is_user_assigned_to_patient(patient_id));

CREATE POLICY "Clinical staff can create interventions" 
ON public.interventions FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['nurse', 'clinical_coordinator', 'case_manager']) AND is_user_assigned_to_patient(patient_id));

CREATE POLICY "Clinical staff can update interventions" 
ON public.interventions FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['admin', 'supervisor']) OR (get_current_user_role() = ANY (ARRAY['nurse', 'clinical_coordinator', 'case_manager']) AND is_user_assigned_to_patient(patient_id)));

-- RLS Policies for alerts
CREATE POLICY "Authenticated users can create alerts" 
ON public.alerts FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update alerts" 
ON public.alerts FOR UPDATE 
USING (true);