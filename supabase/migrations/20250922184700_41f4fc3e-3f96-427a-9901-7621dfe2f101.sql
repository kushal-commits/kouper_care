-- Create alerts for the specific patients with correct severity values
INSERT INTO alerts (patient_id, alert_type, severity, title, message, created_at) VALUES
-- Barbara Robinson alerts  
('418a353a-cc2b-401b-a403-73148307f4d5', 'declining_adl', 'warning', 'Toileting decline', '2-pt drop in toileting score over 7 days', NOW() - INTERVAL '3 hours'),
('418a353a-cc2b-401b-a403-73148307f4d5', 'declining_adl', 'info', 'Bathing no improvement', 'No improvement in bathing for 14 days', NOW() - INTERVAL '2 days'),

-- Mark Jackson alerts
('71049ca6-10c0-49fc-b257-d8ef5b23c8e9', 'declining_adl', 'warning', 'Multiple ADL decline', 'Decline in 3 ADLs within 14 days - mobility, bathing, eating', NOW() - INTERVAL '1 day'),
('71049ca6-10c0-49fc-b257-d8ef5b23c8e9', 'high_risk', 'critical', 'Fall risk assessment', 'Recent mobility decline with safety concerns', NOW() - INTERVAL '30 minutes'),

-- Sarah Wright alerts  
('21980e3e-2b10-4426-a7f8-2b634f72d4c6', 'missed_assessment', 'info', 'Medication adherence', 'Missed medications 3 times this week', NOW() - INTERVAL '4 days'),
('21980e3e-2b10-4426-a7f8-2b634f72d4c6', 'intervention_overdue', 'warning', 'Care plan review', 'Quarterly care plan review due next week', NOW() - INTERVAL '6 hours');