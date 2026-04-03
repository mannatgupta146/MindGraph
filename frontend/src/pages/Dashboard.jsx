import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MemoryCard from '../components/ui/MemoryCard';

import AddSaveModal from '../components/ui/AddSaveModal';
import MemoryDetailDrawer from '../components/ui/MemoryDetailDrawer';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
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

  // High-Level Mastery Pillars: 6 categories that cover everything in the digital & physical world.
  const universalTags = ['Technology', 'Business', 'Philosophy', 'Science', 'Culture', 'Lifestyle'];

  // Consolidate to ONLY the 6 Master Pillars for maximum UI clarity
  const allTags = ['All', ...universalTags];

  const filteredSaves = selectedTag === 'All' 
    ? saves 
    : saves.filter(s => s.tags?.some(t => t.toLowerCase() === selectedTag.toLowerCase()));


  useEffect(() => {
    fetchSaves();
  }, []);



  return (
    <div className="space-y-8">
      {/* AI Synthesis Banner */}
      <section className="bg-surface border border-secondary/30 rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center border border-secondary/50">
              <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-text-primary">AI Daily Synthesis</h2>
          </div>
          <p className="text-lg text-text-secondary max-w-2xl leading-relaxed">
            Welcome back, <span className="text-text-primary font-medium">{user?.name?.split(' ')[0] || 'Architect'}</span>. 
            We noticed you saved 3 articles about <span className="text-secondary font-medium relative inline-block group cursor-pointer">Vector Databases<span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary/50 rounded-full"></span></span> recently. 
            Would you like to auto-generate a Knowledge Graph connecting semantic search paradigms to your existing notes on System Design?
          </p>
          <button className="mt-6 px-4 py-2 bg-secondary/10 text-secondary hover:bg-secondary/20 font-medium rounded-lg border border-secondary/20 transition-colors flex items-center">
            Generate Synthesis
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </section>

      {/* Discovery Tag Ribbon */}
      <section>
        <div className="flex items-center space-x-4 mb-2">
          <div className="w-1.5 h-6 bg-primary/20 rounded-full"></div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-tertiary">Thematic Discovery</h3>
        </div>
        <div className="flex items-center space-x-3 overflow-x-auto pb-4 pt-2 -mx-2 px-2 scrollbar-none scroll-smooth">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold border transition-all ${
                selectedTag === tag 
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-surface border-border text-text-secondary hover:border-primary/40 hover:text-primary'
              }`}
            >
              {tag === 'All' ? 'All Memories' : `#${tag}`}
            </button>
          ))}
        </div>
      </section>

      {/* Recent Saves Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            {selectedTag === 'All' ? 'Recent Saves' : `Themed: ${selectedTag}`}
          </h2>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl flex items-center shadow-lg shadow-primary/20 transition-all font-bold group">
              <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Save
            </button>
            <button 
              onClick={() => navigate('/archives')}
              className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
            >
              View All Archive
            </button>

          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-64 bg-surface border border-border rounded-xl animate-pulse"></div>
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
          <div className="text-center py-20 bg-surface border border-border rounded-2xl border-dashed">
            <h3 className="text-xl font-medium text-text-secondary mb-2">No memories found</h3>
            <p className="text-text-tertiary mb-6">Start by capturing your first article, tweet, or thought.</p>
            {selectedTag === 'All' && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
              >
                Capture New Memory
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
