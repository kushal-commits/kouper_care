-- Create some basic profiles with valid roles
INSERT INTO profiles (id, email, full_name, role) VALUES 
(gen_random_uuid(), 'nurse1@example.com', 'Sarah Mitchell', 'nurse'),
(gen_random_uuid(), 'coordinator1@example.com', 'Dr. James Wilson', 'coordinator'),
(gen_random_uuid(), 'admin1@example.com', 'Admin User', 'admin');

-- Update the episodes to have proper staff assignments
UPDATE episodes 
SET 
  primary_nurse_id = (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1),
  coordinator_id = (SELECT id FROM profiles WHERE role = 'coordinator' LIMIT 1)
WHERE patient_id = '061a562c-e34d-4c2b-b36d-3d02465de7b2';

-- Update assessments to have proper assessor assignments  
UPDATE assessments 
SET assessor_id = (SELECT id FROM profiles WHERE role IN ('nurse', 'coordinator') ORDER BY random() LIMIT 1)
WHERE patient_id = '061a562c-e34d-4c2b-b36d-3d02465de7b2' AND assessor_id IS NULL;