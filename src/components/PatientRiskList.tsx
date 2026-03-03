import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, AlertCircle, TrendingUp } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  age: number;
  riskLevel: "critical" | "high" | "medium" | "low";
  riskScore: number;
  lastAssessment: string;
  nextVisit: string;
  primaryConcern: string;
}

const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Martha Johnson",
    age: 78,
    riskLevel: "critical",
    riskScore: 92,
    lastAssessment: "2 days ago",
    nextVisit: "Today",
    primaryConcern: "ADL decline in bathing, toileting"
  },
  {
    id: "2", 
    name: "Robert Chen",
    age: 65,
    riskLevel: "high",
    riskScore: 76,
    lastAssessment: "1 week ago",
    nextVisit: "Tomorrow",
    primaryConcern: "Mobility decline, fall risk"
  },
  {
    id: "3",
    name: "Elena Rodriguez", 
    age: 82,
    riskLevel: "medium",
    riskScore: 54,
    lastAssessment: "3 days ago",
    nextVisit: "Dec 28",
    primaryConcern: "Medication management"
  }
];

const riskColors = {
  critical: "bg-risk-critical text-white",
  high: "bg-risk-high text-white", 
  medium: "bg-risk-medium text-white",
  low: "bg-risk-low text-white"
};

export function PatientRiskList() {
  return (
    <Card className="shadow-clinical">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          <span>High-Risk Patients</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockPatients.map((patient) => (
            <div key={patient.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:shadow-clinical transition-shadow">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-foreground">{patient.name}</h4>
                  <span className="text-sm text-muted-foreground">Age {patient.age}</span>
                  <Badge className={riskColors[patient.riskLevel]}>
                    {patient.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{patient.primaryConcern}</p>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>Risk Score: {patient.riskScore}%</span>
                  <span>Last: {patient.lastAssessment}</span>
                  <span>Next: {patient.nextVisit}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <TrendingUp className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button variant="clinical" size="sm">
                  Intervene
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}