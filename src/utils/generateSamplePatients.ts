import { supabase } from "@/integrations/supabase/client";

const firstNames = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Christopher", "Karen", "Charles", "Nancy", "Daniel", "Lisa",
  "Matthew", "Betty", "Anthony", "Helen", "Mark", "Sandra", "Donald", "Donna",
  "Steven", "Carol", "Paul", "Ruth", "Andrew", "Sharon", "Joshua", "Michelle",
  "Kenneth", "Laura", "Kevin", "Sarah", "Brian", "Kimberly", "George", "Deborah",
  "Edward", "Dorothy", "Ronald", "Amy"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
  "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts"
];

const diagnoses = [
  "Type 2 Diabetes Mellitus",
  "Congestive Heart Failure",
  "COPD Exacerbation", 
  "Stroke with Hemiparesis",
  "Post-Surgical Recovery",
  "Chronic Wound Care",
  "Hypertension",
  "Pneumonia",
  "Urinary Tract Infection",
  "Chronic Kidney Disease",
  "Osteoarthritis",
  "Depression",
  "Alzheimer's Disease",
  "Parkinson's Disease",
  "Chronic Pain Management"
];

const streetNames = [
  "Main St", "Oak Ave", "Pine St", "Maple Dr", "Cedar Ln", "Elm St", "Park Ave",
  "Washington St", "Lincoln Ave", "Jefferson Dr", "Madison St", "Adams Ave"
];

const cities = [
  "Springfield", "Franklin", "Georgetown", "Bristol", "Clinton", "Salem",
  "Madison", "Chester", "Marion", "Warren", "Washington", "Jackson"
];

const states = ["CA", "TX", "FL", "NY", "PA", "IL", "OH", "GA", "NC", "MI"];

function generateRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateMRN(): string {
  return `MRN${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
}

function generatePhone(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `${areaCode}-${exchange}-${number}`;
}

function generateAddress() {
  const streetNumber = Math.floor(Math.random() * 9999) + 1;
  const street = streetNames[Math.floor(Math.random() * streetNames.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const state = states[Math.floor(Math.random() * states.length)];
  const zip = String(Math.floor(Math.random() * 90000) + 10000);
  
  return {
    street: `${streetNumber} ${street}`,
    city,
    state,
    zip_code: zip
  };
}

function generateEmergencyContact() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const relationships = ["Spouse", "Child", "Sibling", "Parent", "Friend", "Neighbor"];
  
  return {
    name: `${firstName} ${lastName}`,
    relationship: relationships[Math.floor(Math.random() * relationships.length)],
    phone: generatePhone()
  };
}

function generateInsuranceInfo() {
  const insurers = ["Medicare", "Medicaid", "Blue Cross Blue Shield", "Aetna", "Cigna", "United Healthcare"];
  const insurer = insurers[Math.floor(Math.random() * insurers.length)];
  
  return {
    primary_insurer: insurer,
    policy_number: `${insurer.replace(/\s/g, '').toUpperCase()}${Math.floor(Math.random() * 1000000)}`
  };
}

export async function generateSamplePatients(count: number = 50) {
  const patients = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    // Generate age between 25 and 95
    const birthYear = new Date().getFullYear() - (Math.floor(Math.random() * 70) + 25);
    const birthMonth = Math.floor(Math.random() * 12);
    const birthDay = Math.floor(Math.random() * 28) + 1;
    const dateOfBirth = new Date(birthYear, birthMonth, birthDay);
    
    const primaryDiagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];
    
    // Sometimes add secondary diagnoses
    const secondaryDiagnoses = Math.random() > 0.7 ? 
      [diagnoses[Math.floor(Math.random() * diagnoses.length)]] : 
      null;
    
    const patient = {
      mrn: generateMRN(),
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth.toISOString().split('T')[0],
      phone: generatePhone(),
      primary_diagnosis: primaryDiagnosis,
      secondary_diagnoses: secondaryDiagnoses,
      address: generateAddress(),
      emergency_contact: generateEmergencyContact(),
      insurance_info: generateInsuranceInfo()
    };
    
    patients.push(patient);
  }
  
  // Insert patients in batches of 10 to avoid potential limits
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < patients.length; i += batchSize) {
    const batch = patients.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('patients')
      .insert(batch)
      .select();
    
    if (error) {
      console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error);
      throw error;
    }
    
    if (data) {
      results.push(...data);
    }
  }
  
  return results;
}