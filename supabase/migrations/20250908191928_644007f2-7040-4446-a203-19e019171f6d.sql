-- Insert sample alerts with different severities
INSERT INTO alerts (patient_id, episode_id, alert_type, severity, title, message, is_acknowledged, created_at) VALUES
-- Active critical alerts
((SELECT id FROM patients LIMIT 1), (SELECT id FROM episodes LIMIT 1), 'clinical', 'critical', 'Critical ADL Decline', 'Patient shows significant decline in bathing and mobility scores', false, NOW() - INTERVAL '2 hours'),
((SELECT id FROM patients OFFSET 1 LIMIT 1), (SELECT id FROM episodes OFFSET 1 LIMIT 1), 'safety', 'critical', 'Fall Risk Alert', 'Patient had 2 near-falls in past 24 hours', false, NOW() - INTERVAL '4 hours'),
((SELECT id FROM patients OFFSET 2 LIMIT 1), (SELECT id FROM episodes OFFSET 2 LIMIT 1), 'medication', 'critical', 'Medication Non-Compliance', 'Patient missed 3 consecutive medication doses', false, NOW() - INTERVAL '1 day'),

-- Active high severity alerts
((SELECT id FROM patients LIMIT 1), (SELECT id FROM episodes LIMIT 1), 'clinical', 'high', 'Wound Deterioration', 'Stage 2 pressure ulcer showing signs of progression', false, NOW() - INTERVAL '6 hours'),
((SELECT id FROM patients OFFSET 1 LIMIT 1), (SELECT id FROM episodes OFFSET 1 LIMIT 1), 'vitals', 'high', 'Blood Pressure Spike', 'BP reading 180/95 - above baseline', false, NOW() - INTERVAL '8 hours'),

-- Active medium severity alerts
((SELECT id FROM patients OFFSET 2 LIMIT 1), (SELECT id FROM episodes OFFSET 2 LIMIT 1), 'scheduling', 'medium', 'Missed Appointment', 'Patient missed PT appointment today', false, NOW() - INTERVAL '3 hours'),

-- Some acknowledged alerts (won't count as active)
((SELECT id FROM patients LIMIT 1), (SELECT id FROM episodes LIMIT 1), 'clinical', 'critical', 'Previous Alert', 'This was resolved', true, NOW() - INTERVAL '2 days'),
((SELECT id FROM patients OFFSET 1 LIMIT 1), (SELECT id FROM episodes OFFSET 1 LIMIT 1), 'safety', 'high', 'Previous High Alert', 'This was also resolved', true, NOW() - INTERVAL '1 day');

-- Insert sample interventions with different types and statuses
INSERT INTO interventions (patient_id, episode_id, intervention_type, description, status, priority, scheduled_date, completed_date, created_at) VALUES
-- Pending interventions (some overdue)
((SELECT id FROM patients LIMIT 1), (SELECT id FROM episodes LIMIT 1), 'mobility_assessment', 'Complete comprehensive mobility evaluation', 'pending', 'high', CURRENT_DATE - INTERVAL '5 days', NULL, NOW() - INTERVAL '7 days'),
((SELECT id FROM patients OFFSET 1 LIMIT 1), (SELECT id FROM episodes OFFSET 1 LIMIT 1), 'wound_care', 'Daily wound dressing changes and assessment', 'pending', 'high', CURRENT_DATE - INTERVAL '10 days', NULL, NOW() - INTERVAL '12 days'),
((SELECT id FROM patients OFFSET 2 LIMIT 1), (SELECT id FROM episodes OFFSET 2 LIMIT 1), 'medication_review', 'Medication reconciliation with physician', 'pending', 'medium', CURRENT_DATE - INTERVAL '2 days', NULL, NOW() - INTERVAL '4 days'),
((SELECT id FROM patients LIMIT 1), (SELECT id FROM episodes LIMIT 1), 'mobility_equipment', 'Assess need for walker or wheelchair', 'pending', 'medium', CURRENT_DATE + INTERVAL '2 days', NULL, NOW() - INTERVAL '1 day'),
((SELECT id FROM patients OFFSET 1 LIMIT 1), (SELECT id FROM episodes OFFSET 1 LIMIT 1), 'transfer_training', 'Teach safe transfer techniques to caregiver', 'pending', 'low', CURRENT_DATE + INTERVAL '3 days', NULL, NOW() - INTERVAL '2 days'),

-- Completed interventions (this week and earlier)
((SELECT id FROM patients LIMIT 1), (SELECT id FROM episodes LIMIT 1), 'medication_management', 'Set up pill organizer system', 'completed', 'high', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '5 days'),
((SELECT id FROM patients OFFSET 1 LIMIT 1), (SELECT id FROM episodes OFFSET 1 LIMIT 1), 'wound_care', 'Initial wound assessment and care plan', 'completed', 'high', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '6 days'),
((SELECT id FROM patients OFFSET 2 LIMIT 1), (SELECT id FROM episodes OFFSET 2 LIMIT 1), 'mobility_training', 'Ambulation safety training', 'completed', 'medium', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE, NOW() - INTERVAL '3 days'),
((SELECT id FROM patients LIMIT 1), (SELECT id FROM episodes LIMIT 1), 'medication_education', 'Patient education on diabetes management', 'completed', 'medium', CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE - INTERVAL '3 days', NOW() - INTERVAL '8 days'),
((SELECT id FROM patients OFFSET 1 LIMIT 1), (SELECT id FROM episodes OFFSET 1 LIMIT 1), 'ambulation_assessment', 'Evaluate gait and balance', 'completed', 'low', CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE - INTERVAL '5 days', NOW() - INTERVAL '10 days');

-- Insert sample clinician notes (care manager notes awaiting review)
INSERT INTO clinician_notes (patient_id, episode_id, author_id, discipline, title, content, priority, created_at) VALUES
((SELECT id FROM patients LIMIT 1), (SELECT id FROM episodes LIMIT 1), (SELECT id FROM profiles WHERE role = 'case_manager' LIMIT 1), 'case_manager', 'Care Plan Review', 'Patient showing improvement in ADL scores. Recommend continued PT services.', 'high', NOW() - INTERVAL '1 day'),
((SELECT id FROM patients OFFSET 1 LIMIT 1), (SELECT id FROM episodes OFFSET 1 LIMIT 1), (SELECT id FROM profiles WHERE role = 'case_manager' LIMIT 1), 'case_manager', 'Insurance Authorization', 'Need to request extension for skilled nursing visits beyond 30 days.', 'high', NOW() - INTERVAL '2 days'),
((SELECT id FROM patients OFFSET 2 LIMIT 1), (SELECT id FROM episodes OFFSET 2 LIMIT 1), (SELECT id FROM profiles WHERE role = 'case_manager' LIMIT 1), 'case_manager', 'Family Conference', 'Scheduled family meeting to discuss discharge planning options.', 'medium', NOW() - INTERVAL '3 days'),
((SELECT id FROM patients LIMIT 1), (SELECT id FROM episodes LIMIT 1), (SELECT id FROM profiles WHERE role = 'case_manager' LIMIT 1), 'case_manager', 'Equipment Order', 'Ordered hospital bed and bedside commode for patient safety.', 'medium', NOW() - INTERVAL '4 days'),
((SELECT id FROM patients OFFSET 1 LIMIT 1), (SELECT id FROM episodes OFFSET 1 LIMIT 1), (SELECT id FROM profiles WHERE role = 'case_manager' LIMIT 1), 'case_manager', 'Medication Reconciliation', 'Completed medication review with patient and physician.', 'low', NOW() - INTERVAL '5 days');