-- Add 5 more alerts for existing patients
INSERT INTO alerts (patient_id, alert_type, severity, title, message, created_at) VALUES
-- Additional alerts for existing patients
('061a562c-e34d-4c2b-b36d-3d02465de7b2', 'declining_adl', 'critical', 'Transfer abilities severely declining', 'Unable to complete bed-to-chair transfers safely', NOW() - INTERVAL '45 minutes'),
('418a353a-cc2b-401b-a403-73148307f4d5', 'high_risk', 'warning', 'Medication interaction risk', 'New prescription may interact with existing kidney medications', NOW() - INTERVAL '1 hour 30 minutes'),
('21980e3e-2b10-4426-a7f8-2b634f72d4c6', 'declining_adl', 'warning', 'Grooming independence decline', '3-point decline in grooming score over 2 weeks', NOW() - INTERVAL '5 hours'),
('71049ca6-10c0-49fc-b257-d8ef5b23c8e9', 'missed_assessment', 'critical', 'Overdue respiratory assessment', 'Pneumonia follow-up assessment 4 days overdue', NOW() - INTERVAL '8 hours'),
('061a562c-e34d-4c2b-b36d-3d02465de7b2', 'intervention_overdue', 'warning', 'Physical therapy session missed', 'Scheduled PT session not completed, patient unavailable', NOW() - INTERVAL '12 hours');