-- Add additional pre-configured alert rules for comprehensive healthcare monitoring
INSERT INTO public.alert_rules (name, condition, severity, window_size, enabled) VALUES
('Critical ADL Score', 'Total ADL score < 10 points', 'high', 'Immediate', true),
('Fall Risk Alert', 'Ambulation score ≤ 1 or transferring score ≤ 1', 'high', 'Assessment', true),
('Medication Management Risk', 'Medication management score = 0', 'medium', 'Assessment', true),
('Weekly Assessment Overdue', 'No assessment completed in 10+ days', 'medium', '10 days', true),
('Rapid Functional Decline', 'Decline in ≥3 ADL categories within 7 days', 'high', '7 days', true),
('Bathing/Hygiene Independence Loss', 'Bathing score drops to 0 or grooming score drops to 0', 'medium', 'Assessment', true),
('Emergency Intervention Required', 'Any ADL score drops from independent (4) to dependent (0)', 'high', 'Assessment', true),
('Care Plan Review Due', 'No care plan update in 30+ days', 'low', '30 days', true),
('Family Communication Alert', 'High/critical alerts not acknowledged within 4 hours', 'medium', '4 hours', false),
('Documentation Incomplete', 'Assessment missing required notes or signatures', 'low', 'Assessment', true),
('Toileting Independence Risk', 'Toileting score ≤ 1', 'medium', 'Assessment', true),
('Eating/Nutrition Concerns', 'Eating score ≤ 2', 'medium', 'Assessment', true),
('Multiple High-Risk Factors', 'Patient has ≥2 ADL scores ≤ 1', 'high', 'Assessment', true),
('Improvement Plateau', 'No score improvement in 21+ days for non-independent baseline', 'low', '21 days', false),
('Coordinator Review Required', 'Critical or high alerts not resolved within 24 hours', 'medium', '24 hours', true);