import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  User, 
  Clock, 
  Filter, 
  Search, 
  Plus,
  AlertTriangle,
  ExternalLink,
  Tag
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ClinicianNotesProps {
  patientId: string;
}

interface ClinicianNote {
  id: string;
  title: string;
  content: string;
  discipline: string;
  priority: string;
  tags: string[];
  created_at: string;
  author: {
    full_name: string;
    discipline: string;
  };
  attachments: any[];
  linked_data_sources: string[];
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

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  normal: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-amber-100 text-amber-800 border-amber-200',
  urgent: 'bg-red-100 text-red-800 border-red-200',
};

const formatDiscipline = (discipline: string) => {
  return discipline.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export function ClinicianNotes({ patientId }: ClinicianNotesProps) {
  const [selectedNote, setSelectedNote] = useState<ClinicianNote | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Fetch clinician notes from Epic imports and OASIS assessments
  const { data: notes, isLoading } = useQuery({
    queryKey: ['epic-notes', patientId, searchTerm, disciplineFilter, priorityFilter],
    queryFn: async () => {
      // Fetch clinical notes
      let notesQuery = supabase
        .from('clinician_notes')
        .select(`
          id,
          title,
          content,
          discipline,
          priority,
          tags,
          created_at,
          attachments,
          linked_data_sources,
          author:profiles (
            full_name,
            discipline
          )
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (disciplineFilter !== 'all') {
        notesQuery = notesQuery.eq('discipline', disciplineFilter);
      }

      if (priorityFilter !== 'all') {
        notesQuery = notesQuery.eq('priority', priorityFilter);
      }

      const { data: clinicalNotes, error: notesError } = await notesQuery;
      if (notesError) throw notesError;

      // If no clinical notes, fetch OASIS assessments as previous notes
      let combinedData = clinicalNotes as ClinicianNote[];
      
      if (!clinicalNotes || clinicalNotes.length === 0) {
        const { data: assessments, error: assessmentsError } = await supabase
          .from('assessments')
          .select(`
            id,
            assessment_date,
            assessment_type,
            discipline,
            risk_level,
            notes,
            total_adl_score,
            bathing_score,
            dressing_upper_score,
            dressing_lower_score,
            grooming_score,
            eating_score,
            toileting_score,
            transferring_score,
            ambulation_score,
            medication_mgmt_score,
            created_at,
            assessor:profiles (
              full_name,
              discipline
            )
          `)
          .eq('patient_id', patientId)
          .order('assessment_date', { ascending: false });

        if (assessmentsError) throw assessmentsError;

        // Transform assessments into note format
        combinedData = assessments?.map(assessment => ({
          id: assessment.id,
          title: `OASIS ${assessment.assessment_type.replace('_', ' ').toUpperCase()} Assessment`,
          content: `${assessment.notes || 'No notes provided'}\n\nADL Scores:\n- Bathing: ${assessment.bathing_score}\n- Dressing Upper: ${assessment.dressing_upper_score}\n- Dressing Lower: ${assessment.dressing_lower_score}\n- Grooming: ${assessment.grooming_score}\n- Eating: ${assessment.eating_score}\n- Toileting: ${assessment.toileting_score}\n- Transferring: ${assessment.transferring_score}\n- Ambulation: ${assessment.ambulation_score}\n- Medication Management: ${assessment.medication_mgmt_score}\n\nTotal ADL Score: ${assessment.total_adl_score}`,
          discipline: assessment.discipline || 'nursing',
          priority: assessment.risk_level === 'high' ? 'high' : assessment.risk_level === 'low' ? 'low' : 'normal',
          tags: ['OASIS', assessment.assessment_type, `Risk: ${assessment.risk_level}`],
          created_at: assessment.created_at,
          author: {
            full_name: assessment.assessor?.full_name || 'System Generated',
            discipline: assessment.assessor?.discipline || assessment.discipline || 'nursing'
          },
          attachments: [],
          linked_data_sources: []
        })) || [];
      }

      // Filter by discipline and priority
      if (disciplineFilter !== 'all') {
        combinedData = combinedData.filter(note => note.discipline === disciplineFilter);
      }

      if (priorityFilter !== 'all') {
        combinedData = combinedData.filter(note => note.priority === priorityFilter);
      }

      // Filter by search term on the client side
      if (searchTerm) {
        combinedData = combinedData.filter(note => 
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      return combinedData;
    },
  });

  const groupedNotes = notes?.reduce((groups, note) => {
    const discipline = note.discipline;
    if (!groups[discipline]) {
      groups[discipline] = [];
    }
    groups[discipline].push(note);
    return groups;
  }, {} as Record<string, ClinicianNote[]>) || {};

  const getPreview = (content: string, maxLength = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Clinical Notes from Epic</h3>
          <p className="text-sm text-muted-foreground">Imported clinical documentation and assessments</p>
        </div>
        <Badge className="bg-green-50 text-green-700 border-green-200">
          <ExternalLink className="h-3 w-3 mr-1" />
          Synced from Epic
        </Badge>
      </div>

      {/* Filters */}
      <Card className="shadow-clinical">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes, content, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
                <SelectItem value="social_work">Social Work</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notes Content */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading notes...</div>
        </div>
      ) : !notes || notes.length === 0 ? (
        <Card className="shadow-clinical">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Epic Notes Available</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || disciplineFilter !== 'all' || priorityFilter !== 'all' 
                ? 'No notes match your current filters.'
                : 'No clinical notes have been imported from Epic for this patient yet.'
              }
            </p>
            <div className="text-xs text-muted-foreground">
              Notes are automatically synced from Epic during nightly data refresh
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotes).map(([discipline, disciplineNotes]) => (
            <Card key={discipline} className="shadow-clinical">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Badge className={disciplineColors[discipline as keyof typeof disciplineColors] || disciplineColors.nursing}>
                    {formatDiscipline(discipline)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {disciplineNotes.length} note{disciplineNotes.length !== 1 ? 's' : ''}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {disciplineNotes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4 hover:shadow-clinical transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold">{note.title}</h4>
                            <Badge className={priorityColors[note.priority as keyof typeof priorityColors]}>
                              {note.priority === 'urgent' && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {note.priority.toUpperCase()}
                            </Badge>
                          </div>
                          
                           <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                             <div className="flex items-center space-x-1">
                               <ExternalLink className="h-3 w-3" />
                               <span>Epic Import</span>
                             </div>
                             <div className="flex items-center space-x-1">
                               <User className="h-3 w-3" />
                               <span>{note.author.full_name}</span>
                             </div>
                             <div className="flex items-center space-x-1">
                               <Clock className="h-3 w-3" />
                               <span>{new Date(note.created_at).toLocaleDateString()}</span>
                             </div>
                             {note.linked_data_sources.length > 0 && (
                               <div className="flex items-center space-x-1">
                                 <ExternalLink className="h-3 w-3" />
                                 <span>{note.linked_data_sources.length} linked data point{note.linked_data_sources.length !== 1 ? 's' : ''}</span>
                               </div>
                             )}
                           </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {getPreview(note.content)}
                          </p>
                          
                          {note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {note.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedNote(note)}>
                              <FileText className="h-4 w-4 mr-2" />
                              View Full Note
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <span>{note.title}</span>
                              </DialogTitle>
                            </DialogHeader>
                            
                            <ScrollArea className="max-h-[60vh] pr-4">
                              <div className="space-y-4">
                                {/* Note metadata */}
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <User className="h-4 w-4" />
                                    <span>{note.author.full_name}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{new Date(note.created_at).toLocaleString()}</span>
                                  </div>
                                  <Badge className={disciplineColors[note.discipline as keyof typeof disciplineColors]}>
                                    {formatDiscipline(note.discipline)}
                                  </Badge>
                                  <Badge className={priorityColors[note.priority as keyof typeof priorityColors]}>
                                    {note.priority === 'urgent' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                    {note.priority.toUpperCase()}
                                  </Badge>
                                </div>
                                
                                <Separator />
                                
                                {/* Note content */}
                                <div className="prose prose-sm max-w-none">
                                  <p className="whitespace-pre-wrap">{note.content}</p>
                                </div>
                                
                                {/* Tags */}
                                {note.tags.length > 0 && (
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {note.tags.map((tag) => (
                                        <Badge key={tag} variant="outline">
                                          <Tag className="h-3 w-3 mr-1" />
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Linked data sources */}
                                {note.linked_data_sources.length > 0 && (
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Linked Data Points</h4>
                                    <p className="text-sm text-muted-foreground">
                                      This note is linked to {note.linked_data_sources.length} data point{note.linked_data_sources.length !== 1 ? 's' : ''} in the patient record.
                                    </p>
                                  </div>
                                )}
                                
                                {/* Attachments */}
                                {note.attachments.length > 0 && (
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm">Attachments</h4>
                                    <div className="space-y-2">
                                      {note.attachments.map((attachment, index) => (
                                        <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                                          <FileText className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">{attachment.name || `Attachment ${index + 1}`}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}