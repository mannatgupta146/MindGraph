import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import MemoryCard from '../components/ui/MemoryCard';
import MemoryDetailDrawer from '../components/ui/MemoryDetailDrawer';

const Search = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Find the selected save from the local results list if it exists
  const selectedSave = id ? results.find(r => r._id === id) : null;

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const { data } = await axios.get(`http://localhost:3000/api/saves/search?query=${encodeURIComponent(searchTerm)}`, {
        withCredentials: true
      });
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
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleDeleteSuccess = () => {
    setResults(prev => prev.filter(s => s._id !== id));
    navigate('/search');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Search Header */}
      <div className="relative pl-5 py-2 mb-10">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary/80 to-primary/20 rounded-full"></div>
        <div className="flex items-center space-x-2 text-text-tertiary mb-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Semantic Intelligence</span>
        </div>
        <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-3xl">
          Ask anything in natural language. We use vector-based AI to find the deepest conceptual matches in your archive.
        </p>
      </div>

      {/* Modern Search Bar */}
      <div className="relative max-w-2xl mx-auto group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
        <div className="relative flex items-center bg-surface border-2 border-border group-focus-within:border-primary/40 rounded-2xl p-1.5 transition-all shadow-xl">
          <div className="pl-4 pr-2 flex items-center">
            <svg className={`w-5 h-5 transition-colors ${isSearching ? 'text-primary animate-pulse' : 'text-text-tertiary group-focus-within:text-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 'What was that theory about neural networks?'"
            className="flex-1 bg-transparent border-none outline-none text-lg text-text-primary placeholder:text-text-tertiary/40 py-2 font-medium"
            autoFocus
          />
          {query && (
            <button 
              onClick={() => { setQuery(''); setResults([]); setHasSearched(false); }}
              className="p-2 mr-1 hover:bg-surface-hover rounded-xl text-text-tertiary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results Grid (Dual-Column Mastery) */}
      <div className="space-y-8 pt-4">
        {isSearching && results.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="min-h-[180px] p-4 bg-surface border border-border rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="w-16 h-5 bg-border/50 rounded animate-pulse mb-3"></div>
                  <div className="w-3/4 h-6 bg-border/30 rounded animate-pulse mb-2"></div>
                  <div className="w-full h-8 bg-border/20 rounded-lg animate-pulse"></div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <div className="w-16 h-4 bg-border/50 rounded animate-pulse"></div>
                  <div className="w-20 h-4 bg-border/50 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className={`transition-opacity duration-300 ${isSearching ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex flex-col space-y-1 px-2 border-l-4 border-primary pl-6 mb-6">
               <div className="flex items-center justify-between text-text-tertiary text-[10px] font-black uppercase tracking-[0.2em]">
                 <span className="flex items-center">
                   <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                   AI Semantic Rank
                 </span>
                 <span>Synchronized Results</span>
               </div>
               <h2 className="text-2xl font-black text-text-primary">
                 Found {results.length} related concepts for <span className="text-primary italic">"{query}"</span>
               </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-500">
              {results.map((result) => (
                <MemoryCard 
                  key={result._id} 
                  {...result} 
                  date={result.createdAt} 
                  onClick={() => navigate(`/search/${result._id}`)}
                />
              ))}
            </div>
          </div>
        ) : hasSearched && !isSearching ? (
          <div className="text-center py-24 bg-surface/30 border-2 border-dashed border-border rounded-[3rem] animate-in fade-in zoom-in-95">
             <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </div>
             <h3 className="text-3xl font-black text-text-secondary mb-3">No conceptual matches found</h3>
             <p className="text-text-tertiary max-w-md mx-auto leading-relaxed">
               Try searching for a broader master pillar or different keywords. AI synthesis sometimes needs more context to find deep matches.
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 hover:opacity-100 transition-opacity duration-500">
            <div className="p-8 border border-border rounded-[2.5rem] bg-surface/20 relative group overflow-hidden hover:bg-surface/50 hover:shadow-xl hover:shadow-primary/5 hover:scale-[1.02] transition-all duration-300 transform cursor-pointer">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors duration-500"></div>
               <span className="text-xs font-black text-primary mb-3 block uppercase tracking-[0.2em] relative z-10">Research Tip</span>
               <p className="text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors duration-300 relative z-10">Your search is <span className="font-bold text-text-primary">Semantic</span>—it understands ideas. Searching for "learning patterns" will find results about "Space repetition" or "Anki".</p>
            </div>
            <div className="p-8 border border-border rounded-[2.5rem] bg-surface/20 relative group overflow-hidden hover:bg-surface/50 hover:shadow-xl hover:shadow-secondary/5 hover:scale-[1.02] transition-all duration-300 transform cursor-pointer">
               <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-secondary/20 transition-colors duration-500"></div>
               <span className="text-xs font-black text-secondary mb-3 block uppercase tracking-[0.2em] relative z-10">Deep Indexing</span>
               <p className="text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors duration-300 relative z-10">Your entire archive including <span className="font-bold text-text-primary">Tweets, PDFs, Videos, and Articles</span> is highly indexed. Don't be afraid to search broadly.</p>
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
