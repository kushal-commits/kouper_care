import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown, AlertCircle, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PatientProgressData {
  id: string;
  name: string;
  currentADL: number;
  previousADL: number;
  trend: 'improving' | 'declining' | 'stable';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastAssessment: string;
  interventionsNeeded: string[];
}

export default function PatientProgressionTool() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patient-progression'],
    queryFn: async (): Promise<PatientProgressData[]> => {
      const { data: assessments } = await supabase
        .from('assessments')
        .select(`
          *,
          patients!inner(id, first_name, last_name)
        `)
        .order('assessment_date', { ascending: false });

      if (!assessments) return [];

      // Process assessments to get progression data
      const patientMap = new Map();
      
      assessments.forEach(assessment => {
        const patientId = assessment.patient_id;
        const patientName = `${assessment.patients.first_name} ${assessment.patients.last_name}`;
        
        if (!patientMap.has(patientId)) {
          patientMap.set(patientId, {
            id: patientId,
            name: patientName,
            assessments: []
          });
        }
        
        patientMap.get(patientId).assessments.push(assessment);
      });

      return Array.from(patientMap.values()).map(patient => {
        const recentAssessments = patient.assessments.slice(0, 2);
        const current = recentAssessments[0];
        const previous = recentAssessments[1];
        
        const currentADL = current?.total_adl_score || 0;
        const previousADL = previous?.total_adl_score || currentADL;
        
        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (currentADL > previousADL) trend = 'improving';
        else if (currentADL < previousADL) trend = 'declining';
        
        const interventionsNeeded = [];
        if (currentADL < 20) interventionsNeeded.push('Mobility Support');
        if (current?.medication_mgmt_score && current.medication_mgmt_score < 2) interventionsNeeded.push('Medication Management');
        if (trend === 'declining') interventionsNeeded.push('Care Plan Review');

        return {
          id: patient.id,
          name: patient.name,
          currentADL,
          previousADL,
          trend,
          riskLevel: currentADL < 15 ? 'critical' : currentADL < 20 ? 'high' : currentADL < 25 ? 'medium' : 'low',
          lastAssessment: current?.assessment_date || '',
          interventionsNeeded
        } as PatientProgressData;
      }).filter(p => p.currentADL > 0);
    }
  });

  const filteredPatients = patients?.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-accent" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Patient Progression Tool</h1>
          <Button variant="outline">
            Export Report
          </Button>
        </div>
        <p className="text-muted-foreground">
          Monitor ADL trends and identify patients needing mid-episode interventions
        </p>
      </div>

      <Card className="shadow-clinical">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Patients
          </CardTitle>
          <div className="flex gap-4">
            <Input
              placeholder="Search patient name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading patient progression data...</div>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="border rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <User className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold text-foreground">{patient.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Last assessment: {new Date(patient.lastAssessment).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getRiskColor(patient.riskLevel) as any}>
                      {patient.riskLevel} risk
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(patient.trend)}
                      <span className="text-sm">
                        ADL Score: {patient.currentADL}
                        {patient.previousADL !== patient.currentADL && (
                          <span className="text-muted-foreground ml-1">
                            (was {patient.previousADL})
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Trend: </span>
                      <span className={`capitalize ${
                        patient.trend === 'improving' ? 'text-accent' : 
                        patient.trend === 'declining' ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        {patient.trend}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Change: </span>
                      <span className={patient.currentADL > patient.previousADL ? 'text-accent' : 'text-destructive'}>
                        {patient.currentADL > patient.previousADL ? '+' : ''}{patient.currentADL - patient.previousADL}
                      </span>
                    </div>
                  </div>

                  {patient.interventionsNeeded.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">Recommended Interventions:</h4>
                      <div className="flex flex-wrap gap-2">
                        {patient.interventionsNeeded.map((intervention, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {intervention}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredPatients.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  No patients found matching your search criteria
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}