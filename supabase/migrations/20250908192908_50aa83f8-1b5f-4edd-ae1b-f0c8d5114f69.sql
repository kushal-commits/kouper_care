-- Let's try the most basic possible alert values
-- Try with some simple, common alert type values
INSERT INTO alerts (patient_id, alert_type, severity, title, message, is_acknowledged) 
VALUES 
((SELECT id FROM patients ORDER BY created_at LIMIT 1), 'risk', 'critical', 'ADL Score Decline', 'Patient showing decline in daily living activities', false),
((SELECT id FROM patients ORDER BY created_at OFFSET 1 LIMIT 1), 'care', 'high', 'Medication Review Needed', 'Patient medication needs review by physician', false),
((SELECT id FROM patients ORDER BY created_at OFFSET 2 LIMIT 1), 'assessment', 'medium', 'Missing Assessment', 'Patient assessment is overdue', false);