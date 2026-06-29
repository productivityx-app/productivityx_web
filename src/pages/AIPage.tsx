import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Menu, X, PanelRightOpen, PanelRightClose, BrainCircuit, MessageSquarePlus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { aiApi } from '../api/ai';
import { useAIStore } from '../stores/aiStore';
import { Message } from '../types';
import { useTranslation } from 'react-i18next';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import ConversationSidebar from '../components/ai/ConversationSidebar';
import MessageBubble from '../components/ai/MessageBubble';
import ChatInput from '../components/ai/ChatInput';
import WelcomeScreen from '../components/ai/WelcomeScreen';
import ContextPanel from '../components/ai/ContextPanel';
import TypingIndicator from '../components/ai/TypingIndicator';
import ConversationStarters from '../components/ai/ConversationStarters';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function AIPage() {
  useEffect(() => { document.title = 'AI Assistant — ProductivityX'; }, []);
  const { t } = useTranslation();
  const { id: urlConvId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isMobile = useIsMobile();

  const {
    conversations, setConversations, addConversation, removeConversation,
    activeConversation, setActiveConversation, messages, setMessages, addMessage,
    isStreaming, setIsStreaming, streamingContent, appendStreamingContent, clearStreamingContent,
    archiveConversation,
  } = useAIStore();

  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [contextOpen, setContextOpen] = useState(false);
  const [convFetchError, setConvFetchError] = useState(false);
  const [convFetchRetries, setConvFetchRetries] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isLoading: convsLoading, data: convsData, isError: convsError, refetch: convsRefetch } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: () => aiApi.listConversations({ size: 50 }),
  });

  useEffect(() => {
    if (convsData) setConversations(convsData.content || []);
  }, [convsData]);

  useEffect(() => {
    if (urlConvId) {
      setConvFetchError(false);
      aiApi.getConversation(urlConvId)
        .then((conv) => { setActiveConversation(conv); setMessages(conv.messages || []); })
        .catch(() => setConvFetchError(true));
    }
  }, [urlConvId, convFetchRetries]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (isMobile && urlConvId) setSidebarOpen(false);
  }, [urlConvId, activeConversation, isMobile]);

  const createConvMutation = useMutation({
    mutationFn: aiApi.createConversation,
    onSuccess: (conv) => {
      addConversation(conv);
      setActiveConversation(conv);
      setMessages([]);
      navigate(`/ai/conversations/${conv.id}`);
      if (isMobile) setSidebarOpen(false);
    },
  });

  const deleteConvMutation = useMutation({
    mutationFn: (id: string) => aiApi.deleteConversation(id),
    onSuccess: (_, id) => {
      removeConversation(id);
      qc.invalidateQueries({ queryKey: ['ai-conversations'] });
      if (activeConversation?.id === id) {
        setActiveConversation(null);
        setMessages([]);
        navigate('/ai');
      }
      toast.success(t('ai.conversationDeleted'));
    },
  });

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !activeConversation || isStreaming) return;
    const userMsg: Message = {
      id: crypto.randomUUID(), conversationId: activeConversation.id,
      role: 'USER', content: input, actionBlock: null,
      tokenCount: null, createdAt: new Date().toISOString(),
    };
    addMessage(userMsg);
    const sentInput = input;
    setInput('');
    setIsStreaming(true);
    clearStreamingContent();

    await aiApi.sendMessage(
      activeConversation.id, sentInput,
      (token) => appendStreamingContent(token),
      (msg) => { addMessage(msg); clearStreamingContent(); setIsStreaming(false); },
      (err) => { toast.error(t('ai.aiError', { message: err.message })); setIsStreaming(false); clearStreamingContent(); },
    );
  }, [input, activeConversation, isStreaming, addMessage, setIsStreaming, clearStreamingContent, appendStreamingContent, t]);

  const handleRegenerate = useCallback(async () => {
    if (!activeConversation || isStreaming) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'USER');
    if (!lastUserMsg) return;
    setMessages(messages.filter((m) => m.id !== messages[messages.length - 1].id));
    setIsStreaming(true);
    clearStreamingContent();

    await aiApi.sendMessage(
      activeConversation.id, lastUserMsg.content,
      (token) => appendStreamingContent(token),
      (msg) => { addMessage(msg); clearStreamingContent(); setIsStreaming(false); },
      (err) => { toast.error(t('ai.aiError', { message: err.message })); setIsStreaming(false); clearStreamingContent(); },
    );
  }, [activeConversation, isStreaming, messages, addMessage, setIsStreaming, clearStreamingContent, appendStreamingContent, t]);

  const handleSuggestion = (text: string) => {
    if (!activeConversation) {
      createConvMutation.mutate(undefined, {
        onSuccess: (conv) => {
          setTimeout(() => document.querySelector('textarea')?.focus(), 100);
        },
      });
    }
    setInput(text);
    setTimeout(() => {
      const ta = document.querySelector('textarea');
      if (ta) { ta.focus(); ta.setSelectionRange(text.length, text.length); }
    }, 100);
  };

  const handleSelectConversation = (id: string) => {
    navigate(`/ai/conversations/${id}`);
    if (isMobile) setSidebarOpen(false);
  };

  const templatePrompts: Record<string, string> = {
    dailyStandup: t('ai.templateDailyStandupPrompt'),
    weeklyReview: t('ai.templateWeeklyReviewPrompt'),
    focusPlan: t('ai.templateFocusPlanPrompt'),
    noteSummary: t('ai.templateNoteSummaryPrompt'),
  };

  const handleTemplate = (key: string) => {
    const prompt = templatePrompts[key];
    if (!activeConversation) {
      createConvMutation.mutate(undefined, {
        onSuccess: (conv) => {
          setTimeout(() => {
            setInput(prompt);
            document.querySelector('textarea')?.focus();
          }, 100);
        },
      });
    } else {
      setInput(prompt);
      document.querySelector('textarea')?.focus();
    }
  };

  const showWelcome = !activeConversation && !urlConvId;
  const showMessages = activeConversation && !convFetchError;

  return (
    <div className="flex h-full bg-background">
      {/* Overlay for mobile sidebar */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={isMobile ? { x: -300, opacity: 0 } : { opacity: 1 }}
            animate={isMobile ? { x: 0, opacity: 1 } : { opacity: 1 }}
            exit={isMobile ? { x: -300, opacity: 0 } : { opacity: 1 }}
            className={cn(
              'flex-shrink-0 z-40',
              isMobile ? 'fixed left-0 top-0 bottom-0 w-72 shadow-2xl' : 'relative',
            )}
          >
            <ConversationSidebar
              conversations={conversations}
              activeId={activeConversation?.id}
              isLoading={convsLoading}
              isError={convsError}
              onRetry={convsRefetch}
              onSelect={handleSelectConversation}
              onNewChat={() => createConvMutation.mutate()}
              onDelete={(id) => deleteConvMutation.mutate(id)}
              onArchive={(id) => { archiveConversation(id); toast.success(t('ai.conversationArchived')); }}
              onRename={(id, title) => {
                // Placeholder: backend would need rename endpoint
                toast.success(t('ai.renameHint'));
              }}
              isCreating={createConvMutation.isPending}
            />
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-3 right-3 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <X size={14} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            {activeConversation && (
              <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {activeConversation.title || t('ai.newConversation')}
              </span>
            )}
          </div>
          {activeConversation && !isMobile && (
            <button
              onClick={() => setContextOpen(!contextOpen)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {contextOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
            </button>
          )}
        </div>

        {/* Content */}
        {convFetchError ? (
          <div className="flex-1 flex items-center justify-center">
            <ErrorState onRetry={() => setConvFetchRetries((c) => c + 1)} />
          </div>
        ) : showWelcome ? (
          <WelcomeScreen
            onSuggestion={handleSuggestion}
            onNewChat={() => createConvMutation.mutate()}
          />
        ) : showMessages ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
              <div className="max-w-3xl mx-auto space-y-5">
                {messages.length === 0 && !isStreaming && (
                  <EmptyState
                    icon={BrainCircuit}
                    title={t('ai.sendAMessage')}
                    description="Ask me anything — I can help you with notes, tasks, scheduling, and more."
                    gradient="ai"
                    size="sm"
                    actions={[
                      { label: 'Start a conversation', icon: MessageSquarePlus, onClick: () => createConvMutation.mutate(), variant: 'primary' },
                    ]}
                    badge={{ label: 'AI', variant: 'new' }}
                  >
                    <ConversationStarters onSelect={handleTemplate} />
                  </EmptyState>
                )}
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onRegenerate={msg.role === 'ASSISTANT' ? handleRegenerate : undefined}
                  />
                ))}
                {isStreaming && streamingContent && (
                  <MessageBubble
                    message={{
                      id: 'streaming', conversationId: activeConversation?.id || '',
                      role: 'ASSISTANT', content: streamingContent,
                      actionBlock: null, tokenCount: null, createdAt: new Date().toISOString(),
                    }}
                    isStreaming
                  />
                )}
                {isStreaming && !streamingContent && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0">
                      <BrainCircuit size={14} className="text-primary" />
                    </div>
                    <div className="bg-card/80 backdrop-blur-sm border border-border/60 rounded-2xl rounded-tl-sm shadow-sm">
                      <TypingIndicator />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={sendMessage}
              disabled={isStreaming}
            />
          </>
        ) : null}
      </div>

      {/* Context panel */}
      {activeConversation && !isMobile && contextOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 256, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="overflow-hidden flex-shrink-0"
        >
          <ContextPanel
            notes={[]}
            tasks={[]}
            events={[]}
          />
        </motion.div>
      )}
    </div>
  );
}
