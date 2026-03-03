import { Home, Play, Users, AlertTriangle, FileText, Settings, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Hub", icon: Home, active: true },
  { name: "Episodes", icon: Play, active: false },
  { name: "Patients", icon: Users, active: false },
  { name: "Alerts & Tasks", icon: AlertTriangle, active: false },
  { name: "Reports", icon: FileText, active: false },
  { name: "Admin", icon: Settings, active: false },
];

export function Navigation() {
  return (
    <nav className="flex flex-col w-20 bg-sidebar text-sidebar-foreground h-screen">
      <div className="flex-1 flex flex-col items-center py-4 space-y-2">
        <div className="mb-6">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">K</span>
          </div>
        </div>
        
        {navigation.map((item, index) => (
          <Button
            key={item.name}
            variant="ghost"
            size="icon"
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center space-y-1 ${
              item.active 
                ? "bg-sidebar-accent text-sidebar-primary-foreground" 
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
            title={item.name}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] leading-none">{item.name.split(' ')[0]}</span>
          </Button>
        ))}
      </div>
      
      <div className="p-4 space-y-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-xl text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-xl text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </Button>
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto mt-2">
          <span className="text-primary-foreground text-sm font-medium">MS</span>
        </div>
      </div>
    </nav>
  );
}