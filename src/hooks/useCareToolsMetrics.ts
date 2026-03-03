import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CareToolsMetrics {
  patientProgressionCount: number;
  dischargeAssistantCount: number;
  readmissionsPredictorCount: number;
}

export function useCareToolsMetrics() {
  return useQuery({
    queryKey: ['care-tools-metrics'],
    queryFn: async (): Promise<CareToolsMetrics> => {
      try {
        // Get patient progression count (patients with declining ADL trends)
        const { data: assessments } = await supabase
          .from('assessments')
          .select('patient_id, total_adl_score, assessment_date')
          .order('assessment_date', { ascending: false });

        let patientProgressionCount = 0;
        if (assessments) {
          const patientMap = new Map();
          assessments.forEach(assessment => {
            const patientId = assessment.patient_id;
            if (!patientMap.has(patientId)) {
              patientMap.set(patientId, []);
            }
            patientMap.get(patientId).push(assessment);
          });

          // Count patients with declining trends or needing intervention
          for (const [, patientAssessments] of patientMap) {
            if (patientAssessments.length >= 2) {
              const recent = patientAssessments[0];
              const previous = patientAssessments[1];
              if (recent.total_adl_score < previous.total_adl_score || recent.total_adl_score < 20) {
                patientProgressionCount++;
              }
            }
          }
        }

        // Get discharge assistant count (patients nearing discharge in 7 days)
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const { count: dischargeCount } = await supabase
          .from('episodes')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .gte('end_date', new Date().toISOString().split('T')[0])
          .lte('end_date', sevenDaysFromNow.toISOString().split('T')[0]);

        // Get readmissions predictor count (recently discharged patients at risk)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { count: recentDischargeCount } = await supabase
          .from('episodes')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .gte('end_date', thirtyDaysAgo.toISOString().split('T')[0]);

        // Estimate high-risk patients (roughly 30% of recently discharged)
        const readmissionsPredictorCount = Math.floor((recentDischargeCount || 0) * 0.3);

        return {
          patientProgressionCount,
          dischargeAssistantCount: dischargeCount || 0,
          readmissionsPredictorCount
        };
      } catch (error) {
        console.error('Error fetching care tools metrics:', error);
        return {
          patientProgressionCount: 0,
          dischargeAssistantCount: 0,
          readmissionsPredictorCount: 0
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
}