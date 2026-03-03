import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { naturalLanguage } = await req.json();
    
    console.log('Processing natural language rule:', naturalLanguage);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are an expert at converting natural language into structured alert rule parameters for a healthcare system.

Given a natural language description of an alert rule, extract and return ONLY a JSON object with these exact fields:
- name (string): A clear, descriptive name for the rule
- condition (string): The technical condition that will trigger the alert
- severity (string): One of "low", "medium", or "high"
- window_size (string): Time window like "24 hours", "3 days", "1 week", etc.

Examples:
Input: "Alert me when a patient's ADL score drops by 2 points within 3 days"
Output: {"name": "ADL Score Drop Alert", "condition": "adl_score_change <= -2", "severity": "medium", "window_size": "3 days"}

Input: "High priority alert if patient readmission risk exceeds 80% in the last week"
Output: {"name": "High Readmission Risk Alert", "condition": "readmission_risk > 0.8", "severity": "high", "window_size": "1 week"}

Input: "Notify when functional decline detected in mobility over 48 hours"
Output: {"name": "Mobility Decline Alert", "condition": "mobility_decline_detected = true", "severity": "medium", "window_size": "48 hours"}

Return ONLY the JSON object, no other text or explanation.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: naturalLanguage }
        ],
        max_tokens: 200,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();
    
    console.log('AI response:', aiResponse);

    try {
      const parsedRule = JSON.parse(aiResponse);
      
      // Validate required fields
      if (!parsedRule.name || !parsedRule.condition || !parsedRule.severity || !parsedRule.window_size) {
        throw new Error('Missing required fields in parsed rule');
      }

      // Validate severity
      if (!['low', 'medium', 'high'].includes(parsedRule.severity)) {
        parsedRule.severity = 'medium';
      }

      console.log('Successfully parsed rule:', parsedRule);

      return new Response(JSON.stringify({
        success: true,
        rule: parsedRule
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('Failed to parse rule from natural language');
    }

  } catch (error) {
    console.error('Error in parse-rule-language function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});