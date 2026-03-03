import { useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { 
  Calendar, 
  User, 
  Upload, 
  Plus, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const episodeData = {
  id: "EPI-8842",
  patient: {
    name: "Sarah Johnson",
    dob: "1945-03-15",
    mrn: "MRN-001"
  },
  startDate: "2024-01-15",
  endDate: "2024-02-14", 
  day: 14,
  coordinator: "Dr. Smith",
  status: "Active"
};

const adlData = [
  {
    name: "Bathing",
    currentScore: 3,
    previousScore: 2,
    trend: "declining",
    sparklineData: [1, 2, 2, 3, 3],
    lastAssessment: "2024-01-28"
  },
  {
    name: "Dressing (Upper)",
    currentScore: 2,
    previousScore: 2,
    trend: "stable",
    sparklineData: [2, 2, 1, 2, 2],
    lastAssessment: "2024-01-28"
  },
  {
    name: "Dressing (Lower)",
    currentScore: 2,
    previousScore: 3,
    trend: "improving",
    sparklineData: [3, 3, 2, 2, 2],
    lastAssessment: "2024-01-28"
  },
  {
    name: "Grooming",
    currentScore: 1,
    previousScore: 1,
    trend: "stable",
    sparklineData: [1, 1, 0, 1, 1],
    lastAssessment: "2024-01-28"
  },
  {
    name: "Eating",
    currentScore: 0,
    previousScore: 0,
    trend: "stable",
    sparklineData: [0, 0, 0, 0, 0],
    lastAssessment: "2024-01-28"
  },
  {
    name: "Toileting",
    currentScore: 4,
    previousScore: 3,
    trend: "declining",
    sparklineData: [2, 3, 3, 4, 4],
    lastAssessment: "2024-01-28"
  },
  {
    name: "Transferring",
    currentScore: 2,
    previousScore: 2,
    trend: "stable",
    sparklineData: [2, 2, 1, 2, 2],
    lastAssessment: "2024-01-28"
  },
  {
    name: "Ambulation",
    currentScore: 3,
    previousScore: 2,
    trend: "declining",
    sparklineData: [1, 2, 2, 3, 3],
    lastAssessment: "2024-01-28"
  },
  {
    name: "Medication Mgmt",
    currentScore: 1,
    previousScore: 1,
    trend: "stable",
    sparklineData: [1, 1, 1, 1, 1],
    lastAssessment: "2024-01-28"
  }
];

const alerts = [
  {
    id: "ALR-001",
    severity: "High",
    title: "Toileting decline",
    reason: "2-pt drop in 7 days",
    createdAt: "2024-01-28",
    assignee: "Dr. Smith",
    status: "New"
  },
  {
    id: "ALR-002", 
    severity: "Medium",
    title: "Bathing no improvement",
    reason: "No improvement for 14 days",
    createdAt: "2024-01-26",
    assignee: "Nurse Johnson",
    status: "In Progress"
  }
];

const interventions = [
  {
    id: "INT-001",
    type: "OT Evaluation",
    assignee: "Dr. Wilson",
    createdAt: "2024-01-26",
    status: "Completed",
    outcome: "Recommended grab bars and shower chair"
  },
  {
    id: "INT-002",
    type: "Care Plan Update",
    assignee: "Dr. Smith", 
    createdAt: "2024-01-28",
    status: "In Progress",
    outcome: null
  }
];

import { AppLayout } from "@/components/AppLayout";

export default function EpisodeDetail() {
  const { id } = useParams();
  const [selectedADL, setSelectedADL] = useState(adlData[0]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score === 0) return "text-green-600";
    if (score <= 2) return "text-yellow-600";
    return "text-red-600";
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "High":
        return <Badge variant="destructive">{severity}</Badge>;
      case "Medium":
        return <Badge variant="secondary">{severity}</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <NavLink to="/episodes" className="hover:text-foreground">Episodes</NavLink>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{episodeData.id}</span>
          </div> */}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload OASIS
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Intervention
          </Button>
        </div>
      </div>

      {/* Patient Info Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h2 className="text-xl font-semibold">{episodeData.patient.name}</h2>
                <p className="text-sm text-muted-foreground">
                  DOB: {episodeData.patient.dob} • MRN: {episodeData.patient.mrn}
                </p>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Episode: </span>
                  <span className="font-medium">{episodeData.startDate} - {episodeData.endDate}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Day: </span>
                  <span className="font-medium">{episodeData.day}/30</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{episodeData.coordinator}</span>
                </div>
                <Badge>{episodeData.status}</Badge>
              </div>
            </div>
            <Progress value={(episodeData.day / 30) * 100} className="w-32" />
          </div>
        </CardContent>
      </Card>

      {/* ADL Trend Board */}
      <div>
        <h3 className="text-lg font-semibold mb-4">ADL Trend Board</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {adlData.map((adl) => (
            <Card
              key={adl.name}
              className={`cursor-pointer transition-colors ${
                selectedADL.name === adl.name ? "ring-2 ring-magenta-600" : ""
              }`}
              onClick={() => setSelectedADL(adl)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{adl.name}</h4>
                    {getTrendIcon(adl.trend)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={`text-2xl font-bold ${getScoreColor(adl.currentScore)}`}>
                      {adl.currentScore}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      /5
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last: {adl.lastAssessment}
                  </div>
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    View Timeline
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">ADL Timeline</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedADL.name} Timeline</span>
                <Badge variant="outline">Current Score: {selectedADL.currentScore}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Interactive line chart would go here
                <br />
                (0=independent → 5=total assist)
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <AlertTriangle className={`h-5 w-5 ${
                      alert.severity === "High" ? "text-red-600" : "text-yellow-600"
                    }`} />
                    <div>
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground">{alert.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {alert.createdAt} • Assigned to {alert.assignee}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getSeverityBadge(alert.severity)}
                    <Button size="sm" variant="outline">
                      Resolve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {alerts.length === 0 && (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">All clear</h3>
                  <p className="text-muted-foreground">We&apos;ll flag you if any ADL stalls or declines.</p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="interventions" className="space-y-4">
          {interventions.map((intervention) => (
            <Card key={intervention.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{intervention.type}</h4>
                    <p className="text-sm text-muted-foreground">
                      Assigned to {intervention.assignee} • {intervention.createdAt}
                    </p>
                    {intervention.outcome && (
                      <p className="text-sm text-green-600 mt-1">{intervention.outcome}</p>
                    )}
                  </div>
                  <Badge variant={intervention.status === "Completed" ? "default" : "secondary"}>
                    {intervention.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
    </AppLayout>
  );
}