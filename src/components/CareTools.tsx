import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Map, BarChart3, ArrowRight, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCareToolsMetrics } from "@/hooks/useCareToolsMetrics";

const careTools = [
  {
    name: "Patient Progression",
    icon: Map,
    description: "Query patient data & identify mid-episode interventions",
    route: "/tools/patient-progression",
    badgeKey: "patientProgressionCount" as const,
    badgeText: (count: number) => count > 0 ? `${count} flagged` : "All stable"
  },
  {
    name: "OASIS Documentation Assistant",
    icon: Clock,
    description: "Reconcile documentation across episode prior to discharge",
    route: "/tools/discharge-assistant",
    badgeKey: "dischargeAssistantCount" as const,
    badgeText: (count: number) => count > 0 ? `${count} pending` : "Up to date"
  },
  {
    name: "Readmissions prediction assistant",
    icon: TrendingUp,
    description: "Identify readmissions trends and flag patients with high readmission risk",
    route: "/tools/readmissions-predictor",
    badgeKey: "readmissionsPredictorCount" as const,
    badgeText: (count: number) => count > 0 ? `${count} at risk` : "Low risk"
  },
  {
    name: "Readmission Retros",
    icon: FileText,
    description: "Surface insights from episodes ending in readmission for future improvement",
    route: "/tools/readmission-retros",
    badgeKey: "readmissionRetrosCount" as const,
    badgeText: (count: number) => count > 0 ? `${count} insights` : "No new insights"
  }
];

export function CareTools() {
  const navigate = useNavigate();
  const { data: metrics, isLoading } = useCareToolsMetrics();

  return (
    <Card className="shadow-clinical">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Care Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        {careTools.map((tool) => {
          const count = metrics?.[tool.badgeKey] || 0;
          const badgeText = tool.badgeText(count);
          
          return (
            <Button
              key={tool.name}
              variant="ghost"
              className="w-full justify-start h-auto p-3 sm:p-4 text-left border rounded-lg hover:shadow-elevated hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 group hover:scale-[1.02]"
              onClick={() => navigate(tool.route)}
            >
              <tool.icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mr-2 sm:mr-3 flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-foreground text-sm sm:text-base leading-tight group-hover:text-primary transition-colors">
                    {tool.name}
                  </div>
                  {!isLoading && (
                    <Badge 
                      variant={count > 0 ? "secondary" : "outline"} 
                      className="text-xs ml-2 flex-shrink-0"
                    >
                      {badgeText}
                    </Badge>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground leading-tight">
                  {tool.description}
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}