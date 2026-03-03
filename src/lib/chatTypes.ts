export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  message_type: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message_preview?: string;
  messages?: ChatMessage[];
}