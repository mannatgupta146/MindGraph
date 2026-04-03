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
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Find the selected save from the local results list if it exists
  const selectedSave = id ? results.find(r => r._id === id) : null;


  const handleSearch = async (e, forcedQuery) => {
    if (e) e.preventDefault();
    const activeQuery = forcedQuery || query;
    if (!activeQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const { data } = await axios.get(`http://localhost:3000/api/saves/search?query=${encodeURIComponent(activeQuery)}`, {
        withCredentials: true
      });
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSuccess = () => {
    // 1. Optimistic local update
    setResults(prev => prev.filter(s => s._id !== id));
    // 2. Clear URL to hide drawer
    navigate('/search');
    // 3. For search, we stay on current results but filtered
  };



  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-text-primary tracking-tight">Search your Second Brain</h1>
        <p className="text-text-secondary text-lg">Ask anything in natural language. We'll find the semantic match.</p>
      </div>

      {/* Modern Search Bar */}
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <svg className={`w-6 h-6 transition-colors ${loading ? 'text-primary animate-pulse' : 'text-text-tertiary group-focus-within:text-primary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. 'What was that theory about neural networks and memory?'"
          className="w-full pl-14 pr-32 py-5 bg-surface border-2 border-border rounded-2xl text-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-all shadow-xl shadow-black/5"
          autoFocus
        />
        <div className="absolute inset-y-2 right-2 flex items-center">
          <button 
            type="submit"
            disabled={loading}
            className="px-6 h-full bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center shadow-lg shadow-primary/20"
          >
            {loading ? 'Thinking...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Discovery Suggestions */}
      <div className="flex flex-wrap items-center justify-center gap-3 py-2 animate-in fade-in slide-in-from-top-4 duration-700">
        <span className="text-[10px] text-text-tertiary font-black uppercase tracking-[0.2em] mr-1">Discovery:</span>
        {['Project Management', 'AI Prompts', 'Status Reports', 'Dashboard Help'].map((tag) => (
          <button
            key={tag}
            onClick={() => { setQuery(tag); handleSearch(null, tag); }}
            className="px-4 py-1.5 bg-surface border border-border rounded-full text-xs text-text-secondary hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Results Section */}
      <div className="space-y-6 pt-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-32 bg-surface border border-border rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="flex flex-col space-y-1 mb-4 px-2">
              <div className="flex items-center justify-between text-text-tertiary text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-2"></div>
                  Search Results
                </span>
                <span>Sorted by Relevancy</span>
              </div>
              <h2 className="text-xl font-bold text-text-primary">
                Showing {results.length} memories for <span className="text-primary">"{query}"</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {results.map((result) => (
                <div 
                  key={result._id} 
                  onClick={() => navigate(`/search/${result._id}`)}
                  className="bg-surface p-5 border border-border hover:border-primary/50 rounded-2xl cursor-pointer transition-all hover:shadow-lg group flex items-start space-x-4"
                >

                  <div className={`mt-1 p-2 rounded-lg border ${
                    result.type === 'article' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                    result.type === 'tweet' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' :
                    result.type === 'pdf' ? 'bg-red-400/10 text-red-400 border-red-400/20' :
                    result.type === 'youtube' ? 'bg-red-600/10 text-red-600 border-red-600/20' :
                    'bg-primary/10 text-primary border-primary/20'
                  }`}>
                    {result.type === 'article' && (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM14 4v4h4" />
                      </svg>
                    )}
                    {result.type === 'tweet' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    )}
                    {result.type === 'youtube' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186c-.273-1.011-1.04-1.802-2.028-2.074C19.694 3.827 12 3.827 12 3.827s-7.694 0-9.47.285C1.542 4.384.775 5.175.502 6.186.225 7.99.225 12 .225 12s0 4.01.277 5.814c.273 1.011 1.04 1.802 2.028 2.074 1.776.285 9.47.285 9.47.285s7.694 0 9.47-.285c.988-.272 1.755-1.063 2.028-2.074.277-1.804.277-5.814.277-5.814s0-4.01-.277-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    )}
                    {result.type === 'pdf' && (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )}
                    {!['article', 'tweet', 'youtube', 'pdf'].includes(result.type) && (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-text-primary mb-1 group-hover:text-primary transition-colors">{result.title}</h3>
                    <p className="text-text-secondary line-clamp-2">{result.summary}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {result.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-hover border border-border text-text-tertiary group-hover:border-primary/30">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity self-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : hasSearched ? (
          <div className="text-center py-20 bg-surface/50 border-2 border-dashed border-border rounded-3xl">
            <h3 className="text-2xl font-semibold text-text-secondary mb-2">No matching memories found</h3>
            <p className="text-text-tertiary">Try rephrasing your search or adding more content to your brain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50">
            <div className="p-6 border border-border rounded-2xl bg-surface/30">
              <span className="text-xs font-bold text-primary mb-2 block uppercase tracking-widest">Tip</span>
              <p className="text-text-secondary">Search by concepts, not just keywords. "Building local apps" might find results about "Offline architecture".</p>
            </div>
            <div className="p-6 border border-border rounded-2xl bg-surface/30">
              <span className="text-xs font-bold text-secondary mb-2 block uppercase tracking-widest">Recent Context</span>
              <p className="text-text-secondary">Your search is powered by local vector embeddings, ensuring 100% privacy and speed.</p>
            </div>
          </div>
        )}
      </div>

      {/* Single Detail Drawer for Search Results */}
      <MemoryDetailDrawer 
        save={selectedSave}
        saveId={id}
        isOpen={!!id}
        onClose={() => navigate('/search')}
        onDeleteSuccess={handleDeleteSuccess}
      />


    </div>
  );
};

export default Search;
