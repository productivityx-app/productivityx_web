import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Loader2, ArrowUpDown, Filter, Save, ExternalLink, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchApi } from '@/api/search';
import { SearchResult } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getDateFnsLocale } from '@/i18n/dateLocales';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import SearchResultItem, { typeConfig } from '@/components/search/SearchResultItem';
import SearchFilters from '@/components/search/SearchFilters';
import SearchPreview from '@/components/search/SearchPreview';

type SearchType = 'ALL' | 'NOTE' | 'TASK' | 'EVENT' | 'CONVERSATION';

const PAGE_SIZE = 15;

export default function SearchPage() {
  useEffect(() => { document.title = 'Search — ProductivityX'; }, []);
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [filter, setFilter] = useState<SearchType>('ALL');
  const [sort, setSort] = useState<'relevance' | 'updatedAt' | 'createdAt' | 'title'>('relevance');
  const [page, setPage] = useState(0);
  const [previewResult, setPreviewResult] = useState<SearchResult | null>(null);
  const [savedSearches, setSavedSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('px-saved-searches') || '[]'); }
    catch { return []; }
  });

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    setSearchError(false);
    try {
      const types = filter === 'ALL' || filter === 'CONVERSATION' ? undefined : filter;
      const res = await searchApi.search(q, types);
      setResults(res.results || []);
      setPage(0);
      setPreviewResult(null);
    } catch { setSearchError(true); setResults([]); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => {
    const t = setTimeout(() => {
      doSearch(query);
      setSearchParams(query ? { q: query } : {}, { replace: true });
    }, 300);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  useEffect(() => { if (initialQuery) doSearch(initialQuery); }, []);

  const sorted = [...results].sort((a, b) => {
    if (sort === 'updatedAt') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (sort === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageResults = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const saveSearch = () => {
    if (!query.trim()) return;
    const updated = [query, ...savedSearches.filter((s) => s !== query)].slice(0, 10);
    setSavedSearches(updated);
    localStorage.setItem('px-saved-searches', JSON.stringify(updated));
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Filters sidebar (desktop) */}
      <aside className="hidden lg:flex w-56 flex-col border-r border-border bg-card/30 p-4 gap-4">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground/50" />
          <span className="text-xs font-semibold text-foreground">{t('searchPage.filters')}</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">{t('searchPage.type')}</label>
          <SearchFilters active={filter} onChange={(v) => { setFilter(v); setPage(0); }} />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">{t('searchPage.sortBy')}</label>
          <div className="flex flex-col gap-1">
            {(['relevance', 'updatedAt', 'title'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  sort === s ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                }`}
              >
                {t(`searchPage.sort.${s}`)}
              </button>
            ))}
          </div>
        </div>

        {savedSearches.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">{t('searchPage.saved')}</label>
            <div className="flex flex-col gap-0.5">
              {savedSearches.map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="text-left px-2.5 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/30 truncate transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Results area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6">
          {/* Search bar */}
          <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 mb-6 focus-within:border-primary/40 transition-colors shadow-sm">
            <Search size={16} className="text-muted-foreground/40 flex-shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPage.placeholder')}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/30 outline-none"
            />
            {loading && <Loader2 size={14} className="animate-spin text-muted-foreground/40" />}
            <button
              onClick={saveSearch}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-muted-foreground/50 hover:text-foreground hover:bg-accent/30 transition-all"
            >
              <Save size={12} />
              {t('searchPage.saveSearch')}
            </button>
          </div>

          {/* Mobile filters */}
          <div className="lg:hidden mb-4">
            <SearchFilters active={filter} onChange={(v) => { setFilter(v); setPage(0); }} />
          </div>

          {searchError && !loading ? (
            <ErrorState onRetry={() => { setSearchError(false); doSearch(query); }} />
          ) : !query ? (
            <EmptyState icon={Search} title={t('searchPage.searchEverything')} description={t('searchPage.searchEverythingDesc')} gradient="search" />
          ) : loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-accent/30 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-accent/20 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : results.length === 0 && query.length > 1 ? (
            <EmptyState icon={Search} title={t('searchPage.noResultsFor', { query })} description={t('searchPage.tryDifferentKeywords')} gradient="search" />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-muted-foreground/50">
                  {t('searchPage.foundResults', { count: results.length })}
                </p>
                <div className="lg:hidden flex items-center gap-1">
                  <ArrowUpDown size={12} className="text-muted-foreground/30" />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as any)}
                    className="text-xs bg-transparent border-none outline-none text-muted-foreground/60"
                  >
                    <option value="relevance">{t('searchPage.sort.relevance')}</option>
                    <option value="updatedAt">{t('searchPage.sort.updatedAt')}</option>
                    <option value="title">{t('searchPage.sort.title')}</option>
                  </select>
                </div>
              </div>

              <AnimatePresence mode="popLayout">
                {pageResults.map((result) => (
                  <motion.div
                    key={result.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <SearchResultItem
                      result={result}
                      query={query}
                      onSelect={() => {
                        const cfg = typeConfig[result.type] || typeConfig.NOTE;
                        navigate(`${cfg.path}/${result.id}`);
                      }}
                      onPreview={() => setPreviewResult(result)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-1.5 rounded-lg text-xs bg-accent/30 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
                  >
                    {t('searchPage.previous')}
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                        page === i ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1.5 rounded-lg text-xs bg-accent/30 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
                  >
                    {t('searchPage.next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Preview pane (desktop) */}
      {previewResult && (
        <div className="hidden xl:block">
          <SearchPreview
            result={previewResult}
            onClose={() => setPreviewResult(null)}
            onOpen={() => {
              const cfg = typeConfig[previewResult.type] || typeConfig.NOTE;
              navigate(`${cfg.path}/${previewResult.id}`);
            }}
          />
        </div>
      )}
    </div>
  );
}
