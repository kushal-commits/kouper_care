import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ADLDataPoint {
  date: string;
  bathing: number;
  transferring: number;
  ambulation: number;
  toileting: number;
  eating: number;
}

interface ADLProgressChartsProps {
  patientId: string;
}

// Mock data - in real implementation, this would come from assessments
const getMockADLData = (): ADLDataPoint[] => [
  { date: "Day 1", bathing: 1, transferring: 2, ambulation: 1, toileting: 1, eating: 2 },
  { date: "Day 5", bathing: 2, transferring: 2, ambulation: 2, toileting: 2, eating: 3 },
  { date: "Day 10", bathing: 3, transferring: 3, ambulation: 3, toileting: 3, eating: 4 },
  { date: "Day 15", bathing: 4, transferring: 4, ambulation: 4, toileting: 4, eating: 4 },
  { date: "Day 20", bathing: 4, transferring: 4, ambulation: 4, toileting: 5, eating: 5 },
  { date: "Today", bathing: 5, transferring: 5, ambulation: 5, toileting: 5, eating: 5 },
];

const adlMetrics = [
  { key: 'bathing', name: 'Bathing', color: '#3B82F6', trend: 'down' },
  { key: 'transferring', name: 'Transferring', color: '#10B981', trend: 'up' },
  { key: 'ambulation', name: 'Ambulation', color: '#F59E0B', trend: 'down' },
  { key: 'toileting', name: 'Toileting', color: '#EF4444', trend: 'up' },
  { key: 'eating', name: 'Eating', color: '#8B5CF6', trend: 'down' },
];

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return <TrendingUp className="h-4 w-4 text-accent" />;
    case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />;
    default: return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
};

const getTrendDescription = (trend: string) => {
  return trend === 'up' ? 'Improving (higher functional ability)' : 'Declining (lower functional ability)';
};

export function ADLProgressCharts({ patientId }: ADLProgressChartsProps) {
  const adlData = getMockADLData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any) => (
            <div key={entry.dataKey} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}: {entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-clinical">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-primary" />
          <span>ADL Progress Charts</span>
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Visual progress tracking for Activities of Daily Living over the episode
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {adlMetrics.map((metric) => {
              const currentValue = adlData[adlData.length - 1][metric.key as keyof ADLDataPoint] as number;
              const baselineValue = adlData[0][metric.key as keyof ADLDataPoint] as number;
              const change = currentValue - baselineValue;
              
              return (
                <div key={metric.key} className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: metric.color }}
                    />
                    <span className="text-sm font-medium">{metric.name}</span>
                  </div>
                  <div className="text-2xl font-bold">{currentValue}</div>
                  <div className="flex items-center justify-center space-x-1 text-xs">
                    {getTrendIcon(change > 0 ? 'up' : change < 0 ? 'down' : 'stable')}
                    <span className={change > 0 ? 'text-accent' : change < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                      {change > 0 ? '+' : ''}{change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={adlData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  domain={[0, 5]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {adlMetrics.map((metric) => (
                  <Line
                    key={metric.key}
                    type="monotone"
                    dataKey={metric.key}
                    stroke={metric.color}
                    strokeWidth={2}
                    dot={{ fill: metric.color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: metric.color, strokeWidth: 2 }}
                    name={metric.name}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend with Trends */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Progress Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {adlMetrics.map((metric) => {
                const currentValue = adlData[adlData.length - 1][metric.key as keyof ADLDataPoint] as number;
                const baselineValue = adlData[0][metric.key as keyof ADLDataPoint] as number;
                const change = currentValue - baselineValue;
                
                return (
                  <div key={metric.key} className="flex items-center justify-between p-2 bg-muted/10 rounded">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: metric.color }}
                      />
                      <span>{metric.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={change > 0 ? "default" : change < 0 ? "destructive" : "secondary"} className="text-xs">
                        {baselineValue} → {currentValue}
                      </Badge>
                      {getTrendIcon(change > 0 ? 'up' : change < 0 ? 'down' : 'stable')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}