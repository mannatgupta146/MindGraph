import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MemoryCard from '../components/ui/MemoryCard';

const Resurface = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ memories: [], synthesis: '' });
  const [loading, setLoading] = useState(true);

  const fetchResurface = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:3000/api/saves/resurface', { withCredentials: true });
      setData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResurface();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Daily Resurface</h1>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mt-0.5">Anti-Library Synthesis</p>
          </div>
        </div>

        <button 
          onClick={fetchResurface}
          disabled={loading}
          className="px-4 py-2 bg-surface text-sm border border-border text-text-secondary font-bold rounded-lg hover:text-primary hover:border-primary/40 focus:ring-4 ring-primary/10 transition-all shadow-md flex items-center disabled:opacity-50"
        >
          <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Synthesizing...' : 'Re-Roll Variables'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-8 animate-pulse">
           <div className="h-40 bg-surface border border-border rounded-3xl w-full"></div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => <div key={n} className="h-64 bg-surface border border-border rounded-xl"></div>)}
           </div>
        </div>
      ) : (
        <div className="space-y-12 animate-in fade-in duration-1000 slide-in-from-bottom-4">
          
          {/* AI Synthesis Hero Banner */}
          {data.synthesis && data.memories.length > 0 && (
            <section className="relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-surface to-background border border-primary/20 rounded-3xl z-0"></div>
              
              <div className="relative z-10 p-10 md:p-14 text-center max-w-4xl mx-auto flex flex-col items-center justify-center">
                 <div className="w-14 h-14 bg-background rounded-full border border-border shadow-2xl flex items-center justify-center mb-8">
                   <span className="text-xl">✨</span>
                 </div>
                 <h2 className="text-2xl md:text-3xl font-medium text-text-primary leading-relaxed tracking-tight">
                   "{data.synthesis}"
                 </h2>
              </div>
            </section>
          )}

          {/* Cards Display Grid */}
          {data.memories.length > 0 ? (
            <section>
              <div className="flex items-center space-x-3 mb-6 px-2">
                <div className="w-1.5 h-6 bg-primary/20 rounded-full"></div>
                <h3 className="text-sm font-black uppercase tracking-widest text-text-tertiary">Forgotten Variables</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.memories.map(save => (
                  <MemoryCard 
                    key={save._id} 
                    {...save} 
                    date={save.createdAt} 
                    onClick={() => navigate(`/dashboard/${save._id}`)}
                  />
                ))}
              </div>
            </section>
          ) : (
             <div className="text-center min-h-[65vh] flex flex-col items-center justify-center w-full bg-surface border border-border rounded-2xl border-dashed">
               <div className="w-16 h-16 mb-6 bg-background border border-border rounded-full flex items-center justify-center shadow-lg">
                 <svg className="w-6 h-6 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                 </svg>
               </div>
               <h3 className="text-xl font-medium text-text-secondary mb-2">No Memories Found</h3>
               <p className="text-sm text-text-tertiary">You need to capture some knowledge before we can synthesize it!</p>
             </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Resurface;
