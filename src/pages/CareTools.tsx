import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, BarChart3, ArrowRight, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCareToolsMetrics } from "@/hooks/useCareToolsMetrics";

const careTools = [
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

const CareTools = () => {
  const navigate = useNavigate();
  const { data: metrics, isLoading } = useCareToolsMetrics();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Care Tools</h2>
      </div>
      
      <p className="text-muted-foreground">
        Access specialized tools to support patient care and episode management.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 max-w-4xl">
        {careTools.map((tool) => {
          const count = metrics?.[tool.badgeKey] || 0;
          const badgeText = tool.badgeText(count);
          
          return (
            <Card key={tool.name} className="shadow-clinical hover:shadow-elevated transition-all duration-200 hover:scale-[1.02] cursor-pointer" onClick={() => navigate(tool.route)}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <tool.icon className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg font-semibold">{tool.name}</CardTitle>
                  </div>
                  {!isLoading && (
                    <Badge 
                      variant={count > 0 ? "secondary" : "outline"} 
                      className="text-xs"
                    >
                      {badgeText}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {tool.description}
                </p>
                <Button 
                  variant="outline" 
                  className="w-full group hover:bg-primary hover:text-primary-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(tool.route);
                  }}
                >
                  Open Tool
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CareTools;