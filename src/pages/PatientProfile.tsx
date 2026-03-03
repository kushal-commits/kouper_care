
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  AlertTriangle, 
  Clock, 
  Activity, 
  FileText,
  Calendar,
  Phone,
  MapPin,
  Plus,
  User,
  Filter,
  RefreshCw,
  Database,
  TrendingUp,
  BarChart,
  X
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EvidencePopup } from "@/components/EvidencePopup";
import { ClinicianNotes } from "@/components/ClinicianNotes";
import { ADLProgressCharts } from "@/components/ADLProgressCharts";
import { EpisodeTimeline } from "@/components/EpisodeTimeline";
import { MidEpisodeAnalysis } from "@/components/MidEpisodeAnalysis";

// Type definitions for JSON fields
interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface EmergencyContact {
  name?: string;
  phone?: string;
  relationship?: string;
}

interface InsuranceInfo {
  primary?: string;
  secondary?: string;
  id?: string;
}

// Calculate age from date of birth
const calculateAge = (dateOfBirth: string) => {
  const dob = new Date(dateOfBirth);
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const getRiskBadgeColor = (level: string) => {
  switch (level) {
    case "critical": return "bg-destructive/10 text-destructive border-destructive/20";
    case "high": return "bg-amber-100 text-amber-800 border-amber-200";
    case "medium": return "bg-blue-100 text-blue-800 border-blue-200";
    case "low": return "bg-accent/10 text-accent border-accent/20";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getAlertSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical": return "bg-destructive/10 text-destructive border-destructive/20";
    case "warning": return "bg-amber-100 text-amber-800 border-amber-200";
    case "info": return "bg-blue-100 text-blue-800 border-blue-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Detect UUID-like IDs
const isUUID = (value: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value);

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch patient data
  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      if (!id) throw new Error('No patient ID provided');

      // Handle both UUID and human-readable slugs (e.g. "sarah-johnson") or MRNs
      if (isUUID(id)) {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        return data;
      }

      // Try resolving by name slug: first-last
      if (id.includes('-') && /[a-zA-Z]/.test(id)) {
        const parts = id.split('-').filter(Boolean);
        const toTitle = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase());
        const first = toTitle(parts[0] || '');
        const last = toTitle(parts.slice(1).join(' '));
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .ilike('first_name', first)
          .ilike('last_name', last)
          .limit(1)
          .single();
        if (error) throw error;
        return data;
      }

      // Fallback: try MRN match
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('mrn', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch episodes for this patient
  const patientIdForQueries = (patient as any)?.id as string | undefined;
  const { data: episodes } = useQuery({
    queryKey: ['episodes', patientIdForQueries],
    queryFn: async () => {
      if (!patientIdForQueries) return [];
      
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('patient_id', patientIdForQueries)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!patientIdForQueries,
  });

  // Fetch assessments for this patient with author info
  const { data: assessments } = useQuery({
    queryKey: ['assessments', patientIdForQueries],
    queryFn: async () => {
      if (!patientIdForQueries) return [];
      
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          assessor:profiles (
            full_name,
            discipline
          )
        `)
        .eq('patient_id', patientIdForQueries)
        .order('assessment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!patientIdForQueries,
  });

  // Fetch active alerts for this patient
  const { data: alerts } = useQuery({
    queryKey: ['alerts', patientIdForQueries],
    queryFn: async () => {
      if (!patientIdForQueries) return [];
      
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('patient_id', patientIdForQueries)
        .eq('is_acknowledged', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!patientIdForQueries,
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center space-x-4">
          {/* <Button variant="ghost" onClick={() => navigate('/patients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
          <div className="h-6 w-px bg-border" /> */}
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="flex items-start space-x-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <Skeleton className="h-10 w-16 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Patient Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error ? 'There was an error loading the patient profile.' : 'The requested patient profile could not be found.'}
            </p>
            {/* <Button onClick={() => navigate('/patients')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Patients
            </Button> */}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Process patient data
  const patientName = `${patient.first_name} ${patient.last_name}`;
  const patientAge = calculateAge(patient.date_of_birth);
  const latestAssessment = assessments?.[0];
  const activeEpisode = episodes?.find(ep => ep.status === 'active');
  
  // Calculate length of stay
  const calculateLengthOfStay = () => {
    if (!activeEpisode) return { current: 0, total: 0 };
    
    const startDate = new Date(activeEpisode.start_date);
    const now = new Date();
    const currentEpisodeDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Mock total days calculation (sum of all episodes)
    const totalDays = episodes?.reduce((sum, ep) => {
      const episodeStart = new Date(ep.start_date);
      const episodeEnd = ep.status === 'active' ? now : new Date(ep.end_date);
      const episodeDays = Math.floor((episodeEnd.getTime() - episodeStart.getTime()) / (1000 * 60 * 60 * 24));
      return sum + Math.max(0, episodeDays);
    }, 0) || 0;
    
    return { current: currentEpisodeDays, total: totalDays };
  };
  
  const lengthOfStay = calculateLengthOfStay();

  // Type assertion for JSON fields
  const address = patient.address as Address;
  const emergencyContact = patient.emergency_contact as EmergencyContact;
  const insuranceInfo = patient.insurance_info as InsuranceInfo;

  // Format address
  const formattedAddress = address ? 
    `${address.street || ''}, ${address.city || ''}, ${address.state || ''} ${address.zip || ''}`.replace(/^,\s*|,\s*$/, '') : 
    'Address not available';

  // Format emergency contact
  const formattedEmergencyContact = emergencyContact ?
    `${emergencyContact.name || ''} (${emergencyContact.relationship || ''}) - ${emergencyContact.phone || ''}` :
    'Emergency contact not available';

  return (
    <div className="p-8 space-y-6">
        {/* Header - Enhanced */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{patientName}</h1>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <span>Age: {patientAge} • MRN: {patient.mrn}</span>
              {activeEpisode && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Day {lengthOfStay.current} of 30</span>
                  </div>
                  <span>•</span>
                  <span>Total LOS: {lengthOfStay.total} days</span>
                </>
              )}
            </div>
          </div>
          
          <Button size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Now
          </Button>
        </div>

        {/* Top Row Widgets - Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Risk Level */}
          <Card className="shadow-clinical">
            <CardContent className="p-6 text-center">
              <Badge className={`${getRiskBadgeColor(latestAssessment?.risk_level || 'unknown')} text-lg px-4 py-2`}>
                {(latestAssessment?.risk_level || 'PENDING').toUpperCase()}
              </Badge>
              <div className="text-sm text-muted-foreground mt-2">Risk Level</div>
            </CardContent>
          </Card>

          {/* Current ADL Score */}
          <Card className="shadow-clinical">
            <CardContent className="p-6 text-center">
              <EvidencePopup
                dataTable="assessments"
                dataId={latestAssessment?.id || ''}
                value={latestAssessment?.total_adl_score || 'N/A'}
              >
                <div className="text-3xl font-bold cursor-pointer hover:text-primary transition-colors">
                  {latestAssessment?.total_adl_score || 'N/A'}
                </div>
              </EvidencePopup>
              <div className="text-sm text-muted-foreground mt-2">Current ADL Score</div>
              {latestAssessment && (
                <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(latestAssessment.assessment_date).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Intervention */}
          <Card className="shadow-clinical">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary">PT Eval</div>
              <div className="text-sm text-muted-foreground mt-2">Next Intervention</div>
              <div className="text-xs text-muted-foreground mt-1">Scheduled: Tomorrow</div>
            </CardContent>
          </Card>

          {/* Improvement Percentage */}
          <Card className="shadow-clinical">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-1">
                <TrendingUp className="h-5 w-5 text-accent" />
                <div className="text-2xl font-bold text-accent">12%</div>
              </div>
              <div className="text-sm text-muted-foreground mt-2">Improvement vs Baseline</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Panels - Tabs */}
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="analysis">Mid-Episode Analysis</TabsTrigger>
            <TabsTrigger value="timeline">Episode Timeline</TabsTrigger>
            <TabsTrigger value="charts">OT/PT Charts</TabsTrigger>
            <TabsTrigger value="notes">Clinician Notes</TabsTrigger>
            <TabsTrigger value="alerts">
              Alerts {alerts && alerts.length > 0 && (
                <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">
                  {alerts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis">
            <MidEpisodeAnalysis patientId={id!} episodeId={activeEpisode?.id} />
          </TabsContent>
          
          <TabsContent value="timeline">
            <EpisodeTimeline patientId={id!} episodeId={activeEpisode?.id} />
          </TabsContent>
          
          <TabsContent value="charts">
            <ADLProgressCharts patientId={id!} />
          </TabsContent>

          <TabsContent value="notes">
            <ClinicianNotes patientId={id!} />
          </TabsContent>

          <TabsContent value="alerts">
            {alerts && alerts.length > 0 ? (
              <Card className="shadow-clinical">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                    <span>Active Alerts ({alerts.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="flex items-start justify-between p-4 rounded-lg border bg-background/50">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getAlertSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <span className="font-medium">{alert.title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                            </div>
                            <span>Type: {alert.alert_type}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="ml-4">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-clinical">
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Active Alerts</h3>
                  <p className="text-muted-foreground">This patient currently has no active alerts.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Patient Information Card */}
        <Card className="shadow-clinical">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Patient Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Medical Information</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Primary Diagnosis:</strong> {patient.primary_diagnosis || 'Not specified'}</p>
                  {patient.secondary_diagnoses && patient.secondary_diagnoses.length > 0 && (
                    <p><strong>Secondary Diagnoses:</strong> {patient.secondary_diagnoses.join(', ')}</p>
                  )}
                  <p><strong>Date of Birth:</strong> {new Date(patient.date_of_birth).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Phone:</strong> {patient.phone || 'Not available'}</p>
                  <p><strong>Address:</strong> {formattedAddress}</p>
                  <p><strong>Emergency Contact:</strong> {formattedEmergencyContact}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
      </div>
  );
}