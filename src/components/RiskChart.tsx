import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp } from "lucide-react";

const riskData = [
  { name: "Critical", count: 8, color: "hsl(var(--risk-critical))" },
  { name: "High", count: 15, color: "hsl(var(--risk-high))" },
  { name: "Medium", count: 34, color: "hsl(var(--risk-medium))" },
  { name: "Low", count: 67, color: "hsl(var(--risk-low))" },
  { name: "Minimal", count: 123, color: "hsl(var(--risk-minimal))" }
];

const weeklyTrends = [
  { week: "Week 1", critical: 6, high: 12, medium: 28 },
  { week: "Week 2", critical: 7, high: 14, medium: 31 },
  { week: "Week 3", critical: 5, high: 13, medium: 29 },
  { week: "Week 4", critical: 8, high: 15, medium: 34 }
];

export function RiskChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="shadow-clinical">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Risk Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="count"
                label={({ name, count }) => `${name}: ${count}`}
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-clinical">
        <CardHeader>
          <CardTitle>Weekly Risk Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Bar dataKey="critical" fill="hsl(var(--risk-critical))" />
              <Bar dataKey="high" fill="hsl(var(--risk-high))" />
              <Bar dataKey="medium" fill="hsl(var(--risk-medium))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}