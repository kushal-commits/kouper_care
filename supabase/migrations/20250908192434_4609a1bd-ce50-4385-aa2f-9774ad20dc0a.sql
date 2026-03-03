-- Insert sample clinician notes (care manager notes awaiting review)
INSERT INTO clinician_notes (patient_id, author_id, discipline, title, content, priority, created_at) VALUES
((SELECT id FROM patients LIMIT 1), (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1), 'case_manager', 'Care Plan Review', 'Patient showing improvement in ADL scores. Recommend continued PT services.', 'high', NOW() - INTERVAL '1 day'),
((SELECT id FROM patients OFFSET 1 LIMIT 1), (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1), 'case_manager', 'Insurance Authorization', 'Need to request extension for skilled nursing visits beyond 30 days.', 'high', NOW() - INTERVAL '2 days'),
((SELECT id FROM patients OFFSET 2 LIMIT 1), (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1), 'case_manager', 'Family Conference', 'Scheduled family meeting to discuss discharge planning options.', 'medium', NOW() - INTERVAL '3 days'),
((SELECT id FROM patients LIMIT 1), (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1), 'case_manager', 'Equipment Order', 'Ordered hospital bed and bedside commode for patient safety.', 'medium', NOW() - INTERVAL '4 days'),
((SELECT id FROM patients OFFSET 1 LIMIT 1), (SELECT id FROM profiles WHERE role = 'nurse' LIMIT 1), 'case_manager', 'Medication Reconciliation', 'Completed medication review with patient and physician.', 'low', NOW() - INTERVAL '5 days');

-- Try simple alerts without episode_id
INSERT INTO alerts (patient_id, alert_type, severity, title, message, is_acknowledged, created_at) VALUES
((SELECT id FROM patients LIMIT 1), 'system', 'critical', 'Critical ADL Decline', 'Patient shows significant decline in bathing and mobility scores', false, NOW() - INTERVAL '2 hours'),
((SELECT id FROM patients OFFSET 1 LIMIT 1), 'system', 'high', 'Blood Pressure Spike', 'BP reading 180/95 - above baseline', false, NOW() - INTERVAL '8 hours'),
((SELECT id FROM patients OFFSET 2 LIMIT 1), 'system', 'medium', 'Missed Appointment', 'Patient missed PT appointment today', false, NOW() - INTERVAL '3 hours');