import { create } from 'zustand';
import { Conversation, Message } from '../types';

interface AIState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  removeConversation: (id: string) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  appendStreamingContent: (token: string) => void;
  clearStreamingContent: () => void;
  archiveConversation: (id: string) => void;
}

export const useAIStore = create<AIState>()((set) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isStreaming: false,
  streamingContent: '',
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) => set((s) => ({ conversations: [conversation, ...s.conversations] })),
  removeConversation: (id) => set((s) => ({ conversations: s.conversations.filter((c) => c.id !== id) })),
  setActiveConversation: (activeConversation) => set({ activeConversation }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  appendStreamingContent: (token) => set((s) => ({ streamingContent: s.streamingContent + token })),
  clearStreamingContent: () => set({ streamingContent: '' }),
  archiveConversation: (id) => set((s) => ({
    conversations: s.conversations.filter((c) => c.id !== id),
  })),
}));
