import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, TrendingUp, TrendingDown, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import { DashboardMetrics } from "./MetricsCalculator";
import { useNavigate } from "react-router-dom";

interface TaskSnapshotProps {
  metrics?: DashboardMetrics;
  onTaskClick?: (taskType: string) => void;
}

export function TaskSnapshot({ metrics, onTaskClick }: TaskSnapshotProps) {
  const navigate = useNavigate();
  
  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-destructive" />;
    if (change < 0) return <TrendingDown className="h-3 w-3 text-accent" />;
    return null;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleTrendClick = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    navigate(path);
  };

  const handleChipClick = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    navigate(path);
  };

  const renderTaskItem = (
    key: string,
    title: string,
    primaryValue: React.ReactNode,
    context: React.ReactNode,
    trend?: React.ReactNode,
    severity?: React.ReactNode,
    navigationPath?: string,
    trendPath?: string
  ) => (
    <div 
      key={key}
      className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 hover:shadow-sm cursor-pointer transition-all duration-200 border border-transparent hover:border-border focus-within:ring-2 focus-within:ring-primary/20"
      onClick={() => navigationPath && handleNavigation(navigationPath)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && navigationPath) {
          e.preventDefault();
          handleNavigation(navigationPath);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Navigate to ${title}`}
    >
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{title}</span>
          {trend && (
            <button 
              onClick={(e) => trendPath && handleTrendClick(e, trendPath)}
              className="hover:scale-110 transition-transform"
              aria-label="View trend details"
            >
              {trend}
            </button>
          )}
        </div>
        <div className="text-xs text-muted-foreground">{context}</div>
        {severity && <div className="flex gap-1">{severity}</div>}
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="text-lg font-semibold text-foreground">{primaryValue}</div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );

  return (
    <Card className="shadow-clinical">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Task & Alert Snapshot</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary hover:text-primary/80"
          onClick={() => navigate("/worklist")}
        >
          View All <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Critical Alerts with Severity Breakdown */}
        {renderTaskItem(
          "critical-alerts",
          "New Critical Alerts",
          metrics?.activeAlerts || 0,
          `${metrics?.alertsTrend.change > 0 ? '+' : ''}${metrics?.alertsTrend.change || 0} since yesterday`,
          getTrendIcon(metrics?.alertsTrend.change || 0),
          <div className="flex gap-1">
            {(metrics?.alertsSeverity.critical || 0) > 0 && (
              <button
                onClick={(e) => handleChipClick(e, "/alerts?severity=critical&range=last_24h")}
                className="hover:scale-105 transition-transform"
              >
                <Badge variant="destructive" className="text-xs px-1.5 py-0 cursor-pointer">
                  {metrics?.alertsSeverity.critical} Critical
                </Badge>
              </button>
            )}
            {(metrics?.alertsSeverity.high || 0) > 0 && (
              <button
                onClick={(e) => handleChipClick(e, "/alerts?severity=high&range=last_24h")}
                className="hover:scale-105 transition-transform"
              >
                <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-amber-100 text-amber-800 cursor-pointer">
                  {metrics?.alertsSeverity.high} High
                </Badge>
              </button>
            )}
          </div>,
          "/alerts?severity=critical&range=last_24h",
          "/alerts?range=last_7d"
        )}

        {/* Overdue Tasks with Context */}
        {renderTaskItem(
          "overdue-tasks",
          "Overdue Tasks",
          metrics?.overdueTasks || 0,
          <div className="flex gap-1 text-xs">
            <button 
              onClick={(e) => handleChipClick(e, "/tasks?status=overdue&sort=due_date_asc")}
              className="hover:underline cursor-pointer"
            >
              Oldest: {metrics?.overdueTasksContext.oldestDays || 0} days
            </button>
            <span> • </span>
            <button 
              onClick={(e) => handleChipClick(e, "/tasks?status=overdue&filter=older_than=7d")}
              className="hover:underline cursor-pointer"
            >
              {metrics?.overdueTasksContext.percentage || 0}% &gt;7 days
            </button>
          </div>,
          (metrics?.overdueTasksContext.percentage || 0) > 60 ? 
            <AlertTriangle className="h-3 w-3 text-destructive" /> : 
            <Clock className="h-3 w-3 text-amber-600" />,
          undefined,
          "/tasks?status=overdue&sort=due_date_asc"
        )}

        {/* Care Manager Notes with Wait Time */}
        {renderTaskItem(
          "care-notes",
          "Care Manager Notes Awaiting Review",
          metrics?.careNotesContext.count || 0,
          <div className="text-xs">
            <button 
              onClick={(e) => handleChipClick(e, "/notes?status=awaiting_review&sort=wait_time_desc")}
              className="hover:underline cursor-pointer"
            >
              Average wait time: {metrics?.careNotesContext.avgWaitDays || 0} days
            </button>
          </div>,
          (metrics?.careNotesContext.avgWaitDays || 0) > 3 ? 
            <TrendingUp className="h-3 w-3 text-amber-600" /> : null,
          undefined,
          "/notes?status=awaiting_review"
        )}

        {/* Pending Interventions with Breakdown */}
        {renderTaskItem(
          "pending-interventions", 
          "Pending Interventions",
          metrics?.pendingInterventions || 0,
          <div className="flex gap-1 flex-wrap text-xs">
            <button 
              onClick={(e) => handleChipClick(e, "/interventions?status=pending&type=mobility")}
              className="hover:underline cursor-pointer"
            >
              Mobility: {metrics?.interventionBreakdown.mobility || 0}
            </button>
            <span> • </span>
            <button 
              onClick={(e) => handleChipClick(e, "/interventions?status=pending&type=wound_care")}
              className="hover:underline cursor-pointer"
            >
              Wound: {metrics?.interventionBreakdown.woundCare || 0}
            </button>
            <span> • </span>
            <button 
              onClick={(e) => handleChipClick(e, "/interventions?status=pending&type=medication")}
              className="hover:underline cursor-pointer"
            >
              Med: {metrics?.interventionBreakdown.medication || 0}
            </button>
          </div>,
          null,
          undefined,
          "/interventions?status=pending"
        )}

        {/* Completed This Week with Progress */}
        {renderTaskItem(
          "completed-week",
          "Completed This Week",
          <div className="space-y-1">
            <div>{metrics?.completionTarget.completed || 0}</div>
            <button 
              onClick={(e) => handleChipClick(e, "/tasks?status=done&range=this_week")}
              className="block w-full"
            >
              <Progress 
                value={metrics?.completionTarget.percentage || 0} 
                className="w-16 h-1.5 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>
          </div>,
          `${metrics?.completionTarget.completed || 0} / ${metrics?.completionTarget.target || 0} target (${metrics?.completionTarget.percentage || 0}%)`,
          (metrics?.completionTarget.percentage || 0) >= 80 ? 
            <TrendingUp className="h-3 w-3 text-accent" /> : 
            (metrics?.completionTarget.percentage || 0) < 50 ? 
              <TrendingDown className="h-3 w-3 text-amber-600" /> : null,
          undefined,
          "/tasks?status=done&range=this_week"
        )}
      </CardContent>
    </Card>
  );
}