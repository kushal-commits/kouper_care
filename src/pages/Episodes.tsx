import { useState } from "react";
import { Search, Calendar, User, AlertTriangle, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NavLink } from "react-router-dom";

// Mock data
const episodes = [
  {
    id: "EPI-8842",
    patient: { name: "Sarah Johnson", mrn: "MRN-001" },
    startDate: "2024-01-15",
    endDate: "2024-02-14",
    day: 14,
    status: "Active",
    riskLevel: "High",
    alertsCount: 3,
    lastAssessment: "2024-01-28",
    coordinator: "Dr. Smith"
  },
  {
    id: "EPI-8843",
    patient: { name: "Michael Chen", mrn: "MRN-002" },
    startDate: "2024-01-10",
    endDate: "2024-02-09",
    day: 19,
    status: "Active",
    riskLevel: "Medium",
    alertsCount: 1,
    lastAssessment: "2024-01-27",
    coordinator: "Dr. Wilson"
  },
  {
    id: "EPI-8844",
    patient: { name: "Emma Davis", mrn: "MRN-003" },
    startDate: "2024-01-05",
    endDate: "2024-02-04",
    day: 24,
    status: "Completed",
    riskLevel: "Low",
    alertsCount: 0,
    lastAssessment: "2024-02-03",
    coordinator: "Dr. Johnson"
  }
];

export default function Episodes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [coordinatorFilter, setCoordinatorFilter] = useState("All");

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      case "Low": return "outline";
      default: return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === "Active" ? "default" : "secondary";
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Episodes</h1>
          <p className="text-muted-foreground">Snapshot of all active 30-day episodes</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Upload OASIS
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Risk</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
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

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Date range</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Episodes Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Episode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Alerts</TableHead>
                <TableHead>Last Assessment</TableHead>
                <TableHead>Coordinator</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {episodes.map((episode) => (
                <TableRow key={episode.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{episode.patient.name}</div>
                      <div className="text-sm text-muted-foreground">{episode.patient.mrn}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{episode.id}</div>
                      <div className="text-sm text-muted-foreground">
                        Day {episode.day}/30
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {episode.startDate} - {episode.endDate}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(episode.status)}>
                      {episode.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRiskBadgeVariant(episode.riskLevel)}>
                      {episode.riskLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {episode.alertsCount > 0 && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                      <span className={episode.alertsCount > 0 ? "text-destructive font-medium" : "text-muted-foreground"}>
                        {episode.alertsCount}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {episode.lastAssessment}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{episode.coordinator}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <NavLink to={`/episodes/${episode.id}`}>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        Open
                      </Button>
                    </NavLink>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {episodes.length === 0 && (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium">No episodes yet</h3>
              <p className="text-muted-foreground">Upload an OASIS file to start an episode.</p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Upload OASIS File
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}