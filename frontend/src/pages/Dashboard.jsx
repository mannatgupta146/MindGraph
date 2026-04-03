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
      <div className="relative pl-5 py-2">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary/80 to-primary/20 rounded-full"></div>
        <div className="flex items-center space-x-2 text-text-tertiary mb-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cognitive Center</span>
        </div>
        <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-3xl">
          Welcome back. Here is a real-time overview of your active knowledge base, recently processed memories, and thematic explorations. Keep capturing ideas to watch your semantic constellation grow.
        </p>
      </div>
      {/* Discovery Tag Ribbon */}
      <section>
        <div className="flex items-center space-x-4 mb-3 mt-6">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-tertiary">Thematic Discovery</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 pt-1 -mx-2 px-2 scrollbar-none scroll-smooth">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                selectedTag === tag 
                ? 'bg-primary border-primary text-white shadow shadow-primary/20' 
                : 'bg-surface border-border text-text-secondary hover:border-primary/40 hover:text-primary'
              }`}
            >
              {tag === 'All' ? 'All Memories' : `#${tag.toLowerCase()}`}
            </button>
          ))}
        </div>
      </section>

      {/* Recent Saves Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">
            {selectedTag === 'All' ? 'Recent Saves' : `Filtered: ${selectedTag}`}
          </h2>
          <div className="flex items-center space-x-3">
            <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg flex items-center shadow-md shadow-primary/20 transition-all font-bold text-sm group">
              <svg className="w-4 h-4 mr-1.5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
