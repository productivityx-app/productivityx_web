import { useState } from 'react';
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface Props {
  content: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export default function MessageActions({ content, onRegenerate, isRegenerating }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success(t('ai.copied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(feedback === type ? null : type);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-0.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <button
        onClick={handleCopy}
        className="p-1 rounded text-muted-foreground/40 hover:text-foreground hover:bg-accent/50 transition-all"
        title={t('ai.copyMessage')}
      >
        {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
      </button>
      {onRegenerate && (
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="p-1 rounded text-muted-foreground/40 hover:text-foreground hover:bg-accent/50 transition-all disabled:opacity-30"
          title={t('ai.regenerate')}
        >
          <RefreshCw size={12} className={isRegenerating ? 'animate-spin' : ''} />
        </button>
      )}
      <div className="w-px h-3 bg-border mx-0.5" />
      <button
        onClick={() => handleFeedback('up')}
        className={`p-1 rounded transition-all ${feedback === 'up' ? 'text-green-500 bg-green-500/10' : 'text-muted-foreground/40 hover:text-foreground hover:bg-accent/50'}`}
        title={t('ai.thumbsUp')}
      >
        <ThumbsUp size={12} />
      </button>
      <button
        onClick={() => handleFeedback('down')}
        className={`p-1 rounded transition-all ${feedback === 'down' ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground/40 hover:text-foreground hover:bg-accent/50'}`}
        title={t('ai.thumbsDown')}
      >
        <ThumbsDown size={12} />
      </button>
    </motion.div>
  );
}
