import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { GlobalChatPanel } from "@/components/GlobalChatPanel";
import { SidebarProvider } from "@/components/ui/sidebar";

interface AppLayoutProps {
  children: React.ReactNode | ((props: { onOpenChat: (message: string) => void }) => React.ReactNode);
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState<string>("");

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleOpenChatWithMessage = (message: string) => {
    setInitialChatMessage(message);
    setIsChatOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar />
        
        <motion.div 
          className={`flex-1 flex flex-col ${isChatOpen ? 'mr-[400px] xl:mr-[520px]' : ''}`}
          animate={{ 
            marginRight: isChatOpen ? ["0px", "400px"] : ["400px", "0px"]
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Header onChatToggle={handleChatToggle} isChatOpen={isChatOpen} />
          
          <main className="flex-1">
            {typeof children === 'function' ? children({ onOpenChat: handleOpenChatWithMessage }) : children}
          </main>
        </motion.div>

        <GlobalChatPanel isOpen={isChatOpen} onToggle={handleChatToggle} initialMessage={initialChatMessage} />
      </div>
    </SidebarProvider>
  );
}