import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertTriangle, FileText, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DischargeTask {
  id: string;
  title: string;
  description: string;
  category: 'documentation' | 'assessment' | 'communication' | 'medication';
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface PatientDischarge {
  patientId: string;
  patientName: string;
  episodeId: string;
  expectedDischarge: string;
  tasks: DischargeTask[];
  completionRate: number;
  status: 'on-track' | 'at-risk' | 'overdue';
}

export default function DischargeAssistantTool() {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const { data: dischargeData, isLoading } = useQuery({
    queryKey: ['discharge-assistance'],
    queryFn: async (): Promise<PatientDischarge[]> => {
      // Get active episodes nearing discharge (within 7 days)
      const { data: episodes } = await supabase
        .from('episodes')
        .select(`
          *,
          patients!inner(id, first_name, last_name)
        `)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString().split('T')[0])
        .lte('end_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (!episodes) return [];

      // Generate discharge tasks for each patient
      return episodes.map(episode => {
        const patientName = `${episode.patients.first_name} ${episode.patients.last_name}`;
        
        const baseTasks: Omit<DischargeTask, 'id'>[] = [
          {
            title: "Final Assessment Documentation",
            description: "Complete final ADL and outcome assessments",
            category: 'assessment',
            completed: Math.random() > 0.4,
            priority: 'high'
          },
          {
            title: "Care Plan Reconciliation",
            description: "Review and update care plan based on outcomes",
            category: 'documentation',
            completed: Math.random() > 0.5,
            priority: 'medium'
          },
          {
            title: "Medication Review",
            description: "Verify medication reconciliation and discharge instructions",
            category: 'medication',
            completed: Math.random() > 0.3,
            priority: 'critical'
          },
          {
            title: "Physician Communication",
            description: "Send discharge summary to primary physician",
            category: 'communication',
            completed: Math.random() > 0.6,
            priority: 'high'
          },
          {
            title: "DME/Supply Coordination",
            description: "Arrange for ongoing medical equipment needs",
            category: 'documentation',
            completed: Math.random() > 0.7,
            priority: 'medium'
          },
          {
            title: "Follow-up Appointments",
            description: "Schedule necessary follow-up care appointments",
            category: 'communication',
            completed: Math.random() > 0.5,
            priority: 'medium'
          }
        ];

        const tasks: DischargeTask[] = baseTasks.map((task, index) => ({
          ...task,
          id: `${episode.id}-task-${index}`,
          dueDate: episode.end_date
        }));

        const completedTasks = tasks.filter(t => t.completed).length;
        const completionRate = (completedTasks / tasks.length) * 100;
        
        let status: 'on-track' | 'at-risk' | 'overdue' = 'on-track';
        const daysUntilDischarge = Math.ceil((new Date(episode.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        if (completionRate < 50 && daysUntilDischarge <= 2) {
          status = 'overdue';
        } else if (completionRate < 70 && daysUntilDischarge <= 3) {
          status = 'at-risk';
        }

        return {
          patientId: episode.patient_id,
          patientName,
          episodeId: episode.id,
          expectedDischarge: episode.end_date,
          tasks,
          completionRate,
          status
        };
      });
    }
  });

  const handleTaskToggle = (patientId: string, taskId: string) => {
    // In a real app, this would update the database
    console.log(`Toggle task ${taskId} for patient ${patientId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'destructive';
      case 'at-risk': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Discharge Documentation Assistant</h1>
          <Button variant="outline">
            Generate Report
          </Button>
        </div>
        <p className="text-muted-foreground">
          Manage discharge documentation and ensure completion before patient discharge
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading discharge data...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient List */}
          <Card className="shadow-clinical">
            <CardHeader>
              <CardTitle>Patients Nearing Discharge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dischargeData?.map((patient) => (
                <div 
                  key={patient.patientId}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedPatient === patient.patientId ? 'border-primary bg-muted/50' : ''
                  }`}
                  onClick={() => setSelectedPatient(patient.patientId)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{patient.patientName}</span>
                    </div>
                    <Badge variant={getStatusColor(patient.status) as any}>
                      {patient.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Discharge: {new Date(patient.expectedDischarge).toLocaleDateString()}</span>
                      <span>{Math.round(patient.completionRate)}% complete</span>
                    </div>
                    <Progress value={patient.completionRate} className="h-2" />
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    {patient.tasks.filter(t => t.completed).length} of {patient.tasks.length} tasks completed
                  </div>
                </div>
              ))}
              
              {dischargeData?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No patients scheduled for discharge in the next 7 days
                </div>
              )}
            </CardContent>
          </Card>

          {/* Task Details */}
          <Card className="shadow-clinical">
            <CardHeader>
              <CardTitle>Discharge Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPatient ? (
                <div className="space-y-4">
                  {dischargeData
                    ?.find(p => p.patientId === selectedPatient)
                    ?.tasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleTaskToggle(selectedPatient, task.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                                {task.priority}
                              </Badge>
                              {task.completed && <CheckCircle className="h-4 w-4 text-accent" />}
                            </div>
                          </div>
                          <p className={`text-sm ${task.completed ? 'text-muted-foreground' : 'text-foreground'}`}>
                            {task.description}
                          </p>
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a patient to view discharge tasks
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}