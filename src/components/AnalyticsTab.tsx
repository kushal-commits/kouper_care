import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Calendar,
  Filter
} from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Mock data
const kpiData = {
  activePatients: { value: 247, change: "+12%", changeType: "positive" as const },
  interventionsFlagged: { value: 89, change: "+8%", changeType: "positive" as const },
  interventionsCompleted: { value: 76, change: "+15%", changeType: "positive" as const },
  readmissionTrends: { value: "14%", change: "-0.8%", changeType: "positive" as const },
  adlImprovement: { value: "68%", change: "+5%", changeType: "positive" as const }
};

// Brand colors from the design system
const brandColors = {
  magenta200: '#f3e8ff', // magenta-200
  magenta300: '#e9d5ff', // magenta-300  
  magenta400: '#d946ef', // magenta-400
  green200: '#bbf7d0', // green-200
  green300: '#86efac', // green-300
  green400: '#4ade80', // green-400
  viridian200: '#a5b4fc', // viridian-200 (blue-ish)
  viridian300: '#818cf8', // viridian-300
  viridian400: '#0891b2', // viridian-400
};

const trendData = [
  { month: 'Jan', flagged: 65, completed: 58 },
  { month: 'Feb', flagged: 72, completed: 64 },
  { month: 'Mar', flagged: 78, completed: 69 },
  { month: 'Apr', flagged: 85, completed: 74 },
  { month: 'May', flagged: 89, completed: 76 }
];

const readmissionData = [
  { month: 'Jan', rate: 15.1 },
  { month: 'Feb', rate: 14.8 },
  { month: 'Mar', rate: 14.5 },
  { month: 'Apr', rate: 14.2 },
  { month: 'May', rate: 14.0 }
];

const improvementData = [
  { phase: 'Baseline', bathing: 45, ambulation: 52, eating: 78 },
  { phase: 'Mid-Episode', bathing: 58, ambulation: 64, eating: 82 },
  { phase: 'Discharge', bathing: 72, ambulation: 76, eating: 88 }
];

const leaderboardData = [
  { name: "Dr. Sarah Wilson", interventions: 24, completion: 96 },
  { name: "Dr. Michael Chen", interventions: 22, completion: 91 },
  { name: "Dr. Jennifer Park", interventions: 19, completion: 89 },
  { name: "Dr. Robert Davis", interventions: 18, completion: 94 },
  { name: "Dr. Lisa Johnson", interventions: 16, completion: 87 }
];

const adlBreakdown = [
  { name: 'Bathing', value: 28, color: brandColors.magenta200 },
  { name: 'Toileting', value: 22, color: brandColors.magenta300 },
  { name: 'Transferring', value: 18, color: brandColors.green200 },
  { name: 'Ambulation', value: 15, color: brandColors.viridian200 },
  { name: 'Eating', value: 6, color: brandColors.green300 }
];

export function AnalyticsTab() {
  const [dateRange, setDateRange] = useState("30d");
  const [team, setTeam] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [adlType, setAdlType] = useState("all");

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filters</span>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Custom Range
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Team/Assignee</label>
              <Select value={team} onValueChange={setTeam}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="orthopedic">Orthopedic</SelectItem>
                  <SelectItem value="neurologic">Neurologic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Severity</label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">ADL Type</label>
              <Select value={adlType} onValueChange={setAdlType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ADL Types</SelectItem>
                  <SelectItem value="bathing">Bathing</SelectItem>
                  <SelectItem value="toileting">Toileting</SelectItem>
                  <SelectItem value="transferring">Transferring</SelectItem>
                  <SelectItem value="ambulation">Ambulation</SelectItem>
                  <SelectItem value="eating">Eating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard
          title="Active Episodes"
          value={kpiData.activePatients.value.toString()}
          change={kpiData.activePatients.change}
          changeType={kpiData.activePatients.changeType}
          icon={Users}
          description="Patients handled"
        />
        
        <MetricCard
          title="Interventions Flagged"
          value={kpiData.interventionsFlagged.value.toString()}
          change={kpiData.interventionsFlagged.change}
          changeType={kpiData.interventionsFlagged.changeType}
          icon={AlertTriangle}
          description="Alerts generated"
        />
        
        <MetricCard
          title="Interventions Completed"
          value={kpiData.interventionsCompleted.value.toString()}
          change={kpiData.interventionsCompleted.change}
          changeType={kpiData.interventionsCompleted.changeType}
          icon={CheckCircle}
          description="Successfully resolved"
        />
        
        <MetricCard
          title="Readmission Rate"
          value={kpiData.readmissionTrends.value}
          change={kpiData.readmissionTrends.change}
          changeType={kpiData.readmissionTrends.changeType}
          icon={TrendingDown}
          description="Per 1,000 patients"
        />
        
        <MetricCard
          title="ADL Improvement"
          value={kpiData.adlImprovement.value}
          change={kpiData.adlImprovement.change}
          changeType={kpiData.adlImprovement.changeType}
          icon={TrendingUp}
          description="vs. baseline OASIS"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interventions Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Interventions: Flagged vs Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="flagged" 
                  stroke={brandColors.magenta300} 
                  strokeWidth={2}
                  name="Flagged"
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke={brandColors.green300} 
                  strokeWidth={2}
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Readmission Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Readmission Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={readmissionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Rate']} />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke={brandColors.magenta400} 
                  strokeWidth={3}
                  dot={{ fill: brandColors.magenta400, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ADL Improvement */}
        <Card>
          <CardHeader>
            <CardTitle>ADL Improvement: Baseline → Discharge</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={improvementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="phase" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="bathing" fill={brandColors.viridian200} name="Bathing" />
                <Bar dataKey="ambulation" fill={brandColors.green200} name="Ambulation" />
                <Bar dataKey="eating" fill={brandColors.magenta200} name="Eating" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ADL Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Interventions by ADL Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={adlBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {adlBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Coordinator Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboardData.map((coordinator, index) => (
              <div key={coordinator.name} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center bg-viridian-200 text-viridian-700 border-viridian-300">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{coordinator.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {coordinator.interventions} interventions handled
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">{coordinator.completion}%</p>
                  <p className="text-sm text-muted-foreground">completion rate</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}