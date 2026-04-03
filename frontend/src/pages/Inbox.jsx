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
      <section className="relative overflow-hidden pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-2.586 2.586a1 1 0 01-1.414 0L15 13m-6 0l-2.586 2.586a1 1 0 01-1.414 0L5 13" />
                </svg>
              </div>
              <h1 className="text-3xl font-black text-text-primary tracking-tight">Inbox</h1>
            </div>
            <p className="text-text-secondary max-w-xl">
              Unprocessed memories and thoughts. Review, categorize, and link them to your Knowledge Graph to make them permanent.
            </p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl flex items-center shadow-lg shadow-primary/20 transition-all font-bold group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Quick Capture
          </button>
        </div>
      </section>

      {/* Inbox Grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-64 bg-surface border border-border rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : saves.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="text-center py-32 bg-surface/50 border border-border rounded-3xl border-dashed">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">Inbox is Clear!</h3>
            <p className="text-text-secondary mb-8 max-w-sm mx-auto">
              You've processed all your recent captures. Your Second Brain is up to date.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 bg-surface border border-border text-text-primary font-bold rounded-xl hover:border-primary/50 transition-all"
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
