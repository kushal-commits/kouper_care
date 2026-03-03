-- Create source documents table for traceable data
CREATE TABLE public.source_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('note', 'transcript', 'upload', 'assessment', 'lab_result', 'vital_signs')),
  author_id UUID REFERENCES public.profiles(id),
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  episode_id UUID REFERENCES public.episodes(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clinician notes table
CREATE TABLE public.clinician_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id),
  episode_id UUID REFERENCES public.episodes(id),
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  discipline TEXT NOT NULL CHECK (discipline IN ('nursing', 'physical_therapy', 'occupational_therapy', 'speech_therapy', 'case_management', 'clinical_coordination', 'social_work')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  tags TEXT[] DEFAULT '{}',
  linked_data_sources UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data source links table for traceable evidence
CREATE TABLE public.data_source_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data_table TEXT NOT NULL, -- e.g., 'assessments', 'alerts', 'interventions'
  data_id UUID NOT NULL,
  source_document_id UUID NOT NULL REFERENCES public.source_documents(id),
  extracted_snippet TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add discipline to profiles table
ALTER TABLE public.profiles 
ADD COLUMN discipline TEXT CHECK (discipline IN ('nursing', 'physical_therapy', 'occupational_therapy', 'speech_therapy', 'case_management', 'clinical_coordination', 'social_work', 'administration'));

-- Add discipline tracking to assessments
ALTER TABLE public.assessments 
ADD COLUMN discipline TEXT CHECK (discipline IN ('nursing', 'physical_therapy', 'occupational_therapy', 'speech_therapy', 'case_management', 'clinical_coordination'));

-- Enable RLS on new tables
ALTER TABLE public.source_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinician_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_source_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for source_documents
CREATE POLICY "Admins can view all source documents" 
ON public.source_documents 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin', 'supervisor']));

CREATE POLICY "Clinical staff can view source documents for assigned patients" 
ON public.source_documents 
FOR SELECT 
USING (
  (get_current_user_role() = ANY (ARRAY['nurse', 'clinical_coordinator', 'case_manager'])) 
  AND is_user_assigned_to_patient(patient_id)
);

CREATE POLICY "Clinical staff can create source documents" 
ON public.source_documents 
FOR INSERT 
WITH CHECK (
  (get_current_user_role() = ANY (ARRAY['nurse', 'clinical_coordinator', 'case_manager'])) 
  AND is_user_assigned_to_patient(patient_id)
);

CREATE POLICY "Authors can update their own source documents" 
ON public.source_documents 
FOR UPDATE 
USING (auth.uid() = author_id);

-- RLS policies for clinician_notes
CREATE POLICY "Admins can view all clinician notes" 
ON public.clinician_notes 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['admin', 'supervisor']));

CREATE POLICY "Clinical staff can view notes for assigned patients" 
ON public.clinician_notes 
FOR SELECT 
USING (
  (get_current_user_role() = ANY (ARRAY['nurse', 'clinical_coordinator', 'case_manager'])) 
  AND is_user_assigned_to_patient(patient_id)
);

CREATE POLICY "Clinical staff can create notes" 
ON public.clinician_notes 
FOR INSERT 
WITH CHECK (
  (get_current_user_role() = ANY (ARRAY['nurse', 'clinical_coordinator', 'case_manager'])) 
  AND is_user_assigned_to_patient(patient_id)
);

CREATE POLICY "Authors can update their own notes" 
ON public.clinician_notes 
FOR UPDATE 
USING (auth.uid() = author_id);

-- RLS policies for data_source_links
CREATE POLICY "Authenticated users can view data source links" 
ON public.data_source_links 
FOR SELECT 
USING (true);

CREATE POLICY "Clinical staff can create data source links" 
ON public.data_source_links 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['nurse', 'clinical_coordinator', 'case_manager', 'admin', 'supervisor']));

-- Create indexes for performance
CREATE INDEX idx_source_documents_patient_id ON public.source_documents(patient_id);
CREATE INDEX idx_source_documents_author_id ON public.source_documents(author_id);
CREATE INDEX idx_source_documents_type ON public.source_documents(document_type);
CREATE INDEX idx_clinician_notes_patient_id ON public.clinician_notes(patient_id);
CREATE INDEX idx_clinician_notes_author_id ON public.clinician_notes(author_id);
CREATE INDEX idx_clinician_notes_discipline ON public.clinician_notes(discipline);
CREATE INDEX idx_data_source_links_data ON public.data_source_links(data_table, data_id);
CREATE INDEX idx_assessments_discipline ON public.assessments(discipline);

-- Create trigger for updated_at timestamps
CREATE TRIGGER update_source_documents_updated_at
BEFORE UPDATE ON public.source_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinician_notes_updated_at
BEFORE UPDATE ON public.clinician_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();