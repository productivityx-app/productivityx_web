import apiClient from './client';
import { Conversation, Message, PagedResponse } from '../types';
import { useAuthStore } from '../stores/authStore';
import { API_BASE_URL } from '../config/env';

export const aiApi = {
  listConversations: (params?: { page?: number; size?: number }): Promise<PagedResponse<Conversation>> =>
    apiClient.get('/ai/conversations', { params }).then((r) => r.data.data || r.data),
  createConversation: (): Promise<Conversation> =>
    apiClient.post('/ai/conversations').then((r) => r.data.data || r.data),
  getConversation: (id: string): Promise<Conversation> =>
    apiClient.get(`/ai/conversations/${id}`).then((r) => r.data.data || r.data),
  deleteConversation: (id: string) =>
    apiClient.delete(`/ai/conversations/${id}`),

  sendMessage: async (
    conversationId: string,
    content: string,
    onToken: (token: string) => void,
    onDone: (message: Message) => void,
    onError: (err: Error) => void
  ) => {
    const token = useAuthStore.getState().accessToken;
    const deviceId = localStorage.getItem('px-device-id') || '';

    try {
      const response = await fetch(`${API_BASE_URL}/ai/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Device-Id': deviceId,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n');
        buffer = parts.pop() || '';
        for (const line of parts) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              onDone({ id: crypto.randomUUID(), conversationId, role: 'ASSISTANT', content: fullContent, actionBlock: null, tokenCount: null, createdAt: new Date().toISOString() });
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const tokenStr = parsed.token || parsed.content || parsed.text || data;
              fullContent += tokenStr;
              onToken(tokenStr);
            } catch {
              fullContent += data;
              onToken(data);
            }
          }
        }
      }
      onDone({ id: crypto.randomUUID(), conversationId, role: 'ASSISTANT', content: fullContent, actionBlock: null, tokenCount: null, createdAt: new Date().toISOString() });
    } catch (err) {
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  },
};
