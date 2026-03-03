-- Insert sample episode data for the current patient
INSERT INTO public.episodes (
  patient_id, 
  episode_number, 
  start_date, 
  end_date, 
  status, 
  primary_nurse_id, 
  coordinator_id
) 
SELECT 
  'a533d1e7-18c4-48e9-b57f-d9fd3278faa6',
  'EP2025002',
  '2024-11-20',
  '2024-12-20', 
  'active',
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.episodes WHERE patient_id = 'a533d1e7-18c4-48e9-b57f-d9fd3278faa6'
);

-- Insert sample assessment data for this patient
INSERT INTO public.assessments (
  patient_id,
  episode_id,
  assessment_type,
  assessment_date,
  discipline,
  bathing_score,
  dressing_upper_score,
  dressing_lower_score,
  grooming_score,
  eating_score,
  toileting_score,
  transferring_score,
  ambulation_score,
  medication_mgmt_score,
  notes,
  assessor_id
) VALUES 
-- Baseline assessment
(
  'a533d1e7-18c4-48e9-b57f-d9fd3278faa6',
  (SELECT id FROM public.episodes WHERE patient_id = 'a533d1e7-18c4-48e9-b57f-d9fd3278faa6' LIMIT 1),
  'start_of_care',
  '2024-11-20',
  'nursing',
  3, -- bathing
  4, -- dressing_upper  
  4, -- dressing_lower
  3, -- grooming
  5, -- eating
  4, -- toileting
  3, -- transferring
  3, -- ambulation
  5, -- medication_mgmt
  'Start of care assessment. Patient shows good potential for improvement with targeted interventions.',
  NULL
),
-- Progress assessment showing improvement
(
  'a533d1e7-18c4-48e9-b57f-d9fd3278faa6',
  (SELECT id FROM public.episodes WHERE patient_id = 'a533d1e7-18c4-48e9-b57f-d9fd3278faa6' LIMIT 1),
  'follow_up',
  '2024-12-05',
  'occupational_therapy',
  4, -- bathing (improved)
  4, -- dressing_upper
  4, -- dressing_lower
  4, -- grooming (improved)
  5, -- eating
  4, -- toileting
  4, -- transferring (improved)
  4, -- ambulation (improved)
  5, -- medication_mgmt
  'Good progress noted across multiple ADL areas. Continue current intervention plan.',
  NULL
);

-- Insert sample interventions
INSERT INTO public.interventions (
  patient_id,
  episode_id, 
  intervention_type,
  description,
  status,
  priority,
  scheduled_date,
  assigned_to_id,
  notes
) VALUES
(
  'a533d1e7-18c4-48e9-b57f-d9fd3278faa6',
  (SELECT id FROM public.episodes WHERE patient_id = 'a533d1e7-18c4-48e9-b57f-d9fd3278faa6' LIMIT 1),
  'physical_therapy',
  'Mobility and strength training session',
  'pending',
  'medium',
  '2024-12-12',
  NULL,
  'Continue mobility improvements with focus on ambulation and transferring.'
),
(
  'a533d1e7-18c4-48e9-b57f-d9fd3278faa6', 
  (SELECT id FROM public.episodes WHERE patient_id = 'a533d1e7-18c4-48e9-b57f-d9fd3278faa6' LIMIT 1),
  'occupational_therapy',
  'ADL training and adaptive equipment assessment',
  'completed',
  'high', 
  '2024-12-08',
  NULL,
  'Completed ADL assessment. Patient responding well to interventions.'
);