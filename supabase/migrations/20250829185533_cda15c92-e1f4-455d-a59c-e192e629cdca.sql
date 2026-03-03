-- First, let's add sample insurance info to existing patients
UPDATE patients SET insurance_info = jsonb_build_object(
  'primary', 'Medicare Part A & B',
  'secondary', 'Humana Advantage Plus',
  'id', 'MED' || LPAD((random() * 999999)::text, 6, '0')
) WHERE insurance_info IS NULL;

-- Create sample episodes for patients that don't have any episodes yet
-- Use a sequence-based approach to ensure unique episode numbers
INSERT INTO episodes (patient_id, episode_number, start_date, end_date, status, primary_nurse_id, coordinator_id, discharge_reason)
SELECT 
  p.id,
  'EP-2024-' || LPAD(nextval('episodes_id_seq')::text, 4, '0'),
  CURRENT_DATE - INTERVAL '30 days',
  CASE 
    WHEN random() > 0.3 THEN CURRENT_DATE + INTERVAL '60 days'
    ELSE CURRENT_DATE - INTERVAL '5 days'
  END,
  CASE 
    WHEN random() > 0.3 THEN 'active'
    ELSE 'completed'
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
WHERE NOT EXISTS (SELECT 1 FROM episodes e WHERE e.patient_id = p.id)
LIMIT 10;

-- Create sample assessments with realistic ADL scores for patients with episodes
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
  CASE (row_number() OVER (PARTITION BY p.id ORDER BY random()) % 3)
    WHEN 0 THEN 'Initial Assessment'
    WHEN 1 THEN 'Progress Assessment'
    ELSE 'Follow-up Assessment'
  END,
  CURRENT_DATE - INTERVAL '1 day' * (random() * 14)::int,
  (SELECT id FROM profiles WHERE role IN ('nurse', 'clinical_coordinator') ORDER BY random() LIMIT 1),
  -- ADL Scores (1-4 scale: 1=Total Dependence, 2=Extensive Assistance, 3=Limited Assistance, 4=Independence)
  (random() * 3)::int + 1, -- bathing: 1-4
  (random() * 3)::int + 1, -- dressing upper: 1-4
  (random() * 3)::int + 1, -- dressing lower: 1-4
  (random() * 3)::int + 1, -- grooming: 1-4
  (random() * 3)::int + 1, -- eating: 1-4
  (random() * 3)::int + 1, -- toileting: 1-4
  (random() * 3)::int + 1, -- transferring: 1-4
  (random() * 3)::int + 1, -- ambulation: 1-4
  (random() * 3)::int + 1, -- medication management: 1-4
  CASE (random() * 6)::int
    WHEN 0 THEN 'Patient shows good progress in mobility. Able to perform most ADL tasks with minimal assistance.'
    WHEN 1 THEN 'Requires assistance with bathing and dressing. Family caregiver training provided.'
    WHEN 2 THEN 'Patient demonstrates improvement in transfer skills. Continue physical therapy.'
    WHEN 3 THEN 'Fall risk assessment completed. Safety equipment installed in home.'
    WHEN 4 THEN 'Medication compliance improved with pill organizer system.'
    ELSE 'Patient meeting care goals. Ready for transition to maintenance phase.'
  END
FROM patients p
JOIN episodes e ON e.patient_id = p.id
WHERE NOT EXISTS (SELECT 1 FROM assessments a WHERE a.patient_id = p.id);

-- Create additional follow-up assessments for active episodes to show progress
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
  'Progress Assessment',
  CURRENT_DATE - INTERVAL '1 day' * (random() * 7)::int,
  (SELECT id FROM profiles WHERE role IN ('nurse', 'clinical_coordinator') ORDER BY random() LIMIT 1),
  -- Slightly improved scores for follow-up assessments
  LEAST(4, (SELECT bathing_score FROM assessments WHERE patient_id = p.id ORDER BY assessment_date DESC LIMIT 1) + (random() * 2)::int),
  LEAST(4, (SELECT dressing_upper_score FROM assessments WHERE patient_id = p.id ORDER BY assessment_date DESC LIMIT 1) + (random() * 2)::int),
  LEAST(4, (SELECT dressing_lower_score FROM assessments WHERE patient_id = p.id ORDER BY assessment_date DESC LIMIT 1) + (random() * 2)::int),
  LEAST(4, (SELECT grooming_score FROM assessments WHERE patient_id = p.id ORDER BY assessment_date DESC LIMIT 1) + (random() * 2)::int),
  LEAST(4, (SELECT eating_score FROM assessments WHERE patient_id = p.id ORDER BY assessment_date DESC LIMIT 1) + (random() * 2)::int),
  LEAST(4, (SELECT toileting_score FROM assessments WHERE patient_id = p.id ORDER BY assessment_date DESC LIMIT 1) + (random() * 2)::int),
  LEAST(4, (SELECT transferring_score FROM assessments WHERE patient_id = p.id ORDER BY assessment_date DESC LIMIT 1) + (random() * 2)::int),
  LEAST(4, (SELECT ambulation_score FROM assessments WHERE patient_id = p.id ORDER BY assessment_date DESC LIMIT 1) + (random() * 2)::int),
  LEAST(4, (SELECT medication_mgmt_score FROM assessments WHERE patient_id = p.id ORDER BY assessment_date DESC LIMIT 1) + (random() * 2)::int),
  CASE (random() * 4)::int
    WHEN 0 THEN 'Continued progress noted. Patient more confident with mobility tasks.'
    WHEN 1 THEN 'Patient demonstrates increased independence in self-care activities.'
    WHEN 2 THEN 'Goals being met according to established care plan timeline.'
    ELSE 'Patient requires ongoing monitoring and support. Family involvement strong.'
  END
FROM patients p
JOIN episodes e ON e.patient_id = p.id AND e.status = 'active'
WHERE EXISTS (SELECT 1 FROM assessments a WHERE a.patient_id = p.id)
LIMIT 5;