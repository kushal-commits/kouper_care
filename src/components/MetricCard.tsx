import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  description?: string;
  clickPath?: string;
}

export function MetricCard({ title, value, change, changeType, icon: Icon, description, clickPath }: MetricCardProps) {
  const navigate = useNavigate();
  
  const changeColor = {
    positive: "text-accent",
    negative: "text-destructive", 
    neutral: "text-muted-foreground"
  }[changeType];

  const handleClick = () => {
    if (clickPath) {
      navigate(clickPath);
    }
  };

  return (
    <Card 
      className={`shadow-clinical hover:shadow-elevated transition-all duration-300 ${
        clickPath ? 'cursor-pointer hover:scale-[1.02]' : ''
      }`}
      onClick={handleClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
        <div className="flex items-center space-x-2">
          <p className={`text-xs ${changeColor}`}>{change}</p>
          {description && (
            <p className="text-xs text-muted-foreground">• {description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}