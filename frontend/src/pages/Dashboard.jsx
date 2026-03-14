import React, { useContext } from 'react';
import MemoryCard from '../components/ui/MemoryCard';
import { AuthContext } from '../context/AuthContext';

const DUMMY_SAVES = [
  { id: 1, type: 'article', title: 'The Architecture of the Human Brain in the Age of AI', summary: 'Understanding how neural networks mimic biological structures, but fail at long-term episodic memory indexing without external vector stores like Pinecone.', date: '2026-03-14T10:00:00Z', tags: ['Neuroscience', 'AI', 'Vector DB'] },
  { id: 2, type: 'tweet', title: 'Must read thread on distributed systems', summary: 'If you are building a semantic search engine, do not ignore the power of simple inverted indices before jumping to pure HNSW graphs. Hybrid search is the future.', date: '2026-03-13T15:30:00Z', tags: ['System Design', 'Search'] },
  { id: 3, type: 'pdf', title: 'Attention Is All You Need', summary: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. We propose a new simple network architecture, the Transformer...', date: '2026-03-12T09:12:00Z', tags: ['Research', 'Transformers', 'Deep Learning'] },
  { id: 4, type: 'article', title: 'Why Raycast is taking over the developer workflow', summary: 'A deep dive into keyboard-first interfaces, rust-based performance, and creating local-first experiences that feel instantaneous.', date: '2026-03-14T08:45:00Z', tags: ['UX', 'Productivity', 'Rust'] },
];

const Dashboard = () => {
  const { user } = useContext(AuthContext);

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
          <button className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">View All Archive</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {DUMMY_SAVES.map(save => (
            <MemoryCard key={save.id} {...save} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
