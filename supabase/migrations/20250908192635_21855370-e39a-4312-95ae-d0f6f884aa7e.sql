-- Let's check what alert_type values are allowed by looking at the constraint
-- First, let's try some common alert types that might be allowed
INSERT INTO alerts (patient_id, alert_type, severity, title, message, is_acknowledged) 
VALUES 
((SELECT id FROM patients ORDER BY created_at LIMIT 1), 'system', 'critical', 'Test Alert', 'Test message', false);

-- If that fails, let's try other common values
-- INSERT INTO alerts (patient_id, alert_type, severity, title, message, is_acknowledged) 
-- VALUES 
-- ((SELECT id FROM patients ORDER BY created_at LIMIT 1), 'clinical', 'high', 'Test Alert 2', 'Test message 2', false);