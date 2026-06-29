import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, ArrowRight, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { searchApi } from '@/api/search';
import { SearchResult } from '@/types';
import SearchResultItem, { typeConfig } from './SearchResultItem';
import SearchFilters from './SearchFilters';
import SearchPreview from './SearchPreview';
import RecentSearches, { useRecentSearches } from './RecentSearches';

type SearchType = 'ALL' | 'NOTE' | 'TASK' | 'EVENT' | 'CONVERSATION';

interface Props { open: boolean; onClose: () => void; }

export default function SearchModal({ open, onClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { recentSearches, addRecent, removeRecent, clearRecent } = useRecentSearches();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<SearchType>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [previewResult, setPreviewResult] = useState<SearchResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) { setQuery(''); setResults([]); setSelectedIndex(-1); setPreviewResult(null); }
    else setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setSelectedIndex(-1); return; }
    setLoading(true);
    try {
      const res = await searchApi.search(q, filter === 'ALL' || filter === 'CONVERSATION' ? undefined : filter);
      setResults(res.results || []);
      setSelectedIndex(-1);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 250);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    const key = r.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const flatItems = Object.entries(grouped).flatMap(([type, items]) => [type, ...items]);
  const resultCount = results.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const total = flatItems.length;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, total - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter' && selectedIndex >= 0) {
      const item = flatItems[selectedIndex];
      if (typeof item === 'string') return;
      handleSelect(item);
    }
    else if (e.key === 'Escape') { onClose(); }
  };

  useEffect(() => {
    const el = itemRefs.current[selectedIndex];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleSelect = (result: SearchResult) => {
    addRecent(query);
    const cfg = typeConfig[result.type] || typeConfig.NOTE;
    navigate(`${cfg.path}/${result.id}`);
    onClose();
  };

  const suggestionSearches = [
    t('searchModal.suggestRecentNotes'),
    t('searchModal.suggestOverdueTasks'),
    t('searchModal.suggestTodayEvents'),
  ];

  const showSuggestions = query.length < 2 && results.length === 0;
  const showNoResults = query.length >= 2 && !loading && results.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden flex"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main panel */}
            <div className="flex-1 min-w-0">
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <Search size={17} className="text-muted-foreground/40 flex-shrink-0" />
                <input
                  ref={inputRef}
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('searchModal.placeholder')}
                  className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/30 outline-none"
                />
                {loading ? (
                  <Loader2 size={15} className="animate-spin text-muted-foreground/40" />
                ) : (
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-accent/30 text-[10px] text-muted-foreground/40 font-mono">
                    <Command size={10} />K
                  </kbd>
                )}
              </div>

              {/* Filters */}
              <div className="px-5 py-2.5 border-b border-border">
                <SearchFilters active={filter} onChange={(v) => { setFilter(v); setSelectedIndex(-1); }} />
              </div>

              {/* Results */}
              <div
                ref={resultsRef}
                className="overflow-y-auto"
                style={{ maxHeight: 'min(60vh, 480px)' }}
              >
                {/* Suggestions */}
                {showSuggestions && (
                  <div className="px-5 py-4">
                    <p className="text-xs text-muted-foreground/40 mb-3">{t('searchModal.suggestions')}</p>
                    {suggestionSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/30 w-full text-left transition-colors"
                      >
                        <ArrowRight size={11} className="text-muted-foreground/30" />
                        {s}
                      </button>
                    ))}
                    <RecentSearches
                      searches={recentSearches}
                      onSelect={(q) => setQuery(q)}
                      onRemove={removeRecent}
                      onClear={clearRecent}
                    />
                  </div>
                )}

                {/* Recent searches when empty */}
                {query.length === 0 && results.length === 0 && (
                  <RecentSearches
                    searches={recentSearches}
                    onSelect={(q) => setQuery(q)}
                    onRemove={removeRecent}
                    onClear={clearRecent}
                  />
                )}

                {/* No results */}
                {showNoResults && (
                  <div className="px-5 py-12 text-center">
                    <p className="text-sm text-muted-foreground/60">{t('searchModal.noResultsFor', { query })}</p>
                    <p className="text-xs text-muted-foreground/30 mt-1">{t('searchModal.tryDifferentKeywords')}</p>
                  </div>
                )}

                {/* Grouped results */}
                {(() => {
                  let idx = -1;
                  return Object.entries(grouped).map(([type, items]) => {
                    const cfg = typeConfig[type] || typeConfig.NOTE;
                    const Icon = cfg.icon;
                    idx += 1; // header row
                    return (
                      <div key={type}>
                        <div className="px-5 py-1.5 flex items-center gap-2 border-b border-border/30 bg-accent/10">
                          <Icon size={12} className={cfg.color} />
                          <span className="text-[11px] font-medium text-muted-foreground/60">{cfg.label}s</span>
                          <span className="text-[10px] text-muted-foreground/30 ml-auto">{items.length}</span>
                        </div>
                        {items.map((result) => {
                          idx += 1;
                          return (
                            <SearchResultItem
                              key={result.id}
                              result={result}
                              query={query}
                              selected={selectedIndex === idx}
                              onSelect={() => handleSelect(result)}
                              onPreview={() => setPreviewResult(result)}
                            />
                          );
                        })}
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Footer */}
              <div className="px-5 py-2 border-t border-border flex items-center gap-3 text-[10px] text-muted-foreground/30">
                <span><kbd className="px-1 py-0.5 rounded bg-accent/30 font-mono">↑↓</kbd> Navigate</span>
                <span><kbd className="px-1 py-0.5 rounded bg-accent/30 font-mono">↵</kbd> Open</span>
                <span><kbd className="px-1 py-0.5 rounded bg-accent/30 font-mono">Esc</kbd> Close</span>
                {resultCount > 0 && <span className="ml-auto">{resultCount} results</span>}
              </div>
            </div>

            {/* Preview pane */}
            {previewResult && (
              <div className="hidden lg:block">
                <SearchPreview
                  result={previewResult}
                  onClose={() => setPreviewResult(null)}
                  onOpen={() => handleSelect(previewResult)}
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
