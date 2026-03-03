-- Create sample episodes for existing patients
INSERT INTO public.episodes (patient_id, episode_number, start_date, end_date, status, primary_nurse_id, coordinator_id, discharge_reason)
SELECT 
    p.id as patient_id,
    'EP-' || LPAD((ROW_NUMBER() OVER (ORDER BY p.created_at))::text, 6, '0') as episode_number,
    p.created_at::date as start_date,
    (p.created_at + INTERVAL '30 days')::date as end_date,
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) % 3 = 0 THEN 'completed'
        WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) % 3 = 1 THEN 'active'
        ELSE 'paused'
    END as status,
    NULL as primary_nurse_id, -- Will be assigned when auth is implemented
    NULL as coordinator_id,   -- Will be assigned when auth is implemented
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) % 4 = 0 THEN 'Goals met'
        WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) % 4 = 1 THEN 'Transferred to higher level of care'
        WHEN ROW_NUMBER() OVER (ORDER BY p.created_at) % 4 = 2 THEN 'Patient request'
        ELSE NULL
    END as discharge_reason
FROM public.patients p;

-- Create sample assessments for existing patients
INSERT INTO public.assessments (
    patient_id, 
    assessment_type, 
    assessment_date, 
    bathing_score,
    dressing_upper_score,
    dressing_lower_score,
    grooming_score,
    eating_score,
    toileting_score,
    transferring_score,
    ambulation_score,
    medication_mgmt_score,
    notes,
    assessor_id
)
SELECT DISTINCT
    p.id as patient_id,
    CASE s.series % 3
        WHEN 0 THEN 'initial'
        WHEN 1 THEN 'progress'
        ELSE 'discharge'
    END as assessment_type,
    (p.created_at::date + (s.series * 14)) as assessment_date,
    -- Generate varied but realistic ADL scores (1-4 scale)
    (2 + (abs(hashtext(p.id::text || s.series::text || 'bathing')) % 3)) as bathing_score,
    (2 + (abs(hashtext(p.id::text || s.series::text || 'dressing_upper')) % 3)) as dressing_upper_score,
    (2 + (abs(hashtext(p.id::text || s.series::text || 'dressing_lower')) % 3)) as dressing_lower_score,
    (2 + (abs(hashtext(p.id::text || s.series::text || 'grooming')) % 3)) as grooming_score,
    (3 + (abs(hashtext(p.id::text || s.series::text || 'eating')) % 2)) as eating_score,
    (2 + (abs(hashtext(p.id::text || s.series::text || 'toileting')) % 3)) as toileting_score,
    (1 + (abs(hashtext(p.id::text || s.series::text || 'transferring')) % 4)) as transferring_score,
    (1 + (abs(hashtext(p.id::text || s.series::text || 'ambulation')) % 4)) as ambulation_score,
    (2 + (abs(hashtext(p.id::text || s.series::text || 'medication')) % 3)) as medication_mgmt_score,
    CASE s.series % 4
        WHEN 0 THEN 'Patient showing steady improvement in mobility and self-care activities.'
        WHEN 1 THEN 'Some challenges noted with balance and coordination. Continue therapy plan.'
        WHEN 2 THEN 'Good progress with medication management. Family education provided.'
        ELSE 'Patient demonstrates increased independence in daily activities.'
    END as notes,
    NULL as assessor_id -- Will be assigned when auth is implemented
FROM public.patients p
CROSS JOIN generate_series(0, 2) as s(series)
WHERE (p.created_at::date + (s.series * 14)) <= CURRENT_DATE;

-- Create episode associations for assessments
UPDATE public.assessments a
SET episode_id = e.id
FROM public.episodes e
WHERE a.patient_id = e.patient_id
AND a.assessment_date BETWEEN e.start_date AND e.end_date;