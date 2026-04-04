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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full mb-6">
        <div className="relative pl-5 py-2">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary/80 to-primary/20 rounded-full"></div>
          <div className="flex items-center space-x-2 text-text-tertiary mb-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Anti-Library Synthesis</span>
          </div>
          <h2 className="text-xl md:text-3xl font-black text-text-primary tracking-tight mb-2 uppercase">Neural Echo</h2>
          <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-3xl">
            Serendipitous connections from your archive to spark new ideas and reflections. Discover hidden patterns through AI synthesis.
          </p>
        </div>

        <button 
          onClick={fetchResurface}
          disabled={loading}
          className="px-6 py-3.5 bg-surface border border-border text-text-primary font-black text-xs uppercase tracking-widest rounded-2xl hover:border-primary/50 transition-all active:scale-95 shadow-lg flex items-center justify-center disabled:opacity-50"
        >
          <svg className={`w-4 h-4 mr-3 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Synthesizing...' : 'Re-Roll variables'}
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
            <section className="relative overflow-hidden group px-2 md:px-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-surface to-background border border-primary/20 rounded-[2rem] md:rounded-[3rem] z-0"></div>
              
              <div className="relative z-10 p-8 md:p-14 text-center max-w-4xl mx-auto flex flex-col items-center justify-center">
                 <div className="w-12 h-12 md:w-14 md:h-14 bg-background rounded-full border border-border shadow-2xl flex items-center justify-center mb-6 md:mb-8">
                   <span className="text-xl md:text-2xl animate-bounce">✨</span>
                 </div>
                 <h2 className="text-lg md:text-3xl font-bold text-text-primary leading-relaxed tracking-tight transition-all duration-500">
                   "{data.synthesis}"
                 </h2>
              </div>
            </section>
          )}

          {/* Cards Display Grid */}
          {data.memories.length > 0 ? (
            <section>
              <div className="flex items-center space-x-3 mb-6 px-4 md:px-2">
                <div className="w-1.5 h-6 bg-primary/20 rounded-full"></div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary">Forgotten Variables</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
             <div className="text-center min-h-[62vh] flex flex-col items-center justify-center w-full bg-surface border border-border rounded-2xl border-dashed">
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
