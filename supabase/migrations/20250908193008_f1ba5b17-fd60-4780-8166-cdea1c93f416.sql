-- Try with the default severity values from the schema
INSERT INTO alerts (patient_id, alert_type, title, message, is_acknowledged, created_at) 
VALUES 
-- Use default severity (should be 'info' based on schema)
((SELECT id FROM patients ORDER BY created_at LIMIT 1), 'declining_adl', 'Critical ADL Decline', 'Patient shows significant decline in bathing and mobility scores', false, NOW() - INTERVAL '2 hours'),
((SELECT id FROM patients ORDER BY created_at OFFSET 1 LIMIT 1), 'high_risk', 'Fall Risk Alert', 'Patient had 2 near-falls in past 24 hours', false, NOW() - INTERVAL '4 hours'),
((SELECT id FROM patients ORDER BY created_at OFFSET 2 LIMIT 1), 'intervention_overdue', 'Overdue Intervention', 'Critical wound care intervention overdue by 3 days', false, NOW() - INTERVAL '1 day'),
((SELECT id FROM patients ORDER BY created_at LIMIT 1), 'missed_assessment', 'Assessment Overdue', 'Weekly assessment is 2 days overdue', false, NOW() - INTERVAL '6 hours'),
((SELECT id FROM patients ORDER BY created_at OFFSET 1 LIMIT 1), 'declining_adl', 'Mobility Decline', 'Patient showing decline in transfer abilities', false, NOW() - INTERVAL '8 hours'),
((SELECT id FROM patients ORDER BY created_at OFFSET 2 LIMIT 1), 'missed_assessment', 'Routine Assessment Due', 'Monthly assessment due in 2 days', false, NOW() - INTERVAL '3 hours');