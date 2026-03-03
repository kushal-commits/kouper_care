import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight
} from "lucide-react";

interface ADLComparison {
  adl: string;
  baseline: number;
  current: number;
  delta: number;
  status: 'improved' | 'stable' | 'declined';
  lastUpdated: string;
  keywordTriggers?: string[];
  interventionDocumented: boolean;
}

interface MidEpisodeAnalysisProps {
  patientId: string;
  episodeId?: string;
}

// Mock data - in real implementation, this would compare baseline OASIS with latest assessments
const getMockADLComparisons = (): ADLComparison[] => [
  {
    adl: "Bathing",
    baseline: 4,
    current: 2,
    delta: -2,
    status: "declined",
    lastUpdated: "2025-01-10",
    keywordTriggers: ["bathing", "assistance", "safety"],
    interventionDocumented: true
  },
  {
    adl: "Transferring", 
    baseline: 3,
    current: 2,
    delta: -1,
    status: "declined",
    lastUpdated: "2025-01-08",
    keywordTriggers: ["mobility", "transfer"],
    interventionDocumented: false
  },
  {
    adl: "Ambulation",
    baseline: 4,
    current: 2,
    delta: -2,
    status: "declined", 
    lastUpdated: "2025-01-09",
    keywordTriggers: ["walking", "mobility"],
    interventionDocumented: true
  },
  {
    adl: "Toileting",
    baseline: 3,
    current: 2,
    delta: -1,
    status: "declined",
    lastUpdated: "2025-01-07",
    keywordTriggers: ["toileting"],
    interventionDocumented: false
  },
  {
    adl: "Eating",
    baseline: 5,
    current: 4,
    delta: -1,
    status: "declined",
    lastUpdated: "2025-01-06",
    keywordTriggers: [],
    interventionDocumented: false
  },
  {
    adl: "Grooming",
    baseline: 3,
    current: 3,
    delta: 0,
    status: "stable",
    lastUpdated: "2025-01-05",
    keywordTriggers: [],
    interventionDocumented: false
  },
  {
    adl: "Dressing Upper",
    baseline: 2,
    current: 3,
    delta: 1,
    status: "improved",
    lastUpdated: "2025-01-04",
    keywordTriggers: [],
    interventionDocumented: true
  },
  {
    adl: "Dressing Lower",
    baseline: 3,
    current: 3,
    delta: 0,
    status: "stable",
    lastUpdated: "2025-01-03",
    keywordTriggers: [],
    interventionDocumented: false
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'improved': return <TrendingUp className="h-4 w-4 text-accent" />;
    case 'declined': return <TrendingDown className="h-4 w-4 text-destructive" />;
    default: return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'improved': return 'bg-accent/10 text-accent border-accent/20';
    case 'declined': return 'bg-destructive/10 text-destructive border-destructive/20';
    default: return 'bg-muted/50 text-muted-foreground border-muted';
  }
};

const getDeltaDisplay = (delta: number, baseline: number, current: number) => {
  const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
  return `${baseline} ${arrow} ${current}`;
};

export function MidEpisodeAnalysis({ patientId, episodeId }: MidEpisodeAnalysisProps) {
  const adlComparisons = getMockADLComparisons();
  
  // Calculate summary stats
  const totalADLs = adlComparisons.length;
  const improved = adlComparisons.filter(adl => adl.status === 'improved').length;
  const declined = adlComparisons.filter(adl => adl.status === 'declined').length;
  const stable = adlComparisons.filter(adl => adl.status === 'stable').length;
  const undocumentedInterventions = adlComparisons.filter(adl => adl.status === 'declined' && !adl.interventionDocumented).length;

  // Generate AI summary
  const generateSummary = () => {
    const declinedADLs = adlComparisons.filter(adl => adl.status === 'declined');
    if (declinedADLs.length === 0) {
      return "Patient showing stability across all ADL measures.";
    }
    
    const worstDeclines = declinedADLs
      .sort((a, b) => a.delta - b.delta)
      .slice(0, 2)
      .map(adl => adl.adl)
      .join(', ');
      
    return `${declinedADLs.length} ADLs declined since baseline. Greatest concerns: ${worstDeclines}. ${undocumentedInterventions} areas lack documented interventions.`;
  };

  return (
    <Card className="shadow-clinical">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart className="h-5 w-5 text-primary" />
          <span>Mid-Episode Analysis</span>
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Baseline vs current comparison with delta analysis
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-accent">{improved}</div>
              <div className="text-sm text-muted-foreground">Improved</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold">{stable}</div>
              <div className="text-sm text-muted-foreground">Stable</div>
            </div>
            <div className="text-center p-4 bg-destructive/5 rounded-lg">
              <div className="text-2xl font-bold text-destructive">{declined}</div>
              <div className="text-sm text-muted-foreground">Declined</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{undocumentedInterventions}</div>
              <div className="text-sm text-muted-foreground">Need Intervention</div>
            </div>
          </div>

          {/* AI Generated Summary */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center space-x-2">
              <BarChart className="h-4 w-4 text-primary" />
              <span>System Analysis</span>
            </h4>
            <p className="text-sm">{generateSummary()}</p>
          </div>

          {/* ADL Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adlComparisons.map((adl) => (
              <div key={adl.adl} className="border rounded-lg p-4 space-y-3">
                {/* ADL Header */}
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{adl.adl}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(adl.status)}>
                      {adl.status.toUpperCase()}
                    </Badge>
                    {getStatusIcon(adl.status)}
                  </div>
                </div>

                {/* Score Comparison */}
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-muted-foreground">{adl.baseline}</div>
                    <div className="text-xs text-muted-foreground">Baseline</div>
                  </div>
                  
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      adl.status === 'improved' ? 'text-accent' : 
                      adl.status === 'declined' ? 'text-destructive' : 
                      'text-foreground'
                    }`}>
                      {adl.current}
                    </div>
                    <div className="text-xs text-muted-foreground">Current</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      adl.delta > 0 ? 'text-accent' : 
                      adl.delta < 0 ? 'text-destructive' : 
                      'text-muted-foreground'
                    }`}>
                      {adl.delta > 0 ? '+' : ''}{adl.delta}
                    </div>
                    <div className="text-xs text-muted-foreground">Delta</div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Last updated: {new Date(adl.lastUpdated).toLocaleDateString()}</span>
                </div>

                {/* Keyword Triggers */}
                {adl.keywordTriggers && adl.keywordTriggers.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Triggered by keywords:</div>
                    <div className="flex flex-wrap gap-1">
                      {adl.keywordTriggers.map((keyword, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Intervention Status */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    {adl.interventionDocumented ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-accent" />
                        <span className="text-sm text-accent">Intervention documented</span>
                      </>
                    ) : adl.status === 'declined' ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-amber-600">No intervention documented</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">No intervention needed</span>
                      </>
                    )}
                  </div>
                  
                  {adl.status === 'declined' && !adl.interventionDocumented && (
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Create Intervention
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button variant="outline" size="sm">
              Jump to Episode Timeline
            </Button>
            <Button variant="outline" size="sm">
              View All Assessments
            </Button>
            <Button variant="outline" size="sm">
              Generate Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}