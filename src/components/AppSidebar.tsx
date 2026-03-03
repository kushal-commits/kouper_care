import { Home, Play, Users, AlertTriangle, FileText, LogOut, MessageCircle, Cog, Wrench } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navigation = [
  { name: "Hub", icon: Home, url: "/", active: true },
  { name: "Alerts & Tasks", icon: AlertTriangle, url: "/worklist", active: false },
  { name: "Patients", icon: Users, url: "/patients", active: false },
  { name: "Care Tools", icon: Wrench, url: "/care-tools", active: false },
  { name: "Chat History", icon: MessageCircle, url: "/chat-history", active: false },
  { name: "Insights", icon: FileText, url: "/insights", active: false },
  { name: "Admin", icon: Cog, url: "/admin", active: false },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="sticky top-0 border-r border-sidebar-border h-screen flex-shrink-0 w-20" collapsible="none">
      <SidebarContent className="h-full flex flex-col bg-sidebar">
        {/* Logo */}
        <div className="flex items-center justify-center py-4">
          <img 
            src="/lovable-uploads/3b3e30ca-adc6-4c57-8aca-40be89eeef3c.png" 
            alt="Kouper Logo" 
            className="w-8 h-8 object-contain"
          />
        </div>

        {/* Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-2 flex flex-col items-center">
              {navigation.map((item) => {
                const isActive = location.pathname === item.url || (item.url === "/" && location.pathname === "/");
                
                return (
                  <SidebarMenuItem key={item.name} className="w-16 h-16 p-1">
                    <SidebarMenuButton asChild className="h-auto p-0 w-full">
                      <NavLink
                        to={item.url}
                        end
                        className={`w-full h-full flex flex-col items-center justify-center space-y-1 transition-all duration-200 relative hover-scale ${
                          isActive
                            ? "bg-[#1B5760] text-white font-medium shadow-lg scale-105"
                            : "text-white/70 hover:text-white hover:bg-[#1B5760] hover:shadow-lg hover:scale-105"
                        }`}
                        title={item.name}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="text-[10px] leading-none text-center">
                          {item.name.split(' ')[0]}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Actions */}
        <div className="p-2 space-y-2">
          <SidebarMenuButton asChild>
            <button className="w-full h-12 rounded-xl flex flex-col items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 hover:shadow-sm">
              <LogOut className="h-5 w-5" />
            </button>
          </SidebarMenuButton>

          <div className="w-8 h-8 bg-magenta-600 rounded-full flex items-center justify-center mx-auto mt-2 shadow-sm">
            <span className="text-white text-sm font-medium">MS</span>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}