-- Let's try inserting interventions and notes first, which are more likely to work
-- Insert sample interventions with different types and statuses
INSERT INTO interventions (patient_id, intervention_type, description, status, priority, scheduled_date, completed_date, created_at) VALUES
-- Pending interventions (some overdue)
((SELECT id FROM patients LIMIT 1), 'mobility_assessment', 'Complete comprehensive mobility evaluation', 'pending', 'high', CURRENT_DATE - INTERVAL '5 days', NULL, NOW() - INTERVAL '7 days'),
((SELECT id FROM patients OFFSET 1 LIMIT 1), 'wound_care', 'Daily wound dressing changes and assessment', 'pending', 'high', CURRENT_DATE - INTERVAL '10 days', NULL, NOW() - INTERVAL '12 days'),
((SELECT id FROM patients OFFSET 2 LIMIT 1), 'medication_review', 'Medication reconciliation with physician', 'pending', 'medium', CURRENT_DATE - INTERVAL '2 days', NULL, NOW() - INTERVAL '4 days'),
((SELECT id FROM patients LIMIT 1), 'mobility_equipment', 'Assess need for walker or wheelchair', 'pending', 'medium', CURRENT_DATE + INTERVAL '2 days', NULL, NOW() - INTERVAL '1 day'),
((SELECT id FROM patients OFFSET 1 LIMIT 1), 'transfer_training', 'Teach safe transfer techniques to caregiver', 'pending', 'low', CURRENT_DATE + INTERVAL '3 days', NULL, NOW() - INTERVAL '2 days'),

-- Completed interventions (this week and earlier)
((SELECT id FROM patients LIMIT 1), 'medication_management', 'Set up pill organizer system', 'completed', 'high', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '5 days'),
((SELECT id FROM patients OFFSET 1 LIMIT 1), 'wound_care', 'Initial wound assessment and care plan', 'completed', 'high', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '6 days'),
((SELECT id FROM patients OFFSET 2 LIMIT 1), 'mobility_training', 'Ambulation safety training', 'completed', 'medium', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE, NOW() - INTERVAL '3 days'),
((SELECT id FROM patients LIMIT 1), 'medication_education', 'Patient education on diabetes management', 'completed', 'medium', CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE - INTERVAL '3 days', NOW() - INTERVAL '8 days'),
((SELECT id FROM patients OFFSET 1 LIMIT 1), 'ambulation_assessment', 'Evaluate gait and balance', 'completed', 'low', CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE - INTERVAL '5 days', NOW() - INTERVAL '10 days');