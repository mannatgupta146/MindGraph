import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MemoryCard from '../components/ui/MemoryCard';

import AddSaveModal from '../components/ui/AddSaveModal';
import MemoryDetailDrawer from '../components/ui/MemoryDetailDrawer';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saves, setSaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState('All');
  
  // Find the selected save from the local list if it exists (for instant access)
  const selectedSave = id ? saves.find(s => s._id === id) : null;


  const fetchSaves = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:3000/api/saves', { withCredentials: true });
      setSaves(data);
    } catch (error) {
      console.error('Error fetching saves:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteSuccess = () => {
    // 1. Optimistic local update
    setSaves(prev => prev.filter(s => s._id !== id));
    // 2. Navigate back to clear the drawer
    navigate('/dashboard');
    // 3. Trigger full re-sync with animation
    fetchSaves();
  };

  // Expanded Core Pillars to encompass all major world topics
  const allTags = ['All', 'Technology', 'Politics', 'Science', 'Business', 'Health', 'Arts', 'History', 'Philosophy', 'Entertainment'];

  const filteredSaves = selectedTag === 'All' 
    ? saves 
    : saves.filter(s => s.tags?.some(t => t.toLowerCase() === selectedTag.toLowerCase()));


  useEffect(() => {
    fetchSaves();
  }, []);



  return (
    <div className="space-y-8">
      <div className="relative pl-5 py-2 mb-6 md:mb-10">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary/80 to-primary/20 rounded-full"></div>
        <div className="flex items-center space-x-2 text-text-tertiary mb-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Cognitive Center</span>
        </div>
        <h2 className="text-xl md:text-3xl font-black text-text-primary tracking-tight mb-2 uppercase">Neural Overview</h2>
        <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-3xl px-1">
          Welcome back. Here is a real-time overview of your active knowledge base and semantic explorations. Keep capturing ideas to watch your constellation grow.
        </p>
      </div>

      {/* Discovery Tag Ribbon */}
      <section className="mb-10 w-full overflow-hidden">
        <div className="flex items-center space-x-4 mb-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-tertiary">Thematic Discovery</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
        </div>
        <div className="relative">
          <div className="flex items-center space-x-2 overflow-x-auto pb-4 pt-1 scrollbar-none scroll-smooth mask-horizontal">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`whitespace-nowrap px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 border-2 ${
                  selectedTag === tag 
                  ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' 
                  : 'bg-surface border-border text-text-tertiary hover:border-primary/30 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {tag === 'All' ? 'Master Registry' : tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Saves Grid */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-1.5 h-6 bg-primary rounded-full hidden md:block"></div>
            <h2 className="text-xl md:text-2xl font-black tracking-tighter text-text-primary uppercase">
              {selectedTag === 'All' ? 'Active Memories' : `Cluster: ${selectedTag}`}
            </h2>
          </div>
          
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex-1 md:flex-none bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 transition-all font-black text-xs uppercase tracking-widest group active:scale-95"
            >
              <svg className="w-4 h-4 mr-3 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Initialize Save</span>
            </button>
            <button 
              onClick={() => navigate('/archives')}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary-hover transition-colors hidden sm:block"
            >
              View Vault
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-64 bg-surface border border-border rounded-[2rem] animate-pulse">
                 <div className="h-full w-full bg-gradient-to-br from-transparent to-border/10"></div>
              </div>
            ))}
          </div>
        ) : filteredSaves.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {filteredSaves.map(save => (
              <MemoryCard 
                key={save._id} 
                {...save} 
                date={save.createdAt} 
                onClick={() => navigate(`/dashboard/${save._id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-6 bg-surface/30 border-2 border-dashed border-border rounded-[2.5rem] w-full animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-text-primary uppercase tracking-widest mb-2">Constellation Empty</h3>
            <p className="text-text-secondary mb-8 max-w-xs mx-auto text-sm leading-relaxed">
              Start by capturing your first article, tweet, or thought to begin your cognitive journey.
            </p>
            {selectedTag === 'All' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-3.5 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                Capture First Memory
              </button>
            )}
          </div>
        )}
      </section>

      <AddSaveModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSaveSuccess={fetchSaves} 
      />

      <MemoryDetailDrawer 
        save={selectedSave}
        saveId={id}
        isOpen={!!id}
        onClose={() => navigate('/dashboard')}
        onDeleteSuccess={handleDeleteSuccess}
        onUpdateSuccess={fetchSaves}
      />




    </div>
  );
};

export default Dashboard;
