-- Create OASIS items table
CREATE TABLE public.oasis_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create keywords table
CREATE TABLE public.keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  oasis_item_id UUID NOT NULL REFERENCES public.oasis_items(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  tag_type TEXT CHECK (tag_type IN ('device', 'risk', 'symptom', 'action', 'env', 'general')),
  usage_count INTEGER DEFAULT 0,
  last_matched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_keyword_per_oasis UNIQUE(oasis_item_id, term)
);

-- Create keyword synonyms table
CREATE TABLE public.keyword_synonyms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword_id UUID NOT NULL REFERENCES public.keywords(id) ON DELETE CASCADE,
  synonym TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_synonym_per_keyword UNIQUE(keyword_id, synonym)
);

-- Create keyword usage tracking table
CREATE TABLE public.keyword_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword_id UUID NOT NULL REFERENCES public.keywords(id) ON DELETE CASCADE,
  matched_text TEXT NOT NULL,
  source_table TEXT NOT NULL,
  source_id UUID NOT NULL,
  matched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create keyword audit table for version history
CREATE TABLE public.keyword_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword_id UUID REFERENCES public.keywords(id) ON DELETE SET NULL,
  oasis_item_id UUID NOT NULL REFERENCES public.oasis_items(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'merge')),
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default OASIS items
INSERT INTO public.oasis_items (code, label, description, category) VALUES
  ('M1830', 'Bathing', 'Ability to wash entire body safely', 'ADL'),
  ('M1860', 'Ambulation/Locomotion', 'Ability to walk safely or wheelchair use', 'Mobility'),
  ('M2020', 'Management of Oral Medications', 'Ability to prepare and take oral medications', 'Medication'),
  ('M1850', 'Transferring', 'Ability to move from bed to chair or standing position', 'Mobility'),
  ('M1840', 'Toilet Transferring', 'Ability to get to and from the toilet or bedside commode', 'Mobility'),
  ('M1845', 'Toileting Hygiene', 'Ability to maintain perineal hygiene safely and completely', 'ADL'),
  ('M1033', 'Risk for Hospitalization', 'Overall risk factors for hospitalization', 'Risk Assessment');

-- Enable RLS on all tables
ALTER TABLE public.oasis_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keyword_synonyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keyword_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keyword_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for oasis_items (readable by all, editable by admin)
CREATE POLICY "Everyone can view OASIS items" ON public.oasis_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage OASIS items" ON public.oasis_items FOR ALL USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'supervisor'::text]));

-- RLS Policies for keywords (readable by all, editable by admin)
CREATE POLICY "Everyone can view keywords" ON public.keywords FOR SELECT USING (true);
CREATE POLICY "Admins can manage keywords" ON public.keywords FOR ALL USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'supervisor'::text]));

-- RLS Policies for keyword_synonyms (readable by all, editable by admin)
CREATE POLICY "Everyone can view keyword synonyms" ON public.keyword_synonyms FOR SELECT USING (true);
CREATE POLICY "Admins can manage keyword synonyms" ON public.keyword_synonyms FOR ALL USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'supervisor'::text]));

-- RLS Policies for keyword_usage (readable by all, insertable by clinical staff)
CREATE POLICY "Everyone can view keyword usage" ON public.keyword_usage FOR SELECT USING (true);
CREATE POLICY "Clinical staff can create keyword usage" ON public.keyword_usage FOR INSERT WITH CHECK (get_current_user_role() = ANY (ARRAY['nurse'::text, 'clinical_coordinator'::text, 'case_manager'::text, 'admin'::text, 'supervisor'::text]));

-- RLS Policies for keyword_audit (readable by admin only)
CREATE POLICY "Admins can view keyword audit" ON public.keyword_audit FOR SELECT USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'supervisor'::text]));
CREATE POLICY "Admins can create keyword audit" ON public.keyword_audit FOR INSERT WITH CHECK (get_current_user_role() = ANY (ARRAY['admin'::text, 'supervisor'::text]));

-- Create indexes for performance
CREATE INDEX idx_keywords_oasis_item_id ON public.keywords(oasis_item_id);
CREATE INDEX idx_keywords_term ON public.keywords(term);
CREATE INDEX idx_keyword_synonyms_keyword_id ON public.keyword_synonyms(keyword_id);
CREATE INDEX idx_keyword_usage_keyword_id ON public.keyword_usage(keyword_id);
CREATE INDEX idx_keyword_usage_matched_at ON public.keyword_usage(matched_at);
CREATE INDEX idx_keyword_audit_keyword_id ON public.keyword_audit(keyword_id);
CREATE INDEX idx_keyword_audit_created_at ON public.keyword_audit(created_at);

-- Create trigger for updated_at timestamps
CREATE TRIGGER update_oasis_items_updated_at
  BEFORE UPDATE ON public.oasis_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_keywords_updated_at
  BEFORE UPDATE ON public.keywords
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();