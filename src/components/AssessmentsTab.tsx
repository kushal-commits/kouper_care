import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Plus, User, Clock, Filter } from "lucide-react";
import { EvidencePopup } from "./EvidencePopup";
import { MidEpisodeAssessments } from "./MidEpisodeAssessments";

interface Assessment {
  id: string;
  assessment_type: string;
  assessment_date: string;
  discipline: string;
  risk_level: string;
  total_adl_score: number;
  bathing_score: number;
  dressing_upper_score: number;
  dressing_lower_score: number;
  grooming_score: number;
  eating_score: number;
  toileting_score: number;
  transferring_score: number;
  ambulation_score: number;
  medication_mgmt_score: number;
  notes: string;
  assessor?: {
    full_name: string;
    discipline: string;
  };
}

interface AssessmentsTabProps {
  assessments: Assessment[];
  patientId?: string;
}

const disciplineColors = {
  nursing: 'bg-blue-100 text-blue-800 border-blue-200',
  physical_therapy: 'bg-green-100 text-green-800 border-green-200',
  occupational_therapy: 'bg-purple-100 text-purple-800 border-purple-200',
  speech_therapy: 'bg-orange-100 text-orange-800 border-orange-200',
  case_management: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  clinical_coordination: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  social_work: 'bg-pink-100 text-pink-800 border-pink-200',
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

const formatDiscipline = (discipline: string) => {
  return discipline.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export function AssessmentsTab({ assessments, patientId }: AssessmentsTabProps) {
  const [disciplineFilter, setDisciplineFilter] = useState<string>("all");

  // Ensure assessments is always an array
  const safeAssessments = assessments || [];

  // Filter assessments by discipline
  const filteredAssessments = disciplineFilter === "all" 
    ? safeAssessments 
    : safeAssessments.filter(assessment => assessment.discipline === disciplineFilter);

  // Group assessments by discipline
  const groupedAssessments = filteredAssessments.reduce((groups, assessment) => {
    const discipline = assessment.discipline || 'nursing';
    if (!groups[discipline]) {
      groups[discipline] = [];
    }
    groups[discipline].push(assessment);
    return groups;
  }, {} as Record<string, Assessment[]>);

  const adlFields = [
    { key: 'bathing_score', label: 'Bathing' },
    { key: 'dressing_upper_score', label: 'Dressing Upper' },
    { key: 'dressing_lower_score', label: 'Dressing Lower' },
    { key: 'grooming_score', label: 'Grooming' },
    { key: 'eating_score', label: 'Eating' },
    { key: 'toileting_score', label: 'Toileting' },
    { key: 'transferring_score', label: 'Transferring' },
    { key: 'ambulation_score', label: 'Ambulation' },
    { key: 'medication_mgmt_score', label: 'Medication Management' },
  ];

  return (
    <div className="space-y-6">
      {/* Mid-Episode Assessments Panel */}
      {patientId && <MidEpisodeAssessments patientId={patientId} />}
      
      {/* Main Assessment History */}
      <Card className="shadow-clinical">
        <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Assessment History</span>
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Patient assessment records grouped by discipline
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by discipline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Disciplines</SelectItem>
                <SelectItem value="nursing">Nursing</SelectItem>
                <SelectItem value="physical_therapy">Physical Therapy</SelectItem>
                <SelectItem value="occupational_therapy">Occupational Therapy</SelectItem>
                <SelectItem value="speech_therapy">Speech Therapy</SelectItem>
                <SelectItem value="case_management">Case Management</SelectItem>
                <SelectItem value="clinical_coordination">Clinical Coordination</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAssessments && filteredAssessments.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedAssessments).map(([discipline, disciplineAssessments]) => (
              <div key={discipline} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Badge className={disciplineColors[discipline as keyof typeof disciplineColors] || disciplineColors.nursing}>
                    {formatDiscipline(discipline)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {disciplineAssessments.length} assessment{disciplineAssessments.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {disciplineAssessments.map((assessment) => (
                  <div key={assessment.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">{assessment.assessment_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                        <Badge className={`${getRiskBadgeColor(assessment.risk_level)} text-xs`}>
                          {(assessment.risk_level || 'PENDING').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {new Date(assessment.assessment_date).toLocaleDateString()}
                        </div>
                        {assessment.assessor && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{assessment.assessor.full_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* ADL Scores */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total ADL Score</span>
                        <EvidencePopup
                          dataTable="assessments"
                          dataId={assessment.id}
                          value={assessment.total_adl_score}
                        >
                          <span className="text-lg font-bold text-primary cursor-pointer hover:underline">
                            {assessment.total_adl_score}
                          </span>
                        </EvidencePopup>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        {adlFields.map((field) => {
                          const score = assessment[field.key as keyof Assessment] as number;
                          if (score !== null && score !== undefined) {
                            return (
                              <div key={field.key} className="flex justify-between">
                                <span className="text-muted-foreground">{field.label}:</span>
                                <EvidencePopup
                                  dataTable="assessments"
                                  dataId={assessment.id}
                                  value={score}
                                >
                                  <span className="font-medium cursor-pointer hover:text-primary transition-colors">
                                    {score}
                                  </span>
                                </EvidencePopup>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>

                    {assessment.notes && (
                      <div className="border-t pt-3">
                        <p className="text-sm text-muted-foreground">
                          <strong>Notes:</strong> {assessment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Assessments Found</h3>
            <p className="text-muted-foreground mb-4">
              {disciplineFilter !== "all" 
                ? `No assessments found for ${formatDiscipline(disciplineFilter)}.`
                : "No assessment records found for this patient."
              }
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create First Assessment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}