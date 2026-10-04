import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

import MemoryCard from '../components/ui/MemoryCard';
import MemoryDetailDrawer from '../components/ui/MemoryDetailDrawer';

const Archives = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const saves = useStore((state) => state.archivedSaves);
  const loading = useStore((state) => state.loadingArchives);
  const fetchArchives = useStore((state) => state.fetchArchives);
  const removeSaveFromAll = useStore((state) => state.removeSaveFromAll);

  // Find the selected save from the local store
  const selectedSave = id ? saves.find(s => s._id === id) : null;

  const handleDeleteSuccess = () => {
    if (id) removeSaveFromAll(id);
    navigate('/archives');
    fetchArchives(true);
  };

  const handleUpdateSuccess = () => {
    fetchArchives(true);
    if (selectedSave && selectedSave.status !== 'archived') {
       navigate('/archives');
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative pl-5 py-2 mb-6 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-primary/80 to-primary/20 rounded-full"></div>
          <div className="flex items-center space-x-2 text-text-tertiary mb-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Archive</span>
          </div>
          <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-3xl">
            Items you have archived. They remain safely stored and searchable without cluttering your main dashboard.
          </p>
        </div>

        <button
          onClick={() => fetchArchives(true)}
          className="self-start md:self-auto px-4 py-2.5 bg-surface border border-border text-text-primary hover:border-primary/50 text-xs font-bold rounded-xl flex items-center shadow-sm active:scale-95 transition-all"
          title="Refresh Archives"
        >
          <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{loading ? 'Syncing...' : 'Refresh'}</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 bg-surface/50 border border-border rounded-3xl animate-pulse">
               <div className="h-full w-full bg-linear-to-br from-transparent to-border/10"></div>
            </div>
          ))}
        </div>
      ) : saves.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
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
        <div className="flex flex-col items-center justify-center py-20 px-6 min-h-100 text-center space-y-6 bg-surface/30 border-2 border-dashed border-border rounded-[2.5rem] w-full animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center text-text-tertiary">
            <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-text-secondary mb-2 uppercase tracking-widest">Vault is Empty</h3>
            <p className="text-text-tertiary max-w-xs mx-auto text-sm">Memories you archive will appear here for deep-cold storage and safekeeping.</p>
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
