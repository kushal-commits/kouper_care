import { 
  RefreshCw, 
  UserPlus, 
  Home, 
  Users, 
  Calendar,
  Upload,
  AlertTriangle,
  BarChart3,
  FileText,
  Settings,
  MessageCircle,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Alerts", href: "/alerts", icon: AlertTriangle },
  { name: "Upload Records", href: "/upload", icon: Upload },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Admin", href: "/admin", icon: Settings },
];

interface HeaderProps {
  onChatToggle: () => void;
  isChatOpen: boolean;
}

export function Header({ onChatToggle, isChatOpen }: HeaderProps) {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-6">
          <SidebarTrigger className="md:hidden" />

          {/* Navigation */}
          {/* <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.slice(0, 4).map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav> */}

          {/* Compact navigation for smaller screens */}
          {/* <nav className="flex lg:hidden items-center space-x-1">
            {navigationItems.slice(0, 2).map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav> */}
        </div>

        <div className="flex items-center space-x-2">
          {/* Epic Sync Status */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                 <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                   <CheckCircle className="h-3 w-3" />
                   <span className="hidden sm:inline">Last synced at {currentTime} from Epic</span>
                   <span className="sm:hidden">Epic Sync</span>
                 </div>
              </TooltipTrigger>
               <TooltipContent>
                 <p>Last sync {currentTime} — all ADL data and notes refreshed from Epic.</p>
               </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="ghost" size="icon" className="relative">
            <RefreshCw className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="space-x-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Invite</span>
          </Button>
          
          {/* Chat Toggle Button */}
          <Button 
            variant={isChatOpen ? "default" : "outline"}
            size="icon"
            onClick={onChatToggle}
            className={`${isChatOpen ? "bg-magenta-600 hover:bg-magenta-700 text-white" : "hover:bg-magenta-50 hover:text-magenta-600 hover:border-magenta-600"}`}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>

        </div>
      </div>
    </header>
  );
}