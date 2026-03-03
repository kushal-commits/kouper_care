import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardMetrics {
  totalPatients: number;
  criticalPatients: number;
  resolvedInterventions: number;
  pendingInterventions: number;
  activeAlerts: number;
  overdueTasks: number;
  completedThisWeek: number;
  // Enhanced metrics for richer context
  alertsTrend: { current: number; previous: number; change: number };
  alertsSeverity: { critical: number; high: number; medium: number };
  overdueTasksContext: { oldestDays: number; overSevenDays: number; percentage: number };
  careNotesContext: { count: number; avgWaitDays: number };
  interventionBreakdown: { mobility: number; woundCare: number; medication: number; other: number };
  completionTarget: { completed: number; target: number; percentage: number };
}

export function useMetricsCalculator() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async (): Promise<DashboardMetrics> => {
      try {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Get total patients
        const { count: totalPatients } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true });

        // Get current active alerts with severity breakdown
        const { data: activeAlertsData } = await supabase
          .from('alerts')
          .select('severity, created_at')
          .eq('is_acknowledged', false);

        const activeAlerts = activeAlertsData?.length || 0;
        const alertsSeverity = {
          critical: activeAlertsData?.filter(a => a.severity === 'critical').length || 0,
          high: activeAlertsData?.filter(a => a.severity === 'high').length || 0,
          medium: activeAlertsData?.filter(a => a.severity === 'medium').length || 0
        };

        // Get yesterday's alerts for trend calculation
        const { count: yesterdayAlertsCount } = await supabase
          .from('alerts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', yesterday.toISOString().split('T')[0])
          .lt('created_at', now.toISOString().split('T')[0]);

        const alertsTrend = {
          current: activeAlerts,
          previous: yesterdayAlertsCount || 0,
          change: activeAlerts - (yesterdayAlertsCount || 0)
        };

        // Get interventions with detailed breakdown
        const { data: interventions } = await supabase
          .from('interventions')
          .select('status, completed_date, created_at, scheduled_date, intervention_type, priority');

        const resolvedInterventions = interventions?.filter(i => i.status === 'completed').length || 0;
        const pendingInterventions = interventions?.filter(i => i.status === 'pending').length || 0;

        // Calculate completed this week
        const completedThisWeek = interventions?.filter(i => 
          i.status === 'completed' && 
          i.completed_date && 
          new Date(i.completed_date) >= oneWeekAgo
        ).length || 0;

        // Calculate overdue tasks (pending interventions past scheduled date)
        const overdueInterventions = interventions?.filter(i => 
          i.status === 'pending' && 
          i.scheduled_date && 
          new Date(i.scheduled_date) < now
        ) || [];

        const overdueTasks = overdueInterventions.length;
        
        // Calculate oldest overdue and percentage > 7 days
        let oldestOverdueDays = 0;
        let overSevenDaysCount = 0;
        
        if (overdueInterventions.length > 0) {
          const overdueDays = overdueInterventions.map(i => {
            const daysDiff = Math.floor((now.getTime() - new Date(i.scheduled_date!).getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff > 7) overSevenDaysCount++;
            return daysDiff;
          });
          oldestOverdueDays = Math.max(...overdueDays);
        }

        const overdueTasksContext = {
          oldestDays: oldestOverdueDays,
          overSevenDays: overSevenDaysCount,
          percentage: overdueTasks > 0 ? Math.round((overSevenDaysCount / overdueTasks) * 100) : 0
        };

        // Get care manager notes awaiting review
        const { data: careNotes } = await supabase
          .from('clinician_notes')
          .select('created_at, discipline')
          .eq('discipline', 'case_manager')
          .order('created_at', { ascending: false });

        const careNotesCount = careNotes?.length || 0;
        let avgWaitDays = 0;
        
        if (careNotes && careNotes.length > 0) {
          const totalWaitDays = careNotes.reduce((sum, note) => {
            const daysDiff = Math.floor((now.getTime() - new Date(note.created_at).getTime()) / (1000 * 60 * 60 * 24));
            return sum + daysDiff;
          }, 0);
          avgWaitDays = parseFloat((totalWaitDays / careNotes.length).toFixed(1));
        }

        const careNotesContext = {
          count: careNotesCount,
          avgWaitDays
        };

        // Calculate intervention breakdown by type
        const pendingByType = interventions?.filter(i => i.status === 'pending') || [];
        const interventionBreakdown = {
          mobility: pendingByType.filter(i => i.intervention_type?.toLowerCase().includes('mobility') || 
                                            i.intervention_type?.toLowerCase().includes('ambulation') ||
                                            i.intervention_type?.toLowerCase().includes('transfer')).length,
          woundCare: pendingByType.filter(i => i.intervention_type?.toLowerCase().includes('wound') ||
                                              i.intervention_type?.toLowerCase().includes('skin')).length,
          medication: pendingByType.filter(i => i.intervention_type?.toLowerCase().includes('medication') ||
                                               i.intervention_type?.toLowerCase().includes('med')).length,
          other: 0
        };
        interventionBreakdown.other = pendingInterventions - 
          (interventionBreakdown.mobility + interventionBreakdown.woundCare + interventionBreakdown.medication);

        // Get critical/high risk patients from latest assessments
        const { data: riskAssessments } = await supabase
          .from('assessments')
          .select('patient_id, risk_level, assessment_date')
          .in('risk_level', ['critical', 'high'])
          .order('assessment_date', { ascending: false });

        // Get unique critical patients (latest assessment only)
        const criticalPatientIds = new Set();
        const criticalPatients = riskAssessments?.filter(assessment => {
          if (!criticalPatientIds.has(assessment.patient_id)) {
            criticalPatientIds.add(assessment.patient_id);
            return true;
          }
          return false;
        }).length || 0;

        // Calculate completion target (weekly target of 20)
        const weeklyTarget = 20;
        const completionPercentage = Math.min(100, Math.round((completedThisWeek / weeklyTarget) * 100));
        const completionTarget = {
          completed: completedThisWeek,
          target: weeklyTarget,
          percentage: completionPercentage
        };

        return {
          totalPatients: totalPatients || 0,
          criticalPatients,
          resolvedInterventions,
          pendingInterventions,
          activeAlerts: activeAlerts || 0,
          overdueTasks,
          completedThisWeek,
          alertsTrend,
          alertsSeverity,
          overdueTasksContext,
          careNotesContext,
          interventionBreakdown,
          completionTarget
        };
      } catch (error) {
        console.error('Error calculating metrics:', error);
        // Return fallback values
        return {
          totalPatients: 0,
          criticalPatients: 0,
          resolvedInterventions: 0,
          pendingInterventions: 0,
          activeAlerts: 0,
          overdueTasks: 0,
          completedThisWeek: 0,
          alertsTrend: { current: 0, previous: 0, change: 0 },
          alertsSeverity: { critical: 0, high: 0, medium: 0 },
          overdueTasksContext: { oldestDays: 0, overSevenDays: 0, percentage: 0 },
          careNotesContext: { count: 0, avgWaitDays: 0 },
          interventionBreakdown: { mobility: 0, woundCare: 0, medication: 0, other: 0 },
          completionTarget: { completed: 0, target: 0, percentage: 0 }
        };
      }
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

// Helper function to format change text
export function formatMetricChange(current: number, previous: number, suffix = '') {
  const diff = current - previous;
  const sign = diff > 0 ? '+' : '';
  return `${sign}${diff}${suffix}`;
}

// Helper function to determine change type
export function getChangeType(current: number, previous: number, invert = false) {
  const diff = current - previous;
  if (diff === 0) return 'neutral';
  
  const isPositive = diff > 0;
  if (invert) {
    return isPositive ? 'negative' : 'positive';
  }
  return isPositive ? 'positive' : 'negative';
}