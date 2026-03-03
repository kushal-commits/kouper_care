import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Clock, Calendar, User, Search, Filter, CheckCircle, AlertTriangle } from "lucide-react";

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

export default function Tasks() {
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState(mockTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || "all");
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || "due_date");

  useEffect(() => {
    // Apply URL filters
    const status = searchParams.get('status');
    const range = searchParams.get('range');
    const sort = searchParams.get('sort');

    if (status) setStatusFilter(status);
    if (sort) setSortBy(sort);
  }, [searchParams]);

  const getStatusBadge = (status: string, overdueDays?: number) => {
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (searchTerm && !task.patient.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !task.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "due_date_asc":
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      case "patient":
        return a.patient.localeCompare(b.patient);
      default:
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
  });

  const handleCompleteTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: "done" as const, completedDate: new Date().toISOString().split('T')[0], overdueDays: undefined }
        : task
    ));
  };

  const completedTasks = tasks.filter(task => task.status === "done").length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tasks & Assignments</h1>
          <p className="text-muted-foreground">
            {statusFilter === 'overdue' ? 'Overdue tasks requiring immediate attention' : 
             statusFilter === 'done' ? 'Completed tasks this week' :
             'Active tasks and assignments'}
          </p>
        </div>
      </div>

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
                <span>{tasks.filter(t => t.status === "overdue").length} Overdue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span>{tasks.filter(t => t.status === "pending").length} Pending</span>
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
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="done">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
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
                  {getPriorityIcon(task.priority)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground truncate">{task.title}</h3>
                      {getStatusBadge(task.status, task.overdueDays)}
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
                  {statusFilter === 'all' ? 
                    'No tasks match your current search criteria.' :
                    `No ${statusFilter} tasks found.`
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