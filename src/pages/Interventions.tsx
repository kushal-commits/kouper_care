import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Calendar, User, Search, Activity, Target, CheckCircle } from "lucide-react";

// Mock interventions data
const mockInterventions = [
  {
    id: "INT-001",
    title: "Mobility Enhancement Program",
    patient: "Sarah Johnson",
    type: "mobility",
    status: "pending",
    priority: "high",
    assignee: "PT Johnson",
    scheduledDate: "2024-01-30",
    createdAt: "2024-01-26",
    description: "Implement walker training and fall prevention strategies"
  },
  {
    id: "INT-002", 
    title: "Wound Care Protocol Update",
    patient: "Michael Chen",
    type: "wound_care",
    status: "pending",
    priority: "medium",
    assignee: "Nurse Wilson",
    scheduledDate: "2024-01-29",
    createdAt: "2024-01-25",
    description: "Revise dressing change frequency and wound assessment"
  },
  {
    id: "INT-003",
    title: "Medication Reconciliation",
    patient: "Dorothy Williams", 
    type: "medication",
    status: "pending",
    priority: "high",
    assignee: "PharmD Davis",
    scheduledDate: "2024-01-28",
    createdAt: "2024-01-24",
    description: "Review current medications and adjust dosing"
  },
  {
    id: "INT-004",
    title: "Bathing Assistance Training",
    patient: "James Brown",
    type: "mobility",
    status: "completed",
    priority: "medium",
    assignee: "OT Martinez", 
    scheduledDate: "2024-01-26",
    completedDate: "2024-01-27",
    createdAt: "2024-01-23",
    description: "Train patient and caregiver on safe bathing techniques"
  },
  {
    id: "INT-005",
    title: "Nutrition Assessment",
    patient: "Robert Davis",
    type: "other",
    status: "in_progress",
    priority: "normal",
    assignee: "Dietitian Lee",
    scheduledDate: "2024-01-29",
    createdAt: "2024-01-22",
    description: "Comprehensive nutritional evaluation and meal planning"
  }
];

export default function Interventions() {
  const [searchParams] = useSearchParams();
  const [interventions, setInterventions] = useState(mockInterventions);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || "all");
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || "all");
  const [sortBy, setSortBy] = useState("scheduled_date");

  useEffect(() => {
    // Apply URL filters
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    if (status) setStatusFilter(status);
    if (type) setTypeFilter(type);
  }, [searchParams]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      mobility: 'bg-blue-100 text-blue-800 border-blue-200',
      wound_care: 'bg-red-100 text-red-800 border-red-200',
      medication: 'bg-green-100 text-green-800 border-green-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors] || colors.other}>
        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-red-500";
      case "medium": return "border-l-amber-500";
      case "normal": return "border-l-green-500";
      default: return "border-l-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "mobility":
        return <Activity className="h-5 w-5 text-blue-600" />;
      case "wound_care":
        return <Target className="h-5 w-5 text-red-600" />;
      case "medication":
        return <Clock className="h-5 w-5 text-green-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const filteredInterventions = interventions.filter(intervention => {
    if (searchTerm && !intervention.patient.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !intervention.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (statusFilter !== "all" && intervention.status !== statusFilter) return false;
    if (typeFilter !== "all" && intervention.type !== typeFilter) return false;
    return true;
  });

  const sortedInterventions = [...filteredInterventions].sort((a, b) => {
    switch (sortBy) {
      case "scheduled_date":
        return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      case "priority":
        const priorityOrder = { high: 3, medium: 2, normal: 1 };
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      case "patient":
        return a.patient.localeCompare(b.patient);
      case "type":
        return a.type.localeCompare(b.type);
      default:
        return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    }
  });

  const handleCompleteIntervention = (interventionId: string) => {
    setInterventions(prev => prev.map(intervention => 
      intervention.id === interventionId 
        ? { ...intervention, status: "completed", completedDate: new Date().toISOString().split('T')[0] }
        : intervention
    ));
  };

  const getTypeStats = () => {
    const pending = interventions.filter(i => i.status === 'pending');
    return {
      mobility: pending.filter(i => i.type === 'mobility').length,
      wound_care: pending.filter(i => i.type === 'wound_care').length, 
      medication: pending.filter(i => i.type === 'medication').length,
      other: pending.filter(i => i.type === 'other').length,
    };
  };

  const typeStats = getTypeStats();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Interventions</h1>
          <p className="text-muted-foreground">
            {statusFilter === 'pending' ? 
              `Pending interventions - Mobility: ${typeStats.mobility}, Wound Care: ${typeStats.wound_care}, Medication: ${typeStats.medication}` : 
              'Patient intervention tracking and management'
            }
          </p>
        </div>
        <Button>Add Intervention</Button>
      </div>

      {/* Type breakdown chips */}
      {statusFilter === 'pending' && (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={typeFilter === 'mobility' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter(typeFilter === 'mobility' ? 'all' : 'mobility')}
            className="flex items-center gap-1"
          >
            <Activity className="h-4 w-4" />
            Mobility ({typeStats.mobility})
          </Button>
          <Button
            variant={typeFilter === 'wound_care' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTypeFilter(typeFilter === 'wound_care' ? 'all' : 'wound_care')}
            className="flex items-center gap-1"
          >
            <Target className="h-4 w-4" />
            Wound Care ({typeStats.wound_care})
          </Button>
          <Button
            variant={typeFilter === 'medication' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter(typeFilter === 'medication' ? 'all' : 'medication')}
            className="flex items-center gap-1"
          >
            <Clock className="h-4 w-4" />
            Medication ({typeStats.medication})
          </Button>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search interventions or patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="mobility">Mobility</SelectItem>
                <SelectItem value="wound_care">Wound Care</SelectItem>
                <SelectItem value="medication">Medication</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled_date">Scheduled Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="patient">Patient Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Interventions List */}
      <div className="space-y-4">
        {sortedInterventions.map((intervention) => (
          <Card key={intervention.id} className={`hover:shadow-elevated transition-all duration-300 border-l-4 ${getPriorityColor(intervention.priority)}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {getTypeIcon(intervention.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-foreground truncate">{intervention.title}</h3>
                      {getStatusBadge(intervention.status)}
                      {getTypeBadge(intervention.type)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{intervention.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {intervention.patient}
                      </span>
                      <span>Assigned to: {intervention.assignee}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Scheduled: {new Date(intervention.scheduledDate).toLocaleDateString()}
                      </span>
                    </div>
                    {intervention.completedDate && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Completed on {new Date(intervention.completedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {intervention.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleCompleteIntervention(intervention.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {sortedInterventions.length === 0 && (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium">No interventions found</h3>
                <p className="text-muted-foreground">
                  {statusFilter === 'all' ? 
                    'No interventions match your current search criteria.' :
                    `No ${statusFilter.replace('_', ' ')} interventions found.`
                  }
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}