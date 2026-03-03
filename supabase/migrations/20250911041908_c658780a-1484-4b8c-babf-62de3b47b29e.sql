-- Insert sample episode data for Barbara Robinson
INSERT INTO public.episodes (
  patient_id, 
  episode_number, 
  start_date, 
  end_date, 
  status, 
  primary_nurse_id, 
  coordinator_id
) VALUES (
  '418a353a-cc2b-401b-a403-73148307f4d5',
  'EP2025001',
  '2024-12-15',
  '2025-01-14', 
  'active',
  NULL,
  NULL
);

-- Insert sample assessment data for Barbara Robinson
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
-- Baseline OASIS assessment
(
  '418a353a-cc2b-401b-a403-73148307f4d5',
  (SELECT id FROM public.episodes WHERE patient_id = '418a353a-cc2b-401b-a403-73148307f4d5' LIMIT 1),
  'oasis_start_of_care',
  '2024-12-15',
  'nursing',
  4, -- bathing
  3, -- dressing_upper  
  3, -- dressing_lower
  4, -- grooming
  5, -- eating
  3, -- toileting
  2, -- transferring
  2, -- ambulation
  4, -- medication_mgmt
  'Baseline OASIS assessment. Patient requires assistance with mobility and transferring due to chronic kidney disease complications.',
  NULL
),
-- Mid-episode assessment showing some decline
(
  '418a353a-cc2b-401b-a403-73148307f4d5',
  (SELECT id FROM public.episodes WHERE patient_id = '418a353a-cc2b-401b-a403-73148307f4d5' LIMIT 1),
  'progress_assessment',
  '2024-12-28',
  'physical_therapy',
  3, -- bathing (declined)
  3, -- dressing_upper
  3, -- dressing_lower  
  4, -- grooming
  5, -- eating
  2, -- toileting (declined)
  2, -- transferring
  3, -- ambulation (improved)
  4, -- medication_mgmt
  'Patient showing improvement in ambulation after PT interventions. Some decline noted in bathing and toileting independence.',
  NULL
),
-- Latest assessment  
(
  '418a353a-cc2b-401b-a403-73148307f4d5',
  (SELECT id FROM public.episodes WHERE patient_id = '418a353a-cc2b-401b-a403-73148307f4d5' LIMIT 1),
  'progress_assessment',
  '2025-01-08',
  'occupational_therapy',
  2, -- bathing (further decline)
  3, -- dressing_upper
  3, -- dressing_lower
  4, -- grooming  
  4, -- eating (slight decline)
  2, -- toileting
  3, -- transferring (improved)
  3, -- ambulation
  4, -- medication_mgmt
  'OT assessment shows continued bathing challenges. Recommend adaptive equipment and safety modifications. Good progress with transferring skills.',
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
  '418a353a-cc2b-401b-a403-73148307f4d5',
  (SELECT id FROM public.episodes WHERE patient_id = '418a353a-cc2b-401b-a403-73148307f4d5' LIMIT 1),
  'occupational_therapy',
  'Comprehensive bathing safety assessment and adaptive equipment training',
  'scheduled',
  'high',
  '2025-01-12',
  NULL,
  'Patient flagged for declining bathing independence. Schedule comprehensive OT evaluation.'
),
(
  '418a353a-cc2b-401b-a403-73148307f4d5', 
  (SELECT id FROM public.episodes WHERE patient_id = '418a353a-cc2b-401b-a403-73148307f4d5' LIMIT 1),
  'physical_therapy',
  'Mobility and transfer training continuation',
  'in_progress',
  'medium', 
  '2025-01-10',
  NULL,
  'Continue PT for mobility improvements. Good progress noted.'
);