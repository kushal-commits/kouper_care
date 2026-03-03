-- Add more alerts with proper severity values (info, warning, critical)
INSERT INTO alerts (patient_id, alert_type, severity, title, message, is_acknowledged, created_at) 
VALUES 
-- More critical alerts
((SELECT id FROM patients ORDER BY created_at OFFSET 3 LIMIT 1), 'declining_adl', 'critical', 'Severe Mobility Loss', 'Patient unable to transfer independently', false, NOW() - INTERVAL '5 hours'),
((SELECT id FROM patients ORDER BY created_at OFFSET 4 LIMIT 1), 'intervention_overdue', 'critical', 'Critical Med Review', 'Medication reconciliation 5 days overdue', false, NOW() - INTERVAL '12 hours'),

-- Warning alerts
((SELECT id FROM patients ORDER BY created_at OFFSET 5 LIMIT 1), 'high_risk', 'warning', 'Elevated Fall Risk', 'Patient shows unsteady gait', false, NOW() - INTERVAL '1 hour'),
((SELECT id FROM patients ORDER BY created_at OFFSET 6 LIMIT 1), 'missed_assessment', 'warning', 'Assessment Reminder', 'PT assessment due tomorrow', false, NOW() - INTERVAL '30 minutes'),

-- Some acknowledged alerts for yesterday's count
((SELECT id FROM patients ORDER BY created_at LIMIT 1), 'declining_adl', 'critical', 'Previous Critical', 'Resolved alert from yesterday', true, NOW() - INTERVAL '1 day' + INTERVAL '2 hours'),
((SELECT id FROM patients ORDER BY created_at OFFSET 1 LIMIT 1), 'high_risk', 'warning', 'Previous Warning', 'Resolved warning from yesterday', true, NOW() - INTERVAL '1 day' + INTERVAL '4 hours');