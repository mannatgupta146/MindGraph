import React, { useState } from 'react';
import axios from 'axios';

const MemoryDetailDrawer = ({ save, isOpen, onClose, onDeleteSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy to Clipboard');
  const [error, setError] = useState(null);

  if (!isOpen || !save) return null;

  const handleCopy = async () => {
    try {
      const parts = [
        save.title,
        save.url ? `Source: ${save.url}` : null,
        '',
        save.summary ? `Summary: ${save.summary}` : null,
        '',
        `Notes:\n${save.content}`
      ].filter(part => part !== null);

      await navigator.clipboard.writeText(parts.join('\n'));
      setCopyStatus('Copied! ✓');
      setTimeout(() => setCopyStatus('Copy to Clipboard'), 2000);
    } catch (err) {
      setCopyStatus('Failed to copy');
      setTimeout(() => setCopyStatus('Copy to Clipboard'), 2000);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this memory? This cannot be undone.')) return;
    
    setIsDeleting(true);
    setError(null);
    try {
      await axios.delete(`http://localhost:3000/api/saves/${save._id}`, {
        withCredentials: true
      });
      onDeleteSuccess();
      onClose();
    } catch (err) {
      setError('Failed to delete memory');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-2xl w-full flex">
        <div className="h-full w-full bg-surface border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-out animate-slide-in-right">
          
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between bg-surface/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center space-x-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                save.type === 'article' ? 'bg-secondary/10 text-secondary' :
                save.type === 'tweet' ? 'bg-blue-400/10 text-blue-400' :
                save.type === 'pdf' ? 'bg-red-400/10 text-red-400' :
                save.type === 'youtube' ? 'bg-red-600/10 text-red-600' :
                'bg-primary/10 text-primary'
              }`}>
                {save.type}
              </span>
              <span className="text-text-tertiary text-sm">
                Saved on {new Date(save.createdAt).toLocaleDateString()}
              </span>
            </div>
            <button onClick={onClose} className="p-2 text-text-tertiary hover:text-text-primary hover:bg-surface-hover rounded-full transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar pb-32">
            {error && <p className="p-3 bg-red-500/10 text-red-500 rounded-xl text-sm border border-red-500/20">{error}</p>}

            {/* Title & URL */}
            <div>
              <h1 className="text-3xl font-bold text-text-primary leading-tight mb-4 tracking-tight">{save.title}</h1>
              {save.url && (
                <a 
                  href={save.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-primary hover:text-primary-hover group bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 transition-colors"
                >
                  <span className="truncate max-w-sm text-sm font-medium">{save.url}</span>
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>

            {/* AI Summary Block */}
            {save.summary && (
              <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="flex items-center space-x-2 mb-4 text-primary">
                  <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="font-bold text-xs uppercase tracking-[0.2em]">AI Synthesis</span>
                </div>
                <p className="text-text-primary text-xl leading-relaxed font-serif italic opacity-90">"{save.summary}"</p>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {save.tags?.map(tag => (
                <span key={tag} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface border border-border text-text-secondary hover:text-primary hover:border-primary/30 transition-all cursor-default">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Full Content */}
            <div className="pt-4 border-t border-border/50">
              <h3 className="text-text-tertiary text-[10px] font-bold uppercase tracking-[0.2em] mb-6">Content Raw Dump</h3>
              <div className="text-text-secondary leading-relaxed whitespace-pre-wrap text-lg font-light selection:bg-primary/30">
                {save.content}
              </div>
            </div>
          </div>

          {/* Fixed Footer Actions */}
          <div className="p-6 border-t border-border bg-surface/90 backdrop-blur-md absolute bottom-0 w-full flex space-x-4 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
            <button 
              onClick={handleCopy}
              className={`flex-1 py-4 px-6 font-bold rounded-2xl transition-all flex items-center justify-center space-x-2 ${
                copyStatus === 'Copied! ✓' 
                ? 'bg-green-500 text-white' 
                : 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>{copyStatus}</span>
            </button>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-4 text-red-500 hover:bg-red-500/10 font-bold rounded-2xl transition-all flex items-center space-x-2"
            >
              {isDeleting ? 'Deleting...' : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryDetailDrawer;
