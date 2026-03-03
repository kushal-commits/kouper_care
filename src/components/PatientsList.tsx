import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingDown, TrendingUp, Clock, AlertCircle, FileText, Activity } from "lucide-react";
import { Patient } from "@/pages/Patients";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface PatientsListProps {
  patients: Patient[];
}

const getRiskBadgeColor = (level: string) => {
  switch (level) {
    case "critical": return "bg-destructive/10 text-destructive border-destructive/20";
    case "high": return "bg-amber-100 text-amber-800 border-amber-200";
    case "medium": return "bg-blue-100 text-blue-800 border-blue-200";
    case "low": return "bg-accent/10 text-accent border-accent/20";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getInterventionStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-primary/10 text-primary";
    case "completed": return "bg-accent/10 text-accent";
    case "pending": return "bg-amber-100 text-amber-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export function PatientsList({ patients }: PatientsListProps) {
  const [showingCount, setShowingCount] = useState(10);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleViewPatient = (patient: Patient) => {
    navigate(`/patients/${patient.id}`);
  };

  const handleLoadMore = () => {
    setShowingCount(prev => prev + 10);
    toast({
      title: "Loading More Patients",
      description: "Fetching additional patient records...",
    });
  };

  const displayedPatients = patients.slice(0, showingCount);
  const hasMore = patients.length > showingCount;

  if (patients.length === 0) {
    return (
      <Card className="shadow-clinical">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No patients found</p>
            <p>Try adjusting your filters to see more results.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {displayedPatients.map((patient) => (
        <Card key={patient.id} className="shadow-clinical hover:shadow-elevated transition-shadow">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Patient Info */}
              <div className="lg:col-span-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-lg">{patient.name}</h3>
                      <Badge className={`${getRiskBadgeColor(patient.riskLevel)} text-xs`}>
                        {patient.riskLevel.toUpperCase()} RISK
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Age: {patient.age} • {patient.mrn}</p>
                      <p>Episode Start: {new Date(patient.created_at).toLocaleDateString()}</p>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-viridian-100 text-viridian-700 text-xs">
                            {patient.nurse.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span>Nurse: {patient.nurse.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ADL Score & Trend */}
              <div className="lg:col-span-2">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">{patient.adlScore}</div>
                  <div className="text-sm text-muted-foreground mb-2">ADL Score</div>
                  
                  <div className={`flex items-center justify-center space-x-1 text-sm ${
                    patient.scoreChange < 0 ? 'text-destructive' : 'text-accent'
                  }`}>
                    {patient.scoreChange < 0 ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}
                    <span>{Math.abs(patient.scoreChange)} pts</span>
                  </div>
                  
                  {patient.scoreChange < -10 && (
                    <div className="mt-2 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-xs text-destructive ml-1">Significant Decline</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Discharge Reason */}
              <div className="lg:col-span-3">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Original Discharge</h4>
                  <p className="text-sm">{patient.dischargeReason}</p>
                </div>
                
                <div className="mt-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    Next Assessment: {patient.nextAssessmentType} ({new Date(patient.nextAssessment).toLocaleDateString()})
                  </div>
                </div>
              </div>

              {/* Interventions */}
              <div className="lg:col-span-2">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Recent Interventions</h4>
                <div className="space-y-1">
                  {patient.interventions.slice(0, 2).map((intervention, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{intervention.type}</span>
                      <Badge className={`${getInterventionStatusColor(intervention.status)} text-xs`}>
                        {intervention.status}
                      </Badge>
                    </div>
                  ))}
                  {patient.interventions.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{patient.interventions.length - 2} more
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="lg:col-span-1 flex items-center justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewPatient(patient)}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Load More */}
      {hasMore && (
        <div className="text-center py-4">
          <Button variant="outline" onClick={handleLoadMore}>
            Load More Patients ({patients.length - showingCount} remaining)
          </Button>
        </div>
      )}
      
      {!hasMore && patients.length > 10 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Showing all {patients.length} patients
          </p>
        </div>
      )}
    </div>
  );
}