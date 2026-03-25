import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({ title: '', description: '', icon: '📁', color: '#6366f1' });
  const navigate = useNavigate();

  const fetchCollections = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/api/collections');
      setCollections(data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/collections', newCollection);
      setNewCollection({ title: '', description: '', icon: '📁', color: '#6366f1' });
      setIsModalOpen(false);
      fetchCollections();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating collection');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-8 pt-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow-inner">
              <svg className="w-7 h-7 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h1 className="text-4xl font-black text-text-primary tracking-tight">Collections</h1>
          </div>
          <p className="text-text-secondary max-w-xl text-lg">
            Organize your knowledge into thematic projects and structured topics.
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-secondary hover:bg-secondary/90 text-white px-8 py-4 rounded-2xl flex items-center shadow-xl shadow-secondary/20 transition-all font-bold group transform hover:-translate-y-1"
        >
          <svg className="w-6 h-6 mr-2 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Project
        </button>
      </section>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-64 bg-surface border border-border rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {collections.map(col => (
            <div 
              key={col._id}
              onClick={() => navigate(`/collections/${col._id}`)}
              className="group relative bg-surface border-2 border-border rounded-[32px] p-8 hover:border-text-primary/20 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-black/5 flex flex-col items-center text-center"
            >
              {/* Vibrant Accent Color Bar */}
              <div 
                className="absolute top-0 left-0 w-full h-2" 
                style={{ backgroundColor: col.color }}
              ></div>
              
              <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-500">
                {col.icon || '📁'}
              </div>
              
              <h3 className="text-2xl font-black text-text-primary mb-3 truncate w-full">{col.title}</h3>
              <p className="text-text-secondary line-clamp-2 text-sm mb-6 flex-1">{col.description || 'No description provided.'}</p>
              
              <div className="flex items-center space-x-2 bg-text-primary/5 px-4 py-2 rounded-full border border-text-primary/5">
                <span className="text-xs font-black text-text-tertiary uppercase tracking-widest">{col.saves?.length || 0} Memories</span>
              </div>
              
              {/* Hover Effect Light */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-40 bg-surface/30 border-2 border-border border-dashed rounded-[48px]">
          <div className="text-7xl mb-8 opacity-20">📂</div>
          <h3 className="text-3xl font-black text-text-primary mb-4">No Projects Yet</h3>
          <p className="text-text-secondary text-lg mb-10 max-w-sm mx-auto opacity-70">
            Create your first collection to start organizing your memories into meaningful clusters.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-10 py-4 bg-surface border-2 border-border text-text-primary font-black rounded-2xl hover:border-secondary transition-all hover:text-secondary group"
          >
            Start Organizing
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-surface w-full max-w-lg rounded-[40px] border border-border shadow-2xl p-10 relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-secondary"></div>
            
            <h2 className="text-3xl font-black text-text-primary mb-8 tracking-tight">Create New Project</h2>
            
            <form onSubmit={handleCreateCollection} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-3 ml-1">Project Title</label>
                <input 
                  autoFocus
                  required
                  type="text"
                  placeholder="e.g. AI Ethics Research"
                  className="w-full px-6 py-4 bg-surface-hover border-2 border-border rounded-2xl text-text-primary focus:outline-none focus:border-secondary transition-all text-lg font-bold"
                  value={newCollection.title}
                  onChange={e => setNewCollection({...newCollection, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-3 ml-1">Icon (Emoji)</label>
                  <input 
                    type="text"
                    className="w-full px-6 py-4 bg-surface-hover border-2 border-border rounded-2xl text-center text-2xl focus:outline-none focus:border-secondary transition-all"
                    value={newCollection.icon}
                    onChange={e => setNewCollection({...newCollection, icon: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-3 ml-1">Label Color</label>
                  <input 
                    type="color"
                    className="w-full h-[64px] p-2 bg-surface-hover border-2 border-border rounded-2xl cursor-pointer focus:outline-none focus:border-secondary transition-all"
                    value={newCollection.color}
                    onChange={e => setNewCollection({...newCollection, color: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em] mb-3 ml-1">Brief Intent</label>
                <textarea 
                  rows="3"
                  placeholder="What is the goal of this collection?"
                  className="w-full px-6 py-4 bg-surface-hover border-2 border-border rounded-2xl text-text-primary focus:outline-none focus:border-secondary transition-all resize-none font-medium"
                  value={newCollection.description}
                  onChange={e => setNewCollection({...newCollection, description: e.target.value})}
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 font-black text-text-tertiary hover:text-text-primary transition-colors"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-secondary text-white font-black rounded-2xl hover:bg-secondary/90 shadow-xl shadow-secondary/20 transition-all transform hover:-translate-y-1"
                >
                  Construct Project
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
