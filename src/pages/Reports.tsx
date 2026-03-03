import { useState } from "react";
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  Plus,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

// Mock data
const reportHistory = [
  {
    id: "RPT-001",
    name: "Episode Summary - Sarah Johnson",
    type: "Episode Summary",
    createdBy: "Dr. Smith",
    createdAt: "2024-01-28",
    format: "PDF",
    size: "2.3 MB",
    status: "Completed"
  },
  {
    id: "RPT-002", 
    name: "Monthly Assessment Export - January",
    type: "Assessment Export",
    createdBy: "Admin",
    createdAt: "2024-01-27",
    format: "CSV",
    size: "856 KB",
    status: "Completed"
  },
  {
    id: "RPT-003",
    name: "Alerts & Tasks Report - Week 4",
    type: "Alerts & Tasks",
    createdBy: "Dr. Wilson",
    createdAt: "2024-01-26",
    format: "PDF",
    size: "1.2 MB",
    status: "Processing"
  },
  {
    id: "RPT-004",
    name: "Audit Log Export - January",
    type: "Audit Log",
    createdBy: "Compliance Team",
    createdAt: "2024-01-25",
    format: "CSV",
    size: "3.1 MB",
    status: "Failed"
  }
];

const reportTypes = [
  {
    id: "episode-summary",
    name: "Episode Summary",
    description: "Patient header, ADL timelines, alerts, interventions, outcomes",
    format: ["PDF"],
    filters: ["Patient", "Episode", "Date Range"]
  },
  {
    id: "assessment-export",
    name: "Assessment Export",
    description: "All assessments for specified date range",
    format: ["CSV"],
    filters: ["Date Range", "Patient", "ADL Type"]
  },
  {
    id: "alerts-tasks",
    name: "Alerts & Tasks",
    description: "Alert summaries and task completion status",
    format: ["CSV", "PDF"],
    filters: ["Date Range", "Severity", "Status", "Assignee"]
  },
  {
    id: "audit-log",
    name: "Audit Log", 
    description: "System access and change logs",
    format: ["CSV"],
    filters: ["Date Range", "User", "Action Type"]
  }
];



export default function Reports() {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("");
  const [reportName, setReportName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [format, setFormat] = useState("PDF");
  const [emailTo, setEmailTo] = useState("");
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
      case "Processing":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
      case "Failed":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleGenerateReport = () => {
    if (!selectedReportType || !reportName || !startDate || !endDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Report queued",
      description: `${reportName} has been queued for generation`,
    });

    // Reset form
    setIsGenerateOpen(false);
    setSelectedReportType("");
    setReportName("");
    setStartDate("");
    setEndDate("");
    setFormat("PDF");
    setEmailTo("");
  };

  const handleDownload = (reportId: string) => {
    toast({
      title: "Download started",
      description: "Your report download has begun",
    });
  };

  const selectedType = reportTypes.find(type => type.id === selectedReportType);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-l text-foreground">Reports & Exports</h1>
          <p className="text-muted-foreground">CMS-ready outputs and internal summaries</p>
        </div>
        <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generate New Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Report Type Selection */}
              <div className="space-y-4">
                <Label>Report Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportTypes.map((type) => (
                    <Card
                      key={type.id}
                      className={`cursor-pointer transition-colors ${
                        selectedReportType === type.id ? 'ring-2 ring-magenta-600' : ''
                      }`}
                      onClick={() => setSelectedReportType(type.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <h4 className="font-medium text-sm">{type.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              {type.format.map((fmt) => (
                                <Badge key={fmt} variant="outline" className="text-xs">
                                  {fmt}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Report Configuration */}
              {selectedType && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reportName">Report Name</Label>
                      <Input
                        id="reportName"
                        placeholder="Enter report name..."
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="format">Format</Label>
                      <Select value={format} onValueChange={setFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedType.format.map((fmt) => (
                            <SelectItem key={fmt} value={fmt}>
                              {fmt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Cohort Filters */}
                  <div className="space-y-3">
                    <Label>Cohort Filters</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Patient" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Patients</SelectItem>
                          <SelectItem value="sarah">Sarah Johnson</SelectItem>
                          <SelectItem value="michael">Michael Chen</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Diagnosis" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Diagnoses</SelectItem>
                          <SelectItem value="cardiac">Cardiac</SelectItem>
                          <SelectItem value="orthopedic">Orthopedic</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Coordinator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Coordinators</SelectItem>
                          <SelectItem value="smith">Dr. Smith</SelectItem>
                          <SelectItem value="wilson">Dr. Wilson</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="emailTo">Email To (Optional)</Label>
                    <Input
                      id="emailTo"
                      type="email"
                      placeholder="recipient@example.com"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleGenerateReport}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Generate Report
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Report History</span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportHistory.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-muted-foreground">{report.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>{report.createdBy}</TableCell>
                  <TableCell>{report.createdAt}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.format}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{report.size}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={report.status !== "Completed"}
                      onClick={() => handleDownload(report.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-medium mb-2">Episode Summaries</h3>
            <p className="text-sm text-muted-foreground">Generate patient episode reports</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Download className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-medium mb-2">Assessment Data</h3>
            <p className="text-sm text-muted-foreground">Export assessment history</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
            <h3 className="font-medium mb-2">Alerts Report</h3>
            <p className="text-sm text-muted-foreground">Alert trends and resolution</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-medium mb-2">Audit Logs</h3>
            <p className="text-sm text-muted-foreground">System activity exports</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}