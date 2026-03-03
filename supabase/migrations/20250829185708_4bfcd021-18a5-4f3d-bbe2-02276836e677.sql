-- First, add sample insurance info to existing patients
UPDATE patients SET insurance_info = jsonb_build_object(
  'primary', 'Medicare Part A & B',
  'secondary', 'Humana Advantage Plus',
  'id', 'MED' || EXTRACT(EPOCH FROM NOW())::text || (random() * 1000)::int
) WHERE insurance_info IS NULL;

-- Update some patients with more detailed insurance information  
UPDATE patients SET insurance_info = jsonb_build_object(
  'primary', 'Blue Cross Blue Shield',
  'secondary', 'Medicare Supplement Plan F', 
  'id', 'BCBS-' || EXTRACT(EPOCH FROM NOW())::text || (random() * 1000)::int,
  'group_number', 'GRP-' || (random() * 9999)::int,
  'effective_date', '2024-01-01',
  'copay', '$20'
) WHERE id IN (SELECT id FROM patients ORDER BY random() LIMIT 2);

-- Create sample episodes using timestamp-based unique numbers
WITH episode_data AS (
  SELECT 
    p.id as patient_id,
    'EP-' || EXTRACT(EPOCH FROM NOW())::text || '-' || row_number() OVER () as episode_number,
    CURRENT_DATE - INTERVAL '30 days' as start_date,
    CASE 
      WHEN random() > 0.3 THEN CURRENT_DATE + INTERVAL '60 days'
      ELSE CURRENT_DATE - INTERVAL '5 days'
    END as end_date,
    CASE 
      WHEN random() > 0.3 THEN 'active'
      ELSE 'completed'
    END as status,
    CASE 
      WHEN random() > 0.3 THEN NULL
      ELSE CASE (random() * 4)::int
        WHEN 0 THEN 'Goals met'
        WHEN 1 THEN 'Patient moved'
        WHEN 2 THEN 'Insurance coverage ended'
        ELSE 'Hospitalization'
      END
    END as discharge_reason
  FROM patients p
  WHERE NOT EXISTS (SELECT 1 FROM episodes e WHERE e.patient_id = p.id)
  LIMIT 10
)
INSERT INTO episodes (patient_id, episode_number, start_date, end_date, status, primary_nurse_id, coordinator_id, discharge_reason)
SELECT 
  episode_data.patient_id,
  episode_data.episode_number,
  episode_data.start_date,
  episode_data.end_date,
  episode_data.status,
  (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'clinical_coordinator' LIMIT 1),
  episode_data.discharge_reason
FROM episode_data;

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
  'Initial Assessment',
  CURRENT_DATE - INTERVAL '1 day' * (random() * 14)::int,
  (SELECT id FROM profiles WHERE role IN ('nurse', 'clinical_coordinator') ORDER BY random() LIMIT 1),
  -- ADL Scores (1-4 scale: 1=Total Dependence, 2=Extensive Assistance, 3=Limited Assistance, 4=Independence)
  (random() * 3)::int + 1, -- bathing
  (random() * 3)::int + 1, -- dressing upper
  (random() * 3)::int + 1, -- dressing lower
  (random() * 3)::int + 1, -- grooming
  (random() * 3)::int + 1, -- eating
  (random() * 3)::int + 1, -- toileting
  (random() * 3)::int + 1, -- transferring
  (random() * 3)::int + 1, -- ambulation
  (random() * 3)::int + 1, -- medication management
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