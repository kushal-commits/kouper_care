import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, AlertTriangle, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <AppLayout>
      <div 
        className="min-h-screen relative"
        style={{
          backgroundImage: "url('/lovable-uploads/f928bfae-8883-4444-bb6c-572e35b2e688.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Background overlay for better text readability */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
        
        {/* Content */}
        <div className="relative z-10 p-4 md:p-8 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-7xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6 py-12 md:py-20">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary-magenta-600 via-primary-green-600 to-primary-viridian-500 bg-clip-text text-transparent">
                  Kouper AI
                </h1>
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                  Care Copilot Hub
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Instantly access insights from OASIS data, tailored to every patient. Monitor ADL progression and intervene at the right time.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-primary-green-600 to-primary-green-500 hover:from-primary-green-700 hover:to-primary-green-600">
                  View Dashboard
                </Button>
                <Button variant="outline" size="lg">
                  Upload OASIS Data
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-primary-magenta-200 hover:shadow-lg transition-all bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Episodes</CardTitle>
                  <Activity className="h-4 w-4 text-primary-magenta-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">247</div>
                  <p className="text-xs text-muted-foreground">+10 this week</p>
                </CardContent>
              </Card>

              <Card className="border-primary-green-200 hover:shadow-lg transition-all bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <Users className="h-4 w-4 text-primary-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-xs text-muted-foreground">+28 this month</p>
                </CardContent>
              </Card>

              <Card className="border-error-200 hover:shadow-lg transition-all bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-error-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">-3 from yesterday</p>
                </CardContent>
              </Card>

              <Card className="border-primary-viridian-200 hover:shadow-lg transition-all bg-white/90 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Improvements</CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary-viridian-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89%</div>
                  <p className="text-xs text-muted-foreground">+5% this month</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="text-center space-y-6 py-8">
              <h3 className="text-xl font-semibold">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-primary-magenta-300 bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Activity className="h-8 w-8 text-primary-magenta-600 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">View Episodes</h4>
                    <p className="text-sm text-muted-foreground">Monitor all active 30-day episodes</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-primary-green-300 bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 text-primary-green-600 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Patient Management</h4>
                    <p className="text-sm text-muted-foreground">Access patient records and progress</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-error-300 bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <AlertTriangle className="h-8 w-8 text-error-600 mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Review Alerts</h4>
                    <p className="text-sm text-muted-foreground">Triage and resolve critical alerts</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
