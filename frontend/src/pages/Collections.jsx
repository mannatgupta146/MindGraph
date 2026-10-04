import React, { useState, useEffect } from 'react';
import api from '../api/config';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const Collections = () => {
  const collections = useStore((state) => state.collections);
  const loading = useStore((state) => state.loadingCollections);
  const fetchCollections = useStore((state) => state.fetchCollections);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({ title: '', description: '', icon: '📁', color: '#0F92D4' });
  const navigate = useNavigate();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCollections(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    try {
      await api.post('/collections', newCollection);
      setNewCollection({ title: '', description: '', icon: '📁', color: '#0F92D4' });
      setIsModalOpen(false);
      fetchCollections(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating collection');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full mb-8 md:mb-12">
        <div className="relative pl-5 py-2">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-primary/80 to-primary/20 rounded-full"></div>
          <div className="flex items-center space-x-2 text-text-tertiary mb-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Collections</span>
          </div>
          <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-3xl">
            Organize your saved items into folders and topics.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="px-4 py-3.5 bg-surface border border-border text-text-primary hover:border-primary/50 text-xs font-bold rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-75"
            title="Refresh Collections"
          >
            <svg className={`w-4 h-4 mr-2 ${isRefreshing || loading ? 'animate-spin text-primary' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isRefreshing || loading ? 'Syncing...' : 'Refresh'}</span>
          </button>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3.5 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 transition-all font-black text-xs uppercase tracking-widest group shrink-0 active:scale-95"
          >
            <svg className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Collection
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-48 md:h-64 bg-surface border border-border rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 animate-in fade-in duration-500">
          {collections.map(col => (
            <div 
              key={col._id}
              onClick={() => navigate(`/collections/${col._id}`)}
              className="group relative bg-surface border-2 border-border rounded-2xl p-6 md:p-8 hover:border-text-primary/20 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-xl flex flex-col items-center text-center h-55 md:h-60"
            >
              {/* Vibrant Accent Color Bar */}
              <div 
                className="absolute top-0 left-0 w-full h-1.5" 
                style={{ backgroundColor: col.color }}
              ></div>
              
              <div className="text-3xl md:text-4xl mb-3 mt-1 transform group-hover:scale-110 transition-transform duration-500">
                {col.icon || '📁'}
              </div>
              
              <h3 className="text-lg md:text-xl font-black text-text-primary mb-2 truncate w-full tracking-tight">{col.title}</h3>
              <p className="text-text-secondary line-clamp-2 text-[10px] md:text-[11px] font-medium leading-relaxed mb-4 flex-1">{col.description || 'No description provided.'}</p>
              
              <div className="flex items-center space-x-2 bg-text-primary/5 px-3 py-1.5 rounded-xl border border-border/40">
                <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">{col.saves?.length || 0} Items</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 md:py-32 bg-surface/30 border-2 border-border border-dashed rounded-[2.5rem] md:rounded-[3rem] px-6 animate-in fade-in zoom-in-95">
          <div className="text-5xl md:text-7xl mb-6 md:mb-8 opacity-20">📂</div>
          <h3 className="text-xl md:text-3xl font-black text-text-primary mb-3 uppercase tracking-widest">No Collections Found</h3>
          <p className="text-text-secondary text-sm md:text-lg mb-8 md:mb-10 max-w-sm mx-auto opacity-70 leading-relaxed">
            Create your first collection to start organizing your saved items.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 md:px-10 py-3.5 md:py-4 bg-surface border-2 border-border text-text-primary font-black text-xs md:text-sm uppercase tracking-widest rounded-2xl hover:border-text-primary/50 transition-all group shadow-lg active:scale-95"
          >
            Start Organizing
            <span className="inline-block ml-3 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-surface w-full max-w-md rounded-3xl border border-border shadow-2xl p-6 md:p-8 relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
            
            <h2 className="text-xl md:text-2xl font-black text-text-primary mb-8 tracking-tighter uppercase">Create New Collection</h2>
            
            <form onSubmit={handleCreateCollection} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-text-tertiary uppercase tracking-[0.3em] mb-2 ml-1">Collection Name</label>
                <input 
                  autoFocus
                  required
                  type="text"
                  placeholder="e.g. Work Research"
                  className="w-full px-5 py-3.5 bg-background border border-border rounded-2xl text-text-primary focus:outline-none focus:border-primary transition-all text-sm font-bold shadow-inner"
                  value={newCollection.title}
                  onChange={e => setNewCollection({...newCollection, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-1.5 ml-1">Icon (Emoji)</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-center text-lg focus:outline-none focus:border-primary transition-all"
                    value={newCollection.icon}
                    onChange={e => setNewCollection({...newCollection, icon: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-1.5 ml-1">Accent Color</label>
                  <input 
                    type="color"
                    className="w-full h-11.5 p-1.5 bg-background border border-border rounded-xl cursor-pointer focus:outline-none focus:border-primary transition-all"
                    value={newCollection.color}
                    onChange={e => setNewCollection({...newCollection, color: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-1.5 ml-1">Description</label>
                <textarea 
                  rows="2"
                  placeholder="What is this collection for?"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-primary focus:outline-none focus:border-primary transition-all resize-none font-medium text-sm"
                  value={newCollection.description}
                  onChange={e => setNewCollection({...newCollection, description: e.target.value})}
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 font-bold text-text-tertiary hover:text-text-primary transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-2 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all text-sm"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
