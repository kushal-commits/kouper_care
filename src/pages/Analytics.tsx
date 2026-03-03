import { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  AlertTriangle,
  Download,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Mock data
const summaryStats = {
  improving: 65,
  stable: 28,
  declining: 7,
  highRisk: 12,
  medianTimeToIntervention: 2.3,
  missedAssessments: 3
};

const adlHeatmapData = [
  { adl: "Bathing", days: Array.from({length: 30}, (_, i) => Math.random() > 0.7 ? "improving" : Math.random() > 0.5 ? "stable" : "declining") },
  { adl: "Dressing (U)", days: Array.from({length: 30}, (_, i) => Math.random() > 0.6 ? "improving" : Math.random() > 0.4 ? "stable" : "declining") },
  { adl: "Dressing (L)", days: Array.from({length: 30}, (_, i) => Math.random() > 0.6 ? "improving" : Math.random() > 0.4 ? "stable" : "declining") },
  { adl: "Grooming", days: Array.from({length: 30}, (_, i) => Math.random() > 0.8 ? "improving" : Math.random() > 0.6 ? "stable" : "declining") },
  { adl: "Eating", days: Array.from({length: 30}, (_, i) => Math.random() > 0.9 ? "improving" : Math.random() > 0.7 ? "stable" : "declining") },
  { adl: "Toileting", days: Array.from({length: 30}, (_, i) => Math.random() > 0.5 ? "improving" : Math.random() > 0.3 ? "stable" : "declining") },
  { adl: "Transferring", days: Array.from({length: 30}, (_, i) => Math.random() > 0.7 ? "improving" : Math.random() > 0.5 ? "stable" : "declining") },
  { adl: "Ambulation", days: Array.from({length: 30}, (_, i) => Math.random() > 0.6 ? "improving" : Math.random() > 0.4 ? "stable" : "declining") },
  { adl: "Medication", days: Array.from({length: 30}, (_, i) => Math.random() > 0.8 ? "improving" : Math.random() > 0.6 ? "stable" : "declining") }
];

const coordinatorData = [
  { name: "Dr. Smith", workload: 23, slaCompliance: 87, avgResolutionTime: 1.8 },
  { name: "Dr. Wilson", workload: 19, slaCompliance: 92, avgResolutionTime: 1.4 },
  { name: "Dr. Johnson", workload: 15, slaCompliance: 89, avgResolutionTime: 2.1 },
  { name: "Nurse Martinez", workload: 12, slaCompliance: 94, avgResolutionTime: 1.2 }
];

import { AppLayout } from "@/components/AppLayout";

export default function Analytics() {
  const [diagnosisFilter, setDiagnosisFilter] = useState("All");
  const [ageBandFilter, setAgeBandFilter] = useState("All");
  const [facilityFilter, setFacilityFilter] = useState("All");
  const [coordinatorFilter, setCoordinatorFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("January 2024");

  const getCellColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "bg-green-200 text-green-800";
      case "stable":
        return "bg-yellow-100 text-yellow-800";
      case "declining":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-100";
    }
  };

  const getSLABadge = (compliance: number) => {
    if (compliance >= 90) return <Badge className="bg-green-100 text-green-800">{compliance}%</Badge>;
    if (compliance >= 80) return <Badge className="bg-yellow-100 text-yellow-800">{compliance}%</Badge>;
    return <Badge variant="destructive">{compliance}%</Badge>;
  };

  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Understand trends and performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Cohort Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select value={diagnosisFilter} onValueChange={setDiagnosisFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Diagnosis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Diagnoses</SelectItem>
                <SelectItem value="Cardiac">Cardiac</SelectItem>
                <SelectItem value="Orthopedic">Orthopedic</SelectItem>
                <SelectItem value="Stroke">Stroke</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ageBandFilter} onValueChange={setAgeBandFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Age Band" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Ages</SelectItem>
                <SelectItem value="65-74">65-74</SelectItem>
                <SelectItem value="75-84">75-84</SelectItem>
                <SelectItem value="85+">85+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={facilityFilter} onValueChange={setFacilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Facility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Facilities</SelectItem>
                <SelectItem value="Central">Central Hospital</SelectItem>
                <SelectItem value="North">North Clinic</SelectItem>
                <SelectItem value="South">South Center</SelectItem>
              </SelectContent>
            </Select>

            <Select value={coordinatorFilter} onValueChange={setCoordinatorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Coordinator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Coordinators</SelectItem>
                <SelectItem value="Dr. Smith">Dr. Smith</SelectItem>
                <SelectItem value="Dr. Wilson">Dr. Wilson</SelectItem>
                <SelectItem value="Dr. Johnson">Dr. Johnson</SelectItem>
              </SelectContent>
            </Select>

            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Episode Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="January 2024">January 2024</SelectItem>
                <SelectItem value="December 2023">December 2023</SelectItem>
                <SelectItem value="November 2023">November 2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Improving</p>
                <p className="text-2xl font-bold text-green-600">{summaryStats.improving}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stable</p>
                <p className="text-2xl font-bold text-yellow-600">{summaryStats.stable}%</p>
              </div>
              <div className="h-8 w-8 flex items-center justify-center">
                <div className="h-1 w-6 bg-yellow-600 rounded"></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Declining</p>
                <p className="text-2xl font-bold text-red-600">{summaryStats.declining}%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High-Risk Patients</p>
                <p className="text-2xl font-bold text-red-600">{summaryStats.highRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Active episodes</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Median Time to Intervention</p>
                <p className="text-2xl font-bold">{summaryStats.medianTimeToIntervention} days</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Average response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Missed Assessments</p>
                <p className="text-2xl font-bold text-yellow-600">{summaryStats.missedAssessments}</p>
              </div>
              <Users className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* ADL Outcome Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>ADL Outcome Heatmap</CardTitle>
          <p className="text-sm text-muted-foreground">
            Daily improvement vs decline distribution by ADL (last 30 days)
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {adlHeatmapData.map((row) => (
              <div key={row.adl} className="flex items-center space-x-2">
                <div className="w-24 text-sm font-medium">{row.adl}</div>
                <div className="flex space-x-1">
                  {row.days.map((trend, index) => (
                    <div
                      key={index}
                      className={`w-3 h-6 rounded-sm ${getCellColor(trend)}`}
                      title={`Day ${index + 1}: ${trend}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-4 mt-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
              <span>Improving</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-100 rounded-sm"></div>
              <span>Stable</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-200 rounded-sm"></div>
              <span>Declining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Lines Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Improvement Trends</CardTitle>
          <p className="text-sm text-muted-foreground">
            Per-ADL improvement rate and hospitalizations prevented over time
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Interactive trend line chart would go here
            <br />
            (Magenta line: improvement rate, Green line: hospitalizations prevented)
          </div>
        </CardContent>
      </Card>

      {/* Coordinator Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Coordinator Dashboard</CardTitle>
          <p className="text-sm text-muted-foreground">
            Workload distribution and SLA performance
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coordinatorData.map((coordinator) => (
              <div key={coordinator.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{coordinator.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {coordinator.workload} active alerts
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">SLA: </span>
                    {getSLABadge(coordinator.slaCompliance)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Resolution: </span>
                    <span className="font-medium">{coordinator.avgResolutionTime}d</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            SLA: % of alerts resolved within 48 hours
          </div>
        </CardContent>
      </Card>
    </div>
    </AppLayout>
  );
}