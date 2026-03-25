import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MemoryCard from '../components/ui/MemoryCard';
import MemoryDetailDrawer from '../components/ui/MemoryDetailDrawer';

const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSave, setSelectedSave] = useState(null);

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
        <button 
          onClick={() => navigate('/collections')}
          className="group flex items-center space-x-2 text-text-tertiary hover:text-text-primary transition-all mb-6"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-black uppercase tracking-[0.2em]">Back to Projects</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
          <div>
            <div className="flex items-center space-x-4 mb-3">
              <span className="text-5xl">{collection.icon}</span>
              <h1 className="text-5xl font-black text-text-primary tracking-tighter">{collection.title}</h1>
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
            <span className="text-sm font-black text-text-tertiary uppercase tracking-widest">
              {collection.saves?.length || 0} Artifacts
            </span>
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
          <div className="text-center py-32 bg-surface/30 border-2 border-border border-dashed rounded-[48px]">
            <h3 className="text-2xl font-black text-text-primary mb-2 opacity-30">This project is empty</h3>
            <p className="text-text-secondary mb-8 max-w-sm mx-auto opacity-50">
              Time to fuel this project! Search for existing memories or capture new ones to add them here.
            </p>
            <button 
              onClick={() => navigate('/search')}
              className="px-8 py-3 bg-secondary/10 text-secondary border border-secondary/20 font-black rounded-xl hover:bg-secondary/20 transition-all"
            >
              Relate Existing Memory
            </button>
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
    </div>
  );
};

export default CollectionDetail;
