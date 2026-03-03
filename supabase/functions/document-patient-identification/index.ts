import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    // Get form data from the request
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Read file content
    const fileContent = await file.text();
    
    // Get all patients from database for matching
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('id, first_name, last_name, mrn, date_of_birth, phone');

    if (patientsError) {
      console.error('Error fetching patients:', patientsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch patients' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create patient reference for AI
    const patientList = patients.map(p => 
      `${p.first_name} ${p.last_name} (MRN: ${p.mrn}, DOB: ${p.date_of_birth}, Phone: ${p.phone || 'N/A'}) - ID: ${p.id}`
    ).join('\n');

    // Use AI to extract patient information and match
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a healthcare document analysis assistant. Your task is to:

1. Extract patient identifying information from the uploaded document
2. Match it against the provided patient database
3. Return the best matching patient ID and confidence level

Look for: patient name, MRN (Medical Record Number), date of birth, phone number, address, or any other identifying information.

Patient Database:
${patientList}

Respond in JSON format:
{
  "patientId": "matching_patient_id_or_null",
  "confidence": "high|medium|low",
  "extractedInfo": {
    "name": "extracted_name",
    "mrn": "extracted_mrn",
    "dob": "extracted_dob",
    "phone": "extracted_phone",
    "other": "any_other_relevant_info"
  },
  "reasoning": "explanation_of_match_or_no_match"
}`
          },
          {
            role: 'user',
            content: `Please analyze this document and identify the patient:\n\n${fileContent.substring(0, 10000)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      return new Response(
        JSON.stringify({ error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResult = await response.json();
    const analysis = JSON.parse(aiResult.choices[0].message.content);
    
    // Get full patient details if match found
    let matchedPatient = null;
    if (analysis.patientId) {
      const { data: patient } = await supabase
        .from('patients')
        .select('id, first_name, last_name, mrn, date_of_birth')
        .eq('id', analysis.patientId)
        .single();
      
      if (patient) {
        matchedPatient = patient;
        
        // Get active episode
        const { data: episode } = await supabase
          .from('episodes')
          .select('id, episode_number')
          .eq('patient_id', patient.id)
          .eq('status', 'active')
          .single();
        
        if (episode) {
          matchedPatient.activeEpisode = episode;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        matchedPatient,
        fileName: file.name,
        fileSize: file.size
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in document-patient-identification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});