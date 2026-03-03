import { useState, useEffect, useRef } from "react";
import { X, MessageCircle, Send, Paperclip, Mic, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FormattedMessage } from "@/components/FormattedMessage";
import { featureFlags } from "@/lib/featureFlags";
import { addMessageToLocalSession, createLocalSession } from "@/lib/anonymousChat";
import { ChatMessage as ChatMessageType } from "@/lib/chatTypes";

interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  contextSnapshot?: string;
}

interface GlobalChatPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  initialMessage?: string;
}

export function GlobalChatPanel({ isOpen, onToggle, initialMessage }: GlobalChatPanelProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isAnonymousMode, setIsAnonymousMode] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  // Handle initial message when panel opens
  useEffect(() => {
    if (initialMessage && isOpen && !messages.some(msg => msg.content === initialMessage)) {
      setMessage(initialMessage);
        // Auto-send the initial message
        setTimeout(async () => {
          const newMessage: ChatMessage = {
            id: Date.now().toString(),
            content: initialMessage,
            sender: "user",
            timestamp: new Date(),
            contextSnapshot: getPageContext()
          };
          setMessages(prev => [...prev, newMessage]);
          setMessage("");

          try {
            // Get or create session and save user message
            const sessionId = await getCurrentSession();
            await saveMessageToDb(newMessage, sessionId);

            // Use the AI analytics edge function
            const response = await supabase.functions.invoke('ai-analytics', {
              body: { 
                message: initialMessage,
                includeAnalytics: true
              }
            });

            if (response.data?.response) {
              const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: response.data.response,
                sender: "ai",
                timestamp: new Date()
              };
              setMessages(prev => [...prev, aiResponse]);
              
              // Save AI response to database
              await saveMessageToDb(aiResponse, sessionId);
            }
          } catch (error) {
            console.error('AI processing error:', error);
            const errorResponse: ChatMessage = {
              id: (Date.now() + 1).toString(),
              content: "Great question! I'd be happy to help you with this - what would you like to explore or accomplish?",
              sender: "ai",
              timestamp: new Date()
            };
            setMessages(prev => [...prev, errorResponse]);
          }
        }, 100);
    }
  }, [initialMessage, isOpen, messages]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const startRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsRecording(true);
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setMessage(prev => prev + finalTranscript + ' ');
        }
      };
      
      recognition.onerror = () => {
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Auto-bind context from current page
  const getPageContext = () => {
    switch (location.pathname) {
      case "/patients":
        return "Patients page - viewing patient list and filters";
      case "/episodes":
        return "Episodes page - viewing active 30-day episodes";
      case "/alerts":
        return "Alerts & Tasks page - triaging patient alerts";
      case "/analytics":
        return "Analytics page - reviewing trends and performance";
      case "/reports":
        return "Reports page - generating CMS outputs";
      case "/admin":
        return "Admin Settings - managing users and system configuration";
      default:
        if (location.pathname.startsWith("/episodes/")) {
          return `Episode Detail page - viewing episode ${location.pathname.split("/")[2]}`;
        }
        return "Dashboard - overview of ADL coordination hub";
    }
  };

  // Create or get current chat session
  const getCurrentSession = async (): Promise<string | null> => {
    if (currentSessionId) {
      return currentSessionId;
    }

    try {
      // Check if anonymous chat is allowed
      if (featureFlags.allowAnonymousChat) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAnonymousMode(true);
          // Create a local session
          const sessionTitle = generateSessionTitle(messages[0]?.content || message || "Chat Session");
          const localSession = createLocalSession(sessionTitle, getPageContext());
          setCurrentSessionId(localSession.id);
          return localSession.id;
        }
        setIsAnonymousMode(false);
      } else {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No authenticated user - chat will work without database persistence');
          return null;
        }
      }

      // Create new session
      const sessionTitle = generateSessionTitle(messages[0]?.content || message || "Chat Session");
      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user!.id,
          title: sessionTitle,
          session_metadata: {
            page_context: getPageContext(),
            started_from: location.pathname
          }
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setCurrentSessionId(session.id);
      return session.id;
    } catch (error) {
      console.error('Error creating session:', error);
      if (featureFlags.allowAnonymousChat) {
        // Fallback to anonymous mode
        setIsAnonymousMode(true);
        const sessionTitle = generateSessionTitle(messages[0]?.content || message || "Chat Session");
        const localSession = createLocalSession(sessionTitle, getPageContext());
        setCurrentSessionId(localSession.id);
        return localSession.id;
      }
      return null;
    }
  };

  // Generate a smart title from the first message
  const generateSessionTitle = (firstMessage: string): string => {
    if (firstMessage.length > 50) {
      return firstMessage.substring(0, 47) + "...";
    }
    return firstMessage || `${getPageContext()} Discussion`;
  };

  // Save message to database or local storage
  const saveMessageToDb = async (message: ChatMessage, sessionId: string | null) => {
    if (!sessionId) {
      console.log('No session ID - skipping message save');
      return;
    }

    try {
      if (isAnonymousMode || sessionId.startsWith('local-')) {
        // Save to local storage
        const chatMessage: ChatMessageType = {
          id: message.id,
          role: message.sender === 'user' ? 'user' : 'assistant',
          content: message.content,
          message_type: 'text',
          created_at: message.timestamp.toISOString()
        };
        addMessageToLocalSession(sessionId, chatMessage);
        return;
      }

      // Save to database
      await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          role: message.sender === 'user' ? 'user' : 'assistant',
          content: message.content,
          message_type: 'text',
          metadata: {
            context_snapshot: message.contextSnapshot,
            timestamp: message.timestamp.toISOString()
          }
        });
    } catch (error) {
      console.error('Error saving message:', error);
      // Don't throw - we don't want to break the chat if saving fails
    }
  };

  // Reset session when panel is closed
  useEffect(() => {
    if (!isOpen) {
      setCurrentSessionId(null);
    }
  }, [isOpen]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onToggle();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === ".") {
        event.preventDefault();
        onToggle();
      }
      if (event.key === "k" || event.key === "K") {
        // Only trigger if not typing in an input/textarea
        const activeElement = document.activeElement;
        const isTyping = activeElement instanceof HTMLInputElement || 
                        activeElement instanceof HTMLTextAreaElement ||
                        activeElement?.getAttribute('contenteditable') === 'true';
        
        if (!isTyping) {
          event.preventDefault();
          onToggle();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onToggle]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
      contextSnapshot: getPageContext()
    };

    setMessages(prev => [...prev, newMessage]);
    const currentMessage = message;
    setMessage("");

    try {
      // Get or create session and save user message
      const sessionId = await getCurrentSession();
      await saveMessageToDb(newMessage, sessionId);

      // Note: Remove hardcoded anonymous responses - let AI service handle all requests

      // Use the AI analytics edge function
      const response = await supabase.functions.invoke('ai-analytics', {
        body: { 
          message: currentMessage,
          includeAnalytics: true
        }
      });

      if (response.error) {
        throw new Error(`AI service error: ${response.error.message}`);
      }

      if (response.data?.response) {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: response.data.response,
          sender: "ai",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
        
        // Save AI response to database
        await saveMessageToDb(aiResponse, sessionId);
        
        toast.success("AI response received!");
      } else {
        throw new Error('No response received from AI service');
      }
      
    } catch (error) {
      console.error('AI processing error:', error);
      
      // Check if this is a quota/billing error
      const errorString = error instanceof Error ? error.message : String(error);
      const isQuotaError = errorString.includes('quota') || errorString.includes('429') || errorString.includes('insufficient_quota');
      
      let fallbackContent = "";
      let isTemporary = true;
      
      if (isQuotaError) {
        fallbackContent = "🔧 **AI Assistant Temporarily Unavailable**\n\nOur AI service is currently experiencing capacity limits. Here's how I can still help you:\n\n";
        isTemporary = false;
      } else {
        fallbackContent = "⚠️ **Temporary Connection Issue**\n\nI'm having trouble connecting to my AI services right now. Let me help you navigate manually:\n\n";
      }
      
      // Add contextual help based on current page with actionable suggestions
      if (location.pathname === '/' || location.pathname.includes('dashboard')) {
        fallbackContent += "**📊 Dashboard Help:**\n" +
          "• View patient alerts by clicking the 'Patient Alerts' card\n" +
          "• Access patient list via the 'Total Patients' card\n" +
          "• Check resolved alerts in the middle card\n" +
          "• Use the sidebar to navigate to specific sections\n\n" +
          "**Quick Actions:** Try asking me about specific patients, episodes, or care tasks when I'm back online!";
      } else if (location.pathname.includes('/patients')) {
        fallbackContent += "**👥 Patient Management:**\n" +
          "• Use the search bar to find specific patients\n" +
          "• Filter by risk level (High, Medium, Low)\n" +
          "• Click patient names to view detailed profiles\n" +
          "• Check the 'Episodes' tab for active care episodes\n\n" +
          "**Need Help?** Ask me about patient care plans, risk assessments, or episode management when I'm available.";
      } else if (location.pathname.includes('/alerts') || location.pathname.includes('/worklist')) {
        fallbackContent += "**🚨 Alerts & Tasks:**\n" +
          "• Use the 'Alerts' tab to see critical patient alerts\n" +
          "• Switch to 'Tasks' tab for assigned care tasks\n" +
          "• Filter by severity: Critical → Warning → Info\n" +
          "• Click alerts to acknowledge or assign to staff\n\n" +
          "**Coming Back Soon:** I'll help you prioritize alerts and suggest interventions when reconnected.";
      } else if (location.pathname.includes('/episodes')) {
        fallbackContent += "**📋 Episode Management:**\n" +
          "• View all active 30-day episodes\n" +
          "• Click episode IDs for detailed timeline\n" +
          "• Check assessment schedules and outcomes\n" +
          "• Monitor patient progress through episode stages\n\n" +
          "**AI Analysis:** I'll provide episode insights and recommendations once I'm back online.";
      } else if (location.pathname.includes('/analytics')) {
        fallbackContent += "**📈 Analytics & Reports:**\n" +
          "• Explore charts and performance metrics\n" +
          "• Use date filters to adjust reporting periods\n" +
          "• Export data using the download buttons\n" +
          "• Compare trends across different time ranges\n\n" +
          "**Advanced Analytics:** Ask me to interpret trends and suggest improvements when I return.";
      } else if (location.pathname.includes('/care-tools')) {
        fallbackContent += "**🛠️ Care Tools:**\n" +
          "• Access specialized assessment tools\n" +
          "• Use discharge planning assistants\n" +
          "• Run readmission risk predictions\n" +
          "• Review retrospective analyses\n\n" +
          "**Smart Recommendations:** I'll provide tool-specific guidance and insights when reconnected.";
      } else {
        fallbackContent += "**🏥 General Navigation:**\n" +
          "• **Dashboard**: Overview of key metrics and alerts\n" +
          "• **Patients**: Complete patient roster and profiles\n" +
          "• **Episodes**: Active care episodes and timelines\n" +
          "• **Alerts**: Critical patient notifications and tasks\n" +
          "• **Analytics**: Performance metrics and trends\n" +
          "• **Care Tools**: Specialized assessment and planning tools\n\n" +
          "**Personal AI Assistant:** I'll be back shortly to provide personalized insights and recommendations!";
      }
      
      if (isTemporary) {
        fallbackContent += "\n\n💡 **Try again in a few moments** - connection issues are usually resolved quickly.";
      } else {
        fallbackContent += "\n\n🔄 **Service will resume shortly** - our team is working to restore full AI capabilities.";
      }
      
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: fallbackContent,
        sender: "ai",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      
      if (isQuotaError) {
        toast.error("AI service temporarily unavailable - working to restore access");
      } else {
        toast.error("Connection issue - please try again in a moment");
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed right-0 top-16 bottom-0 w-[400px] xl:w-[520px] bg-white border-l border-gray-200 shadow-xl z-40 flex flex-col backdrop-blur-sm"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
        >
          {/* Header */}
          <motion.div 
            className="bg-gray-50 px-4 py-3 border-b border-gray-200"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ backgroundColor: 'rgba(249, 250, 251, 0.95)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Context Chat</h3>
                <p className="text-xs text-gray-500">{getPageContext()}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-1">
                  <div className="w-6 h-6 bg-magenta-600 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-xs text-white">AI</span>
                  </div>
                  <div className="w-6 h-6 bg-green-600 rounded-full border-2 border-white flex items-center justify-center">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onToggle}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Context Pills */}
          <motion.div 
            className="px-4 py-2 border-b border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                {location.pathname === "/" ? "Dashboard" : location.pathname.slice(1)}
              </Badge>
              {location.pathname.includes("episode") && (
                <Badge variant="outline" className="text-xs">Episode Context</Badge>
              )}
            </div>
          </motion.div>

          {/* Messages */}
          <motion.div 
            className="flex-1 overflow-y-auto p-4 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">I'm here to help! What would you like to know?</p>
                <div className="mt-4 space-y-2">
                  <Button variant="ghost" size="sm" className="text-magenta-600">
                    /summarize
                  </Button>
                  <Button variant="ghost" size="sm" className="text-magenta-600">
                    /suggest-next-steps
                  </Button>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <motion.div 
                key={msg.id} 
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FormattedMessage 
                  content={msg.content}
                  sender={msg.sender}
                  timestamp={msg.timestamp}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Composer */}
          <motion.div 
            className="border-t border-gray-200 p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2 mb-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
              />
              
              <div className="flex flex-col p-4 bg-white rounded-lg border border-gray-200 min-h-[48px]">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What can I help you with on this page?"
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 resize-none outline-none"
                />
                
                <div className="flex items-center justify-between mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                    onClick={triggerFileSelect}
                    title="Attach files"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`h-8 w-8 p-0 relative ${isRecording ? 'text-red-500' : 'text-muted-foreground hover:text-primary'}`}
                      onClick={toggleRecording}
                      title={isRecording ? "Stop recording" : "Start voice input"}
                    >
                      {isRecording ? (
                        <div className="flex items-center space-x-0.5">
                          <div className="w-0.5 h-2 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0ms', animationDuration: '800ms' }}></div>
                          <div className="w-0.5 h-3 bg-red-500 rounded animate-pulse" style={{ animationDelay: '200ms', animationDuration: '600ms' }}></div>
                          <div className="w-0.5 h-4 bg-red-500 rounded animate-pulse" style={{ animationDelay: '400ms', animationDuration: '700ms' }}></div>
                          <div className="w-0.5 h-3 bg-red-500 rounded animate-pulse" style={{ animationDelay: '600ms', animationDuration: '500ms' }}></div>
                          <div className="w-0.5 h-2 bg-red-500 rounded animate-pulse" style={{ animationDelay: '800ms', animationDuration: '900ms' }}></div>
                        </div>
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white h-8 w-8 p-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enter to send, Shift+Enter for new line • K to open • Ctrl/⌘ + . to toggle
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}