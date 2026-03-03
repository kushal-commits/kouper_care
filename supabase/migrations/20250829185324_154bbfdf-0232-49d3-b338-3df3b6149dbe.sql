-- First, let's add sample insurance info to existing patients
UPDATE patients SET insurance_info = jsonb_build_object(
  'primary', 'Medicare Part A & B',
  'secondary', 'Humana Advantage Plus',
  'id', 'MED' || LPAD((random() * 999999)::text, 6, '0')
) WHERE insurance_info IS NULL;

-- Create sample episodes for all patients
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
    WHEN random() > 0.3 THEN 'active'
    ELSE 'discharged'
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
  -- ADL Scores (0-4 scale typically)
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
    WHEN 0 THEN 'Patient shows good progress in mobility'
    WHEN 1 THEN 'Requires assistance with daily activities'
    WHEN 2 THEN 'Patient demonstrates improvement in self-care'
    WHEN 3 THEN 'Safety concerns noted during assessment'
    ELSE 'Patient meeting established care goals'
  END
FROM patients p
JOIN episodes e ON e.patient_id = p.id
WHERE NOT EXISTS (SELECT 1 FROM assessments a WHERE a.patient_id = p.id);

-- Create additional assessments to show progress over time
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
  'Follow-up Assessment',
  CURRENT_DATE - INTERVAL '1 day' * (random() * 14)::int,
  (SELECT id FROM profiles WHERE role IN ('nurse', 'clinical_coordinator') ORDER BY random() LIMIT 1),
  -- Slightly improved scores for follow-up
  LEAST(4, (random() * 4)::int + 2), 
  LEAST(4, (random() * 4)::int + 2), 
  LEAST(4, (random() * 4)::int + 2),  
  LEAST(4, (random() * 4)::int + 2), 
  LEAST(4, (random() * 4)::int + 2), 
  LEAST(4, (random() * 4)::int + 2), 
  LEAST(4, (random() * 4)::int + 2), 
  LEAST(4, (random() * 4)::int + 2), 
  LEAST(4, (random() * 4)::int + 2), 
  CASE (random() * 4)::int
    WHEN 0 THEN 'Continued progress noted in patient mobility'
    WHEN 1 THEN 'Patient demonstrates increased independence'
    WHEN 2 THEN 'Goals being met according to care plan'
    ELSE 'Patient requires ongoing support and monitoring'
  END
FROM patients p
JOIN episodes e ON e.patient_id = p.id
WHERE e.status = 'active';

-- Create sample interventions for active episodes
INSERT INTO interventions (
  patient_id,
  episode_id,
  intervention_type,
  description,
  scheduled_date,
  status,
  priority,
  assigned_to_id,
  notes
)
SELECT 
  p.id,
  e.id,
  CASE (random() * 5)::int
    WHEN 0 THEN 'Physical Therapy'
    WHEN 1 THEN 'Medication Management'
    WHEN 2 THEN 'Safety Assessment'
    WHEN 3 THEN 'Wound Care'
    ELSE 'Patient Education'
  END,
  CASE (random() * 5)::int
    WHEN 0 THEN 'Assess mobility and provide therapy exercises'
    WHEN 1 THEN 'Review medications and ensure compliance'
    WHEN 2 THEN 'Conduct home safety evaluation'
    WHEN 3 THEN 'Monitor and treat pressure ulcers'
    ELSE 'Educate patient on condition management'
  END,
  CURRENT_DATE + INTERVAL '1 day' * (random() * 14)::int,
  CASE (random() * 3)::int
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'in_progress'
    ELSE 'completed'
  END,
  CASE (random() * 3)::int
    WHEN 0 THEN 'low'
    WHEN 1 THEN 'medium'
    ELSE 'high'
  END,
  (SELECT id FROM profiles WHERE role IN ('nurse', 'clinical_coordinator') ORDER BY random() LIMIT 1),
  'Standard intervention protocol'
FROM patients p
JOIN episodes e ON e.patient_id = p.id AND e.status = 'active'
WHERE NOT EXISTS (SELECT 1 FROM interventions i WHERE i.patient_id = p.id);

-- Update some patients with more detailed insurance information
UPDATE patients SET insurance_info = jsonb_build_object(
  'primary', 'Blue Cross Blue Shield',
  'secondary', 'Medicare Supplement Plan F',
  'id', 'BCBS-' || LPAD((random() * 999999)::text, 6, '0'),
  'group_number', 'GRP-' || LPAD((random() * 9999)::text, 4, '0'),
  'effective_date', '2024-01-01',
  'copay', '$20'
) WHERE id IN (SELECT id FROM patients ORDER BY random() LIMIT 3);

-- Create some alerts for patients
INSERT INTO alerts (
  patient_id,
  episode_id,
  alert_type,
  title,
  message,
  severity,
  is_acknowledged
)
SELECT 
  p.id,
  e.id,
  CASE (random() * 4)::int
    WHEN 0 THEN 'medication_due'
    WHEN 1 THEN 'assessment_overdue'
    WHEN 2 THEN 'safety_concern'
    ELSE 'discharge_planning'
  END,
  CASE (random() * 4)::int
    WHEN 0 THEN 'Medication Review Due'
    WHEN 1 THEN 'Assessment Overdue'
    WHEN 2 THEN 'Safety Risk Identified'
    ELSE 'Discharge Planning Needed'
  END,
  CASE (random() * 4)::int
    WHEN 0 THEN 'Patient medication review is due within 24 hours'
    WHEN 1 THEN 'Patient assessment is overdue by 3 days'
    WHEN 2 THEN 'Fall risk assessment indicates high risk level'
    ELSE 'Patient approaching discharge date - planning required'
  END,
  CASE (random() * 3)::int
    WHEN 0 THEN 'low'
    WHEN 1 THEN 'medium'
    ELSE 'high'
  END,
  random() > 0.7  -- Some alerts are acknowledged
FROM patients p
JOIN episodes e ON e.patient_id = p.id AND e.status = 'active'
ORDER BY random()
LIMIT 10;