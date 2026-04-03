import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';


const MemoryDetailDrawer = ({ save: initialSave, saveId, isOpen, onClose, onDeleteSuccess, onUpdateSuccess }) => {
  const [save, setSave] = useState(initialSave);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [collections, setCollections] = useState([]);
  const [isAddingToCollection, setIsAddingToCollection] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy to Clipboard');
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsDeleting(false);
      setIsUpdating(false);
      fetchCollections();
      if (saveId && (!save || save._id !== saveId)) {
        fetchSaveDetails(saveId);
      }
    } else {
      setSave(null);
      setIsDeleting(false);
      setIsUpdating(false);
      setError(null);
    }
  }, [isOpen, saveId]);

  useEffect(() => {
    if (initialSave) setSave(initialSave);
  }, [initialSave]);

  const fetchSaveDetails = async (id) => {
    setIsFetching(true);
    try {
      const { data } = await axios.get(`http://localhost:3000/api/saves/${id}`, {
        withCredentials: true
      });
      setSave(data);
    } catch (err) {
      console.error('Error fetching save details:', err);
      setError('Failed to load memory details');
    } finally {
      setIsFetching(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const { data } = await axios.get('http://localhost:3000/api/collections');
      setCollections(data);
    } catch (err) {
      console.error('Error fetching collections:', err);
    }
  };

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!save) return;
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
    if (!save) return;
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
    if (!save) return;
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
    if (!save) return;
    setIsAddingToCollection(true);
    setError(null);
    try {
      await axios.post('http://localhost:3000/api/collections/add', {
        collectionId,
        saveId: save._id
      }, { withCredentials: true });
      if (onUpdateSuccess) onUpdateSuccess();
      fetchCollections();
    } catch (err) {
      setError('Failed to add memory to collection');
    } finally {
      setIsAddingToCollection(false);
    }
  };

  const handleRemoveFromCollection = async (collectionId) => {
    if (!save) return;
    setIsAddingToCollection(true);
    setError(null);
    try {
      await axios.post('http://localhost:3000/api/collections/remove', {
        collectionId,
        saveId: save._id
      }, { withCredentials: true });
      if (onUpdateSuccess) onUpdateSuccess();
      fetchCollections();
    } catch (err) {
      setError('Failed to remove memory from collection');
    } finally {
      setIsAddingToCollection(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={() => !(isDeleting || isUpdating) && onClose()}
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-2xl w-full flex">
        <div className="h-full w-full bg-surface border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-out animate-slide-in-right">
          
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between bg-surface/80 backdrop-blur-md sticky top-0 z-10 transition-opacity duration-300">
            <div className="flex items-center space-x-3">
              {save && (
                <>
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
                </>
              )}
              {!save && isFetching && <span className="text-text-tertiary text-sm">Loading memory...</span>}
            </div>
            <button 
              onClick={onClose} 
              disabled={isDeleting || isUpdating}
              className="p-2 text-text-tertiary hover:text-text-primary hover:bg-surface-hover rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar pb-8 relative">
            {/* Global Loading Overlay */}
            {(isDeleting || isUpdating) && (
              <div className="absolute inset-0 z-50 bg-surface/60 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p className="mt-4 text-text-primary font-bold text-sm tracking-widest uppercase animate-pulse">
                  {isDeleting ? 'Deleting Forever...' : 'Syncing Brain...'}
                </p>
              </div>
            )}

            {error && <p className="p-3 bg-red-500/10 text-red-500 rounded-xl text-sm border border-red-500/20">{error}</p>}
            
            {isFetching && !save && (
              <div className="space-y-6 animate-pulse">
                <div className="h-10 bg-surface-hover rounded-xl w-3/4"></div>
                <div className="h-32 bg-surface-hover rounded-2xl w-full"></div>
                <div className="h-64 bg-surface-hover rounded-3xl w-full"></div>
              </div>
            )}

            {save && (
              <>
                {/* Title & URL */}
                <div>
                  <h1 className="text-3xl font-bold text-text-primary leading-tight mb-4 tracking-tight">{save.title}</h1>
                  <div className="flex flex-wrap gap-3">
                    {save.url && (
                      <a 
                        href={save.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`inline-flex items-center text-primary hover:text-primary-hover group bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 transition-colors ${isDeleting || isUpdating ? 'pointer-events-none opacity-30' : ''}`}
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
                        className={`inline-flex items-center text-secondary hover:text-secondary-hover group bg-secondary/5 px-3 py-1.5 rounded-lg border border-secondary/10 transition-colors ${isDeleting || isUpdating ? 'pointer-events-none opacity-30' : ''}`}
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
                      const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
                      const match = save.url.match(regExp);
                      const videoId = match ? match[1] : null;

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

                {/* AI Synthesis Block */}
                {save.summary && (
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="flex items-center space-x-2 mb-3 text-primary">
                      <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="font-bold text-[10px] uppercase tracking-[0.2em]">AI Synthesis</span>
                    </div>
                    <div className="text-text-primary text-base leading-relaxed opacity-95 markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {save.summary}
                  </ReactMarkdown>
                </div>
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

                {/* Collections */}
                <div className="pt-4 border-t border-border/50">
                  <h3 className="text-text-tertiary text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Relate to Project</h3>
                  <div className="flex flex-wrap gap-2">
                    {collections.map(col => {
                      const isInCollection = col.saves.some(s => s._id === save._id || s === save._id);
                      return (
                        <button 
                          key={col._id}
                          onClick={() => isInCollection ? handleRemoveFromCollection(col._id) : handleAddToCollection(col._id)}
                          disabled={isAddingToCollection || isDeleting || isUpdating}
                          className={`px-4 py-2 rounded-xl border text-sm font-bold flex items-center space-x-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed group ${
                            isInCollection 
                            ? 'bg-secondary/10 border-secondary text-secondary hover:bg-red-500/10 hover:border-red-500 hover:text-red-500' 
                            : 'border-border text-text-secondary hover:border-secondary/40 hover:text-text-primary'
                          }`}
                        >
                          <span>{col.icon}</span>
                          <span className={isInCollection ? 'group-hover:line-through' : ''}>{col.title}</span>
                          {isInCollection ? (
                            <>
                              <svg className="w-4 h-4 ml-1 group-hover:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                              <svg className="w-4 h-4 ml-1 hidden group-hover:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Original Content */}
                <div className="pt-4 border-t border-border/50">
                  <h3 className="text-text-tertiary text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Original Content</h3>
                  <div className="text-text-secondary leading-relaxed whitespace-pre-wrap text-sm font-normal selection:bg-primary/30 opacity-80">
                    {save.content}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Actions */}
          {save && (
            <div className={`p-5 border-t border-border bg-surface/90 backdrop-blur-md sticky bottom-0 w-full flex flex-col space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] transition-opacity duration-300 ${(isDeleting || isUpdating) ? 'pointer-events-none opacity-30' : ''}`}>
              <div className="flex space-x-3">
                {save.status === 'inbox' && (
                  <button 
                    onClick={() => handleStatusUpdate('processed')}
                    disabled={isUpdating || isDeleting}
                    className="flex-1 py-3 px-4 bg-secondary text-white font-bold text-sm rounded-xl hover:bg-secondary/90 shadow-md shadow-secondary/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{isUpdating ? 'Wait...' : 'Mark Processed'}</span>
                  </button>
                )}
                
                <button 
                  onClick={handleCopy}
                  disabled={isDeleting || isUpdating}
                  className={`flex-1 py-3 px-4 font-bold text-sm rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 ${
                    copyStatus === 'Copied! ✓' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span>{copyStatus}</span>
                </button>
              </div>

              <div className="flex justify-between items-center px-2">
                <button 
                  onClick={() => handleStatusUpdate(save.status === 'archived' ? 'processed' : 'archived')}
                  disabled={isUpdating || isDeleting}
                  className="text-text-tertiary hover:text-text-primary text-sm font-bold transition-all flex items-center space-x-1 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span>
                    {isUpdating ? 'Wait...' : (save.status === 'archived' ? 'Restore to Dashboard' : 'Archive Memory')}
                  </span>
                </button>


                <button 
                  onClick={handleDelete}
                  disabled={isDeleting || isUpdating}
                  className="text-red-500/60 hover:text-red-500 text-sm font-bold transition-all flex items-center space-x-1 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>{isDeleting ? 'Deleting...' : 'Delete Forever'}</span>
                </button>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryDetailDrawer;
