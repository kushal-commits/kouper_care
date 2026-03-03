-- Add sample insurance info to patients without it
UPDATE patients 
SET insurance_info = jsonb_build_object(
  'primary', 'Medicare Part A & B',
  'secondary', 'Humana Advantage Plus',
  'id', 'MED' || (random() * 999999)::int,
  'group_number', 'GRP-' || (random() * 9999)::int,
  'effective_date', '2024-01-01'
) 
WHERE insurance_info IS NULL;

-- Create episodes with valid status values
INSERT INTO episodes (patient_id, episode_number, start_date, end_date, status)
SELECT 
  p.id,
  'EP-' || (random() * 99999)::int || '-' || substring(p.id::text, 1, 8),
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '60 days',
  'active'
FROM patients p
WHERE NOT EXISTS (SELECT 1 FROM episodes e WHERE e.patient_id = p.id)
LIMIT 5;

-- Create assessments with valid constraint values
INSERT INTO assessments (
  patient_id, 
  episode_id,
  assessment_type, 
  assessment_date,
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
)
SELECT 
  p.id,
  e.id,
  'start_of_care',  -- Valid assessment type
  CURRENT_DATE - INTERVAL '7 days',
  2, 3, 2, 3, 4, 2, 3, 2, 3,  -- All scores 0-5 range
  'Initial assessment shows patient requires moderate assistance with ADL activities.'
FROM patients p
JOIN episodes e ON e.patient_id = p.id
WHERE NOT EXISTS (SELECT 1 FROM assessments a WHERE a.patient_id = p.id)
LIMIT 5;

-- Create follow-up assessments to show progress
INSERT INTO assessments (
  patient_id, 
  episode_id,
  assessment_type, 
  assessment_date,
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
)
SELECT 
  p.id,
  e.id,
  'follow_up',
  CURRENT_DATE - INTERVAL '2 days',
  3, 4, 3, 4, 4, 3, 4, 3, 4,  -- Improved scores
  'Follow-up assessment shows patient improvement in independence with daily activities.'
FROM patients p
JOIN episodes e ON e.patient_id = p.id AND e.status = 'active'
WHERE EXISTS (SELECT 1 FROM assessments a WHERE a.patient_id = p.id)
LIMIT 3;