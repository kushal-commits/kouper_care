import { MetricCard } from "@/components/MetricCard";
import { PatientAlertsView } from "@/components/PatientAlertsView";
import { AICopilot } from "@/components/AICopilot";
import { Users, AlertTriangle, Activity } from "lucide-react";
import { useMetricsCalculator } from "@/components/MetricsCalculator";

interface DashboardProps {
  onOpenChat?: (initialMessage: string) => void;
}

export default function Dashboard({ onOpenChat }: DashboardProps) {
  const { data: metrics, isLoading } = useMetricsCalculator();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 xl:p-12 space-y-6 lg:space-y-8 xl:space-y-12 max-w-7xl 2xl:max-w-[90rem] mx-auto">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Loading Dashboard...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 xl:p-12 space-y-6 lg:space-y-8 xl:space-y-12 max-w-7xl 2xl:max-w-[90rem] mx-auto">
      {/* AI Copilot Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Hi there! Your HomeCare Copilot is ready to help.</h1>
        <p className="text-muted-foreground text-lg">
          I'm here to help you consolidate your patient data so you can make confident care decisions.
        </p>
      </div>

      {/* AI Copilot Interface */}
      <div className="max-w-4xl mx-auto">
        <AICopilot onOpenChat={onOpenChat} />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Patient Alerts"
          value={metrics?.criticalPatients.toString() || "0"}
          change="+5 from last week"
          changeType="negative"
          icon={AlertTriangle}
          description="Requiring intervention"
          clickPath="/alerts?tab=alerts"
        />
        <div className="border-2 border-primary-green-500 rounded-lg">
          <MetricCard
            title="Alerts Resolved"
            value={metrics?.resolvedInterventions.toString() || "0"}
            change="+28% this month"
            changeType="positive"
            icon={Activity}
            description="Actions Taken"
          />
        </div>
        <MetricCard
          title="Total Patients"
          value={metrics?.totalPatients.toString() || "0"}
          change="+10 this week"
          changeType="positive"
          icon={Users}
          description="Active caseload"
          clickPath="/patients"
        />
      </div>

      {/* Patient Alerts - Full Width */}
      <div className="w-full">
        <PatientAlertsView />
      </div>
    </div>
  );
}