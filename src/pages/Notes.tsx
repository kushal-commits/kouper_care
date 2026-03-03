import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Calendar, User, Search, FileText, Eye } from "lucide-react";

// Mock notes data
const mockNotes = [
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
    title: "Physical Therapy Progress Note",
    patient: "Dorothy Williams", 
    author: "PT Johnson",
    discipline: "physical_therapy",
    status: "reviewed",
    priority: "normal",
    createdAt: "2024-01-24",
    reviewedAt: "2024-01-27",
    tags: ["improved", "stable"]
  },
  {
    id: "NOTE-004",
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
];

export default function Notes() {
  const [searchParams] = useSearchParams();
  const [notes, setNotes] = useState(mockNotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || "all");
  const [disciplineFilter, setDisciplineFilter] = useState("all");
  const [sortBy, setSortBy] = useState("wait_time_desc");

  useEffect(() => {
    // Apply URL filters
    const status = searchParams.get('status');
    if (status) setStatusFilter(status);
  }, [searchParams]);

  const getStatusBadge = (status: string, waitDays?: number) => {
    switch (status) {
      case "awaiting_review":
        return <Badge variant={waitDays && waitDays > 3 ? "destructive" : "secondary"}>
          Awaiting Review ({waitDays}d)
        </Badge>;
      case "reviewed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Reviewed
        </Badge>;
      case "in_review":
        return <Badge variant="secondary">In Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDisciplineBadge = (discipline: string) => {
    const colors = {
      case_management: 'bg-blue-100 text-blue-800 border-blue-200',
      nursing: 'bg-green-100 text-green-800 border-green-200', 
      physical_therapy: 'bg-purple-100 text-purple-800 border-purple-200',
      pharmacy: 'bg-orange-100 text-orange-800 border-orange-200',
      social_work: 'bg-pink-100 text-pink-800 border-pink-200'
    };
    
    return (
      <Badge variant="outline" className={colors[discipline as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {discipline.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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

  const filteredNotes = notes.filter(note => {
    if (searchTerm && !note.patient.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !note.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (statusFilter !== "all" && note.status !== statusFilter) return false;
    if (disciplineFilter !== "all" && note.discipline !== disciplineFilter) return false;
    return true;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case "wait_time_desc":
        return (b.waitDays || 0) - (a.waitDays || 0);
      case "created_date":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "priority":
        const priorityOrder = { high: 3, medium: 2, normal: 1 };
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      case "patient":
        return a.patient.localeCompare(b.patient);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const handleReviewNote = (noteId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, status: "reviewed" as const, reviewedAt: new Date().toISOString().split('T')[0], waitDays: undefined }
        : note
    ));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Care Manager Notes</h1>
          <p className="text-muted-foreground">
            {statusFilter === 'awaiting_review' ? 
              'Notes pending clinical review and approval' : 
              'Clinical notes and documentation'
            }
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
                <SelectItem value="awaiting_review">Awaiting Review</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
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

            <Select value={sortBy} onValueChange={setSortBy}>
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
        {sortedNotes.map((note) => (
          <Card key={note.id} className={`hover:shadow-elevated transition-all duration-300 border-l-4 ${getPriorityColor(note.priority)}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-foreground truncate">{note.title}</h3>
                      {getStatusBadge(note.status, note.waitDays)}
                      {getDisciplineBadge(note.discipline)}
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
                      {note.waitDays && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {note.waitDays} days waiting
                        </span>
                      )}
                    </div>
                    {note.tags && (
                      <div className="flex gap-1 mt-2">
                        {note.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {note.reviewedAt && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Reviewed on {new Date(note.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {note.status === "awaiting_review" && (
                    <Button
                      size="sm"
                      onClick={() => handleReviewNote(note.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark Reviewed
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {sortedNotes.length === 0 && (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium">No notes found</h3>
                <p className="text-muted-foreground">
                  {statusFilter === 'all' ? 
                    'No notes match your current search criteria.' :
                    `No ${statusFilter.replace('_', ' ')} notes found.`
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