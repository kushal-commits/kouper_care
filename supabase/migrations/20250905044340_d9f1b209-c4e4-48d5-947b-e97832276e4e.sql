-- Populate comprehensive sample data for existing patients using existing profiles
DO $$
DECLARE
    patient_record RECORD;
    profile_record RECORD;
    profile_ids UUID[];
    current_profile_id UUID;
    episode_id UUID;
    assessment_id1 UUID;
    assessment_id2 UUID;
    source_doc_id UUID;
    counter INT := 0;
    profile_counter INT := 0;
BEGIN
    -- Get all existing profile IDs
    SELECT ARRAY(SELECT id FROM public.profiles ORDER BY created_at LIMIT 10) INTO profile_ids;
    
    -- If no profiles exist, exit gracefully
    IF array_length(profile_ids, 1) IS NULL OR array_length(profile_ids, 1) = 0 THEN
        RAISE NOTICE 'No profiles found, skipping data population';
        RETURN;
    END IF;
    
    -- Loop through each patient and create comprehensive data
    FOR patient_record IN 
        SELECT id, first_name, last_name FROM public.patients 
        ORDER BY created_at DESC 
        LIMIT 10
    LOOP
        counter := counter + 1;
        profile_counter := profile_counter + 1;
        
        -- Cycle through available profiles
        IF profile_counter > array_length(profile_ids, 1) THEN
            profile_counter := 1;
        END IF;
        current_profile_id := profile_ids[profile_counter];
        
        -- Create episode for each patient
        INSERT INTO public.episodes (
            patient_id, 
            episode_number, 
            start_date, 
            end_date, 
            status, 
            primary_nurse_id, 
            coordinator_id
        ) VALUES (
            patient_record.id,
            'EP-' || TO_CHAR(counter, 'FM0000'),
            CURRENT_DATE - INTERVAL '30 days',
            CURRENT_DATE + INTERVAL '30 days',
            'active',
            current_profile_id,
            current_profile_id
        ) RETURNING id INTO episode_id;
        
        -- Create first assessment
        INSERT INTO public.assessments (
            patient_id,
            episode_id,
            assessment_date,
            assessment_type,
            assessor_id,
            discipline,
            bathing_score,
            dressing_upper_score,
            dressing_lower_score,
            grooming_score,
            eating_score,
            toileting_score,
            transferring_score,
            ambulation_score,
            medication_mgmt_score,
            notes
        ) VALUES (
            patient_record.id,
            episode_id,
            CURRENT_DATE - INTERVAL '5 days',
            'start_of_care',
            current_profile_id,
            'nursing',
            2 + (counter % 4),
            3 + (counter % 3),
            2 + (counter % 4),
            4 + (counter % 2),
            3 + (counter % 3),
            3 + (counter % 3),
            2 + (counter % 4),
            3 + (counter % 3),
            2 + (counter % 4),
            'Initial nursing assessment completed. Patient shows ' ||
            CASE WHEN counter % 3 = 0 THEN 'good cooperation' 
                 WHEN counter % 3 = 1 THEN 'moderate assistance needs'
                 ELSE 'some challenges with mobility' END
        ) RETURNING id INTO assessment_id1;
        
        -- Create second assessment
        INSERT INTO public.assessments (
            patient_id,
            episode_id,
            assessment_date,
            assessment_type,
            assessor_id,
            discipline,
            bathing_score,
            dressing_upper_score,
            dressing_lower_score,
            grooming_score,
            eating_score,
            toileting_score,
            transferring_score,
            ambulation_score,
            medication_mgmt_score,
            notes
        ) VALUES (
            patient_record.id,
            episode_id,
            CURRENT_DATE - INTERVAL '3 days',
            'follow_up',
            current_profile_id,
            'occupational_therapy',
            3 + (counter % 3),
            2 + (counter % 4),
            3 + (counter % 3),
            3 + (counter % 3),
            4 + (counter % 2),
            4 + (counter % 2),
            3 + (counter % 3),
            2 + (counter % 4),
            3 + (counter % 3),
            'OT evaluation shows ' ||
            CASE WHEN counter % 2 = 0 THEN 'improved fine motor skills'
                 ELSE 'need for adaptive equipment' END
        ) RETURNING id INTO assessment_id2;
        
        -- Create source documents
        INSERT INTO public.source_documents (
            title,
            content,
            document_type,
            author_id,
            patient_id,
            metadata
        ) VALUES (
            'Initial Assessment - ' || patient_record.first_name || ' ' || patient_record.last_name,
            'Comprehensive assessment of ' || patient_record.first_name || '. Patient demonstrates varying levels of independence across ADL categories. Bathing requires moderate assistance due to balance concerns. Dressing upper body shows good independence with minimal cuing. Patient is motivated and cooperative with therapy interventions.',
            'assessment',
            current_profile_id,
            patient_record.id,
            ('{"assessment_date": "' || (CURRENT_DATE - INTERVAL '5 days')::text || '", "time": "' || 
             CASE WHEN counter % 3 = 0 THEN '09:00 AM'
                  WHEN counter % 3 = 1 THEN '11:30 AM'  
                  ELSE '14:00 PM' END || '"}')::jsonb
        ) RETURNING id INTO source_doc_id;
        
        -- Create data source links for both assessments
        INSERT INTO public.data_source_links (
            data_table,
            data_id,
            source_document_id,
            extracted_snippet,
            confidence_score
        ) VALUES 
        (
            'assessments',
            assessment_id1,
            source_doc_id,
            'Bathing requires moderate assistance due to balance concerns. Patient shows good cooperation.',
            0.92 + (counter * 0.01)
        ),
        (
            'assessments',
            assessment_id2,
            source_doc_id,
            'Dressing upper body shows good independence with minimal cuing.',
            0.88 + (counter * 0.01)
        );
        
        -- Create clinician notes
        INSERT INTO public.clinician_notes (
            patient_id,
            author_id,
            discipline,
            title,
            content,
            priority,
            tags
        ) VALUES (
            patient_record.id,
            current_profile_id,
            'nursing',
            CASE WHEN counter % 3 = 0 THEN 'Medication Management Review'
                 WHEN counter % 3 = 1 THEN 'Fall Risk Assessment'
                 ELSE 'Care Plan Update' END,
            CASE WHEN counter % 3 = 0 THEN 'Reviewed medication regimen with patient and family. ' || patient_record.first_name || ' demonstrates good understanding of dosing schedule. Recommend pill organizer to prevent missed doses.'
                 WHEN counter % 3 = 1 THEN 'Completed comprehensive fall risk assessment for ' || patient_record.first_name || '. Identified several environmental hazards. Provided safety education and equipment recommendations.'
                 ELSE 'Updated care plan based on recent assessment findings. ' || patient_record.first_name || ' showing progress in targeted ADL areas. Continue current interventions with weekly reassessment.' END,
            CASE WHEN counter % 4 = 0 THEN 'high'
                 WHEN counter % 4 = 1 THEN 'normal'
                 WHEN counter % 4 = 2 THEN 'urgent' 
                 ELSE 'low' END,
            CASE WHEN counter % 3 = 0 THEN ARRAY['medication', 'compliance', 'safety']
                 WHEN counter % 3 = 1 THEN ARRAY['falls', 'safety', 'assessment']
                 ELSE ARRAY['care_plan', 'progress', 'adl'] END
        );
        
        INSERT INTO public.clinician_notes (
            patient_id,
            author_id,
            discipline,
            title,
            content,
            priority,
            tags
        ) VALUES (
            patient_record.id,
            current_profile_id,
            'occupational_therapy',
            CASE WHEN counter % 2 = 0 THEN 'Adaptive Equipment Training'
                 ELSE 'Fine Motor Skills Assessment' END,
            CASE WHEN counter % 2 = 0 THEN 'Introduced adaptive equipment to ' || patient_record.first_name || ' including reacher, sock aid, and button hook. Patient demonstrated good learning ability and appropriate use of devices.'
                 ELSE 'Assessed fine motor coordination and dexterity for ' || patient_record.first_name || '. Noted improvements in precision grip and bilateral coordination since last evaluation.' END,
            'normal',
            CASE WHEN counter % 2 = 0 THEN ARRAY['adaptive_equipment', 'training', 'independence']
                 ELSE ARRAY['fine_motor', 'assessment', 'progress'] END
        );
        
        INSERT INTO public.clinician_notes (
            patient_id,
            author_id,
            discipline,
            title,
            content,
            priority,
            tags
        ) VALUES (
            patient_record.id,
            current_profile_id,
            'physical_therapy',
            CASE WHEN counter % 2 = 0 THEN 'Gait Training Progress'
                 ELSE 'Strength Assessment' END,
            CASE WHEN counter % 2 = 0 THEN 'Gait training session with ' || patient_record.first_name || '. Patient able to ambulate 75 feet with walker. Balance improving but still requires contact guard for safety.'
                 ELSE 'Strength assessment shows improvements in lower extremity strength for ' || patient_record.first_name || '. Continue progressive strengthening exercises.' END,
            'normal',
            CASE WHEN counter % 2 = 0 THEN ARRAY['gait', 'mobility', 'walker']
                 ELSE ARRAY['strength', 'exercise', 'progress'] END
        );
        
        -- Create interventions
        INSERT INTO public.interventions (
            patient_id,
            episode_id,
            intervention_type,
            description,
            assigned_to_id,
            priority,
            status,
            scheduled_date,
            notes
        ) VALUES (
            patient_record.id,
            episode_id,
            CASE WHEN counter % 3 = 0 THEN 'safety_education'
                 WHEN counter % 3 = 1 THEN 'equipment_provision'
                 ELSE 'therapy_referral' END,
            CASE WHEN counter % 3 = 0 THEN 'Home safety education and fall prevention strategies for ' || patient_record.first_name
                 WHEN counter % 3 = 1 THEN 'Provide adaptive equipment: grab bars, shower chair, and reacher'
                 ELSE 'Continue PT/OT services for strength and mobility training' END,
            current_profile_id,
            CASE WHEN counter % 4 = 0 THEN 'high'
                 ELSE 'medium' END,
            CASE WHEN counter % 5 = 0 THEN 'completed'
                 WHEN counter % 5 IN (1,2) THEN 'pending'
                 ELSE 'in_progress' END,
            CURRENT_DATE + INTERVAL '3 days',
            'Priority intervention based on assessment findings'
        );
        
    END LOOP;
    
    -- Create some alerts for critical patients
    INSERT INTO public.alerts (
        patient_id,
        alert_type,
        severity,
        title,
        message,
        is_acknowledged
    )
    SELECT 
        p.id,
        CASE WHEN random() < 0.3 THEN 'adl_decline'
             WHEN random() < 0.6 THEN 'medication_missed'
             ELSE 'fall_risk' END,
        CASE WHEN random() < 0.2 THEN 'critical'
             WHEN random() < 0.5 THEN 'high'
             ELSE 'medium' END,
        CASE WHEN random() < 0.3 THEN 'ADL Score Decline Detected'
             WHEN random() < 0.6 THEN 'Medication Compliance Issue'
             ELSE 'Increased Fall Risk Identified' END,
        CASE WHEN random() < 0.3 THEN p.first_name || ' showing decline in bathing and toileting scores over past week.'
             WHEN random() < 0.6 THEN p.first_name || ' missed multiple medication doses. Family education needed.'  
             ELSE p.first_name || ' experienced near-fall incident. Immediate safety assessment required.' END,
        random() < 0.3
    FROM public.patients p
    ORDER BY p.created_at DESC
    LIMIT 6;
    
    RAISE NOTICE 'Successfully populated data for % patients', counter;
    
END $$;