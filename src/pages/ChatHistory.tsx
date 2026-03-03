import { useState, useEffect } from "react";
import { MessageCircle, Clock, Search, Trash2, Eye, Calendar, Info, RotateCcw, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { FormattedMessage } from "@/components/FormattedMessage";
import { featureFlags } from "@/lib/featureFlags";
import { demoSeedData, loadLocalHistory, saveLocalHistory, clearLocalHistory, deleteLocalSession } from "@/lib/anonymousChat";
import { ChatMessage, ChatSession } from "@/lib/chatTypes";

export default function ChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAnonymousMode, setIsAnonymousMode] = useState(false);
  const { toast } = useToast();

  // Fetch chat sessions
  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      
      if (!featureFlags.allowAnonymousChat) {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Authentication required",
            description: "Please log in to view chat history",
            variant: "destructive"
          });
          return;
        }
        setIsAnonymousMode(false);
      } else {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAnonymousMode(true);
          // Load from localStorage or demo data
          if (featureFlags.persistAnonLocally) {
            const localSessions = loadLocalHistory();
            if (localSessions.length > 0) {
              setSessions(localSessions);
              setIsLoading(false);
              return;
            }
          }
          
          if (featureFlags.useDemoSeedData) {
            setSessions(demoSeedData);
            setIsLoading(false);
            return;
          }
          
          // No data available
          setSessions([]);
          setIsLoading(false);
          return;
        }
        setIsAnonymousMode(false);
      }

      const { data: sessionsData, error } = await supabase
        .from('chat_sessions')
        .select(`
          id,
          title,
          created_at,
          updated_at,
          chat_messages(count)
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform data to include message count
      const transformedSessions = sessionsData?.map(session => ({
        ...session,
        message_count: session.chat_messages?.[0]?.count || 0
      })) || [];

      setSessions(transformedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      if (featureFlags.allowAnonymousChat) {
        // Fallback to anonymous mode on error
        setIsAnonymousMode(true);
        if (featureFlags.persistAnonLocally) {
          const localSessions = loadLocalHistory();
          setSessions(localSessions.length > 0 ? localSessions : demoSeedData);
        } else {
          setSessions(featureFlags.useDemoSeedData ? demoSeedData : []);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch chat history",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sample messages for demonstration
  const getSampleMessages = (sessionId: string): ChatMessage[] => {
    const sampleMessages = {
      '550e8400-e29b-41d4-a716-446655440000': [
        {
          id: 'msg-1',
          role: 'user' as const,
          content: 'Can you help me analyze this patient\'s risk factors based on their recent OASIS assessment?',
          message_type: 'text',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'msg-2', 
          role: 'assistant' as const,
          content: 'I\'d be happy to help analyze the patient\'s risk factors. Based on the assessment data, I can see several key areas that warrant attention:\n\n**High Priority Areas:**\n- Ambulation score of 1 indicates significant fall risk\n- Medication management concerns noted\n\n**Recommendations:**\n1. Implement fall prevention protocols\n2. Consider PT consultation\n3. Review medication management plan\n\nWould you like me to dive deeper into any specific area?',
          message_type: 'text',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString()
        }
      ],
      '550e8400-e29b-41d4-a716-446655440001': [
        {
          id: 'msg-3',
          role: 'user' as const,
          content: 'What are some effective ADL improvement strategies for patients with mobility limitations?',
          message_type: 'text',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'msg-4',
          role: 'assistant' as const,
          content: 'Here are evidence-based ADL improvement strategies for patients with mobility limitations:\n\n**Progressive Mobility Training:**\n- Start with bed mobility exercises\n- Advance to sitting balance\n- Progress to standing and walking\n\n**Adaptive Equipment:**\n- Grab bars and raised toilet seats\n- Shower chairs and benches\n- Reachers and dressing aids\n\n**Therapeutic Interventions:**\n- Physical therapy for strength building\n- Occupational therapy for daily living skills\n- Regular monitoring and plan adjustments\n\nThe key is individualizing the approach based on each patient\'s specific limitations and goals.',
          message_type: 'text',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString()
        }
      ],
      '550e8400-e29b-41d4-a716-446655440002': [
        {
          id: 'msg-5',
          role: 'user' as const,
          content: 'Help me create realistic goals for this 30-day episode. The patient has moderate cognitive decline.',
          message_type: 'text',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'msg-6',
          role: 'assistant' as const,
          content: 'For a patient with moderate cognitive decline, here are realistic 30-day episode goals:\n\n**Safety & Independence Goals:**\n- Maintain current ADL independence levels\n- Reduce fall risk through environmental modifications\n- Improve medication adherence with systems/reminders\n\n**Functional Goals:**\n- Increase bathing independence from 2 to 3\n- Maintain current mobility level\n- Improve meal preparation safety\n\n**Support System Goals:**\n- Educate family/caregivers on cognitive strategies\n- Establish routine and structure\n- Connect with community resources\n\n**Measurable Outcomes:**\n- Weekly OASIS scores to track progress\n- Safety incident reduction\n- Caregiver confidence improvement\n\nThese goals balance realistic expectations with meaningful improvement potential.',
          message_type: 'text',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString()
        }
      ]
    };
    return sampleMessages[sessionId as keyof typeof sampleMessages] || [];
  };

  // Fetch messages for a specific session
  const fetchSessionMessages = async (sessionId: string) => {
    try {
      // Check if this is a demo/local session
      if (sessionId.startsWith('demo-') || sessionId.startsWith('local-')) {
        // Find messages from the session itself or sample data
        const session = sessions.find(s => s.id === sessionId);
        if (session?.messages) {
          setMessages(session.messages);
          return;
        }
        
        const sampleMessages = getSampleMessages(sessionId);
        setMessages(sampleMessages);
        return;
      }

      if (!isAnonymousMode) {
        const { data: messagesData, error } = await supabase
          .from('chat_messages')
          .select('id, role, content, message_type, created_at')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (error) {
          throw error;
        }

        // Cast the role to the correct type
        const typedMessages: ChatMessage[] = (messagesData || []).map(msg => ({
          ...msg,
          role: msg.role as 'user' | 'assistant'
        }));

        setMessages(typedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (!isAnonymousMode) {
        toast({
          title: "Error",
          description: "Failed to fetch conversation messages",
          variant: "destructive"
        });
      }
    }
  };

  // Delete a chat session
  const deleteSession = async (sessionId: string) => {
    try {
      // Handle demo/local sessions
      if (sessionId.startsWith('demo-')) {
        toast({
          title: "Cannot delete demo data",
          description: "Demo conversations cannot be deleted",
          variant: "destructive"
        });
        return;
      }

      if (sessionId.startsWith('local-') || isAnonymousMode) {
        deleteLocalSession(sessionId);
        setSessions(sessions.filter(s => s.id !== sessionId));
        toast({
          title: "Session deleted",
          description: "Chat session has been deleted from local storage",
        });
        return;
      }

      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        throw error;
      }

      setSessions(sessions.filter(s => s.id !== sessionId));
      toast({
        title: "Session deleted",
        description: "Chat session has been permanently deleted",
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat session",
        variant: "destructive"
      });
    }
  };

  // Clear all local chat history
  const clearAllLocalHistory = () => {
    clearLocalHistory();
    setSessions(featureFlags.useDemoSeedData ? demoSeedData : []);
    toast({
      title: "Local history cleared",
      description: "All local chat history has been deleted",
    });
  };

  // View session details
  const viewSession = (session: ChatSession) => {
    setSelectedSession(session);
    fetchSessionMessages(session.id);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Filter sessions based on search
  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displaySessions = filteredSessions;

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-l text-foreground">Chat History</h1>
          <p className="text-body-m-regular text-muted-foreground">
            Review your previous AI conversations and analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchSessions}>
            <Clock className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
          {isAnonymousMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={clearAllLocalHistory}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear Chat History
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>


      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chat sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading state
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))
        ) : displaySessions.length === 0 ? (
          // Empty state
          <Card className="col-span-full text-center py-12">
            <CardContent>
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-heading-s text-foreground mb-2">No chats yet</h3>
              <p className="text-body-m-regular text-muted-foreground mb-4">
                Start a conversation to ask about patients, forms, or interventions.
              </p>
              <Button>New Chat</Button>
            </CardContent>
          </Card>
        ) : (
          // Sessions list
          displaySessions.map((session) => (
            <Card key={session.id} className="hover:shadow-elevated transition-all duration-200 cursor-pointer group">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-heading-s text-foreground line-clamp-2">
                    {session.title}
                  </CardTitle>
                  <Badge variant="outline" className="text-label">
                    {session.message_count || 0} msgs
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-caption text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(session.updated_at), 'MMM dd, yyyy')}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {session.last_message_preview && (
                  <p className="text-body-s-regular text-muted-foreground line-clamp-2">
                    {session.last_message_preview}
                  </p>
                )}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewSession(session)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Session Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {selectedSession?.title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    } mb-4`}
                  >
                    <FormattedMessage 
                      content={message.content}
                      sender={message.role === 'user' ? 'user' : 'ai'}
                      timestamp={new Date(message.created_at)}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No messages in this conversation</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}