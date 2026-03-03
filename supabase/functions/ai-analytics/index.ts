import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface PatientAnalytics {
  totalPatients: number;
  activeEpisodes: number;
  criticalPatients: string[];
  recentActions: any[];
  nurseList: string[];
  caregiverList: string[];
  patientsNeedingAttention: any[];
  trends: any;
}

async function getComprehensiveAnalytics(): Promise<PatientAnalytics> {
  console.log('Fetching comprehensive patient analytics...');

  // Get all patients
  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('*');

  if (patientsError) {
    console.error('Error fetching patients:', patientsError);
    throw patientsError;
  }

  // Get active episodes with patient and staff info
  const { data: episodes, error: episodesError } = await supabase
    .from('episodes')
    .select(`
      *,
      patients:patient_id (first_name, last_name, mrn),
      primary_nurse:primary_nurse_id (full_name, role),
      coordinator:coordinator_id (full_name, role)
    `)
    .eq('status', 'active');

  if (episodesError) {
    console.error('Error fetching episodes:', episodesError);
    throw episodesError;
  }

  // Get recent assessments with risk levels
  const { data: assessments, error: assessmentsError } = await supabase
    .from('assessments')
    .select(`
      *,
      patients:patient_id (first_name, last_name, mrn),
      profiles:assessor_id (full_name)
    `)
    .order('assessment_date', { ascending: false })
    .limit(50);

  if (assessmentsError) {
    console.error('Error fetching assessments:', assessmentsError);
    throw assessmentsError;
  }

  // Get recent interventions
  const { data: interventions, error: interventionsError } = await supabase
    .from('interventions')
    .select(`
      *,
      patients:patient_id (first_name, last_name, mrn),
      assigned_to:assigned_to_id (full_name, role)
    `)
    .order('created_at', { ascending: false })
    .limit(30);

  if (interventionsError) {
    console.error('Error fetching interventions:', interventionsError);
    throw interventionsError;
  }

  // Get all alerts
  const { data: alerts, error: alertsError } = await supabase
    .from('alerts')
    .select(`
      *,
      patients:patient_id (first_name, last_name, mrn)
    `)
    .eq('is_acknowledged', false)
    .order('created_at', { ascending: false });

  if (alertsError) {
    console.error('Error fetching alerts:', alertsError);
    throw alertsError;
  }

  // Get all staff members
  const { data: staff, error: staffError } = await supabase
    .from('profiles')
    .select('*');

  if (staffError) {
    console.error('Error fetching staff:', staffError);
    throw staffError;
  }

  // Process the data
  const totalPatients = patients?.length || 0;
  const activeEpisodes = episodes?.length || 0;

  // Find critical patients
  const criticalPatients = assessments
    ?.filter(a => a.risk_level === 'critical')
    ?.map(a => `${a.patients?.first_name} ${a.patients?.last_name} (${a.patients?.mrn})`)
    ?.slice(0, 10) || [];

  // Recent actions (interventions and assessments)
  const recentActions = [
    ...(interventions?.map(i => ({
      type: 'intervention',
      description: i.description,
      patient: `${i.patients?.first_name} ${i.patients?.last_name}`,
      assignedTo: i.assigned_to?.full_name,
      date: i.created_at,
      status: i.status
    })) || []),
    ...(assessments?.slice(0, 10).map(a => ({
      type: 'assessment',
      description: `${a.assessment_type} assessment - Risk: ${a.risk_level}`,
      patient: `${a.patients?.first_name} ${a.patients?.last_name}`,
      assessor: a.profiles?.full_name,
      date: a.assessment_date,
      totalScore: a.total_adl_score
    })) || [])
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15);

  // Get nurse and caregiver lists
  const nurseList = staff?.filter(s => s.role === 'nurse').map(s => s.full_name) || [];
  const caregiverList = staff?.filter(s => s.role === 'caregiver').map(s => s.full_name) || [];

  // Patients needing attention (based on alerts and risk levels)
  const patientsNeedingAttention = [
    ...(alerts?.map(a => ({
      patient: `${a.patients?.first_name} ${a.patients?.last_name} (${a.patients?.mrn})`,
      reason: a.title,
      severity: a.severity,
      type: 'alert'
    })) || []),
    ...(assessments?.filter(a => a.risk_level === 'critical' || a.risk_level === 'high')
      ?.slice(0, 8)
      ?.map(a => ({
        patient: `${a.patients?.first_name} ${a.patients?.last_name} (${a.patients?.mrn})`,
        reason: `${a.risk_level} risk level - ADL Score: ${a.total_adl_score}`,
        severity: a.risk_level === 'critical' ? 'critical' : 'warning',
        type: 'risk_assessment'
      })) || [])
  ];

  // Calculate trends
  const trends = {
    averageADLScore: assessments?.reduce((sum, a) => sum + (a.total_adl_score || 0), 0) / (assessments?.length || 1),
    riskDistribution: {
      low: assessments?.filter(a => a.risk_level === 'low').length || 0,
      medium: assessments?.filter(a => a.risk_level === 'medium').length || 0,
      high: assessments?.filter(a => a.risk_level === 'high').length || 0,
      critical: assessments?.filter(a => a.risk_level === 'critical').length || 0
    },
    activeInterventions: interventions?.filter(i => i.status === 'active').length || 0,
    completedInterventions: interventions?.filter(i => i.status === 'completed').length || 0
  };

  // Create detailed patient profiles for AI context
  const detailedPatients = patients?.map(p => {
    const patientEpisodes = episodes?.filter(e => e.patient_id === p.id) || [];
    const patientAssessments = assessments?.filter(a => a.patient_id === p.id) || [];
    const patientInterventions = interventions?.filter(i => i.patient_id === p.id) || [];
    const patientAlerts = alerts?.filter(a => a.patient_id === p.id) || [];
    
    const latestAssessment = patientAssessments?.[0];
    const activeEpisode = patientEpisodes?.find(e => e.status === 'active');
    
    return {
      name: `${p.first_name} ${p.last_name}`,
      mrn: p.mrn,
      dateOfBirth: p.date_of_birth,
      primaryDiagnosis: p.primary_diagnosis,
      secondaryDiagnoses: p.secondary_diagnoses,
      phone: p.phone,
      address: p.address,
      emergencyContact: p.emergency_contact,
      insuranceInfo: p.insurance_info,
      currentEpisode: activeEpisode ? {
        episodeNumber: activeEpisode.episode_number,
        startDate: activeEpisode.start_date,
        endDate: activeEpisode.end_date,
        primaryNurse: staff?.find(s => s.id === activeEpisode.primary_nurse_id)?.full_name,
        coordinator: staff?.find(s => s.id === activeEpisode.coordinator_id)?.full_name,
        status: activeEpisode.status
      } : null,
      latestAssessment: latestAssessment ? {
        date: latestAssessment.assessment_date,
        type: latestAssessment.assessment_type,
        totalADLScore: latestAssessment.total_adl_score,
        riskLevel: latestAssessment.risk_level,
        bathingScore: latestAssessment.bathing_score,
        dressingUpperScore: latestAssessment.dressing_upper_score,
        dressingLowerScore: latestAssessment.dressing_lower_score,
        groomingScore: latestAssessment.grooming_score,
        eatingScore: latestAssessment.eating_score,
        toiletingScore: latestAssessment.toileting_score,
        transferringScore: latestAssessment.transferring_score,
        ambulationScore: latestAssessment.ambulation_score,
        medicationMgmtScore: latestAssessment.medication_mgmt_score,
        assessor: staff?.find(s => s.id === latestAssessment.assessor_id)?.full_name,
        notes: latestAssessment.notes
      } : null,
      activeInterventions: patientInterventions?.filter(i => i.status === 'active' || i.status === 'pending').map(i => ({
        type: i.intervention_type,
        description: i.description,
        priority: i.priority,
        status: i.status,
        scheduledDate: i.scheduled_date,
        assignedTo: staff?.find(s => s.id === i.assigned_to_id)?.full_name,
        notes: i.notes
      })) || [],
      alerts: patientAlerts?.map(a => ({
        title: a.title,
        message: a.message,
        severity: a.severity,
        alertType: a.alert_type,
        createdAt: a.created_at
      })) || []
    };
  }) || [];

  return {
    totalPatients,
    activeEpisodes,
    criticalPatients,
    recentActions,
    nurseList,
    caregiverList,
    patientsNeedingAttention,
    trends,
    detailedPatients: detailedPatients.slice(0, 50) // Limit to prevent context overflow
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, includeAnalytics = true } = await req.json();

    let contextData = '';
    
    if (includeAnalytics) {
      console.log('Gathering comprehensive analytics...');
      const analytics = await getComprehensiveAnalytics();
      
      contextData = `
CURRENT SYSTEM OVERVIEW:
======================
Total Patients: ${analytics.totalPatients}
Active Episodes: ${analytics.activeEpisodes}
Average ADL Score: ${analytics.trends.averageADLScore.toFixed(1)}

STAFF ROSTER:
============
Nurses: ${analytics.nurseList.join(', ') || 'None registered'}
Caregivers: ${analytics.caregiverList.join(', ') || 'None registered'}

PATIENTS REQUIRING ATTENTION:
============================
${analytics.patientsNeedingAttention.map(p => `• ${p.patient} - ${p.reason} (${p.severity})`).join('\n') || 'All patients stable'}

CRITICAL PATIENTS:
=================
${analytics.criticalPatients.join('\n') || 'No critical patients'}

RECENT ACTIONS (Last 15):
========================
${analytics.recentActions.map(a => `• ${a.type}: ${a.description} - ${a.patient} (${new Date(a.date).toLocaleDateString()})`).join('\n')}

RISK DISTRIBUTION:
=================
Low Risk: ${analytics.trends.riskDistribution.low} patients
Medium Risk: ${analytics.trends.riskDistribution.medium} patients  
High Risk: ${analytics.trends.riskDistribution.high} patients
Critical Risk: ${analytics.trends.riskDistribution.critical} patients

INTERVENTION STATUS:
==================
Active: ${analytics.trends.activeInterventions}
Completed: ${analytics.trends.completedInterventions}

DETAILED PATIENT DATABASE:
=========================
${analytics.detailedPatients.map(p => `
PATIENT: ${p.name} (MRN: ${p.mrn})
- DOB: ${p.dateOfBirth}
- Primary Diagnosis: ${p.primaryDiagnosis || 'Not specified'}
- Secondary Diagnoses: ${p.secondaryDiagnoses?.join(', ') || 'None'}
- Phone: ${p.phone || 'Not provided'}
- Current Episode: ${p.currentEpisode ? `${p.currentEpisode.episodeNumber} (${p.currentEpisode.startDate} to ${p.currentEpisode.endDate}) - Nurse: ${p.currentEpisode.primaryNurse || 'Unassigned'}, Coordinator: ${p.currentEpisode.coordinator || 'Unassigned'}` : 'No active episode'}
- Latest Assessment: ${p.latestAssessment ? `${p.latestAssessment.date} - ${p.latestAssessment.type} - ADL Score: ${p.latestAssessment.totalADLScore}, Risk: ${p.latestAssessment.riskLevel} - Assessor: ${p.latestAssessment.assessor || 'Unknown'}` : 'No assessments'}
- Active Interventions: ${p.activeInterventions.length > 0 ? p.activeInterventions.map(i => `${i.type}: ${i.description} (${i.priority} priority, assigned to ${i.assignedTo || 'Unassigned'})`).join('; ') : 'None'}
- Alerts: ${p.alerts.length > 0 ? p.alerts.map(a => `${a.title}: ${a.message} (${a.severity})`).join('; ') : 'None'}
${p.latestAssessment?.notes ? `- Assessment Notes: ${p.latestAssessment.notes}` : ''}
`).join('\n')}
      `;
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are a friendly and knowledgeable healthcare AI assistant specializing in ADL (Activities of Daily Living) coordination. You have complete access to the current patient database and care records. 

You speak in a warm, conversational tone like a trusted healthcare colleague. You can see everything happening in the system right now, including all patients, their progress, staff assignments, and care needs.

When users ask about:
- "What's happening" or "Give me an overview" → Provide a comprehensive summary
- Specific patients → Give detailed insights about their care and progress  
- Staff/nurses → List who's working and their current caseloads
- Trends → Analyze patterns in ADL scores and patient outcomes
- Alerts → Highlight patients needing immediate attention

Always be helpful, caring, and provide actionable insights that help caregivers make better decisions.

${includeAnalytics ? `CURRENT DATA CONTEXT:\n${contextData}` : ''}`;

    console.log('Calling OpenAI with context...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_completion_tokens: 800,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      analytics: includeAnalytics ? await getComprehensiveAnalytics() : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI analytics function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process request',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});