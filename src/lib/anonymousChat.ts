import { ChatMessage, ChatSession } from "./chatTypes";

const STORAGE_KEY = "chat.history";

// Demo seed data
export const demoSeedData: ChatSession[] = [
  {
    id: 'demo-1',
    title: 'Patient Risk Assessment Discussion',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    message_count: 2,
    last_message_preview: 'Based on the assessment data, I can see several key areas that warrant attention...',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Can you help me analyze this patient\'s risk factors based on their recent OASIS assessment?',
        message_type: 'text',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-2', 
        role: 'assistant',
        content: 'I\'d be happy to help analyze the patient\'s risk factors. Based on the assessment data, I can see several key areas that warrant attention:\n\n**High Priority Areas:**\n- Ambulation score of 1 indicates significant fall risk\n- Medication management concerns noted\n\n**Recommendations:**\n1. Implement fall prevention protocols\n2. Consider PT consultation\n3. Review medication management plan\n\nWould you like me to dive deeper into any specific area?',
        message_type: 'text',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'demo-2',
    title: 'ADL Improvement Strategies',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    message_count: 2,
    last_message_preview: 'The key is individualizing the approach based on each patient\'s specific limitations...',
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        content: 'What are some effective ADL improvement strategies for patients with mobility limitations?',
        message_type: 'text',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: 'Here are evidence-based ADL improvement strategies for patients with mobility limitations:\n\n**Progressive Mobility Training:**\n- Start with bed mobility exercises\n- Advance to sitting balance\n- Progress to standing and walking\n\n**Adaptive Equipment:**\n- Grab bars and raised toilet seats\n- Shower chairs and benches\n- Reachers and dressing aids\n\n**Therapeutic Interventions:**\n- Physical therapy for strength building\n- Occupational therapy for daily living skills\n- Regular monitoring and plan adjustments\n\nThe key is individualizing the approach based on each patient\'s specific limitations and goals.',
        message_type: 'text',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'demo-3',
    title: 'Episode Planning & Goals',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    message_count: 2,
    last_message_preview: 'These goals balance realistic expectations with meaningful improvement potential.',
    messages: [
      {
        id: 'msg-5',
        role: 'user',
        content: 'Help me create realistic goals for this 30-day episode. The patient has moderate cognitive decline.',
        message_type: 'text',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-6',
        role: 'assistant',
        content: 'For a patient with moderate cognitive decline, here are realistic 30-day episode goals:\n\n**Safety & Independence Goals:**\n- Maintain current ADL independence levels\n- Reduce fall risk through environmental modifications\n- Improve medication adherence with systems/reminders\n\n**Functional Goals:**\n- Increase bathing independence from 2 to 3\n- Maintain current mobility level\n- Improve meal preparation safety\n\n**Support System Goals:**\n- Educate family/caregivers on cognitive strategies\n- Establish routine and structure\n- Connect with community resources\n\n**Measurable Outcomes:**\n- Weekly OASIS scores to track progress\n- Safety incident reduction\n- Caregiver confidence improvement\n\nThese goals balance realistic expectations with meaningful improvement potential.',
        message_type: 'text',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString()
      }
    ]
  }
];

// Local storage functions
export const loadLocalHistory = (): ChatSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveLocalHistory = (sessions: ChatSession[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.warn('Failed to save chat history locally:', error);
  }
};

export const clearLocalHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear local chat history:', error);
  }
};

export const addMessageToLocalSession = (sessionId: string, message: ChatMessage): void => {
  const sessions = loadLocalHistory();
  const sessionIndex = sessions.findIndex(s => s.id === sessionId);
  
  if (sessionIndex >= 0) {
    sessions[sessionIndex].messages = sessions[sessionIndex].messages || [];
    sessions[sessionIndex].messages.push(message);
    sessions[sessionIndex].message_count = sessions[sessionIndex].messages.length;
    sessions[sessionIndex].updated_at = new Date().toISOString();
    sessions[sessionIndex].last_message_preview = message.content.substring(0, 100) + '...';
  }
  
  saveLocalHistory(sessions);
};

export const createLocalSession = (title: string, pageContext: string): ChatSession => {
  const sessions = loadLocalHistory();
  const newSession: ChatSession = {
    id: `local-${Date.now()}`,
    title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    message_count: 0,
    messages: []
  };
  
  sessions.unshift(newSession);
  saveLocalHistory(sessions);
  return newSession;
};

export const deleteLocalSession = (sessionId: string): void => {
  const sessions = loadLocalHistory();
  const filtered = sessions.filter(s => s.id !== sessionId);
  saveLocalHistory(filtered);
};