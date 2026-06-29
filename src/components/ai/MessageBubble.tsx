import { useState, memo } from 'react';
import { Bot, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Message } from '@/types';
import CodeBlock from './CodeBlock';
import MessageActions from './MessageActions';
import ActionBlock from '../common/ActionBlock';

interface Props {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

const MessageBubble = memo(function MessageBubble({ message, isStreaming, onRegenerate, isRegenerating }: Props) {
  const [showActions, setShowActions] = useState(false);

  const isUser = message.role === 'USER';

  const extractActionBlock = (content: string) => {
    try {
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          const data = JSON.parse(trimmed);
          if (data.type && ['CREATE_TASK', 'CREATE_NOTE', 'ADD_EVENT'].includes(data.type)) {
            return data;
          }
        }
      }
    } catch {}
    return null;
  };

  const actionData = !isUser ? extractActionBlock(message.content) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
          isUser ? 'bg-primary' : 'bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10',
        )}
      >
        {isUser ? (
          <User size={15} className="text-primary-foreground" />
        ) : (
          <Sparkles size={14} className="text-primary" />
        )}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[80%] md:max-w-[70%] lg:max-w-[65%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
              : 'bg-card/80 backdrop-blur-sm border border-border/60 rounded-2xl rounded-tl-sm text-foreground shadow-sm',
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="max-w-none prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 prose-code:bg-muted/50 prose-code:px-1 prose-code:rounded prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5 prose-headings:text-foreground prose-a:text-primary prose-a:underline">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeStr = String(children).replace(/\n$/, '');
                    if (match) {
                      return <CodeBlock code={codeStr} language={match[1]} />;
                    }
                    return (
                      <code className={cn('bg-muted/50 px-1.5 py-0.5 rounded text-[12.5px]', className)} {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre({ children }) {
                    return <>{children}</>;
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
              {actionData && <ActionBlock data={actionData} />}
            </div>
          )}
        </div>

        {/* Streaming cursor */}
        {isStreaming && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="inline-block w-2 h-4 bg-primary rounded-sm ml-0.5"
          />
        )}

        {/* Actions (AI messages only) */}
        {!isUser && message.content && !isStreaming && (
          <MessageActions
            content={message.content}
            onRegenerate={onRegenerate}
            isRegenerating={isRegenerating}
          />
        )}
      </div>
    </motion.div>
  );
});

export default MessageBubble;

