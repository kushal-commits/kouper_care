import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  Plus, 
  Eye,
  Filter,
  Droplets,
  Activity,
  Pill,
  Timer,
  Star,
  X
} from "lucide-react";

interface MidEpisodeForm {
  id: string;
  name: string;
  icon: any;
  latestScore?: number | string;
  maxScore?: number;
  unit?: string;
  lastCompleted?: string;
  trend?: 'up' | 'down' | 'stable';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  formType: string;
}

interface MidEpisodeAssessmentsProps {
  patientId: string;
}

// Mock data - in a real implementation, this would come from the database
const getMockMidEpisodeForms = (): MidEpisodeForm[] => [
  {
    id: "1",
    name: "Therapy Five Star Care Form",
    icon: Star,
    latestScore: 4,
    maxScore: 5,
    unit: "stars",
    lastCompleted: "2025-01-15",
    trend: "up",
    riskLevel: "low",
    formType: "therapy"
  },
  {
    id: "2", 
    name: "Bathing Smart Form",
    icon: Droplets,
    latestScore: 3,
    maxScore: 5,
    lastCompleted: "2025-01-14",
    trend: "stable",
    riskLevel: "medium",
    formType: "adl"
  },
  {
    id: "3",
    name: "Mobility Smart Form", 
    icon: Activity,
    latestScore: 2,
    maxScore: 5,
    lastCompleted: "2025-01-13",
    trend: "down",
    riskLevel: "high",
    formType: "mobility"
  },
  {
    id: "4",
    name: "Timed Up and Go",
    icon: Timer,
    latestScore: 12,
    unit: "seconds",
    lastCompleted: "2025-01-12",
    trend: "down", // Improvement (lower time is better)
    riskLevel: "medium",
    formType: "mobility"
  },
  {
    id: "5",
    name: "Medication Management Smart Form",
    icon: Pill,
    latestScore: 4,
    maxScore: 5,
    lastCompleted: "2025-01-11",
    trend: "up",
    riskLevel: "low",
    formType: "medication"
  }
];

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
    case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
    default: return <Minus className="h-4 w-4 text-gray-600" />;
  }
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

const getProgressValue = (form: MidEpisodeForm): number => {
  if (form.name === "Timed Up and Go") {
    // For Timed Up and Go, lower is better. Normal is <10s, concerning is >20s
    const time = form.latestScore as number;
    if (time <= 10) return 100; // Excellent
    if (time <= 15) return 75;  // Good
    if (time <= 20) return 50;  // Fair
    return 25; // Poor
  }
  
  if (form.maxScore) {
    return ((form.latestScore as number) / form.maxScore) * 100;
  }
  
  return 0;
};

export function MidEpisodeAssessments({ patientId }: MidEpisodeAssessmentsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [formTypeFilter, setFormTypeFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("30days");
  const [keywordFilters, setKeywordFilters] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  
  const forms = getMockMidEpisodeForms();
  
  const filteredForms = forms.filter(form => {
    if (formTypeFilter !== "all" && form.formType !== formTypeFilter) {
      return false;
    }
    
    // Date range filtering would be implemented here
    // For now, we'll show all forms
    
    return true;
  }).filter(form => {
    // If keywords are provided, filter by keywords
    if (keywordFilters.length > 0) {
      return keywordFilters.some(keyword => 
        form.name.toLowerCase().includes(keyword.toLowerCase()) ||
        form.formType.toLowerCase().includes(keyword.toLowerCase())
      );
    }
    return true;
  });

  const formatScore = (form: MidEpisodeForm): string => {
    if (form.unit) {
      return `${form.latestScore} ${form.unit}`;
    }
    if (form.maxScore) {
      return `${form.latestScore}/${form.maxScore}`;
    }
    return `${form.latestScore}`;
  };

  return (
    <Card className="shadow-clinical mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:bg-accent/5 rounded-lg p-2 -m-2">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>Mid-Episode Assessments</span>
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Common assessment forms with latest scores and trends
                </p>
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Select value={formTypeFilter} onValueChange={setFormTypeFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by form type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Form Types</SelectItem>
                  <SelectItem value="therapy">Therapy</SelectItem>
                  <SelectItem value="adl">ADL Forms</SelectItem>
                  <SelectItem value="mobility">Mobility</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger className="w-48">
                  <Clock className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              {/* Keyword filters */}
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add keyword filter..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && keywordInput.trim()) {
                      setKeywordFilters([...keywordFilters, keywordInput.trim()]);
                      setKeywordInput("");
                    }
                  }}
                  className="w-48"
                />
                {keywordFilters.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {keywordFilters.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setKeywordFilters(keywordFilters.filter((_, i) => i !== index))}
                          className="h-3 w-3 p-0 ml-1 hover:text-destructive"
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Forms Grid */}
            {filteredForms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredForms.map((form) => {
                  const IconComponent = form.icon;
                  return (
                    <div key={form.id} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-all">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{form.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`${getRiskBadgeColor(form.riskLevel)} text-xs`}>
                                {form.riskLevel?.toUpperCase()}
                              </Badge>
                              {getTrendIcon(form.trend)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Score and Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Latest Score</span>
                          <span className="font-bold text-lg">{formatScore(form)}</span>
                        </div>
                        
                        {form.maxScore && (
                          <Progress 
                            value={getProgressValue(form)} 
                            className="h-2"
                          />
                        )}
                      </div>

                      {/* Date and Actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Last: {new Date(form.lastCompleted).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="ghost" className="h-8 px-2">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 px-2">
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Mid-Episode Forms Found</h3>
                <p className="text-muted-foreground mb-4">
                  No assessment forms match the selected filters.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Assessment Form
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}