import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsTab } from "@/components/AnalyticsTab";
import { ReportsTab } from "@/components/ReportsTab";

export default function Insights() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-heading-l text-foreground">Insights</h1>
        <p className="text-muted-foreground">Leadership analytics and compliance reports</p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsTab />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}