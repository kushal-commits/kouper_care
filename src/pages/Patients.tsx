import { useState, useMemo, useEffect } from "react";
import { PatientsList } from "@/components/PatientsList";
import { PatientsFilters } from "@/components/PatientsFilters";
import { AddPatientForm } from "@/components/AddPatientForm";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingDown, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { generateSamplePatients } from "@/utils/generateSamplePatients";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type Patient = Database['public']['Tables']['patients']['Row'] & {
  age: number;
  name: string;
  riskLevel: "critical" | "high" | "medium" | "low";
  adlScore: number;
  scoreChange: number;
  lastAssessment: string;
  nurse: {
    name: string;
    initials: string;
  };
  dischargeReason: string;
  interventions: {
    date: string;
    type: string;
    status: "active" | "completed" | "pending";
  }[];
  nextAssessment: string;
  nextAssessmentType: string;
}

export interface FilterState {
  search: string;
  riskLevel: string;
  nurse: string;
  adlCategory: string;
}

export default function Patients() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    riskLevel: "",
    nurse: "",
    adlCategory: ""
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingData, setGeneratingData] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleGenerateSampleData = async () => {
    setGeneratingData(true);
    try {
      toast("Generating 50 sample patients...", { duration: 2000 });
      await generateSamplePatients(50);
      toast.success("Successfully created 50 sample patients!");
      fetchPatients(); // Refresh the list
    } catch (error) {
      console.error('Error generating sample data:', error);
      toast.error("Failed to generate sample patients. Please try again.");
    } finally {
      setGeneratingData(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data: patientsData, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching patients:', error);
        return;
      }

      // Transform database data to match expected format
      const transformedPatients = patientsData?.map(patient => {
        const birthDate = new Date(patient.date_of_birth);
        const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (1000 * 3600 * 24 * 365));
        
        // Generate randomized ADL scores (1-4 scale)
        const adlScores = {
          bathing: Math.floor(Math.random() * 4) + 1,
          dressing: Math.floor(Math.random() * 4) + 1,
          grooming: Math.floor(Math.random() * 4) + 1,
          eating: Math.floor(Math.random() * 4) + 1,
          toileting: Math.floor(Math.random() * 4) + 1,
          transferring: Math.floor(Math.random() * 4) + 1,
          ambulation: Math.floor(Math.random() * 4) + 1,
          medication: Math.floor(Math.random() * 4) + 1
        };

        // Calculate total ADL score (out of 32 max)
        const totalAdlScore = Object.values(adlScores).reduce((sum, score) => sum + score, 0);

        // Determine risk level based on total score
        let riskLevel: "critical" | "high" | "medium" | "low";
        if (totalAdlScore <= 16) riskLevel = "critical";
        else if (totalAdlScore <= 20) riskLevel = "high"; 
        else if (totalAdlScore <= 26) riskLevel = "medium";
        else riskLevel = "low";

        // Generate random score change (-5 to +3)
        const scoreChange = Math.floor(Math.random() * 9) - 5;

        // Array of realistic nurses
        const nurses = [
          { name: "Sarah Johnson", initials: "SJ" },
          { name: "Mike Chen", initials: "MC" },
          { name: "Lisa Rodriguez", initials: "LR" },
          { name: "David Kim", initials: "DK" },
          { name: "Emma Wilson", initials: "EW" },
          { name: "Carlos Martinez", initials: "CM" },
          { name: "Anna Thompson", initials: "AT" },
          { name: "James Brown", initials: "JB" }
        ];

        // Assign random nurse
        const assignedNurse = nurses[Math.floor(Math.random() * nurses.length)];

        // Generate realistic interventions based on diagnosis
        const getInterventions = (diagnosis: string) => {
          const interventionTypes = {
            "Type 2 Diabetes Mellitus": ["Blood Sugar Monitoring", "Diabetic Foot Care", "Nutrition Education"],
            "Congestive Heart Failure": ["Cardiac Monitoring", "Medication Management", "Fluid Restriction"],
            "COPD Exacerbation": ["Respiratory Therapy", "Oxygen Therapy", "Breathing Exercises"],
            "Stroke with Hemiparesis": ["Physical Therapy", "Speech Therapy", "Occupational Therapy"],
            "Post-Surgical Recovery": ["Wound Care", "Pain Management", "Mobility Training"],
            "Chronic Wound Care": ["Wound Dressing", "Infection Prevention", "Nutrition Support"]
          };

          const defaultInterventions = ["Assessment", "Medication Review", "Care Plan Update"];
          const specificInterventions = interventionTypes[diagnosis] || defaultInterventions;
          
          // Return 1-3 random interventions
          const numInterventions = Math.floor(Math.random() * 3) + 1;
          const selectedInterventions = [];
          
          for (let i = 0; i < numInterventions; i++) {
            const intervention = specificInterventions[Math.floor(Math.random() * specificInterventions.length)];
            const statuses = ["active", "completed", "pending"] as const;
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            // Generate dates within last 14 days
            const daysAgo = Math.floor(Math.random() * 14);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            
            selectedInterventions.push({
              date: date.toISOString().split('T')[0],
              type: intervention,
              status: status
            });
          }
          
          return selectedInterventions;
        };

        // Generate assessment dates and types
        const lastAssessmentDate = new Date();
        lastAssessmentDate.setDate(lastAssessmentDate.getDate() - Math.floor(Math.random() * 7));
        
        const nextAssessmentDate = new Date();
        nextAssessmentDate.setDate(nextAssessmentDate.getDate() + Math.floor(Math.random() * 7) + 1);
        
        // Generate assessment type
        const assessmentTypes = ["PT", "OT", "SLP", "Nursing", "MD", "RN"];
        const nextAssessmentType = assessmentTypes[Math.floor(Math.random() * assessmentTypes.length)];
        
        return {
          ...patient,
          name: `${patient.first_name} ${patient.last_name}`,
          age,
          riskLevel,
          adlScore: totalAdlScore,
          scoreChange,
          lastAssessment: lastAssessmentDate.toISOString().split('T')[0],
          nurse: assignedNurse,
          dischargeReason: patient.primary_diagnosis || "Care management",
          interventions: getInterventions(patient.primary_diagnosis || ""),
          nextAssessment: nextAssessmentDate.toISOString().split('T')[0],
          nextAssessmentType: nextAssessmentType
        };
      }) || [];

      setPatients(transformedPatients);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                           patient.mrn.toLowerCase().includes(filters.search.toLowerCase());
      const matchesRisk = !filters.riskLevel || patient.riskLevel === filters.riskLevel;
      const matchesNurse = !filters.nurse || patient.nurse.name.toLowerCase().includes(filters.nurse.toLowerCase());
      
      return matchesSearch && matchesRisk && matchesNurse;
    });
  }, [patients, filters]);

  const stats = useMemo(() => {
    const total = filteredPatients.length;
    const declining = filteredPatients.filter(p => p.scoreChange < 0).length;
    const pendingAssessments = filteredPatients.filter(p => 
      new Date(p.nextAssessment) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    ).length;
    const activeInterventions = filteredPatients.reduce((acc, p) => 
      acc + p.interventions.filter(i => i.status === "active").length, 0
    );

    return { total, declining, pendingAssessments, activeInterventions };
  }, [filteredPatients]);

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-l text-foreground">Patients</h1>
          <p className="text-muted-foreground">
            Monitor patient ADL scores, interventions, and care progress
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleGenerateSampleData}
            disabled={generatingData}
            variant="outline"
          >
            {generatingData ? "Generating..." : "Generate Sample Data"}
          </Button>
          <AddPatientForm onPatientAdded={fetchPatients} />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-clinical">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-clinical">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-destructive">{stats.declining}</p>
                <p className="text-sm text-muted-foreground">Score Declining</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-clinical">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.pendingAssessments}</p>
                <p className="text-sm text-muted-foreground">Pending Assessments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-clinical">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-primary">{stats.activeInterventions}</p>
                <p className="text-sm text-muted-foreground">Active Interventions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <PatientsFilters 
        filters={filters}
        onFiltersChange={setFilters}
        filteredCount={filteredPatients.length}
        totalCount={patients.length}
      />

      {/* Patients List */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Loading patients...</div>
        </div>
      ) : (
        <PatientsList patients={filteredPatients} />
      )}
    </div>
  );
}