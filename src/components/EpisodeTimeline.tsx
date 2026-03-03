import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Activity, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  TrendingUp,
  TrendingDown,
  User,
  Stethoscope,
  Target
} from "lucide-react";

interface TimelineEvent {
  id: string;
  date: string;
  type: 'episode_start' | 'pt_visit' | 'ot_visit' | 'aide_visit' | 'alert' | 'resolution' | 'intervention' | 'assessment';
  title: string;
  description: string;
  metadata?: {
    assessor?: string;
    score?: number;
    previousScore?: number;
    severity?: 'critical' | 'high' | 'medium' | 'low';
    keywords?: string[];
  };
}

interface EpisodeTimelineProps {
  patientId: string;
  episodeId?: string;
}

// Mock data - in real implementation, this would come from various tables
const getMockTimelineEvents = (): TimelineEvent[] => [
  {
    id: "1",
    date: "2024-12-15",
    type: "episode_start",
    title: "Episode Entry - Baseline OASIS",
    description: "Episode initiated with comprehensive baseline assessment",
    metadata: {
      assessor: "Sarah Johnson, RN",
      score: 19
    }
  },
  {
    id: "2", 
    date: "2024-12-18",
    type: "pt_visit",
    title: "PT Visit - Mobility Assessment",
    description: "Physical therapy evaluation and mobility training session",
    metadata: {
      assessor: "Mike Chen, PT",
      score: 3,
      previousScore: 4,
      keywords: ["mobility", "balance"]
    }
  },
  {
    id: "3",
    date: "2024-12-20",
    type: "ot_visit", 
    title: "OT Visit - Bathing Assessment",
    description: "Patient requires moderate assistance with bathing activities",
    metadata: {
      assessor: "Lisa Park, OT",
      score: 2,
      previousScore: 3,
      keywords: ["bathing", "safety"]
    }
  },
  {
    id: "4",
    date: "2024-12-22",
    type: "alert",
    title: "Alert: Bathing Score Declined",
    description: "System flagged declining bathing independence from keyword analysis",
    metadata: {
      severity: "high",
      keywords: ["bathing", "assistance", "safety"]
    }
  },
  {
    id: "5",
    date: "2024-12-25",
    type: "aide_visit",
    title: "Home Health Aide Check-in",
    description: "Routine ADL assistance and safety monitoring",
    metadata: {
      assessor: "Maria Rodriguez, HHA"
    }
  },
  {
    id: "6",
    date: "2024-12-28",
    type: "intervention",
    title: "OT Evaluation Scheduled",
    description: "Occupational therapy evaluation pending to address bathing concerns",
    metadata: {
      severity: "medium"
    }
  },
  {
    id: "7",
    date: "2025-01-02",
    type: "resolution",
    title: "Alert Resolved: OT Intervention Complete",
    description: "Occupational therapy intervention completed, bathing score improved",
    metadata: {
      assessor: "Lisa Park, OT",
      score: 3,
      previousScore: 2
    }
  }
];

const getEventIcon = (type: string) => {
  switch (type) {
    case 'episode_start': return <Calendar className="h-5 w-5" />;
    case 'pt_visit': return <Activity className="h-5 w-5" />;
    case 'ot_visit': return <UserCheck className="h-5 w-5" />;
    case 'aide_visit': return <User className="h-5 w-5" />;
    case 'alert': return <AlertTriangle className="h-5 w-5" />;
    case 'resolution': return <CheckCircle className="h-5 w-5" />;
    case 'intervention': return <Target className="h-5 w-5" />;
    case 'assessment': return <Stethoscope className="h-5 w-5" />;
    default: return <FileText className="h-5 w-5" />;
  }
};

const getEventColor = (type: string, severity?: string) => {
  switch (type) {
    case 'episode_start': return 'bg-primary/10 text-primary';
    case 'pt_visit': return 'bg-green-100 text-green-800';
    case 'ot_visit': return 'bg-purple-100 text-purple-800';
    case 'aide_visit': return 'bg-blue-100 text-blue-800';
    case 'alert': 
      return severity === 'critical' ? 'bg-destructive/10 text-destructive' : 
             severity === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-yellow-100 text-yellow-800';
    case 'resolution': return 'bg-accent/10 text-accent';
    case 'intervention': return 'bg-orange-100 text-orange-800';
    case 'assessment': return 'bg-cyan-100 text-cyan-800';
    default: return 'bg-muted/10 text-muted-foreground';
  }
};

const getScoreTrend = (current?: number, previous?: number) => {
  if (!current || !previous) return null;
  
  if (current > previous) {
    return <TrendingUp className="h-4 w-4 text-accent inline ml-2" />;
  } else if (current < previous) {
    return <TrendingDown className="h-4 w-4 text-destructive inline ml-2" />;
  }
  return null;
};

export function EpisodeTimeline({ patientId, episodeId }: EpisodeTimelineProps) {
  const events = getMockTimelineEvents().reverse(); // Show latest events first

  return (
    <Card className="shadow-clinical">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-primary" />
          <span>Episode Timeline</span>
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Chronological care narrative through the 30-day episode
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline Rail */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
          
          <div className="space-y-6">
            {events.map((event, index) => (
              <div key={event.id} className="relative flex items-start space-x-4">
                {/* Event Icon */}
                <div className={`
                  relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-2 border-background
                  ${getEventColor(event.type, event.metadata?.severity)}
                `}>
                  {getEventIcon(event.type)}
                </div>
                
                {/* Event Content */}
                <div className="flex-1 min-w-0 pb-6">
                  <div className="bg-card border rounded-lg p-4 shadow-sm">
                    {/* Event Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                          {event.metadata?.assessor && (
                            <>
                              <span>•</span>
                              <span>{event.metadata.assessor}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {event.metadata?.severity && (
                        <Badge className={
                          event.metadata.severity === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                          event.metadata.severity === 'high' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          event.metadata.severity === 'medium' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-accent/10 text-accent border-accent/20'
                        }>
                          {event.metadata.severity.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Event Description */}
                    <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                    
                    {/* Score Information */}
                    {(event.metadata?.score || event.metadata?.previousScore) && (
                      <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-3">
                        <div className="flex items-center space-x-4">
                          {event.metadata.previousScore && event.metadata.score && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">Score:</span>
                              <span className="font-medium">
                                {event.metadata.previousScore} → {event.metadata.score}
                              </span>
                              {getScoreTrend(event.metadata.score, event.metadata.previousScore)}
                            </div>
                          )}
                          {event.metadata.score && !event.metadata.previousScore && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">Score:</span>
                              <span className="font-medium">{event.metadata.score}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Keywords */}
                    {event.metadata?.keywords && event.metadata.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className="text-xs text-muted-foreground mr-2">Keywords:</span>
                        {event.metadata.keywords.map((keyword, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Button size="sm" variant="ghost" className="h-8">
                        <FileText className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      {event.type === 'alert' && (
                        <Button size="sm" variant="ghost" className="h-8">
                          <Target className="h-3 w-3 mr-1" />
                          Create Intervention
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}