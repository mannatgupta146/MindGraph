import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MemoryCard from '../components/ui/MemoryCard';

import AddSaveModal from '../components/ui/AddSaveModal';
import MemoryDetailDrawer from '../components/ui/MemoryDetailDrawer';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Inbox = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [saves, setSaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Find the selected save from the local list if it exists
  const selectedSave = id ? saves.find(s => s._id === id) : null;


  const fetchInbox = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:3000/api/saves/inbox');
      setSaves(data);
    } catch (error) {
      console.error('Error fetching inbox:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteSuccess = () => {
    // 1. Optimistic local update
    setSaves(prev => prev.filter(s => s._id !== id));
    // 2. Navigate back to clear the drawer
    navigate('/inbox');
    // 3. Trigger full re-sync with animation
    fetchInbox();
  };




  useEffect(() => {
    fetchInbox();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Inbox Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full mb-6">
        <div className="relative pl-5 py-2">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary/80 to-primary/20 rounded-full"></div>
          <div className="flex items-center space-x-2 text-text-tertiary mb-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-2.586 2.586a1 1 0 01-1.414 0L15 13m-6 0l-2.586 2.586a1 1 0 01-1.414 0L5 13" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Capture Queue</span>
          </div>
          <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-2xl px-2 md:px-0">
            Unprocessed memories and thoughts. Review, categorize, and link them to your Knowledge Graph to make them permanent.
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white px-6 py-3.5 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 transition-all font-black text-xs uppercase tracking-widest group shrink-0 active:scale-95"
        >
          <svg className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Quick Capture
        </button>
      </div>

      {/* Inbox Grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-64 bg-surface border border-border rounded-[2rem] animate-pulse"></div>
            ))}
          </div>
        ) : saves.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {saves.map(save => (
              <MemoryCard 
                key={save._id} 
                {...save} 
                date={save.createdAt} 
                onClick={() => navigate(`/inbox/${save._id}`)}
              />
            ))}

          </div>
        ) : (
          <div className="text-center py-20 px-6 bg-surface/30 border-2 border-dashed border-border rounded-[2.5rem] w-full animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-text-primary uppercase tracking-widest mb-2">Inbox is Clear!</h3>
            <p className="text-text-secondary mb-8 max-w-xs mx-auto text-sm leading-relaxed">
              You've processed all your recent captures. Your Second Brain is fully up to date.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3.5 bg-surface border border-border text-text-primary font-black text-xs uppercase tracking-widest rounded-2xl hover:border-primary/50 transition-all active:scale-95 shadow-lg"
            >
              Capture New Thought
            </button>
          </div>
        )}
      </section>

      <AddSaveModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSaveSuccess={fetchInbox} 
      />

      <MemoryDetailDrawer 
        save={selectedSave}
        saveId={id}
        isOpen={!!id}
        onClose={() => navigate('/inbox')}
        onDeleteSuccess={handleDeleteSuccess}
        onUpdateSuccess={fetchInbox}
      />



    </div>
  );
};

export default Inbox;
