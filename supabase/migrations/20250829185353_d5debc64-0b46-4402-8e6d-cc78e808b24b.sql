-- First, let's add sample insurance info to existing patients
UPDATE patients SET insurance_info = jsonb_build_object(
  'primary', 'Medicare Part A & B',
  'secondary', 'Humana Advantage Plus',
  'id', 'MED' || LPAD((random() * 999999)::text, 6, '0')
) WHERE insurance_info IS NULL;

-- Create sample episodes for all patients with valid status values
INSERT INTO episodes (patient_id, episode_number, start_date, end_date, status, primary_nurse_id, coordinator_id, discharge_reason)
SELECT 
  p.id,
  'EP-' || LPAD((random() * 9999)::text, 4, '0'),
  CURRENT_DATE - INTERVAL '30 days',
  CASE 
    WHEN random() > 0.3 THEN CURRENT_DATE + INTERVAL '60 days'
    ELSE CURRENT_DATE - INTERVAL '5 days'
  END,
  CASE 
    WHEN random() > 0.3 THEN 'active'::text
    ELSE 'completed'::text
  END,
  (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'clinical_coordinator' LIMIT 1),
  CASE 
    WHEN random() > 0.3 THEN NULL
    ELSE CASE (random() * 4)::int
      WHEN 0 THEN 'Goals met'
      WHEN 1 THEN 'Patient moved'
      WHEN 2 THEN 'Insurance coverage ended'
      ELSE 'Hospitalization'
    END
  END
FROM patients p
WHERE NOT EXISTS (SELECT 1 FROM episodes e WHERE e.patient_id = p.id);

-- Create sample assessments with realistic ADL scores
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
)
SELECT 
  p.id,
  e.id,
  CASE (random() * 3)::int
    WHEN 0 THEN 'Initial Assessment'
    WHEN 1 THEN 'Progress Assessment'
    ELSE 'Discharge Assessment'
  END,
  CURRENT_DATE - INTERVAL '1 day' * (random() * 30)::int,
  (SELECT id FROM profiles WHERE role IN ('nurse', 'clinical_coordinator') ORDER BY random() LIMIT 1),
  -- ADL Scores (1-4 scale for independence levels)
  (random() * 4)::int + 1, -- bathing
  (random() * 4)::int + 1, -- dressing upper
  (random() * 4)::int + 1, -- dressing lower  
  (random() * 4)::int + 1, -- grooming
  (random() * 4)::int + 1, -- eating
  (random() * 4)::int + 1, -- toileting
  (random() * 4)::int + 1, -- transferring
  (random() * 4)::int + 1, -- ambulation
  (random() * 4)::int + 1, -- medication management
  CASE (random() * 5)::int
    WHEN 0 THEN 'Patient shows good progress in mobility and self-care tasks'
    WHEN 1 THEN 'Requires assistance with daily activities, family support available'
    WHEN 2 THEN 'Patient demonstrates improvement in independence with ADL tasks'
    WHEN 3 THEN 'Safety concerns noted during assessment, fall risk precautions implemented'
    ELSE 'Patient meeting established care goals, continue current plan'
  END
FROM patients p
JOIN episodes e ON e.patient_id = p.id
WHERE NOT EXISTS (SELECT 1 FROM assessments a WHERE a.patient_id = p.id);

-- Update some patients with more detailed insurance information
UPDATE patients SET insurance_info = jsonb_build_object(
  'primary', 'Blue Cross Blue Shield',
  'secondary', 'Medicare Supplement Plan F', 
  'id', 'BCBS-' || LPAD((random() * 999999)::text, 6, '0'),
  'group_number', 'GRP-' || LPAD((random() * 9999)::text, 4, '0'),
  'effective_date', '2024-01-01',
  'copay', '$20'
) WHERE id IN (SELECT id FROM patients ORDER BY random() LIMIT 2);