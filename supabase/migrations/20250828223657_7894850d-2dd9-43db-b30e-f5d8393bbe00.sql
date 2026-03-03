-- Fix security warnings by setting proper search_path for functions

-- Update the ADL metrics calculation function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update the updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update the new user handler function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;