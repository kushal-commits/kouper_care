-- Insert sample alerts with basic alert types
INSERT INTO alerts (patient_id, alert_type, severity, title, message, is_acknowledged, created_at) VALUES
-- Active critical alerts
((SELECT id FROM patients LIMIT 1), 'alert', 'critical', 'Critical ADL Decline', 'Patient shows significant decline in bathing and mobility scores', false, NOW() - INTERVAL '2 hours'),
((SELECT id FROM patients OFFSET 1 LIMIT 1), 'alert', 'critical', 'Fall Risk Alert', 'Patient had 2 near-falls in past 24 hours', false, NOW() - INTERVAL '4 hours'),
((SELECT id FROM patients OFFSET 2 LIMIT 1), 'alert', 'critical', 'Medication Non-Compliance', 'Patient missed 3 consecutive medication doses', false, NOW() - INTERVAL '1 day'),

-- Active high severity alerts
((SELECT id FROM patients LIMIT 1), 'alert', 'high', 'Wound Deterioration', 'Stage 2 pressure ulcer showing signs of progression', false, NOW() - INTERVAL '6 hours'),
((SELECT id FROM patients OFFSET 1 LIMIT 1), 'alert', 'high', 'Blood Pressure Spike', 'BP reading 180/95 - above baseline', false, NOW() - INTERVAL '8 hours'),

-- Active medium severity alerts  
((SELECT id FROM patients OFFSET 2 LIMIT 1), 'alert', 'medium', 'Missed Appointment', 'Patient missed PT appointment today', false, NOW() - INTERVAL '3 hours'),

-- Some acknowledged alerts (won't count as active)
((SELECT id FROM patients LIMIT 1), 'alert', 'critical', 'Previous Alert', 'This was resolved', true, NOW() - INTERVAL '2 days'),
((SELECT id FROM patients OFFSET 1 LIMIT 1), 'alert', 'high', 'Previous High Alert', 'This was also resolved', true, NOW() - INTERVAL '1 day');