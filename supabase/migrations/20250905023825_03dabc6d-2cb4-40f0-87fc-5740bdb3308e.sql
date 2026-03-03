-- Update existing profiles with discipline information
UPDATE public.profiles SET discipline = 
  CASE role
    WHEN 'nurse' THEN 'nursing'
    WHEN 'clinical_coordinator' THEN 'clinical_coordination'
    WHEN 'case_manager' THEN 'case_management'
    WHEN 'admin' THEN 'administration'
    WHEN 'supervisor' THEN 'administration'
    ELSE 'nursing'
  END
WHERE discipline IS NULL;

-- Update existing assessments with discipline information
UPDATE public.assessments SET discipline = 
  CASE 
    WHEN assessment_type IN ('start_of_care', 'resumption') THEN 'nursing'
    WHEN assessment_type = 'follow_up' THEN 'clinical_coordination'
    ELSE 'nursing'
  END
WHERE discipline IS NULL;

-- Get some existing patient IDs and profile IDs to use for sample data
DO $$
DECLARE
    patient_ids UUID[];
    nurse_id UUID;
    ot_id UUID;
    pt_id UUID;
    cm_id UUID;
BEGIN
    -- Get first 3 patient IDs
    SELECT ARRAY(SELECT id FROM public.patients LIMIT 3) INTO patient_ids;
    
    -- Create some additional profiles for different disciplines
    INSERT INTO public.profiles (id, email, full_name, role, discipline, phone, license_number)
    SELECT 
        gen_random_uuid(),
        'ot.therapist@homecare.com',
        'Sarah Johnson, OTR/L',
        'nurse',
        'occupational_therapy',
        '555-0123',
        'OT-12345'
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'ot.therapist@homecare.com');

    INSERT INTO public.profiles (id, email, full_name, role, discipline, phone, license_number)
    SELECT 
        gen_random_uuid(),
        'pt.therapist@homecare.com',
        'Michael Chen, PT',
        'nurse',
        'physical_therapy',
        '555-0124',
        'PT-12345'
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'pt.therapist@homecare.com');

    INSERT INTO public.profiles (id, email, full_name, role, discipline, phone, license_number)
    SELECT 
        gen_random_uuid(),
        'case.manager@homecare.com',
        'Jennifer Martinez, RN',
        'case_manager',
        'case_management',
        '555-0125',
        'RN-12345'
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'case.manager@homecare.com');

    -- Get profile IDs for sample data
    SELECT id INTO nurse_id FROM public.profiles WHERE discipline = 'nursing' LIMIT 1;
    SELECT id INTO ot_id FROM public.profiles WHERE discipline = 'occupational_therapy' LIMIT 1;
    SELECT id INTO pt_id FROM public.profiles WHERE discipline = 'physical_therapy' LIMIT 1;
    SELECT id INTO cm_id FROM public.profiles WHERE discipline = 'case_management' LIMIT 1;

    -- Only proceed if we have patients and staff
    IF array_length(patient_ids, 1) > 0 AND nurse_id IS NOT NULL THEN
        -- Create sample source documents
        INSERT INTO public.source_documents (title, content, document_type, author_id, patient_id, metadata)
        VALUES 
        (
            'Initial Nursing Assessment',
            'Patient demonstrates significant difficulty with bathing activities. Requires moderate assistance (score: 2) due to balance concerns and fear of falling. Patient expressed anxiety about showering alone. Recommended grab bars and shower chair. ADL scores: Bathing: 2, Dressing Upper: 3, Toileting: 4, Transferring: 3.',
            'assessment',
            nurse_id,
            patient_ids[1],
            '{"assessment_date": "2024-01-15", "time": "10:30 AM"}'
        ),
        (
            'OT Functional Assessment',
            'Patient evaluation shows decreased fine motor skills affecting dressing activities. Upper body dressing score of 2 reflects need for assistance with buttons, zippers, and overhead garments. Cognitive assessment shows mild confusion with sequencing tasks. Recommend adaptive equipment and task simplification strategies.',
            'assessment',
            COALESCE(ot_id, nurse_id),
            patient_ids[1],
            '{"assessment_date": "2024-01-16", "time": "2:00 PM"}'
        ),
        (
            'Care Coordination Note',
            'Family meeting conducted regarding patient''s declining ADL scores. Risk level elevated to HIGH due to cumulative ADL decline (total score: 28). Daughter expresses concern about safety. Initiated home safety evaluation and increased visit frequency to 3x/week.',
            'note',
            COALESCE(cm_id, nurse_id),
            patient_ids[1],
            '{"meeting_attendees": ["patient", "daughter", "care_manager"], "date": "2024-01-18"}'
        );

        -- Create data source links for assessments
        INSERT INTO public.data_source_links (data_table, data_id, source_document_id, extracted_snippet, confidence_score)
        SELECT 
            'assessments', 
            a.id, 
            sd.id,
            CASE 
                WHEN sd.document_type = 'assessment' AND sd.title LIKE '%Nursing%' THEN 'ADL scores: Bathing: 2, Dressing Upper: 3, Toileting: 4, Transferring: 3'
                WHEN sd.document_type = 'assessment' AND sd.title LIKE '%OT%' THEN 'Upper body dressing score of 2 reflects need for assistance'
                ELSE 'Risk level elevated to HIGH due to cumulative ADL decline (total score: 28)'
            END,
            0.95
        FROM public.assessments a
        CROSS JOIN public.source_documents sd
        WHERE a.patient_id = patient_ids[1] 
        AND sd.patient_id = patient_ids[1]
        LIMIT 6;

        -- Create sample clinician notes
        INSERT INTO public.clinician_notes (patient_id, author_id, discipline, title, content, priority, tags)
        VALUES 
        (
            patient_ids[1],
            nurse_id,
            'nursing',
            'Medication Compliance Concerns',
            'Patient missed two doses of blood pressure medication this week. Daughter reports confusion about timing. Recommend pill organizer and simplified dosing schedule. Will coordinate with physician for possible medication review.',
            'high',
            ARRAY['medication', 'compliance', 'safety']
        ),
        (
            patient_ids[1],
            COALESCE(ot_id, nurse_id),
            'occupational_therapy',
            'Home Safety Assessment Complete',
            'Completed comprehensive home safety evaluation. Identified multiple fall hazards: loose rugs in hallway, inadequate lighting in bathroom, no grab bars near toilet. Provided patient and family with safety checklist and equipment recommendations. Will follow up in 1 week to ensure modifications completed.',
            'normal',
            ARRAY['safety', 'fall_prevention', 'home_modification']
        ),
        (
            patient_ids[1],
            COALESCE(pt_id, nurse_id),
            'physical_therapy',
            'Mobility Progress Note',
            'Patient showing improvement in ambulation distance. Now able to walk 50 feet with walker compared to 20 feet at initial assessment. Balance remains precarious - patient experienced near-fall during session. Continue balance training exercises and walker safety education.',
            'normal',
            ARRAY['mobility', 'balance', 'progress']
        );

        -- Create notes for additional patients if available
        IF array_length(patient_ids, 1) > 1 THEN
            INSERT INTO public.clinician_notes (patient_id, author_id, discipline, title, content, priority, tags)
            VALUES 
            (
                patient_ids[2],
                nurse_id,
                'nursing',
                'Wound Care Progress',
                'Stage 2 pressure ulcer on sacrum showing signs of healing. Wound bed is pink with minimal drainage. Continue current dressing protocol with hydrocolloid dressing changes every 3 days. Patient and caregiver demonstrate proper positioning techniques.',
                'normal',
                ARRAY['wound_care', 'healing', 'education']
            ),
            (
                patient_ids[2],
                COALESCE(cm_id, nurse_id),
                'case_management',
                'Insurance Authorization Update',
                'Received approval for additional 30 days of skilled nursing visits. Medicare has approved 3x/week frequency based on wound care needs and medication management requirements. Next recertification due in 4 weeks.',
                'high',
                ARRAY['insurance', 'authorization', 'medicare']
            );
        END IF;
    END IF;
END $$;