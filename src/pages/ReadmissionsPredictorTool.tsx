import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, TrendingDown, User, Phone, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReadmissionRisk {
  patientId: string;
  patientName: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  lastDischarge: string;
  daysFromDischarge: number;
  contactInfo: string;
  recommendedActions: string[];
}

export default function ReadmissionsPredictorTool() {
  const { data: riskData, isLoading } = useQuery({
    queryKey: ['readmission-risks'],
    queryFn: async (): Promise<{
      patients: ReadmissionRisk[];
      trends: {
        totalAtRisk: number;
        monthlyTrend: number;
        preventedReadmissions: number;
      };
    }> => {
      // Get recently discharged patients (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: episodes } = await supabase
        .from('episodes')
        .select(`
          *,
          patients!inner(id, first_name, last_name, phone, date_of_birth, primary_diagnosis)
        `)
        .eq('status', 'completed')
        .gte('end_date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (!episodes) return { patients: [], trends: { totalAtRisk: 0, monthlyTrend: 0, preventedReadmissions: 0 } };

      // Calculate risk scores based on various factors
      const riskPatients: ReadmissionRisk[] = episodes.map(episode => {
        const patient = episode.patients;
        const patientName = `${patient.first_name} ${patient.last_name}`;
        const daysFromDischarge = Math.floor((new Date().getTime() - new Date(episode.end_date).getTime()) / (1000 * 60 * 60 * 24));
        
        // Risk calculation factors
        let riskScore = 0;
        const riskFactors: string[] = [];
        const recommendedActions: string[] = [];

        // Age factor
        const age = Math.floor((new Date().getTime() - new Date(patient.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365));
        if (age > 75) {
          riskScore += 25;
          riskFactors.push('Advanced age (>75)');
          recommendedActions.push('Weekly wellness check');
        }

        // Diagnosis-based risk
        const highRiskDiagnoses = ['heart failure', 'copd', 'diabetes', 'wound', 'fall'];
        if (patient.primary_diagnosis && highRiskDiagnoses.some(d => 
          patient.primary_diagnosis.toLowerCase().includes(d))) {
          riskScore += 30;
          riskFactors.push('High-risk diagnosis');
          recommendedActions.push('Specialized follow-up');
        }

        // Episode length (shorter episodes = higher risk)
        const episodeLength = Math.floor((new Date(episode.end_date).getTime() - new Date(episode.start_date).getTime()) / (1000 * 60 * 60 * 24));
        if (episodeLength < 14) {
          riskScore += 20;
          riskFactors.push('Short episode length');
          recommendedActions.push('Early follow-up call');
        }

        // Time since discharge (30-day window is critical)
        if (daysFromDischarge <= 7) {
          riskScore += 15;
          riskFactors.push('Recent discharge (<7 days)');
          recommendedActions.push('48-hour follow-up call');
        }

        // Random factors for demo (in real app, would use real data)
        if (Math.random() > 0.7) {
          riskScore += 10;
          riskFactors.push('Medication compliance concerns');
          recommendedActions.push('Medication review');
        }

        if (Math.random() > 0.8) {
          riskScore += 15;
          riskFactors.push('Limited social support');
          recommendedActions.push('Social services referral');
        }

        // Determine risk level
        let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (riskScore >= 70) riskLevel = 'critical';
        else if (riskScore >= 50) riskLevel = 'high';
        else if (riskScore >= 30) riskLevel = 'medium';

        return {
          patientId: patient.id,
          patientName,
          riskScore: Math.min(riskScore, 100),
          riskLevel,
          riskFactors,
          lastDischarge: episode.end_date,
          daysFromDischarge,
          contactInfo: patient.phone || 'No phone on file',
          recommendedActions
        };
      }).filter(p => p.riskLevel !== 'low'); // Only show medium+ risk patients

      // Calculate trends
      const trends = {
        totalAtRisk: riskPatients.length,
        monthlyTrend: Math.floor(Math.random() * 20) - 10, // Demo data
        preventedReadmissions: Math.floor(Math.random() * 5) + 3 // Demo data
      };

      return {
        patients: riskPatients.sort((a, b) => b.riskScore - a.riskScore),
        trends
      };
    }
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      default: return 'outline';
    }
  };

  const handleContactPatient = (patientId: string) => {
    console.log(`Initiating contact with patient ${patientId}`);
    // In real app, would open contact interface or log the interaction
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Readmissions Prediction Assistant</h1>
          <Button variant="outline">
            Export Risk Report
          </Button>
        </div>
        <p className="text-muted-foreground">
          Identify and manage patients at high risk for 30-day readmissions
        </p>
      </div>

      {/* Trend Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-clinical">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Patients at Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              {riskData?.trends.totalAtRisk || 0}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-1" />
              Requiring attention
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-clinical">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              {riskData?.trends.monthlyTrend || 0}%
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              {(riskData?.trends.monthlyTrend || 0) >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1 text-destructive" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1 text-accent" />
              )}
              Change from last month
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-clinical">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Prevented This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent mb-1">
              {riskData?.trends.preventedReadmissions || 0}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4 mr-1" />
              Successful interventions
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High-Risk Patients List */}
      <Card className="shadow-clinical">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            High-Risk Patients
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading readmission risk data...</div>
          ) : (
            <div className="space-y-4">
              {riskData?.patients.map((patient) => (
                <div key={patient.patientId} className="border rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <User className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold text-foreground">{patient.patientName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Discharged {patient.daysFromDischarge} days ago
                        </p>
                      </div>
                    </div>
                    <Badge variant={getRiskColor(patient.riskLevel) as any}>
                      {patient.riskLevel} risk
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Risk Score</span>
                        <span>{patient.riskScore}%</span>
                      </div>
                      <Progress value={patient.riskScore} className="h-2" />
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Risk Factors:</h4>
                      <div className="flex flex-wrap gap-2">
                        {patient.riskFactors.map((factor, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Recommended Actions:</h4>
                      <div className="flex flex-wrap gap-2">
                        {patient.recommendedActions.map((action, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {patient.contactInfo}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleContactPatient(patient.patientId)}
                        >
                          Contact Patient
                        </Button>
                        <Button size="sm">
                          Create Intervention
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {riskData?.patients.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No high-risk patients identified at this time
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}