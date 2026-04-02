import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MemoryDetailDrawer = ({ save, isOpen, onClose, onDeleteSuccess, onUpdateSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [collections, setCollections] = useState([]);
  const [isAddingToCollection, setIsAddingToCollection] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy to Clipboard');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/api/collections');
      setCollections(data);
    } catch (err) {
      console.error('Error fetching collections:', err);
    }
  };

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

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    setError(null);
    try {
      await axios.patch(`http://localhost:3000/api/saves/${save._id}`, 
        { status: newStatus },
        { withCredentials: true }
      );
      if (onUpdateSuccess) onUpdateSuccess();
      onClose();
    } catch (err) {
      setError(`Failed to update status to ${newStatus}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddToCollection = async (collectionId) => {
    setIsAddingToCollection(true);
    setError(null);
    try {
      await axios.post('http://localhost:3000/api/collections/add', {
        collectionId,
        saveId: save._id
      }, { withCredentials: true });
      if (onUpdateSuccess) onUpdateSuccess();
      fetchCollections(); // Refresh list to show success state
    } catch (err) {
      setError('Failed to add memory to collection');
    } finally {
      setIsAddingToCollection(false);
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
              <div className="flex flex-wrap gap-3">
                {save.url && (
                  <a 
                    href={save.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-primary hover:text-primary-hover group bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 transition-colors"
                  >
                    <span className="truncate max-w-sm text-sm font-medium">Source Link</span>
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
                {save.fileUrl && (
                  <a 
                    href={save.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-secondary hover:text-secondary-hover group bg-secondary/5 px-3 py-1.5 rounded-lg border border-secondary/10 transition-colors"
                  >
                    <span className="truncate max-w-sm text-sm font-medium">Original Artifact</span>
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* YouTube Embed Preview */}
            {save.type === 'youtube' && save.url && (
              <div className="rounded-3xl overflow-hidden border border-border shadow-2xl aspect-video bg-black/5">
                {(() => {
                  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                  const match = save.url.match(regExp);
                  const videoId = (match && match[2].length === 11) ? match[2] : null;
                  
                  return videoId ? (
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-surface/50">
                      <svg className="w-12 h-12 text-red-500 mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
                      </svg>
                      <p className="text-text-secondary font-medium">Invalid YouTube URL</p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Image Preview for visual artifacts */}
            {save.type === 'image' && save.fileUrl && (
              <div className="relative group rounded-3xl overflow-hidden border border-border shadow-2xl bg-black/5">
                <img 
                  src={save.fileUrl} 
                  alt={save.title} 
                  className="w-full h-auto object-contain max-h-[500px] transition-transform duration-500 group-hover:scale-[1.02]" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                   <a 
                    href={save.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white text-xs font-bold flex items-center bg-black/50 px-3 py-2 rounded-full backdrop-blur-md"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Full Resolution
                  </a>
                </div>
              </div>
            )}

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

            {/* Collections Assignment */}
            <div className="pt-4 border-t border-border/50">
              <h3 className="text-text-tertiary text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Relate to Project</h3>
              <div className="flex flex-wrap gap-2">
                {collections.map(col => {
                  const isInCollection = col.saves.some(s => s._id === save._id || s === save._id);
                  return (
                    <button 
                      key={col._id}
                      onClick={() => !isInCollection && handleAddToCollection(col._id)}
                      disabled={isAddingToCollection || isInCollection}
                      className={`px-4 py-2 rounded-xl border text-sm font-bold flex items-center space-x-2 transition-all ${
                        isInCollection 
                        ? 'bg-secondary/10 border-secondary text-secondary' 
                        : 'border-border text-text-secondary hover:border-secondary/40 hover:text-text-primary'
                      }`}
                    >
                      <span>{col.icon}</span>
                      <span>{col.title}</span>
                      {isInCollection && (
                        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
                {collections.length === 0 && (
                  <p className="text-text-tertiary text-sm italic">No projects created yet.</p>
                )}
              </div>
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
          <div className="p-6 border-t border-border bg-surface/90 backdrop-blur-md absolute bottom-0 w-full flex flex-col space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
            <div className="flex space-x-4">
              {save.status === 'inbox' && (
                <button 
                  onClick={() => handleStatusUpdate('processed')}
                  disabled={isUpdating}
                  className="flex-1 py-4 px-6 bg-secondary text-white font-bold rounded-2xl hover:bg-secondary/90 shadow-lg shadow-secondary/20 transition-all flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{isUpdating ? 'Processing...' : 'Mark as Processed'}</span>
                </button>
              )}
              
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
            </div>

            <div className="flex justify-between items-center px-2">
              <button 
                onClick={() => handleStatusUpdate('archived')}
                disabled={isUpdating}
                className="text-text-tertiary hover:text-text-primary text-sm font-bold transition-all flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span>{isUpdating ? 'Wait...' : 'Archive Memory'}</span>
              </button>

              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-500/60 hover:text-red-500 text-sm font-bold transition-all flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete Forever</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryDetailDrawer;
