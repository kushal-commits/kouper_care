import { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Download, X, Brain, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Mock data
const patients = [
  { id: "1", name: "Sarah Johnson", mrn: "MRN-001", activeEpisode: "EPI-8842" },
  { id: "2", name: "Michael Chen", mrn: "MRN-002", activeEpisode: "EPI-8843" },
  { id: "3", name: "Emma Davis", mrn: "MRN-003", activeEpisode: null }
];

const mockFieldMapping = {
  patient_id: "PatientID",
  assessment_date: "AssessmentDate", 
  assessor_role: "AssessorRole",
  bathing: "M1830_Bathing",
  dressing_upper: "M1840_DressingUpper",
  dressing_lower: "M1850_DressingLower",
  grooming: "M1845_Grooming",
  eating: "M1860_Eating",
  toileting: "M1870_Toileting",
  transferring: "M1880_Transferring",
  ambulation: "M1890_Ambulation",
  medication_mgmt: "M2020_MedicationMgmt"
};

const mockValidationIssues = [
  {
    row: 3,
    field: "assessment_date",
    issue: "Date format invalid",
    value: "2024/01/30",
    suggestion: "Use YYYY-MM-DD format"
  },
  {
    row: 5,
    field: "bathing",
    issue: "Value out of range",
    value: "6",
    suggestion: "Must be 0-5"
  }
];

export default function UploadOASIS() {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [step, setStep] = useState(0); // 0: Upload, 1: AI Identify, 2: Confirm/Select, 3: Map, 4: Validate, 5: Review
  const [fieldMapping, setFieldMapping] = useState(mockFieldMapping);
  const [validationIssues, setValidationIssues] = useState(mockValidationIssues);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setIsAnalyzing(true);
      
      try {
        // Analyze document with AI
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await supabase.functions.invoke('document-patient-identification', {
          body: formData,
        });
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        setAiAnalysis(response.data);
        setStep(1);
        
        toast({
          title: "Document analyzed",
          description: response.data.matchedPatient 
            ? `AI identified patient: ${response.data.matchedPatient.first_name} ${response.data.matchedPatient.last_name}`
            : "AI analysis complete - please select patient manually",
        });
      } catch (error) {
        console.error('AI analysis failed:', error);
        toast({
          title: "Analysis failed",
          description: "Please select patient manually",
          variant: "destructive"
        });
        setStep(2); // Skip to manual selection
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, [toast]);

  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      setIsAnalyzing(true);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await supabase.functions.invoke('document-patient-identification', {
          body: formData,
        });
        
        if (response.error) {
          throw new Error(response.error.message);
        }
        
        setAiAnalysis(response.data);
        setStep(1);
        
        toast({
          title: "Document analyzed",
          description: response.data.matchedPatient 
            ? `AI identified: ${response.data.matchedPatient.first_name} ${response.data.matchedPatient.last_name}`
            : "AI analysis complete - please confirm patient",
        });
      } catch (error) {
        console.error('AI analysis failed:', error);
        toast({
          title: "Analysis failed", 
          description: "Please select patient manually",
          variant: "destructive"
        });
        setStep(2);
      } finally {
        setIsAnalyzing(false);
      }
    }
  }, [toast]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const proceedToValidation = () => {
    setStep(4);
    toast({
      title: "Field mapping saved",
      description: "Proceeding to validation...",
    });
  };

  const proceedToReview = () => {
    setStep(5);
    toast({
      title: "Validation complete",
      description: `Found ${validationIssues.length} issues to review`,
    });
  };

  const handleImport = () => {
    toast({
      title: "Import successful",
      description: "Imported 48 assessments to Episode EPI-8842",
    });
    // Reset form
    setStep(0);
    setSelectedPatient("");
    setUploadedFile(null);
    setAiAnalysis(null);
  };

  const confirmPatient = (patientId: string) => {
    setSelectedPatient(patientId);
    setStep(3); // Skip to field mapping
  };

  const proceedToMapping = () => {
    setStep(3);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Upload Document</h1>
          <p className="text-muted-foreground">Upload document and let AI identify the patient</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Step 0: Upload Document */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Upload Document for AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Drop your document here</h3>
              <p className="text-muted-foreground mb-4">AI will automatically identify the patient</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="document-upload"
                disabled={isAnalyzing}
              />
              <label htmlFor="document-upload">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild disabled={isAnalyzing}>
                  <span>
                    {isAnalyzing ? (
                      <>
                        <Brain className="h-4 w-4 mr-2 animate-pulse" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Choose Document
                      </>
                    )}
                  </span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                Supports PDF, DOC, DOCX, TXT, CSV, XLSX formats
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: AI Patient Identification Results */}
      {step === 1 && aiAnalysis && uploadedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Analyzed: {uploadedFile.name}</span>
            </div>

            {aiAnalysis.matchedPatient ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <strong>Patient Identified!</strong> AI found a {aiAnalysis.analysis.confidence} confidence match.
                  </AlertDescription>
                </Alert>

                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Identified Patient:</h4>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {aiAnalysis.analysis.confidence} confidence
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Name:</strong> {aiAnalysis.matchedPatient.first_name} {aiAnalysis.matchedPatient.last_name}
                    </div>
                    <div>
                      <strong>MRN:</strong> {aiAnalysis.matchedPatient.mrn}
                    </div>
                    <div>
                      <strong>DOB:</strong> {aiAnalysis.matchedPatient.date_of_birth}
                    </div>
                    {aiAnalysis.matchedPatient.activeEpisode && (
                      <div>
                        <strong>Episode:</strong> {aiAnalysis.matchedPatient.activeEpisode.episode_number}
                      </div>
                    )}
                  </div>
                </div>

                {aiAnalysis.analysis.extractedInfo && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Extracted Information:</h4>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      {Object.entries(aiAnalysis.analysis.extractedInfo).map(([key, value]) => (
                        value && <div key={key}><strong>{key}:</strong> {String(value)}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    onClick={() => confirmPatient(aiAnalysis.matchedPatient.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Patient
                  </Button>
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <User className="h-4 w-4 mr-2" />
                    Select Different Patient
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    AI could not identify a matching patient. Please select manually.
                  </AlertDescription>
                </Alert>

                {aiAnalysis.analysis.extractedInfo && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Extracted Information:</h4>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      {Object.entries(aiAnalysis.analysis.extractedInfo).map(([key, value]) => (
                        value && <div key={key}><strong>{key}:</strong> {String(value)}</div>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={() => setStep(2)} className="bg-primary hover:bg-primary/90">
                  <User className="h-4 w-4 mr-2" />
                  Select Patient Manually
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Manual Patient Selection */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Patient & Episode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Patient</label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} ({patient.mrn})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Episode</label>
                <Select disabled={!selectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-selected based on patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="episode1">Current Episode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(uploadedFile ? 1 : 0)}>
                Back
              </Button>
              <Button 
                onClick={proceedToMapping} 
                disabled={!selectedPatient}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Continue to Field Mapping
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Field Mapping */}
      {step === 3 && uploadedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Field Mapping</span>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-normal">{uploadedFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUploadedFile(null);
                    setStep(2);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Auto-detected field mappings. Review and adjust as needed.
                </AlertDescription>
              </Alert>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>System Field</TableHead>
                    <TableHead>CSV Column</TableHead>
                    <TableHead>Scale</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(fieldMapping).map(([systemField, csvColumn]) => (
                    <TableRow key={systemField}>
                      <TableCell className="font-medium">{systemField}</TableCell>
                      <TableCell>{csvColumn}</TableCell>
                      <TableCell>
                        {systemField.includes('bathing') || systemField.includes('dressing') || 
                         systemField.includes('grooming') || systemField.includes('eating') ||
                         systemField.includes('toileting') || systemField.includes('transferring') ||
                         systemField.includes('ambulation') || systemField.includes('medication') 
                         ? "0-5" : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                          Mapped
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={proceedToValidation} className="bg-green-600 hover:bg-green-700 text-white">
                  Validate Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Validation */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validationIssues.length > 0 ? (
                <>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Found {validationIssues.length} validation issues that need attention.
                    </AlertDescription>
                  </Alert>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Field</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Current Value</TableHead>
                        <TableHead>Suggestion</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationIssues.map((issue, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{issue.row}</TableCell>
                          <TableCell>{issue.field}</TableCell>
                          <TableCell className="text-destructive">{issue.issue}</TableCell>
                          <TableCell><code className="bg-muted px-2 py-1 rounded">{issue.value}</code></TableCell>
                          <TableCell className="text-muted-foreground">{issue.suggestion}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    All data passed validation checks!
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back to Mapping
                </Button>
                <Button onClick={proceedToReview} className="bg-green-600 hover:bg-green-700 text-white">
                  Review & Confirm
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Review & Confirm */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Confirm Import</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">48</div>
                    <div className="text-sm text-muted-foreground">Assessments</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-muted-foreground">Updates</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{validationIssues.length}</div>
                    <div className="text-sm text-muted-foreground">Warnings</div>
                  </CardContent>
                </Card>
              </div>

              {validationIssues.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Import will skip rows with validation errors. You can fix these issues and re-import the affected rows later.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(4)}>
                  Back to Validation
                </Button>
                <Button onClick={handleImport} className="bg-green-600 hover:bg-green-700 text-white">
                  Import Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}