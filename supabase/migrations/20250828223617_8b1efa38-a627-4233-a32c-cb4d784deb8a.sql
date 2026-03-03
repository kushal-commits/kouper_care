-- Create user profiles table for authentication
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('nurse', 'coordinator', 'admin', 'caregiver')),
  phone TEXT,
  license_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mrn TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  address JSONB,
  phone TEXT,
  emergency_contact JSONB,
  primary_diagnosis TEXT,
  secondary_diagnoses TEXT[],
  insurance_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create care episodes table  
CREATE TABLE public.episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  episode_number TEXT NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  primary_nurse_id UUID REFERENCES public.profiles(id),
  coordinator_id UUID REFERENCES public.profiles(id),
  discharge_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Create OASIS assessments table
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('start_of_care', 'resumption', 'follow_up', 'transfer', 'discharge')),
  assessor_id UUID REFERENCES public.profiles(id),
  -- ADL Scores (0-5 scale)
  bathing_score INTEGER CHECK (bathing_score >= 0 AND bathing_score <= 5),
  dressing_upper_score INTEGER CHECK (dressing_upper_score >= 0 AND dressing_upper_score <= 5),
  dressing_lower_score INTEGER CHECK (dressing_lower_score >= 0 AND dressing_lower_score <= 5),
  grooming_score INTEGER CHECK (grooming_score >= 0 AND grooming_score <= 5),
  eating_score INTEGER CHECK (eating_score >= 0 AND eating_score <= 5),
  toileting_score INTEGER CHECK (toileting_score >= 0 AND toileting_score <= 5),
  transferring_score INTEGER CHECK (transferring_score >= 0 AND transferring_score <= 5),
  ambulation_score INTEGER CHECK (ambulation_score >= 0 AND ambulation_score <= 5),
  medication_mgmt_score INTEGER CHECK (medication_mgmt_score >= 0 AND medication_mgmt_score <= 5),
  -- Calculated fields
  total_adl_score INTEGER,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Create interventions table
CREATE TABLE public.interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  intervention_type TEXT NOT NULL,
  description TEXT NOT NULL,
  assigned_to_id UUID REFERENCES public.profiles(id),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'completed', 'cancelled')) DEFAULT 'pending',
  scheduled_date DATE,
  completed_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS  
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('declining_adl', 'missed_assessment', 'high_risk', 'intervention_overdue')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by_id UUID REFERENCES public.profiles(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can update their own profile" ON public.profiles  
  FOR UPDATE USING (auth.uid() = id);

-- Patients policies
CREATE POLICY "Authenticated users can view all patients" ON public.patients
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Authenticated users can create patients" ON public.patients
  FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can update patients" ON public.patients
  FOR UPDATE TO authenticated USING (TRUE);

-- Episodes policies  
CREATE POLICY "Authenticated users can view all episodes" ON public.episodes
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Authenticated users can create episodes" ON public.episodes
  FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can update episodes" ON public.episodes
  FOR UPDATE TO authenticated USING (TRUE);

-- Assessments policies
CREATE POLICY "Authenticated users can view all assessments" ON public.assessments
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Authenticated users can create assessments" ON public.assessments
  FOR INSERT TO authenticated WITH CHECK (TRUE);

-- Interventions policies
CREATE POLICY "Authenticated users can view all interventions" ON public.interventions
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Authenticated users can create interventions" ON public.interventions
  FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can update interventions" ON public.interventions
  FOR UPDATE TO authenticated USING (TRUE);

-- Alerts policies
CREATE POLICY "Authenticated users can view all alerts" ON public.alerts
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Authenticated users can create alerts" ON public.alerts
  FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can update alerts" ON public.alerts
  FOR UPDATE TO authenticated USING (TRUE);

-- Create triggers for updated_at fields
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Create function to calculate ADL total score and risk level
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

CREATE TRIGGER calculate_adl_metrics_trigger
    BEFORE INSERT OR UPDATE ON public.assessments
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_adl_metrics();

-- Create function to handle new user signup
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

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();