-- Now insert alerts with the correct alert_type values from the constraint
INSERT INTO alerts (patient_id, alert_type, severity, title, message, is_acknowledged, created_at) 
VALUES 
-- Critical alerts
((SELECT id FROM patients ORDER BY created_at LIMIT 1), 'declining_adl', 'critical', 'Critical ADL Decline', 'Patient shows significant decline in bathing and mobility scores', false, NOW() - INTERVAL '2 hours'),
((SELECT id FROM patients ORDER BY created_at OFFSET 1 LIMIT 1), 'high_risk', 'critical', 'Fall Risk Alert', 'Patient had 2 near-falls in past 24 hours', false, NOW() - INTERVAL '4 hours'),
((SELECT id FROM patients ORDER BY created_at OFFSET 2 LIMIT 1), 'intervention_overdue', 'critical', 'Overdue Intervention', 'Critical wound care intervention overdue by 3 days', false, NOW() - INTERVAL '1 day'),

-- High severity alerts  
((SELECT id FROM patients ORDER BY created_at LIMIT 1), 'missed_assessment', 'high', 'Assessment Overdue', 'Weekly assessment is 2 days overdue', false, NOW() - INTERVAL '6 hours'),
((SELECT id FROM patients ORDER BY created_at OFFSET 1 LIMIT 1), 'declining_adl', 'high', 'Mobility Decline', 'Patient showing decline in transfer abilities', false, NOW() - INTERVAL '8 hours'),

-- Medium severity alerts
((SELECT id FROM patients ORDER BY created_at OFFSET 2 LIMIT 1), 'missed_assessment', 'medium', 'Routine Assessment Due', 'Monthly assessment due in 2 days', false, NOW() - INTERVAL '3 hours'),

-- Some acknowledged alerts (won't count as active)
((SELECT id FROM patients ORDER BY created_at LIMIT 1), 'high_risk', 'critical', 'Previous Risk Alert', 'This was resolved', true, NOW() - INTERVAL '2 days'),
((SELECT id FROM patients ORDER BY created_at OFFSET 1 LIMIT 1), 'intervention_overdue', 'high', 'Previous Overdue', 'This was also resolved', true, NOW() - INTERVAL '1 day');