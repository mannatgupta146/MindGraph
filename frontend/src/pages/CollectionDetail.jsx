import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MemoryCard from '../components/ui/MemoryCard';
import MemoryDetailDrawer from '../components/ui/MemoryDetailDrawer';
import AddSaveModal from '../components/ui/AddSaveModal';

const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSave, setSelectedSave] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchCollectionDetail = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:3000/api/collections/${id}`);
      setCollection(data);
    } catch (error) {
      console.error('Error fetching collection detail:', error);
      navigate('/collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectionDetail();
  }, [id]);

  const handleAddMemorySuccess = async () => {
    fetchCollectionDetail();
  };

  const handleDeleteCollection = async () => {
    if (window.confirm("Are you sure you want to permanently delete this project? Your captured memories will remain safely in your inbox.")) {
      try {
        await axios.delete(`http://localhost:3000/api/collections/${id}`, { withCredentials: true });
        navigate('/collections');
      } catch (error) {
        console.error('Error deleting collection:', error);
        alert('Failed to delete project');
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!collection) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <section className="relative pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10">
          <button 
            onClick={() => navigate('/collections')}
            className="group flex items-center space-x-3 text-text-tertiary hover:text-text-primary transition-all active:scale-95 py-2"
          >
            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center group-hover:border-primary/50 transition-all shadow-sm">
              <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Projects</span>
          </button>

          <button 
            onClick={handleDeleteCollection}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-lg shadow-red-500/5"
            title="Delete Project"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Terminate Project</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
               <div 
                className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] bg-surface border border-border shadow-2xl flex items-center justify-center text-3xl md:text-4xl"
                style={{ borderTop: `4px solid ${collection.color}` }}
              >
                {collection.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2 text-text-tertiary mb-0.5">
                   <div 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: collection.color }}
                  ></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Project Vault</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-text-primary tracking-tighter uppercase">{collection.title}</h1>
              </div>
            </div>
            <p className="text-base md:text-xl text-text-secondary max-w-2xl leading-relaxed font-medium opacity-70 px-1">
              {collection.description}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-3 bg-surface/50 border border-border px-4 py-2.5 rounded-2xl shadow-sm">
              <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
                {collection.saves?.length || 0} Registered Artifacts
              </span>
            </div>
            
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center group active:scale-95"
            >
              <svg className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Synergize Memory
            </button>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="pt-4">
        {collection.saves?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 animate-in fade-in duration-500">
            {collection.saves.map(save => (
              <MemoryCard 
                key={save._id}
                {...save}
                date={save.createdAt}
                onClick={() => setSelectedSave(save)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-6 bg-surface/30 border-2 border-border border-dashed rounded-[2.5rem] md:rounded-[3rem] animate-in fade-in zoom-in-95">
             <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0l-1.5-1.5M5 11l1.5-1.5" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-text-primary mb-3 uppercase tracking-widest">This Vault is Empty</h3>
            <p className="text-text-secondary text-sm mb-8 max-w-sm mx-auto opacity-70 leading-relaxed">
              Time to fuel this project! Search for existing memories or capture new ones to add them to this thematic cluster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all flex items-center justify-center active:scale-95"
              >
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Synergize Memory
              </button>
              <button 
                onClick={() => navigate('/search')}
                className="w-full sm:w-auto px-8 py-3.5 bg-surface border border-border text-text-primary font-black text-xs uppercase tracking-widest rounded-2xl hover:border-primary/50 transition-all active:scale-95 shadow-lg"
              >
                Link Existing
              </button>
            </div>
          </div>
        )}
      </section>

      <MemoryDetailDrawer 
        save={selectedSave}
        isOpen={!!selectedSave}
        onClose={() => setSelectedSave(null)}
        onUpdateSuccess={fetchCollectionDetail}
        onDeleteSuccess={fetchCollectionDetail}
      />

      <AddSaveModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSaveSuccess={handleAddMemorySuccess} 
        preselectedCollectionId={id}
      />
    </div>
  );
};

export default CollectionDetail;
