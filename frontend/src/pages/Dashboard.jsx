import React, { useContext, useEffect, useState } from 'react';
import MemoryCard from '../components/ui/MemoryCard';
import AddSaveModal from '../components/ui/AddSaveModal';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [saves, setSaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSaves = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/api/saves');
      setSaves(data);
    } catch (error) {
      console.error('Error fetching saves:', error);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Recent Saves Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Recent Saves</h2>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Save
            </button>
            <button className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">View All Archive</button>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-64 bg-surface border border-border rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : saves.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {saves.map(save => (
              <MemoryCard key={save._id} {...save} date={save.createdAt} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface border border-border rounded-2xl border-dashed">
            <h3 className="text-xl font-medium text-text-secondary mb-2">No memories saved yet</h3>
            <p className="text-text-tertiary mb-6">Start by capturing your first article, tweet, or thought.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
            >
              Capture New Memory
            </button>
          </div>
        )}
      </section>

      <AddSaveModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSaveSuccess={fetchSaves} 
      />
    </div>
  );
};

export default Dashboard;
