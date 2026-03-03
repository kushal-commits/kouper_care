-- Create some basic sample alerts that should work with existing data
-- First let's see what we have and create minimal working data

-- Insert basic alerts (trying with different alert_type values)
INSERT INTO alerts (patient_id, alert_type, severity, title, message, is_acknowledged, created_at) 
SELECT 
    p.id,
    'notification' as alert_type,
    'critical' as severity,
    'ADL Score Decline' as title,
    'Patient showing decline in daily living activities' as message,
    false as is_acknowledged,
    NOW() - INTERVAL '2 hours' as created_at
FROM patients p 
LIMIT 1;

-- Add more alerts if the first one works
INSERT INTO alerts (patient_id, alert_type, severity, title, message, is_acknowledged, created_at) 
SELECT 
    p.id,
    'notification' as alert_type,
    'high' as severity,
    'Medication Review Needed' as title,
    'Patient medication needs review by physician' as message,
    false as is_acknowledged,
    NOW() - INTERVAL '4 hours' as created_at
FROM patients p 
OFFSET 1 LIMIT 1;