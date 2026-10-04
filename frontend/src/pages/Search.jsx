import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/config';
import MemoryCard from '../components/ui/MemoryCard';
import MemoryDetailDrawer from '../components/ui/MemoryDetailDrawer';
import { Search as SearchIcon, X, Sparkles, FileText, Layers } from 'lucide-react';

const Search = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Selected save for detail drawer
  const selectedSave = id ? results.find(r => r._id === id) : null;

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const { data } = await api.get(`/saves/search?query=${encodeURIComponent(searchTerm)}`);
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length > 2) {
        performSearch(query);
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Keyboard shortcut: Press "/" to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDeleteSuccess = () => {
    setResults(prev => prev.filter(s => s._id !== id));
    navigate('/search');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Hero */}
      <div className="relative pl-5 py-2 mb-6">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-primary/80 to-primary/20 rounded-full"></div>
        <div className="flex items-center space-x-2 text-text-tertiary mb-1">
          <SearchIcon className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Search & Discover</span>
        </div>
        <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-2xl">
          Search your saved content by topic, keyword, or concept with smart AI indexing.
        </p>
      </div>

      {/* Main Search Bar Section (Full Width, Left-Aligned) */}
      <div className="w-full space-y-4 mb-8">
        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-primary/30 to-secondary/30 rounded-3xl blur-md opacity-20 group-focus-within:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative flex items-center bg-surface border-2 border-border group-focus-within:border-primary/50 rounded-2xl px-5 py-4 shadow-xl transition-all">
            <SearchIcon className={`w-5 h-5 mr-3 shrink-0 transition-colors ${isSearching ? 'text-primary animate-pulse' : 'text-text-tertiary group-focus-within:text-primary'}`} />
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keyword, concept, or phrase... (Press '/' to focus)"
              className="w-full bg-transparent border-none outline-none text-base md:text-lg text-text-primary placeholder:text-text-tertiary/50 font-medium"
              autoFocus
            />

            {query ? (
              <button 
                onClick={() => { setQuery(''); setResults([]); setHasSearched(false); inputRef.current?.focus(); }}
                className="p-1.5 hover:bg-background/80 rounded-xl text-text-tertiary hover:text-text-primary transition-colors ml-2 shrink-0"
                title="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-mono text-text-tertiary bg-background border border-border rounded-md shadow-xs">
                /
              </kbd>
            )}
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="pt-2">
        {isSearching && results.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 bg-surface border border-border rounded-2xl p-5 animate-pulse flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-20 h-4 bg-border/40 rounded-lg"></div>
                  <div className="w-3/4 h-6 bg-border/30 rounded-lg"></div>
                  <div className="w-full h-12 bg-border/20 rounded-lg"></div>
                </div>
                <div className="flex space-x-2 pt-4">
                  <div className="w-12 h-4 bg-border/40 rounded-md"></div>
                  <div className="w-16 h-4 bg-border/40 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
              <h2 className="text-lg md:text-xl font-black text-text-primary tracking-tight">
                Found <span className="text-primary">{results.length}</span> {results.length === 1 ? 'match' : 'matches'} for <span className="text-primary italic">"{query}"</span>
              </h2>
              <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                Smart Conceptual Search
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
              {results.map((result) => (
                <MemoryCard 
                  key={result._id} 
                  {...result} 
                  score={result.score}
                  date={result.createdAt} 
                  onClick={() => navigate(`/search/${result._id}`)}
                />
              ))}
            </div>
          </div>
        ) : hasSearched && !isSearching ? (
          <div className="text-center py-20 px-6 bg-surface/30 border-2 border-dashed border-border rounded-[2.5rem] w-full animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-primary">
              <SearchIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-text-primary uppercase tracking-wider mb-2">No Matching Content</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-6 max-w-md mx-auto">
              We couldn't find items matching <span className="font-bold text-text-primary">"{query}"</span>. Try adjusting your query or searching for a different keyword.
            </p>
            <button 
              onClick={() => { setQuery(''); setResults([]); setHasSearched(false); }}
              className="px-6 py-2.5 bg-surface border border-border text-text-primary font-bold text-xs uppercase tracking-widest rounded-xl hover:border-text-primary/40 transition-all shadow-md active:scale-95"
            >
              Reset Search
            </button>
          </div>
        ) : (
          /* Feature Showcase Cards (Default State) */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-6 border border-border rounded-3xl bg-surface/40 hover:bg-surface/70 hover:border-text-primary/30 transition-all duration-300 shadow-sm flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-text-primary mb-2 uppercase tracking-wide">Concept Understanding</h3>
                <p className="text-xs text-text-secondary leading-relaxed font-medium">
                  Search by meaning, not just exact words. Querying <span className="text-text-primary font-bold">"learning strategies"</span> resurfaces notes on Spaced Repetition or Active Recall.
                </p>
              </div>
            </div>

            <div className="p-6 border border-border rounded-3xl bg-surface/40 hover:bg-surface/70 hover:border-text-primary/30 transition-all duration-300 shadow-sm flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary mb-4 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-text-primary mb-2 uppercase tracking-wide">Multi-Format Indexing</h3>
                <p className="text-xs text-text-secondary leading-relaxed font-medium">
                  Deeply index Articles, Tweets, PDFs, YouTube transcripts, Images, and Code Snippets in one search.
                </p>
              </div>
            </div>

            <div className="p-6 border border-border rounded-3xl bg-surface/40 hover:bg-surface/70 hover:border-text-primary/30 transition-all duration-300 shadow-sm flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-text-primary mb-2 uppercase tracking-wide">OCR & Extracted Text</h3>
                <p className="text-xs text-text-secondary leading-relaxed font-medium">
                  All uploaded PDFs and images undergo automatic AI OCR text extraction, making raw documents searchable instantly.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <MemoryDetailDrawer 
        save={selectedSave}
        saveId={id}
        isOpen={!!id}
        onClose={() => navigate('/search')}
        onDeleteSuccess={handleDeleteSuccess}
        onUpdateSuccess={() => performSearch(query)}
      />
    </div>
  );
};

export default Search;
