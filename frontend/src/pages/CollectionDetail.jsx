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
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate('/collections')}
            className="group flex items-center space-x-2 text-text-tertiary hover:text-text-primary transition-all"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Back to Projects</span>
          </button>

          <button 
            onClick={handleDeleteCollection}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all font-bold text-xs"
            title="Delete Project"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete Project</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">{collection.icon}</span>
              <h1 className="text-3xl font-black text-text-primary tracking-tight">{collection.title}</h1>
            </div>
            <p className="text-xl text-text-secondary max-w-2xl leading-relaxed opacity-80">
              {collection.description}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
             <div 
              className="w-4 h-4 rounded-full shadow-inner" 
              style={{ backgroundColor: collection.color }}
            ></div>
            <span className="text-sm font-bold text-text-tertiary uppercase tracking-widest hidden sm:inline">
              {collection.saves?.length || 0} Artifacts
            </span>
            <div className="h-6 w-px bg-border hidden sm:block"></div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center group"
            >
              <svg className="w-4 h-4 mr-1.5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Memory
            </button>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section>
        {collection.saves?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
          <div className="text-center py-24 bg-surface/30 border-2 border-border border-dashed rounded-[40px]">
            <h3 className="text-xl font-bold text-text-primary mb-2 opacity-40">This project is empty</h3>
            <p className="text-text-secondary text-sm mb-8 max-w-sm mx-auto opacity-50">
              Time to fuel this project! Search for existing memories or capture new ones to add them here.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center text-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Capture New Memory
              </button>
              <button 
                onClick={() => navigate('/search')}
                className="px-6 py-2.5 bg-secondary/10 text-secondary border border-secondary/20 font-bold rounded-xl hover:bg-secondary/20 transition-all text-sm"
              >
                Relate Existing
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
