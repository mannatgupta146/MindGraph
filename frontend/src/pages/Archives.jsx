import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import MemoryCard from '../components/ui/MemoryCard';
import MemoryDetailDrawer from '../components/ui/MemoryDetailDrawer';

const Archives = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saves, setSaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Find the selected save from the local list if it exists
  const selectedSave = id ? saves.find(s => s._id === id) : null;

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:3000/api/saves/archived', { withCredentials: true });
      setSaves(data);
    } catch (error) {
      console.error('Error fetching archives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSuccess = () => {
    setSaves(prev => prev.filter(s => s._id !== id));
    navigate('/archives');
    fetchArchives();
  };

  const handleUpdateSuccess = () => {
    fetchArchives();
    // If it was restored, it will be gone from this view
    if (selectedSave && selectedSave.status !== 'archived') {
       navigate('/archives');
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2 text-text-tertiary">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Storage Vault</span>
        </div>
        <h1 className="text-4xl font-bold text-text-primary tracking-tight">Archives</h1>
        <p className="text-text-secondary max-w-2xl">
          Everything you've hidden from your active brain. These memories are still searchable but won't clutter your graph or dashboard.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 bg-surface/50 border border-border rounded-3xl animate-pulse">
               <div className="h-full w-full bg-gradient-to-br from-transparent to-border/10"></div>
            </div>
          ))}
        </div>
      ) : saves.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {saves.map((save) => (
            <MemoryCard
              key={save._id}
              {...save}
              date={save.createdAt}
              onClick={() => navigate(`/archives/${save._id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-surface/30 border-2 border-dashed border-border rounded-[40px]">
          <div className="w-20 h-20 rounded-full bg-surface-hover flex items-center justify-center text-text-tertiary">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-text-primary">Archive is empty</h3>
            <p className="text-text-secondary">Memories you archive will appear here for safekeeping.</p>
          </div>
        </div>
      )}

      {/* Persistence-enabled Detail Drawer */}
      <MemoryDetailDrawer 
        save={selectedSave}
        saveId={id}
        isOpen={!!id}
        onClose={() => navigate('/archives')}
        onDeleteSuccess={handleDeleteSuccess}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default Archives;
