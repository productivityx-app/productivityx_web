import { useMemo, useState, useRef, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-okaidia.min.css';

interface Props {
  code: string;
  language?: string;
}

const LANG_MAP: Record<string, string> = {
  js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
  py: 'python', rb: 'ruby', rs: 'rust', go: 'go',
  json: 'json', yaml: 'yaml', yml: 'yaml', md: 'markdown',
  sh: 'bash', bash: 'bash', css: 'css', sql: 'sql', html: 'markup',
};

export default function CodeBlock({ code, language }: Props) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const lang = language ? (LANG_MAP[language] || language) : 'typescript';

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, lang]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');
  const lineCount = lines.length;

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-border/50 bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#2d2d2d] border-b border-[#3d3d3d]">
        <span className="text-[11px] text-gray-400 font-mono uppercase tracking-wider">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-gray-400 hover:text-gray-200 hover:bg-[#3d3d3d] transition-all"
        >
          {copied ? (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-green-400">
              <Check size={12} /> Copied
            </motion.span>
          ) : (
            <span className="flex items-center gap-1">
              <Copy size={12} /> Copy
            </span>
          )}
        </button>
      </div>
      <div className="flex overflow-x-auto">
        <div className="flex-none text-right px-3 py-3 text-[12px] leading-[1.65] text-gray-500 font-mono select-none border-r border-[#3d3d3d] bg-[#252525]">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="flex-1 p-3 overflow-x-auto">
          <code ref={codeRef} className={`language-${lang}`} style={{ fontSize: '12.5px', lineHeight: 1.65, fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace" }}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
