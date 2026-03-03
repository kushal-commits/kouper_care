-- Add sample insurance info to patients that don't have it
UPDATE patients 
SET insurance_info = jsonb_build_object(
  'primary', 'Medicare Part A & B',
  'secondary', 'Humana Advantage Plus',
  'id', 'MED' || (random() * 999999)::int
) 
WHERE insurance_info IS NULL;

-- Create a simple episode for each patient that doesn't have one
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

-- Create basic assessments with simple valid data
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
  'OASIS',
  CURRENT_DATE - INTERVAL '7 days',
  3, 3, 2, 3, 4, 2, 3, 2, 3,
  'Patient assessment shows moderate assistance needed with daily activities.'
FROM patients p
JOIN episodes e ON e.patient_id = p.id
WHERE NOT EXISTS (SELECT 1 FROM assessments a WHERE a.patient_id = p.id)
LIMIT 5;