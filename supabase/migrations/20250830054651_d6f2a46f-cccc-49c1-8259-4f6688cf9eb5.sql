-- Create alert_rules table for managing alert rules
CREATE TABLE public.alert_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  condition TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  window_size TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for alert rules access - admins can do everything
CREATE POLICY "Admins can view all alert rules" 
ON public.alert_rules 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'supervisor'::text]));

CREATE POLICY "Admins can create alert rules" 
ON public.alert_rules 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin'::text, 'supervisor'::text]));

CREATE POLICY "Admins can update alert rules" 
ON public.alert_rules 
FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'supervisor'::text]));

CREATE POLICY "Admins can delete alert rules" 
ON public.alert_rules 
FOR DELETE 
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'supervisor'::text]));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_alert_rules_updated_at
BEFORE UPDATE ON public.alert_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default alert rules
INSERT INTO public.alert_rules (name, condition, severity, window_size, enabled) VALUES
('Significant Decline', 'Δscore ≤ -2 within 7 days', 'high', '7 days', true),
('Moderate Decline', 'Δscore ≤ -1 since last', 'medium', 'Assessment', true),
('No Improvement', 'No improvement ≥14 days when baseline not independent', 'medium', '14 days', true),
('Multiple ADL Decline', 'Decline in ≥2 ADLs within 14 days', 'high', '14 days', true),
('Missed Assessment', 'Missed weekly assessment by >2 days', 'medium', 'Weekly', false);