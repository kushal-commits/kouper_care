-- Create sample episode for the current patient
INSERT INTO episodes (
  patient_id, 
  episode_number, 
  start_date, 
  end_date, 
  status,
  primary_nurse_id,
  coordinator_id
) VALUES (
  '061a562c-e34d-4c2b-b36d-3d02465de7b2',
  'EP-2024-' || (EXTRACT(EPOCH FROM NOW())::int),
  CURRENT_DATE - INTERVAL '45 days',
  CURRENT_DATE + INTERVAL '30 days', 
  'active',
  (SELECT id FROM profiles WHERE role IN ('nurse', 'clinical_coordinator') LIMIT 1),
  (SELECT id FROM profiles WHERE role IN ('clinical_coordinator', 'case_manager') LIMIT 1)
);

-- Create initial assessment for Margaret Johnson
INSERT INTO assessments (
  patient_id,
  episode_id, 
  assessment_type,
  assessment_date,
  assessor_id,
  bathing_score,
  dressing_upper_score,
  dressing_lower_score,
  grooming_score,
  eating_score,
  toileting_score,
  transferring_score,
  ambulation_score,
  medication_mgmt_score,
  notes
) VALUES (
  '061a562c-e34d-4c2b-b36d-3d02465de7b2',
  (SELECT id FROM episodes WHERE patient_id = '061a562c-e34d-4c2b-b36d-3d02465de7b2' LIMIT 1),
  'start_of_care',
  CURRENT_DATE - INTERVAL '40 days',
  (SELECT id FROM profiles WHERE role IN ('nurse', 'clinical_coordinator') LIMIT 1),
  2, 2, 1, 3, 4, 2, 2, 1, 2,
  'Initial assessment shows patient requires extensive assistance with bathing, dressing, and mobility. Diabetes management education initiated.'
);

-- Create follow-up assessment showing improvement
INSERT INTO assessments (
  patient_id,
  episode_id,
  assessment_type, 
  assessment_date,
  assessor_id,
  bathing_score,
  dressing_upper_score,
  dressing_lower_score,
  grooming_score,
  eating_score,
  toileting_score,
  transferring_score,
  ambulation_score,
  medication_mgmt_score,
  notes
) VALUES (
  '061a562c-e34d-4c2b-b36d-3d02465de7b2',
  (SELECT id FROM episodes WHERE patient_id = '061a562c-e34d-4c2b-b36d-3d02465de7b2' LIMIT 1),
  'follow_up',
  CURRENT_DATE - INTERVAL '14 days',
  (SELECT id FROM profiles WHERE role IN ('nurse', 'clinical_coordinator') LIMIT 1),
  3, 3, 2, 4, 4, 3, 3, 2, 3,
  'Patient showing improvement in independence. Blood sugar levels stabilizing with medication compliance. Continue current care plan.'
);

-- Create most recent assessment
INSERT INTO assessments (
  patient_id,
  episode_id,
  assessment_type,
  assessment_date,
  assessor_id,
  bathing_score,
  dressing_upper_score,
  dressing_lower_score,
  grooming_score,
  eating_score,
  toileting_score,
  transferring_score,
  ambulation_score,
  medication_mgmt_score,
  notes
) VALUES (
  '061a562c-e34d-4c2b-b36d-3d02465de7b2',
  (SELECT id FROM episodes WHERE patient_id = '061a562c-e34d-4c2b-b36d-3d02465de7b2' LIMIT 1),
  'follow_up',
  CURRENT_DATE - INTERVAL '3 days',
  (SELECT id FROM profiles WHERE role IN ('nurse', 'clinical_coordinator') LIMIT 1),
  4, 4, 3, 4, 5, 4, 4, 3, 4,
  'Excellent progress noted. Patient demonstrates good independence with most ADL tasks. Neuropathy symptoms well-managed.'
);