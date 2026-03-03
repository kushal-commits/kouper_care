-- Insert 50 sample patient records for home health care system
INSERT INTO public.patients (mrn, first_name, last_name, date_of_birth, phone, primary_diagnosis, secondary_diagnoses, address, emergency_contact, insurance_info) VALUES
('MRN001234', 'Margaret', 'Johnson', '1945-03-15', '555-0101', 'Type 2 Diabetes Mellitus', ARRAY['Hypertension', 'Peripheral Neuropathy'], '{"street": "123 Oak Street", "city": "Springfield", "state": "IL", "zip": "62701"}', '{"name": "Robert Johnson", "relationship": "Spouse", "phone": "555-0102"}', '{"primary": "Medicare", "secondary": "Blue Cross", "id": "ABC123456789"}'),

('MRN001235', 'Robert', 'Smith', '1938-11-22', '555-0103', 'Congestive Heart Failure', ARRAY['COPD', 'Atrial Fibrillation'], '{"street": "456 Pine Avenue", "city": "Springfield", "state": "IL", "zip": "62702"}', '{"name": "Mary Smith", "relationship": "Spouse", "phone": "555-0104"}', '{"primary": "Medicare", "secondary": "Aetna", "id": "DEF987654321"}'),

('MRN001236', 'Dorothy', 'Williams', '1952-07-08', '555-0105', 'Chronic Wound Care', ARRAY['Diabetes', 'Venous Insufficiency'], '{"street": "789 Maple Drive", "city": "Springfield", "state": "IL", "zip": "62703"}', '{"name": "James Williams", "relationship": "Son", "phone": "555-0106"}', '{"primary": "Medicare", "secondary": "United Healthcare", "id": "GHI456789123"}'),

('MRN001237', 'James', 'Brown', '1941-12-03', '555-0107', 'Stroke with Hemiparesis', ARRAY['Hypertension', 'Dysphagia'], '{"street": "321 Elm Street", "city": "Springfield", "state": "IL", "zip": "62704"}', '{"name": "Patricia Brown", "relationship": "Spouse", "phone": "555-0108"}', '{"primary": "Medicare", "secondary": "Humana", "id": "JKL789123456"}'),

('MRN001238', 'Patricia', 'Davis', '1948-09-17', '555-0109', 'COPD Exacerbation', ARRAY['Anxiety', 'Osteoporosis'], '{"street": "654 Cedar Lane", "city": "Springfield", "state": "IL", "zip": "62705"}', '{"name": "Michael Davis", "relationship": "Husband", "phone": "555-0110"}', '{"primary": "Medicare", "secondary": "Cigna", "id": "MNO123456789"}'),

('MRN001239', 'Michael', 'Miller', '1955-01-28', '555-0111', 'Post-Surgical Recovery', ARRAY['Hip Replacement', 'Osteoarthritis'], '{"street": "987 Birch Road", "city": "Springfield", "state": "IL", "zip": "62706"}', '{"name": "Linda Miller", "relationship": "Spouse", "phone": "555-0112"}', '{"primary": "Medicare", "secondary": "BCBS", "id": "PQR987654321"}'),

('MRN001240', 'Linda', 'Wilson', '1950-04-12', '555-0113', 'Hypertensive Crisis', ARRAY['Kidney Disease', 'Diabetes'], '{"street": "147 Spruce Street", "city": "Springfield", "state": "IL", "zip": "62707"}', '{"name": "David Wilson", "relationship": "Husband", "phone": "555-0114"}', '{"primary": "Medicare", "secondary": "Kaiser", "id": "STU456789123"}'),

('MRN001241', 'David', 'Moore', '1943-06-25', '555-0115', 'Fall Risk Assessment', ARRAY['Balance Disorder', 'Osteoporosis'], '{"street": "258 Willow Avenue", "city": "Springfield", "state": "IL", "zip": "62708"}', '{"name": "Susan Moore", "relationship": "Spouse", "phone": "555-0116"}', '{"primary": "Medicare", "secondary": "Tricare", "id": "VWX789123456"}'),

('MRN001242', 'Susan', 'Taylor', '1949-10-14', '555-0117', 'Medication Management', ARRAY['Multiple Medications', 'Memory Issues'], '{"street": "369 Poplar Drive", "city": "Springfield", "state": "IL", "zip": "62709"}', '{"name": "Robert Taylor", "relationship": "Husband", "phone": "555-0118"}', '{"primary": "Medicare", "secondary": "Medicaid", "id": "YZA123456789"}'),

('MRN001243', 'Charles', 'Anderson', '1946-02-09', '555-0119', 'Cardiac Rehabilitation', ARRAY['Recent MI', 'High Cholesterol'], '{"street": "741 Cherry Street", "city": "Springfield", "state": "IL", "zip": "62710"}', '{"name": "Nancy Anderson", "relationship": "Spouse", "phone": "555-0120"}', '{"primary": "Medicare", "secondary": "Anthem", "id": "BCD987654321"}'),

('MRN001244', 'Nancy', 'Thomas', '1951-08-31', '555-0121', 'Diabetic Foot Care', ARRAY['Neuropathy', 'Poor Circulation'], '{"street": "852 Hickory Lane", "city": "Springfield", "state": "IL", "zip": "62711"}', '{"name": "William Thomas", "relationship": "Husband", "phone": "555-0122"}', '{"primary": "Medicare", "secondary": "Molina", "id": "EFG456789123"}'),

('MRN001245', 'William', 'Jackson', '1944-05-16', '555-0123', 'Pulmonary Rehabilitation', ARRAY['COPD', 'Sleep Apnea'], '{"street": "963 Sycamore Road", "city": "Springfield", "state": "IL", "zip": "62712"}', '{"name": "Barbara Jackson", "relationship": "Spouse", "phone": "555-0124"}', '{"primary": "Medicare", "secondary": "WellCare", "id": "HIJ789123456"}'),

('MRN001246', 'Barbara', 'White', '1947-11-07', '555-0125', 'Pain Management', ARRAY['Arthritis', 'Fibromyalgia'], '{"street": "159 Magnolia Avenue", "city": "Springfield", "state": "IL", "zip": "62713"}', '{"name": "Kenneth White", "relationship": "Husband", "phone": "555-0126"}', '{"primary": "Medicare", "secondary": "Coventry", "id": "KLM123456789"}'),

('MRN001247', 'Kenneth', 'Harris', '1940-01-23', '555-0127', 'Wound Infection Treatment', ARRAY['Diabetes', 'Immune Deficiency'], '{"street": "267 Dogwood Drive", "city": "Springfield", "state": "IL", "zip": "62714"}', '{"name": "Helen Harris", "relationship": "Spouse", "phone": "555-0128"}', '{"primary": "Medicare", "secondary": "Health Net", "id": "NOP987654321"}'),

('MRN001248', 'Helen', 'Martin', '1953-09-05', '555-0129', 'Osteoporosis Management', ARRAY['Fracture Risk', 'Vitamin D Deficiency'], '{"street": "375 Redwood Street", "city": "Springfield", "state": "IL", "zip": "62715"}', '{"name": "Paul Martin", "relationship": "Husband", "phone": "555-0130"}', '{"primary": "Medicare", "secondary": "Independence Blue Cross", "id": "QRS456789123"}'),

('MRN001249', 'Paul', 'Thompson', '1942-12-18', '555-0131', 'Neurological Assessment', ARRAY['Parkinsons Disease', 'Tremor'], '{"street": "483 Sequoia Lane", "city": "Springfield", "state": "IL", "zip": "62716"}', '{"name": "Donna Thompson", "relationship": "Spouse", "phone": "555-0132"}', '{"primary": "Medicare", "secondary": "Caresource", "id": "TUV789123456"}'),

('MRN001250', 'Donna', 'Garcia', '1954-04-02', '555-0133', 'Blood Pressure Monitoring', ARRAY['Hypertension', 'Kidney Disease'], '{"street": "591 Aspen Road", "city": "Springfield", "state": "IL", "zip": "62717"}', '{"name": "Anthony Garcia", "relationship": "Husband", "phone": "555-0134"}', '{"primary": "Medicare", "secondary": "Medicaid", "id": "WXY123456789"}'),

('MRN001251', 'Anthony', 'Martinez', '1939-06-14', '555-0135', 'Respiratory Therapy', ARRAY['Emphysema', 'Chronic Bronchitis'], '{"street": "678 Fir Avenue", "city": "Springfield", "state": "IL", "zip": "62718"}', '{"name": "Maria Martinez", "relationship": "Spouse", "phone": "555-0136"}', '{"primary": "Medicare", "secondary": "Molina", "id": "ZAB987654321"}'),

('MRN001252', 'Maria', 'Robinson', '1956-08-27', '555-0137', 'Physical Therapy', ARRAY['Joint Replacement', 'Mobility Issues'], '{"street": "784 Pine Ridge Drive", "city": "Springfield", "state": "IL", "zip": "62719"}', '{"name": "Jose Robinson", "relationship": "Husband", "phone": "555-0138"}', '{"primary": "Medicare", "secondary": "United Healthcare", "id": "CDE456789123"}'),

('MRN001253', 'Jose', 'Clark', '1945-10-11', '555-0139', 'Occupational Therapy', ARRAY['Stroke Recovery', 'ADL Assistance'], '{"street": "892 Valley View Street", "city": "Springfield", "state": "IL", "zip": "62720"}', '{"name": "Carmen Clark", "relationship": "Spouse", "phone": "555-0140"}', '{"primary": "Medicare", "secondary": "Aetna", "id": "FGH789123456"}'),

('MRN001254', 'Carmen', 'Rodriguez', '1948-01-06', '555-0141', 'Speech Therapy', ARRAY['Dysphagia', 'Communication Disorder'], '{"street": "135 Hillside Lane", "city": "Springfield", "state": "IL", "zip": "62721"}', '{"name": "Carlos Rodriguez", "relationship": "Husband", "phone": "555-0142"}', '{"primary": "Medicare", "secondary": "Humana", "id": "IJK123456789"}'),

('MRN001255', 'Carlos', 'Lewis', '1941-03-29', '555-0143', 'Cardiac Monitoring', ARRAY['Arrhythmia', 'Pacemaker'], '{"street": "246 Countryside Road", "city": "Springfield", "state": "IL", "zip": "62722"}', '{"name": "Elena Lewis", "relationship": "Spouse", "phone": "555-0144"}', '{"primary": "Medicare", "secondary": "Cigna", "id": "LMN987654321"}'),

('MRN001256', 'Elena', 'Lee', '1950-07-21', '555-0145', 'Insulin Administration', ARRAY['Type 1 Diabetes', 'Neuropathy'], '{"street": "357 Meadowbrook Avenue", "city": "Springfield", "state": "IL", "zip": "62723"}', '{"name": "Daniel Lee", "relationship": "Husband", "phone": "555-0146"}', '{"primary": "Medicare", "secondary": "BCBS", "id": "OPQ456789123"}'),

('MRN001257', 'Daniel', 'Walker', '1952-12-13', '555-0147', 'Catheter Care', ARRAY['Urinary Retention', 'Prostate Issues'], '{"street": "468 Brookside Drive", "city": "Springfield", "state": "IL", "zip": "62724"}', '{"name": "Lisa Walker", "relationship": "Spouse", "phone": "555-0148"}', '{"primary": "Medicare", "secondary": "Kaiser", "id": "RST789123456"}'),

('MRN001258', 'Lisa', 'Hall', '1947-05-08', '555-0149', 'Nutritional Assessment', ARRAY['Malnutrition', 'Weight Loss'], '{"street": "579 Riverside Street", "city": "Springfield", "state": "IL", "zip": "62725"}', '{"name": "Mark Hall", "relationship": "Husband", "phone": "555-0150"}', '{"primary": "Medicare", "secondary": "Tricare", "id": "UVW123456789"}'),

('MRN001259', 'Mark', 'Allen', '1943-09-30', '555-0151', 'Depression Management', ARRAY['Major Depression', 'Anxiety'], '{"street": "680 Parkview Lane", "city": "Springfield", "state": "IL", "zip": "62726"}', '{"name": "Jennifer Allen", "relationship": "Spouse", "phone": "555-0152"}', '{"primary": "Medicare", "secondary": "Medicaid", "id": "XYZ987654321"}'),

('MRN001260', 'Jennifer', 'Young', '1955-02-14', '555-0153', 'Alzheimer Care', ARRAY['Dementia', 'Behavioral Issues'], '{"street": "791 Garden Court", "city": "Springfield", "state": "IL", "zip": "62727"}', '{"name": "Brian Young", "relationship": "Husband", "phone": "555-0154"}', '{"primary": "Medicare", "secondary": "Anthem", "id": "ABC456789123"}'),

('MRN001261', 'Brian', 'Hernandez', '1944-11-26', '555-0155', 'Ostomy Care', ARRAY['Colostomy', 'Bowel Disease'], '{"street": "812 Sunset Boulevard", "city": "Springfield", "state": "IL", "zip": "62728"}', '{"name": "Sandra Hernandez", "relationship": "Spouse", "phone": "555-0156"}', '{"primary": "Medicare", "secondary": "Molina", "id": "DEF789123456"}'),

('MRN001262', 'Sandra', 'King', '1949-08-12', '555-0157', 'Chemotherapy Support', ARRAY['Cancer Treatment', 'Nausea Management'], '{"street": "923 Sunrise Avenue", "city": "Springfield", "state": "IL", "zip": "62729"}', '{"name": "Richard King", "relationship": "Husband", "phone": "555-0158"}', '{"primary": "Medicare", "secondary": "WellCare", "id": "GHI123456789"}'),

('MRN001263', 'Richard', 'Wright', '1946-04-19', '555-0159', 'Dialysis Support', ARRAY['End Stage Renal Disease', 'Hypertension'], '{"street": "134 Morning Glory Drive", "city": "Springfield", "state": "IL", "zip": "62730"}', '{"name": "Deborah Wright", "relationship": "Spouse", "phone": "555-0160"}', '{"primary": "Medicare', "secondary": "Coventry", "id": "JKL987654321"}'),

('MRN001264', 'Deborah', 'Lopez', '1951-06-04', '555-0161', 'Skin Integrity Assessment', ARRAY['Pressure Ulcers', 'Immobility'], '{"street": "245 Evening Star Street", "city": "Springfield", "state": "IL", "zip": "62731"}', '{"name": "Francisco Lopez", "relationship": "Husband", "phone": "555-0162"}', '{"primary": "Medicare", "secondary": "Health Net", "id": "MNO456789123"}'),

('MRN001265', 'Francisco', 'Scott', '1940-10-17', '555-0163', 'Vision Rehabilitation', ARRAY['Macular Degeneration', 'Blindness'], '{"street": "356 Twilight Lane", "city": "Springfield", "state": "IL", "zip": "62732"}', '{"name": "Gloria Scott", "relationship": "Spouse", "phone": "555-0164"}', '{"primary": "Medicare", "secondary": "Independence Blue Cross", "id": "PQR789123456"}'),

('MRN001266', 'Gloria', 'Green', '1953-01-31', '555-0165', 'Hearing Assessment', ARRAY['Hearing Loss', 'Tinnitus'], '{"street": "467 Moonlight Road", "city": "Springfield", "state": "IL", "zip": "62733"}', '{"name": "Eugene Green", "relationship": "Husband", "phone": "555-0166"}', '{"primary": "Medicare", "secondary": "Caresource", "id": "STU123456789"}'),

('MRN001267', 'Eugene', 'Adams', '1945-07-24', '555-0167', 'Mobility Assessment', ARRAY['Wheelchair Bound', 'Muscle Weakness'], '{"street": "578 Starlight Avenue", "city": "Springfield", "state": "IL", "zip": "62734"}', '{"name": "Betty Adams", "relationship": "Spouse", "phone": "555-0168"}', '{"primary": "Medicare", "secondary": "Medicaid", "id": "VWX987654321"}'),

('MRN001268', 'Betty', 'Baker', '1948-12-09', '555-0169', 'Bowel Management', ARRAY['Constipation', 'Incontinence'], '{"street": "689 Daybreak Drive", "city": "Springfield", "state": "IL", "zip": "62735"}', '{"name": "Harold Baker", "relationship": "Husband", "phone": "555-0170"}', '{"primary": "Medicare", "secondary": "Molina", "id": "YZA456789123"}'),

('MRN001269', 'Harold', 'Gonzalez', '1942-04-15', '555-0171', 'Seizure Monitoring', ARRAY['Epilepsy', 'Medication Compliance'], '{"street": "790 Dawn Street", "city": "Springfield", "state": "IL", "zip": "62736"}', '{"name": "Ruth Gonzalez", "relationship": "Spouse", "phone": "555-0172"}', '{"primary": "Medicare", "secondary": "United Healthcare", "id": "BCD789123456"}'),

('MRN001270', 'Ruth', 'Nelson', '1950-09-28', '555-0173', 'IV Therapy', ARRAY['Dehydration', 'Electrolyte Imbalance'], '{"street": "801 Dusk Lane", "city": "Springfield", "state": "IL", "zip": "62737"}', '{"name": "Raymond Nelson", "relationship": "Husband", "phone": "555-0174"}', '{"primary": "Medicare", "secondary": "Aetna", "id": "EFG123456789"}'),

('MRN001271', 'Raymond', 'Carter', '1947-02-11', '555-0175', 'Antibiotic Therapy', ARRAY['Infection', 'MRSA'], '{"street": "912 Nightfall Road", "city": "Springfield", "state": "IL", "zip": "62738"}', '{"name": "Sharon Carter", "relationship": "Spouse", "phone": "555-0176"}', '{"primary": "Medicare", "secondary": "Humana", "id": "HIJ987654321"}'),

('MRN001272', 'Sharon', 'Mitchell', '1954-06-03', '555-0177', 'Oxygen Therapy', ARRAY['Respiratory Failure', 'Pulmonary Edema'], '{"street": "123 Midnight Avenue", "city": "Springfield", "state": "IL", "zip": "62739"}', '{"name": "Gary Mitchell", "relationship": "Husband", "phone": "555-0178"}', '{"primary": "Medicare", "secondary": "Cigna", "id": "KLM456789123"}'),

('MRN001273', 'Gary', 'Perez', '1941-11-18', '555-0179', 'Tracheostomy Care', ARRAY['Ventilator Dependent', 'Respiratory Failure'], '{"street": "234 Shadow Drive", "city": "Springfield", "state": "IL", "zip": "62740"}', '{"name": "Cynthia Perez", "relationship": "Spouse", "phone": "555-0180"}', '{"primary": "Medicare", "secondary": "BCBS", "id": "NOP789123456"}'),

('MRN001274', 'Cynthia', 'Roberts', '1949-03-07', '555-0181', 'Enteral Feeding', ARRAY['Malnutrition', 'Swallowing Disorder'], '{"street": "345 Twilight Street", "city": "Springfield", "state": "IL", "zip": "62741"}', '{"name": "Dennis Roberts", "relationship": "Husband", "phone": "555-0182"}', '{"primary": "Medicare", "secondary": "Kaiser", "id": "QRS123456789"}'),

('MRN001275', 'Dennis', 'Turner', '1946-08-22', '555-0183', 'Palliative Care', ARRAY['Terminal Illness', 'Pain Management'], '{"street": "456 Serenity Lane", "city": "Springfield", "state": "IL", "zip": "62742"}', '{"name": "Pamela Turner", "relationship": "Spouse", "phone": "555-0184"}', '{"primary": "Medicare", "secondary": "Tricare", "id": "TUV987654321"}'),

('MRN001276', 'Pamela', 'Phillips', '1952-01-14', '555-0185', 'Hospice Care', ARRAY['End of Life', 'Comfort Measures'], '{"street": "567 Peaceful Road", "city": "Springfield", "state": "IL", "zip": "62743"}', '{"name": "Terry Phillips", "relationship": "Husband", "phone": "555-0186"}', '{"primary": "Medicare", "secondary": "Medicaid", "id": "WXY456789123"}'),

('MRN001277', 'Terry', 'Campbell', '1943-05-29', '555-0187', 'Mental Health Support', ARRAY['Bipolar Disorder', 'Medication Management'], '{"street": "678 Harmony Avenue", "city": "Springfield", "state": "IL", "zip": "62744"}', '{"name": "Brenda Campbell", "relationship": "Spouse", "phone": "555-0188"}', '{"primary": "Medicare", "secondary": "Anthem", "id": "ZAB789123456"}'),

('MRN001278', 'Brenda', 'Parker', '1955-10-06', '555-0189', 'Substance Abuse Recovery', ARRAY['Alcohol Dependence', 'Liver Disease'], '{"street": "789 Recovery Street", "city": "Springfield", "state": "IL", "zip": "62745"}', '{"name": "Wayne Parker", "relationship": "Husband", "phone": "555-0190"}', '{"primary": "Medicare", "secondary": "Molina", "id": "CDE123456789"}'),

('MRN001279', 'Wayne', 'Evans', '1944-12-21', '555-0191', 'Burn Care', ARRAY['Third Degree Burns', 'Infection Risk'], '{"street": "890 Healing Drive", "city": "Springfield", "state": "IL", "zip": "62746"}', '{"name": "Carolyn Evans", "relationship": "Spouse", "phone": "555-0192"}', '{"primary": "Medicare", "secondary": "WellCare", "id": "FGH987654321"}'),

('MRN001280', 'Carolyn', 'Edwards', '1951-04-16', '555-0193', 'Amputation Care', ARRAY['Diabetic Amputation', 'Prosthetic Training'], '{"street": "901 Hope Lane", "city": "Springfield", "state": "IL", "zip": "62747"}', '{"name": "Larry Edwards", "relationship": "Husband", "phone": "555-0194"}', '{"primary": "Medicare", "secondary": "Coventry", "id": "IJK456789123"}'),

('MRN001281', 'Larry', 'Collins', '1948-07-01', '555-0195', 'Transplant Follow-up', ARRAY['Kidney Transplant', 'Immunosuppression'], '{"street": "112 New Life Road", "city": "Springfield", "state": "IL", "zip": "62748"}', '{"name": "Janet Collins", "relationship": "Spouse", "phone": "555-0196"}', '{"primary": "Medicare", "secondary": "Health Net", "id": "LMN789123456"}'),

('MRN001282', 'Janet', 'Stewart', '1946-09-13', '555-0197', 'Spinal Cord Injury Care', ARRAY['Paraplegia', 'Neurogenic Bladder'], '{"street": "223 Courage Avenue", "city": "Springfield", "state": "IL", "zip": "62749"}', '{"name": "Ralph Stewart", "relationship": "Husband", "phone": "555-0198"}', '{"primary": "Medicare", "secondary": "Independence Blue Cross", "id": "OPQ123456789"}'),

('MRN001283', 'Ralph', 'Sanchez', '1940-02-25', '555-0199', 'Traumatic Brain Injury', ARRAY['Cognitive Impairment', 'Memory Loss'], '{"street": "334 Strength Street", "city": "Springfield", "state": "IL", "zip": "62750"}', '{"name": "Maria Sanchez", "relationship": "Spouse", "phone": "555-0200"}', '{"primary": "Medicare", "secondary": "Caresource", "id": "RST987654321"}');