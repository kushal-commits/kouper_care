import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Paperclip, Mic, Wand2, X, Send } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AICopilotProps {
  onOpenChat?: (initialMessage: string) => void;
}

export function AICopilot({ onOpenChat }: AICopilotProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const processNaturalLanguage = async (query: string) => {
    setIsProcessing(true);
    setResponse("");

    try {
      // Use the new AI analytics edge function
      const response = await supabase.functions.invoke('ai-analytics', {
        body: { 
          message: query,
          includeAnalytics: true
        }
      });

      if (response.error) {
        throw new Error(`AI service error: ${response.error.message}`);
      }

      if (response.data?.response) {
        setResponse(response.data.response);
        toast.success("Query processed successfully!");
      } else {
        throw new Error('No response received from AI service');
      }
      
    } catch (error) {
      console.error('AI processing error:', error);
      toast.error("Failed to process query. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    if (onOpenChat) {
      onOpenChat(inputValue);
      setInputValue("");
    } else {
      processNaturalLanguage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
          setInputValue(prev => prev + finalTranscript + ' ');
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

  return (
    <Card className="border-0">
      <CardContent className="p-6 space-y-4">
        {/* AI Response */}
        {response && (
          <div className="rounded-lg p-4 border border-green-200 bg-green-50">
            <h4 className="font-medium text-green-800 mb-2">AI Response</h4>
            <p className="text-sm text-green-700 whitespace-pre-wrap">{response}</p>
          </div>
        )}

        {/* Suggested Query */}
        <div className="rounded-lg p-4 border border-primary/20">
          <div className="flex items-start space-x-3">
            <Wand2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Try asking:</span> "What's happening with my patients today?" or "Show me everyone who needs attention" or "Give me an overview of recent changes."
            </p>
          </div>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
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

        {/* Chat Input */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
          />
          
          <div className="flex flex-col p-4 bg-white rounded-[20px] border border-[rgba(0,204,173,0.30)] transition-colors min-h-[48px]" 
               style={{ boxShadow: '6px 3px 12px 0 rgba(139, 61, 255, 0.15), -6px -3px 12px 0 rgba(0, 196, 204, 0.15)' }}>
            
            <textarea
              ref={textareaRef}
              placeholder="What would you like to know about your patients today?"
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 resize-none outline-none text-sm leading-relaxed"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            
            <div className="flex items-center justify-between mt-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={triggerFileSelect}
                title="Attach files"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 relative ${isRecording ? 'text-red-500' : 'text-muted-foreground hover:text-primary'}`}
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
                  size="icon" 
                  className="h-8 w-8 bg-primary hover:bg-primary/90"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}