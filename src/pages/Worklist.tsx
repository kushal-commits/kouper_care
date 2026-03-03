import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  Clock, 
  FileText, 
  Activity, 
  TrendingUp, 
  Users, 
  Search, 
  Filter, 
  User, 
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  X,
  Check,
  XCircle,
  Plus
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Mock alerts data
const alerts = [
  {
    id: "ALR-001",
    severity: "High",
    type: "Decline",
    title: "Toileting decline",
    reason: "2-pt drop in 7 days",
    patient: "Sarah Johnson",
    episode: "EPI-8842",
    episodeDay: 14,
    age: 3,
    assignee: "Dr. Smith",
    updatedAt: "2024-01-28",
    status: "New",
    adl: "Toileting",
    keywords: ["toileting", "mobility"],
    resolution: null,
    assignmentStatus: "Assigned",
    dueDate: "2024-02-12"
  },
  {
    id: "ALR-002",
    severity: "Medium", 
    type: "No-improvement",
    title: "Bathing no improvement",
    reason: "No improvement for 14 days",
    patient: "Sarah Johnson",
    episode: "EPI-8842",
    episodeDay: 14,
    age: 2,
    assignee: "Nurse Johnson",
    updatedAt: "2024-01-26",
    status: "Assigned",
    adl: "Bathing",
    keywords: ["bathing", "hygiene"],
    resolution: null,
    assignmentStatus: "In Progress",
    dueDate: "2024-02-10"
  },
  {
    id: "ALR-003",
    severity: "High",
    type: "Compounding",
    title: "Multiple ADL decline", 
    reason: "Decline in 3 ADLs within 14 days",
    patient: "Michael Chen",
    episode: "EPI-8843",
    episodeDay: 19,
    age: 1,
    assignee: null,
    updatedAt: "2024-01-29",
    status: "New",
    adl: "Multiple",
    keywords: ["mobility", "bathing", "eating"],
    resolution: null,
    assignmentStatus: null,
    dueDate: null
  },
  {
    id: "ALR-004",
    severity: "Medium",
    type: "Decline",
    title: "Mobility decline",
    reason: "1-pt drop in mobility over 5 days",
    patient: "Emma Davis",
    episode: "EPI-8844",
    episodeDay: 21,
    age: 5,
    assignee: "Dr. Wilson",
    updatedAt: "2024-01-25",
    status: "Resolved",
    adl: "Mobility",
    keywords: ["mobility", "transfer"],
    resolution: {
      type: "complete",
      user: "Dr. Wilson",
      timestamp: "2024-01-29 10:30 AM",
      comment: null
    },
    assignmentStatus: "Completed",
    dueDate: "2024-01-30"
  },
  {
    id: "ALR-005",
    severity: "Low",
    type: "No-improvement",
    title: "Eating assistance plateau",
    reason: "No improvement in eating for 10 days",
    patient: "Robert Kim",
    episode: "EPI-8845",
    episodeDay: 12,
    age: 4,
    assignee: "Nurse Johnson",
    updatedAt: "2024-01-27",
    status: "Resolved",
    adl: "Eating",
    keywords: ["eating", "nutrition"],
    resolution: {
      type: "decline",
      user: "Nurse Johnson", 
      timestamp: "2024-01-28 2:15 PM",
      comment: "Patient family requested to delay intervention until next week"
    },
    assignmentStatus: "Completed",
    dueDate: "2024-02-05"
  }
];

// Mock nurses data
const nurses = [
  { id: "nurse-1", name: "Dr. Wilson", title: "Registered Nurse", specialty: "General Care" },
  { id: "nurse-2", name: "Nurse Johnson", title: "Registered Nurse", specialty: "Wound Care" },
  { id: "nurse-3", name: "Dr. Smith", title: "Clinical Coordinator", specialty: "ADL Assessment" },
  { id: "nurse-4", name: "Nurse Davis", title: "Licensed Practical Nurse", specialty: "Medication Management" },
  { id: "nurse-5", name: "Dr. Brown", title: "Registered Nurse", specialty: "Physical Therapy" }
];

// Mock task data with alert context
const mockTasks = [
  {
    id: "TSK-001",
    title: "OT Evaluation for Toileting",
    patient: "Sarah Johnson",
    episodeDay: 14,
    alertId: "ALR-001",
    type: "assessment",
    status: "overdue",
    priority: "high",
    dueDate: "2024-01-25",
    assignee: "Dr. Smith",
    overdueDays: 3,
    adl: "Toileting"
  },
  {
    id: "TSK-002", 
    title: "Care Plan Update - Bathing ADL",
    patient: "Michael Chen",
    episodeDay: 7,
    alertId: "ALR-002",
    type: "documentation",
    status: "overdue", 
    priority: "medium",
    dueDate: "2024-01-26",
    assignee: "Nurse Johnson",
    overdueDays: 2,
    adl: "Bathing"
  },
  {
    id: "TSK-003",
    title: "Medication Review",
    patient: "Dorothy Williams",
    episodeDay: 21,
    alertId: null,
    type: "medication",
    status: "pending",
    priority: "high",
    dueDate: "2024-01-30",
    assignee: "Dr. Wilson",
    adl: null
  },
  {
    id: "TSK-004",
    title: "PT Assessment",
    patient: "James Brown",
    episodeDay: 3,
    alertId: null,
    type: "assessment", 
    status: "done",
    priority: "medium",
    dueDate: "2024-01-27",
    assignee: "PT Johnson",
    completedDate: "2024-01-27",
    adl: null
  }
];

const tasks = [
  {
    id: "TSK-001",
    title: "OT Evaluation for Toileting",
    patient: "Sarah Johnson",
    adl: "Toileting",
    dueDate: "2024-01-30",
    owner: "Dr. Smith",
    status: "New",
    alertId: "ALR-001"
  },
  {
    id: "TSK-002",
    title: "Care Plan Update",
    patient: "Sarah Johnson", 
    adl: "Bathing",
    dueDate: "2024-01-29",
    owner: "Nurse Johnson",
    status: "In Progress",
    alertId: "ALR-002"
  },
  {
    id: "TSK-003",
    title: "Comprehensive Assessment",
    patient: "Michael Chen",
    adl: "Multiple", 
    dueDate: "2024-01-28",
    owner: null,
    status: "Overdue",
    alertId: "ALR-003"
  }
];

export default function Worklist() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch real alerts from database
  const { data: realAlerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['worklist-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          id,
          severity,
          alert_type,
          title,
          message,
          patient_id,
          created_at,
          is_acknowledged,
          patients (
            first_name,
            last_name
          )
        `)
        .eq('is_acknowledged', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(alert => ({
        id: alert.id,
        severity: alert.severity === 'critical' ? 'High' : 
                  alert.severity === 'warning' ? 'Medium' : 'Low',
        type: alert.alert_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        title: alert.title,
        reason: alert.message,
        patient: `${alert.patients?.first_name} ${alert.patients?.last_name}`,
        episode: `EPI-${alert.id.slice(0, 4)}`,
        episodeDay: Math.floor(Math.random() * 30) + 1,
        age: Math.floor((Date.now() - new Date(alert.created_at).getTime()) / (1000 * 60 * 60 * 24)) || 0,
        assignee: Math.random() > 0.5 ? ["Dr. Smith", "Nurse Johnson", "Dr. Wilson"][Math.floor(Math.random() * 3)] : null,
        updatedAt: new Date(alert.created_at).toISOString().split('T')[0],
        status: alert.is_acknowledged ? "Resolved" : "New",
        adl: alert.alert_type.includes('adl') ? "Multiple" : "General",
        keywords: [alert.alert_type.replace('_', '-')],
        resolution: null,
        assignmentStatus: Math.random() > 0.7 ? "Assigned" : null,
        dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
    },
  });

  // Use real alerts instead of mock data
  const alerts = realAlerts;

  // Handle tab parameter from URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'alerts', 'tasks', 'notes', 'interventions'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [selectedAlert, setSelectedAlert] = useState<typeof alerts[0] | null>(null);
  const [expandedPatients, setExpandedPatients] = useState<Set<string>>(new Set());
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [alertToAssign, setAlertToAssign] = useState<typeof alerts[0] | null>(null);
  
  // Task management state
  const [worklistTasks, setWorklistTasks] = useState(mockTasks);
  const [taskSearchTerm, setTaskSearchTerm] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("all");
  const [taskSortBy, setTaskSortBy] = useState("due_date");

  // Helper functions
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "New":
        return <Badge variant="destructive">{status}</Badge>;
      case "Assigned":
        return <Badge variant="secondary">{status}</Badge>;
      case "Overdue":
        return <Badge variant="destructive">{status}</Badge>;
      case "Resolved":
        return <Badge variant="outline">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "border-l-blue-500";
      case "In Progress":
        return "border-l-yellow-500";
      case "Completed":
        return "border-l-green-500";
      case "Overdue":
        return "border-l-red-500";
      default:
        return "border-l-gray-300";
    }
  };

  const getAssignmentStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    switch (status) {
      case "Assigned":
        return <Badge variant="secondary" className="text-xs">Assigned</Badge>;
      case "In Progress":
        return <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">In Progress</Badge>;
      case "Completed":
        return <Badge variant="outline" className="text-xs border-green-500 text-green-600">Completed</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const handleAssignAlert = (alertId: string, patientName?: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      setAlertToAssign(alert);
      setAssignmentModalOpen(true);
    }
  };

  const handleSaveAssignment = (nurseName: string) => {
    if (alertToAssign) {
      toast({
        title: "Alert assigned",
        description: `Alert has been assigned to ${nurseName}`,
      });
      
      // Update the alert in the alerts array (in a real app, this would be an API call)
      const alertIndex = alerts.findIndex(a => a.id === alertToAssign.id);
      if (alertIndex !== -1) {
        alerts[alertIndex].assignee = nurseName;
        alerts[alertIndex].assignmentStatus = "Assigned";
        alerts[alertIndex].dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }
      
      setAssignmentModalOpen(false);
      setAlertToAssign(null);
    }
  };

  const handleResolveAlert = (alertId: string, resolutionType: 'complete' | 'decline', comment?: string) => {
    const resolutionText = resolutionType === 'complete' ? 'Intervention complete' : 'Decline intervention at this time';
    
    toast({
      title: "Alert resolved",
      description: `Alert marked as: ${resolutionText}`,
    });
  };

  // Task helper functions
  const getTaskStatusBadge = (status: string, overdueDays?: number) => {
    switch (status) {
      case "overdue":
        return <Badge variant="destructive">Overdue ({overdueDays}d)</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "done":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTaskPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleCompleteTask = (taskId: string) => {
    setWorklistTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: "done" as const, completedDate: new Date().toISOString().split('T')[0], overdueDays: undefined }
        : task
    ));
  };

  // Task filtering and sorting
  const filteredTasks = worklistTasks.filter(task => {
    if (taskSearchTerm && !task.patient.toLowerCase().includes(taskSearchTerm.toLowerCase()) && 
        !task.title.toLowerCase().includes(taskSearchTerm.toLowerCase())) return false;
    if (taskStatusFilter !== "all" && task.status !== taskStatusFilter) return false;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (taskSortBy) {
      case "due_date_asc":
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      case "patient":
        return a.patient.localeCompare(b.patient);
      default:
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
  });

  const completedTasks = worklistTasks.filter(task => task.status === "done").length;
  const totalTasks = worklistTasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const togglePatient = (patientName: string) => {
    const newExpanded = new Set(expandedPatients);
    if (newExpanded.has(patientName)) {
      newExpanded.delete(patientName);
    } else {
      newExpanded.add(patientName);
    }
    setExpandedPatients(newExpanded);
  };

  // Filter logic
  const filteredAlerts = alerts.filter(alert => {
    if (searchTerm && !alert.patient.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (severityFilter !== "All" && alert.severity !== severityFilter) return false;
    if (typeFilter !== "All" && alert.type !== typeFilter) return false;
    if (statusFilter !== "All" && alert.status !== statusFilter) return false;
    if (assigneeFilter !== "All" && alert.assignee !== assigneeFilter) return false;
    return true;
  });

  const activeAlerts = alerts.filter(alert => alert.status !== "Resolved");
  const resolvedAlerts = alerts.filter(alert => alert.status === "Resolved");

  const tasksByStatus = {
    "New": tasks.filter(t => t.status === "New"),
    "In Progress": tasks.filter(t => t.status === "In Progress"),
    "Completed": tasks.filter(t => t.status === "Completed"),
    "Overdue": tasks.filter(t => t.status === "Overdue")
  };

  // Mock summary data - updated to reflect real alert count
  const summaryStats = {
    alerts: { total: alerts.length, critical: alerts.filter(a => a.severity === "High").length, high: alerts.filter(a => a.severity === "High").length, medium: alerts.filter(a => a.severity === "Medium").length },
    tasks: { overdue: tasks.filter(t => t.status === "Overdue").length, pending: tasks.filter(t => t.status === "New").length, completed: tasks.filter(t => t.status === "Completed").length },
    notes: { awaiting: 6, in_review: 3, reviewed: 18 },
    interventions: { pending: 11, in_progress: 4, completed: 15 }
  };

  const quickActions = [
    {
      title: "Critical Alerts",
      count: summaryStats.alerts.critical,
      description: "Require immediate attention",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50 border-red-200",
      action: () => navigate("/alerts?severity=critical&range=last_24h")
    },
    {
      title: "Overdue Tasks",
      count: summaryStats.tasks.overdue,
      description: "Past due date",
      icon: Clock,
      color: "text-amber-600", 
      bgColor: "bg-amber-50 border-amber-200",
      action: () => navigate("/tasks?status=overdue&sort=due_date_asc")
    },
    {
      title: "Notes Awaiting Review",
      count: summaryStats.notes.awaiting,
      description: "Need clinical approval",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-200",
      action: () => navigate("/notes?status=awaiting_review")
    },
    {
      title: "Pending Interventions",
      count: summaryStats.interventions.pending,
      description: "Scheduled interventions",
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50 border-purple-200",
      action: () => navigate("/interventions?status=pending")
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "alert",
      title: "New critical alert created",
      patient: "Sarah Johnson",
      time: "2 minutes ago",
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      id: 2,
      type: "task", 
      title: "Task completed",
      patient: "Michael Chen",
      time: "15 minutes ago",
      icon: Clock,
      color: "text-green-600"
    },
    {
      id: 3,
      type: "note",
      title: "Care note submitted for review",
      patient: "Dorothy Williams",
      time: "1 hour ago",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      id: 4,
      type: "intervention",
      title: "Intervention scheduled",
      patient: "James Brown",
      time: "2 hours ago", 
      icon: Activity,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Alerts & Tasks</h1>
          <p className="text-muted-foreground">Care coordination worklist - alerts, tasks, notes, and interventions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts 
            <Badge variant="destructive" className="ml-2 text-xs">
              {summaryStats.alerts.total}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks
            <Badge variant="secondary" className="ml-2 text-xs">
              {summaryStats.tasks.overdue + summaryStats.tasks.pending}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="notes">
            Notes
            <Badge variant="secondary" className="ml-2 text-xs">
              {summaryStats.notes.awaiting + summaryStats.notes.in_review}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="interventions">
            Interventions
            <Badge variant="secondary" className="ml-2 text-xs">
              {summaryStats.interventions.pending + summaryStats.interventions.in_progress}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer hover:shadow-elevated transition-all duration-300 border-2 ${action.bgColor}`}
                onClick={action.action}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                    <div className="text-2xl font-bold text-foreground">{action.count}</div>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>


          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <activity.icon className={`h-4 w-4 ${activity.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">Patient: {activity.patient}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {alertsLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Loading alerts...</div>
            </div>
          ) : (
            <div className={`${selectedAlert ? 'mr-96' : ''}`}>
              {/* Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search patient..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Severity</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Types</SelectItem>
                      <SelectItem value="Decline">Decline</SelectItem>
                      <SelectItem value="No-improvement">No-improvement</SelectItem>
                      <SelectItem value="Missing assessment">Missing assessment</SelectItem>
                      <SelectItem value="Compounding">Compounding</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Assigned">Assigned</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Assignees</SelectItem>
                      <SelectItem value="Dr. Smith">Dr. Smith</SelectItem>
                      <SelectItem value="Nurse Johnson">Nurse Johnson</SelectItem>
                      <SelectItem value="Dr. Wilson">Dr. Wilson</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Date range</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alert Tabs */}
            <Tabs defaultValue="active" className="space-y-4">
              <TabsList>
                <TabsTrigger value="active">Active Alerts ({activeAlerts.length})</TabsTrigger>
                <TabsTrigger value="resolved">Resolved ({resolvedAlerts.length})</TabsTrigger>
                <TabsTrigger value="alert-tasks">Alert Tasks ({tasks.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {(() => {
                  // Group alerts by patient
                  const alertsByPatient = activeAlerts.reduce((acc, alert) => {
                    if (!acc[alert.patient]) {
                      acc[alert.patient] = [];
                    }
                    acc[alert.patient].push(alert);
                    return acc;
                  }, {} as Record<string, typeof activeAlerts>);

                  // Sort alerts within each patient group by severity and date
                  Object.keys(alertsByPatient).forEach(patient => {
                    alertsByPatient[patient].sort((a, b) => {
                      const severityOrder = { High: 3, Medium: 2, Low: 1 };
                      const severityDiff = (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
                                          (severityOrder[a.severity as keyof typeof severityOrder] || 0);
                      if (severityDiff !== 0) return severityDiff;
                      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                    });
                  });

                  return Object.entries(alertsByPatient).map(([patientName, patientAlerts]) => {
                    const isExpanded = expandedPatients.has(patientName);
                    const criticalCount = patientAlerts.filter(a => a.severity === 'High').length;
                    const mediumCount = patientAlerts.filter(a => a.severity === 'Medium').length;
                    const lowCount = patientAlerts.filter(a => a.severity === 'Low').length;

                    return (
                      <Card key={patientName} className="w-full">
                        <CardContent className="p-0">
                          {/* Patient Header */}
                          <div 
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => togglePatient(patientName)}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                                <h3 className="font-semibold text-lg">{patientName}</h3>
                              </div>
                              <div className="flex items-center space-x-2">
                                {criticalCount > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {criticalCount} High
                                  </Badge>
                                )}
                                {mediumCount > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {mediumCount} Medium
                                  </Badge>
                                )}
                                {lowCount > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {lowCount} Low
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">
                                {patientAlerts.length} alert{patientAlerts.length !== 1 ? 's' : ''}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const patientSlug = patientName.toLowerCase().replace(/\s+/g, '-');
                                  navigate(`/patients/${patientSlug}`);
                                }}
                              >
                                View Patient
                              </Button>
                            </div>
                          </div>

                          {/* Expanded Patient Alerts */}
                          {isExpanded && (
                            <div className="border-t space-y-3 p-4">
                              {patientAlerts.map((alert) => (
                                <Card
                                  key={alert.id}
                                  className={`cursor-pointer transition-colors hover:bg-muted/30 ${
                                    selectedAlert?.id === alert.id ? 'ring-2 ring-primary' : ''
                                  }`}
                                  onClick={() => setSelectedAlert(alert)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <AlertTriangle className={`h-4 w-4 ${
                                          alert.severity === "High" ? "text-red-600" : 
                                          alert.severity === "Medium" ? "text-yellow-600" : "text-blue-600"
                                        }`} />
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            {getSeverityBadge(alert.severity)}
                                            <h4 className="font-medium text-sm">{alert.title}</h4>
                                          </div>
                                          <p className="text-xs text-muted-foreground mb-2">{alert.reason}</p>
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs text-muted-foreground">Triggered by:</span>
                                            <div className="flex gap-1">
                                              {alert.keywords.map((keyword) => (
                                                <Badge key={keyword} variant="outline" className="text-xs px-1 py-0">
                                                  {keyword}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span>Episode Day {alert.episodeDay}</span>
                                            <span>Alert Age: {alert.age}d</span>
                                            <span>Updated {alert.updatedAt}</span>
                                          </div>
                                          {alert.assignee && alert.dueDate && (
                                            <div className="flex items-center gap-2 mt-2">
                                              <span className="text-xs text-muted-foreground">
                                                Assigned to {alert.assignee} — Due {new Date(alert.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                              </span>
                                              {getAssignmentStatusBadge(alert.assignmentStatus)}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {getStatusBadge(alert.status)}
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAssignAlert(alert.id);
                                          }}
                                        >
                                          {alert.assignee ? "Reassign" : "Assign"}
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  });
                })()}
              </TabsContent>

              <TabsContent value="resolved" className="space-y-4">
                {resolvedAlerts.map((alert) => (
                  <Card key={alert.id} className="opacity-75">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getSeverityBadge(alert.severity)}
                              <h3 className="font-medium">{alert.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{alert.reason}</p>
                            {alert.resolution && (
                              <div className="flex items-center gap-2 mb-2 p-2 bg-muted/50 rounded">
                                {alert.resolution.type === 'complete' ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-orange-600" />
                                )}
                                <div className="flex-1">
                                  <p className="text-xs font-medium">
                                    {alert.resolution.type === 'complete' ? '✅ Intervention complete' : '🚫 Decline intervention at this time'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {alert.resolution.user} • {alert.resolution.timestamp}
                                  </p>
                                  {alert.resolution.comment && (
                                    <p className="text-xs text-muted-foreground italic mt-1">{alert.resolution.comment}</p>
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{alert.patient}</span>
                              <span>Episode Day {alert.episodeDay}</span>
                              <span>Resolved {alert.updatedAt}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(alert.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="alert-tasks" className="space-y-4">
                {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
                  <div key={status}>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      {status} ({statusTasks.length})
                    </h3>
                    <div className="space-y-2">
                      {statusTasks.map((task) => (
                        <Card key={task.id} className={`border-l-4 ${getTaskStatusColor(task.status)}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-sm">{task.title}</h4>
                                <p className="text-xs text-muted-foreground">{task.patient}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-muted-foreground">Due: {task.dueDate}</span>
                                  {task.owner && <span className="text-xs text-muted-foreground">• {task.owner}</span>}
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {task.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Alert Detail Panel */}
      {selectedAlert && (
        <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Alert Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAlert(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {getSeverityBadge(selectedAlert.severity)}
                      {getStatusBadge(selectedAlert.status)}
                    </div>
                    <h3 className="font-medium text-lg">{selectedAlert.title}</h3>
                    <p className="text-muted-foreground">{selectedAlert.reason}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Patient:</span>
                      <span className="font-medium">{selectedAlert.patient}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Episode:</span>
                      <span>{selectedAlert.episode}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Episode Day:</span>
                      <span>{selectedAlert.episodeDay}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Alert Age:</span>
                      <span>{selectedAlert.age} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ADL Area:</span>
                      <span>{selectedAlert.adl}</span>
                    </div>
                  </div>

                  {selectedAlert.assignee && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Assignment</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Assignee:</span>
                        <span>{selectedAlert.assignee}</span>
                      </div>
                      {selectedAlert.dueDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Due Date:</span>
                          <span>{new Date(selectedAlert.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-medium">Actions</h4>
                    <div className="space-y-2">
                      {!selectedAlert.assignee ? (
                        <Button
                          className="w-full"
                          onClick={() => handleAssignAlert(selectedAlert.id)}
                        >
                          Assign Alert
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleAssignAlert(selectedAlert.id)}
                        >
                          Reassign Alert
                        </Button>
                      )}
                      
                      {selectedAlert.status !== "Resolved" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full">
                              Resolve Alert
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleResolveAlert(selectedAlert.id, 'complete')}>
                              Mark as Complete
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResolveAlert(selectedAlert.id, 'decline')}>
                              Decline Intervention
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks">
          <div className="space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Overall Progress</h3>
                      <p className="text-sm text-muted-foreground">
                        {completedTasks} of {totalTasks} tasks completed
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{completionPercentage}%</div>
                      <div className="text-xs text-muted-foreground">Complete</div>
                    </div>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>{worklistTasks.filter(t => t.status === "overdue").length} Overdue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span>{worklistTasks.filter(t => t.status === "pending").length} Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>{completedTasks} Completed</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks or patients..."
                      value={taskSearchTerm}
                      onChange={(e) => setTaskSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="done">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={taskSortBy} onValueChange={setTaskSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="due_date_asc">Due Date</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="patient">Patient Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Task List */}
            <div className="space-y-4">
              {sortedTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-elevated transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {getTaskPriorityIcon(task.priority)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground truncate">{task.title}</h3>
                            {getTaskStatusBadge(task.status, task.overdueDays)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {task.patient}
                            </span>
                            {task.episodeDay && (
                              <span>Episode Day {task.episodeDay}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            <span>Assigned to: {task.assignee}</span>
                          </div>
                          {task.adl && (
                            <div className="text-xs text-muted-foreground mb-1">
                              Related to: {task.adl} ADL
                            </div>
                          )}
                          {task.alertId && (
                            <div className="text-xs text-blue-600 mb-1">
                              Generated from Alert {task.alertId}
                            </div>
                          )}
                          {task.completedDate && (
                            <p className="text-xs text-green-600">
                              ✓ Completed on {new Date(task.completedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.status !== "done" && (
                          <Button
                            size="sm"
                            onClick={() => handleCompleteTask(task.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Complete
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

              {sortedTasks.length === 0 && (
                <Card className="p-12 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">No tasks found</h3>
                      <p className="text-muted-foreground">
                        {taskStatusFilter === 'all' ? 
                          'No tasks match your current search criteria.' :
                          `No ${taskStatusFilter} tasks found.`
                        }
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Care Manager Notes</h2>
                <p className="text-muted-foreground">
                  Clinical notes and documentation awaiting review
                </p>
              </div>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search notes or patients..."
                      className="pl-10"
                    />
                  </div>
                  
                  <Select defaultValue="awaiting_review">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="awaiting_review">Awaiting Review</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Discipline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Disciplines</SelectItem>
                      <SelectItem value="case_management">Case Management</SelectItem>
                      <SelectItem value="nursing">Nursing</SelectItem>
                      <SelectItem value="physical_therapy">Physical Therapy</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="social_work">Social Work</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select defaultValue="wait_time_desc">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wait_time_desc">Wait Time</SelectItem>
                      <SelectItem value="created_date">Created Date</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="patient">Patient Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notes List */}
            <div className="space-y-4">
              {[
                {
                  id: "NOTE-001",
                  title: "Care Plan Review - Mobility Decline",
                  patient: "Sarah Johnson",
                  author: "Dr. Smith",
                  discipline: "case_management", 
                  status: "awaiting_review",
                  priority: "high",
                  createdAt: "2024-01-26",
                  waitDays: 2,
                  tags: ["decline", "mobility", "urgent"]
                },
                {
                  id: "NOTE-002",
                  title: "Wound Care Assessment Update", 
                  patient: "Michael Chen",
                  author: "Nurse Wilson",
                  discipline: "nursing",
                  status: "awaiting_review",
                  priority: "medium", 
                  createdAt: "2024-01-25",
                  waitDays: 3,
                  tags: ["wound_care", "progress"]
                },
                {
                  id: "NOTE-003",
                  title: "Medication Adherence Concerns",
                  patient: "James Brown",
                  author: "PharmD Davis",
                  discipline: "pharmacy", 
                  status: "awaiting_review",
                  priority: "high",
                  createdAt: "2024-01-23",
                  waitDays: 5,
                  tags: ["medication", "compliance", "urgent"]
                }
              ].map((note) => (
                <Card key={note.id} className={`hover:shadow-elevated transition-all duration-300 border-l-4 ${
                  note.priority === "high" ? "border-l-red-500" : 
                  note.priority === "medium" ? "border-l-amber-500" : "border-l-green-500"
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <FileText className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-foreground truncate">{note.title}</h3>
                            <Badge variant={note.waitDays && note.waitDays > 3 ? "destructive" : "secondary"}>
                              Awaiting Review ({note.waitDays}d)
                            </Badge>
                            <Badge variant="outline" className={
                              note.discipline === "case_management" ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              note.discipline === "nursing" ? 'bg-green-100 text-green-800 border-green-200' : 
                              note.discipline === "physical_therapy" ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              note.discipline === "pharmacy" ? 'bg-orange-100 text-orange-800 border-orange-200' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {note.discipline.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {note.patient}
                            </span>
                            <span>By: {note.author}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {note.waitDays} days waiting
                            </span>
                          </div>
                          <div className="flex gap-1 mt-2">
                            {note.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark Reviewed
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="interventions">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Interventions Management</h2>
                <p className="text-muted-foreground">
                  Schedule and track patient interventions and treatments
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Intervention
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search interventions or patients..."
                      className="pl-10"
                    />
                  </div>
                  
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="physical_therapy">Physical Therapy</SelectItem>
                      <SelectItem value="occupation_therapy">Occupational Therapy</SelectItem>
                      <SelectItem value="nursing">Nursing</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Interventions List */}
            <div className="space-y-4">
              {[
                {
                  id: "INT-001",
                  patient: "Sarah Johnson",
                  type: "physical_therapy",
                  description: "Mobility assessment and gait training",
                  priority: "high",
                  status: "scheduled",
                  assignedTo: "PT Johnson",
                  scheduledDate: "2024-01-30",
                  scheduledTime: "10:00 AM",
                  episodeDay: 14,
                  createdAt: "2024-01-26"
                },
                {
                  id: "INT-002", 
                  patient: "Michael Chen",
                  type: "nursing",
                  description: "Wound care and dressing change",
                  priority: "medium",
                  status: "in_progress", 
                  assignedTo: "Nurse Wilson",
                  scheduledDate: "2024-01-29",
                  scheduledTime: "2:00 PM",
                  episodeDay: 19,
                  createdAt: "2024-01-25"
                },
                {
                  id: "INT-003",
                  patient: "Dorothy Williams",
                  type: "occupation_therapy",
                  description: "ADL training - bathing and dressing",
                  priority: "medium",
                  status: "completed",
                  assignedTo: "OT Davis",
                  scheduledDate: "2024-01-28",
                  completedDate: "2024-01-28",
                  episodeDay: 21,
                  createdAt: "2024-01-24"
                },
                {
                  id: "INT-004",
                  patient: "James Brown", 
                  type: "medication",
                  description: "Medication reconciliation and education",
                  priority: "high",
                  status: "pending",
                  assignedTo: "PharmD Davis",
                  scheduledDate: "2024-01-31",
                  episodeDay: 8,
                  createdAt: "2024-01-27"
                }
              ].map((intervention) => (
                <Card key={intervention.id} className={`hover:shadow-elevated transition-all duration-300 border-l-4 ${
                  intervention.priority === "high" ? "border-l-red-500" : 
                  intervention.priority === "medium" ? "border-l-amber-500" : "border-l-green-500"
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Activity className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-foreground truncate">{intervention.description}</h3>
                            <Badge variant={
                              intervention.status === "completed" ? "outline" :
                              intervention.status === "in_progress" ? "default" :
                              intervention.status === "scheduled" ? "secondary" :
                              intervention.status === "pending" ? "secondary" : "destructive"
                            } className={
                              intervention.status === "completed" ? "bg-green-50 text-green-700 border-green-200" :
                              intervention.status === "in_progress" ? "bg-blue-50 text-blue-700 border-blue-200" :
                              ""
                            }>
                              {intervention.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                            <Badge variant="outline" className={
                              intervention.type === "physical_therapy" ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              intervention.type === "occupation_therapy" ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                              intervention.type === "nursing" ? 'bg-green-100 text-green-800 border-green-200' :
                              intervention.type === "medication" ? 'bg-orange-100 text-orange-800 border-orange-200' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {intervention.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {intervention.patient}
                            </span>
                            <span>Assigned to: {intervention.assignedTo}</span>
                            <span>Episode Day {intervention.episodeDay}</span>
                            {intervention.scheduledDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(intervention.scheduledDate).toLocaleDateString()}
                                {intervention.scheduledTime && ` at ${intervention.scheduledTime}`}
                              </span>
                            )}
                          </div>
                          {intervention.completedDate && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ Completed on {new Date(intervention.completedDate).toLocaleDateString()}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                            <span>Created: {new Date(intervention.createdAt).toLocaleDateString()}</span>
                            <Badge variant="outline" className={`text-xs ${
                              intervention.priority === "high" ? "text-red-700 border-red-200" :
                              intervention.priority === "medium" ? "text-amber-700 border-amber-200" :
                              "text-green-700 border-green-200"
                            }`}>
                              {intervention.priority.toUpperCase()} Priority
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        {intervention.status === "pending" && (
                          <Button size="sm" variant="outline">
                            <Calendar className="h-4 w-4 mr-1" />
                            Schedule
                          </Button>
                        )}
                        {intervention.status === "scheduled" && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Start
                          </Button>
                        )}
                        {intervention.status === "in_progress" && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Empty State */}
              <Card className="p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">All interventions managed</h3>
                    <p className="text-muted-foreground">
                      Great work! All current interventions are being tracked.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Assignment Modal */}
      <Dialog open={assignmentModalOpen} onOpenChange={setAssignmentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Alert</DialogTitle>
            <DialogDescription>
              {alertToAssign && `Select a nurse to assign the "${alertToAssign.title}" alert for ${alertToAssign.patient}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {nurses.map((nurse) => (
              <div
                key={nurse.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => handleSaveAssignment(nurse.name)}
              >
                <div>
                  <h4 className="font-medium">{nurse.name}</h4>
                  <p className="text-sm text-muted-foreground">{nurse.title} • {nurse.specialty}</p>
                </div>
                <Button size="sm" variant="ghost">
                  Select
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignmentModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}