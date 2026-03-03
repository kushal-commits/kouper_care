import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronRight, 
  AlertTriangle, 
  Clock, 
  User,
  ArrowRight,
  Eye
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Alert {
  id: string;
  severity: string;
  alert_type: string;
  title: string;
  message: string;
  patient_id: string;
  patient_name: string;
  created_at: string;
  is_acknowledged: boolean;
}

interface AlertsByPatient {
  patient_name: string;
  patient_id: string;
  alerts: Alert[];
}

export function PatientAlertsView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedPatients, setExpandedPatients] = useState<Set<string>>(new Set());

  // Hide this component on the home page
  if (location.pathname === '/') {
    return null;
  }

  // Fetch alerts with patient information
  const { data: alertsData = [], isLoading } = useQuery({
    queryKey: ['patient-alerts'],
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
        ...alert,
        patient_name: `${alert.patients?.first_name} ${alert.patients?.last_name}`
      }));
    },
  });

  // Group alerts by patient
  const alertsByPatient = alertsData.reduce((acc, alert) => {
    if (!acc[alert.patient_id]) {
      acc[alert.patient_id] = {
        patient_name: alert.patient_name,
        patient_id: alert.patient_id,
        alerts: []
      };
    }
    acc[alert.patient_id].alerts.push(alert);
    return acc;
  }, {} as Record<string, AlertsByPatient>);

  // Sort alerts within each patient group by severity then time
  const severityOrder = { "critical": 0, "warning": 1, "info": 2 };
  Object.values(alertsByPatient).forEach(patientGroup => {
    patientGroup.alerts.sort((a, b) => {
      const severityDiff = (severityOrder[a.severity as keyof typeof severityOrder] || 3) - 
                          (severityOrder[b.severity as keyof typeof severityOrder] || 3);
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  });

  const togglePatient = (patientId: string) => {
    const newExpanded = new Set(expandedPatients);
    if (newExpanded.has(patientId)) {
      newExpanded.delete(patientId);
    } else {
      newExpanded.add(patientId);
    }
    setExpandedPatients(newExpanded);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "destructive";
      case "warning": return "secondary";
      case "info": return "outline";
      default: return "outline";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleViewPatientDetails = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  const handleViewAlert = (alertId: string, patientId: string) => {
    navigate(`/worklist?alert=${alertId}&patient=${patientId}`);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const alertTime = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - alertTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "< 1h ago";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card className="w-full shadow-clinical">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Patient Alerts</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary hover:text-primary/80"
          onClick={() => navigate("/worklist?tab=alerts")}
        >
          View All <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading alerts...</div>
        ) : Object.values(alertsByPatient).map(({ patient_name, patient_id, alerts }) => (
          <Collapsible
            key={patient_id}
            open={expandedPatients.has(patient_id)}
            onOpenChange={() => togglePatient(patient_id)}
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  {expandedPatients.has(patient_id) ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium text-foreground">{patient_name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
                      </Badge>
                      {alerts.some(a => a.severity === "critical") && (
                        <Badge variant="destructive" className="text-xs">Critical</Badge>
                      )}
                      {alerts.some(a => a.severity === "warning") && !alerts.some(a => a.severity === "critical") && (
                        <Badge variant="destructive" className="text-xs">Warning</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewPatientDetails(patient_id);
                  }}
                  className="text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Patient
                </Button>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-2 mt-2 ml-4">
              {alerts.map((alert) => (
                <Card 
                  key={alert.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary/20"
                  onClick={() => handleViewAlert(alert.id, patient_id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(alert.severity)}
                        <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                          {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {alert.alert_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(alert.created_at)}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{alert.message}</p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>Alert ID: {alert.id.slice(0, 8)}</span>
                        <span>Patient: {patient_name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {alert.is_acknowledged ? 'Acknowledged' : 'New'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
        
        {Object.keys(alertsByPatient).length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No alerts found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}