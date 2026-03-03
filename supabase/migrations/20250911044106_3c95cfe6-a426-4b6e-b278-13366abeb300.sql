-- Insert sample clinician notes that appear imported from Epic
INSERT INTO public.clinician_notes (
  patient_id,
  episode_id,
  title,
  content,
  discipline,
  priority,
  tags,
  author_id,
  attachments,
  linked_data_sources
) VALUES 
-- Nursing Note from Epic
(
  'a533d1e7-18c4-48e9-b57f-d9fd3278faa6',
  (SELECT id FROM public.episodes WHERE patient_id = 'a533d1e7-18c4-48e9-b57f-d9fd3278faa6' LIMIT 1),
  'Initial Nursing Assessment - Imported from Epic',
  'Patient presents with chronic kidney disease and requires close monitoring of fluid status and medication compliance. Current vital signs stable: BP 145/88, HR 76, RR 18, O2 Sat 96% on room air. Patient reports mild fatigue and occasional shortness of breath with exertion. 

Assessment findings:
- Alert and oriented x3
- Skin warm, dry, good turgor
- Mild pedal edema noted bilaterally
- Patient demonstrates good understanding of dietary restrictions
- Medication list reviewed and reconciled

Plan:
- Continue current medication regimen
- Monitor daily weights
- Educate on fluid restriction compliance
- Follow up with nephrology as scheduled
- Monitor for signs of fluid overload

Note imported from Epic EMR on 2024-11-20 14:30:00',
  'nursing',
  'normal',
  ARRAY['epic-import', 'assessment', 'ckd', 'vitals', 'medication-reconciliation'],
  NULL,
  '[]'::jsonb,
  ARRAY[]::uuid[]
),
-- Physical Therapy Note from Epic
(
  'a533d1e7-18c4-48e9-b57f-d9fd3278faa6',
  (SELECT id FROM public.episodes WHERE patient_id = 'a533d1e7-18c4-48e9-b57f-d9fd3278faa6' LIMIT 1),
  'PT Evaluation - Epic Import',
  'Physical therapy evaluation completed for patient with chronic kidney disease and associated deconditioning.

SUBJECTIVE: Patient reports decreased endurance and muscle weakness over past 6 months. Denies falls but notes increased difficulty with stairs and prolonged standing. 

OBJECTIVE:
- Berg Balance Scale: 48/56 (mild balance impairment)
- 6-minute walk test: 280 meters (below normal for age/gender)
- Manual muscle testing: 4/5 lower extremities, 4+/5 upper extremities
- Range of motion: within normal limits all joints
- Gait analysis: mild antalgic gait, requires 1 rest break for 50 feet

ASSESSMENT: Patient demonstrates mild balance deficits and reduced functional endurance secondary to chronic kidney disease and deconditioning.

PLAN:
- PT 3x/week for 4 weeks focusing on:
  * Progressive strength training
  * Balance and proprioception exercises
  * Endurance training within cardiac precautions
  * Gait training and safety education
- Home exercise program provided
- Reassess in 2 weeks

Epic encounter ID: PT-2024-11-22-001',
  'physical_therapy',
  'high',
  ARRAY['epic-import', 'evaluation', 'balance', 'endurance', 'gait-training'],
  NULL,
  '[]'::jsonb,
  ARRAY[]::uuid[]
),
-- Occupational Therapy Note from Epic
(
  'a533d1e7-18c4-48e9-b57f-d9fd3278faa6',
  (SELECT id FROM public.episodes WHERE patient_id = 'a533d1e7-18c4-48e9-b57f-d9fd3278faa6' LIMIT 1),
  'OT ADL Assessment - Epic EMR',
  'Occupational therapy assessment for activities of daily living and home safety evaluation.

FUNCTIONAL ASSESSMENT:
- Bathing: Modified independence with adaptive equipment
- Dressing: Independent upper body, requires assistance with socks/shoes
- Grooming: Independent with setup
- Toileting: Independent with grab bars
- Transfers: Independent bed/chair, requires assistance car transfers
- Ambulation: Independent household distances with rest breaks

COGNITIVE ASSESSMENT:
- Montreal Cognitive Assessment (MoCA): 26/30 (within normal limits)
- Medication management: Independent with pill organizer

HOME SAFETY EVALUATION:
- Bathroom: Recommend shower chair, grab bars installed
- Kitchen: Adequate lighting, recommend reaching aids
- Stairs: 12 steps to bedroom, bilateral handrails present
- General: Remove throw rugs, improve lighting in hallways

RECOMMENDATIONS:
1. Continue OT services 2x/week for ADL training
2. Provide adaptive equipment training
3. Energy conservation techniques
4. Home safety modifications as noted
5. Caregiver education for assistance with lower extremity dressing

Data imported from Epic MyChart Integration 11/25/2024',
  'occupational_therapy',
  'normal',
  ARRAY['epic-import', 'adl-assessment', 'home-safety', 'adaptive-equipment', 'cognitive'],
  NULL,
  '[]'::jsonb,
  ARRAY[]::uuid[]
),
-- Case Management Note from Epic
(
  'a533d1e7-18c4-48e9-b57f-d9fd3278faa6',
  (SELECT id FROM public.episodes WHERE patient_id = 'a533d1e7-18c4-48e9-b57f-d9fd3278faa6' LIMIT 1),
  'Discharge Planning - Epic Case Management',
  'Case management evaluation for discharge planning and resource coordination.

DISCHARGE PLANNING ASSESSMENT:
Patient lives alone in single-story home. Adult daughter lives 30 minutes away and visits 2x/week. Patient has been independent with most ADLs prior to current hospitalization.

INSURANCE/BENEFITS:
- Primary: Medicare Part A & B
- Secondary: Medicaid
- Prior authorized for home health services
- DME benefits verified for adaptive equipment

SERVICES COORDINATED:
1. Home health nursing 3x/week x 4 weeks
2. Physical therapy 3x/week x 4 weeks  
3. Occupational therapy 2x/week x 3 weeks
4. Social work consultation for community resources

EQUIPMENT ORDERED:
- Hospital bed (delivered 11/28/2024)
- Bedside commode
- Walker with seat
- Shower chair and grab bars

FOLLOW-UP APPOINTMENTS:
- Nephrology: Dr. Smith 12/15/2024 at 2:00 PM
- Primary care: Dr. Johnson 12/10/2024 at 10:30 AM
- Cardiology: Dr. Brown 12/20/2024 at 1:00 PM

SAFETY CONCERNS:
Patient demonstrates good safety awareness. Emergency contact numbers programmed in phone. Medical alert system recommended.

Epic Case Management workflow completed by: Sarah Martinez, RN, CCM
Epic Record ID: CM-2024-11-27-HMS',
  'case_management',
  'high',
  ARRAY['epic-import', 'discharge-planning', 'insurance', 'equipment', 'follow-up'],
  NULL,
  '[]'::jsonb,
  ARRAY[]::uuid[]
),
-- Physician Progress Note from Epic
(
  'a533d1e7-18c4-48e9-b57f-d9fd3278faa6',
  (SELECT id FROM public.episodes WHERE patient_id = 'a533d1e7-18c4-48e9-b57f-d9fd3278faa6' LIMIT 1),
  'Physician Progress Note - Epic MD Import',
  'Progress note for patient with chronic kidney disease stage 3b, hypertension, and mild heart failure.

CHIEF COMPLAINT: Follow-up for chronic kidney disease and medication management.

REVIEW OF SYSTEMS: 
Patient denies chest pain, palpitations, or significant shortness of breath at rest. Reports mild fatigue and decreased exercise tolerance over past month. No nausea, vomiting, or changes in appetite. Urine output normal. Mild ankle swelling noted by patient.

PHYSICAL EXAMINATION:
Vitals: BP 148/85 (elevated from baseline), HR 78, RR 16, Temp 98.2°F, O2Sat 97%
General: Well-appearing, no acute distress
Cardiovascular: Regular rate and rhythm, no murmurs, mild JVD
Pulmonary: Clear to auscultation bilaterally
Extremities: 1+ bilateral ankle edema, no calf tenderness
Neurologic: Grossly intact

LABORATORY RESULTS (from Epic LabCorp integration):
- Creatinine: 1.8 mg/dL (stable from 1.7)
- eGFR: 42 mL/min/1.73m² (stage 3b CKD)
- BUN: 28 mg/dL (slightly elevated)
- Potassium: 4.2 mEq/L (normal)
- Hemoglobin: 11.2 g/dL (mild anemia)

ASSESSMENT & PLAN:
1. Chronic kidney disease stage 3b - stable
   - Continue ACE inhibitor
   - Nephrology follow-up in 6 weeks
   - Monitor creatinine monthly
   
2. Hypertension - suboptimal control
   - Increase lisinopril to 10mg daily
   - Home BP monitoring log
   - Reduce sodium intake <2g/day
   
3. Heart failure with preserved ejection fraction
   - Continue current diuretic
   - Daily weight monitoring
   - Restrict fluids to 1.5L/day

Next visit in 4 weeks or sooner if concerns.

Electronically signed by: Dr. Michael Chen, MD
Epic Provider ID: MCHEN2024
Note auto-imported from Epic EMR 12/01/2024 09:15:00',
  'clinical_coordination',
  'normal',
  ARRAY['epic-import', 'progress-note', 'ckd', 'hypertension', 'labs', 'medication-management'],
  NULL,
  '[]'::jsonb,
  ARRAY[]::uuid[]
);