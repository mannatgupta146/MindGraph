import React, { useState } from 'react';
import axios from 'axios';

const AddSaveModal = ({ isOpen, onClose, onSaveSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('article');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('type', type);
      if (url) formData.append('url', url);
      
      if (type === 'pdf' && file) {
        formData.append('file', file);
      } else {
        formData.append('content', content);
      }

      await axios.post('http://localhost:3000/api/saves', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      onSaveSuccess();
      onClose();
      // Reset form
      setTitle('');
      setContent('');
      setUrl('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save content');
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-text-primary text-blue-500">Capture New Memory</h3>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && <p className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 text-text-primary">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your memory a name"
              required
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary/50 transition-colors"
            >
              <option value="article">Article</option>
              <option value="tweet">Tweet</option>
              <option value="pdf">PDF</option>
              <option value="youtube">YouTube Video</option>
              <option value="image">Image</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Source URL (Optional)</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {type === 'pdf' ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">PDF File</label>
              <div className="relative group/file">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  required={!content}
                  className="hidden"
                  id="pdf-upload"
                />
                <label 
                  htmlFor="pdf-upload"
                  className="flex flex-col items-center justify-center w-full h-32 px-4 py-6 bg-background/50 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <svg className={`w-8 h-8 mb-2 ${file ? 'text-emerald-500' : 'text-text-tertiary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm font-medium text-text-secondary">
                    {file ? file.name : "Select or drag PDF here"}
                  </span>
                  {file && <span className="text-[10px] text-emerald-500 mt-1 uppercase font-bold">Ready to parse</span>}
                </label>
              </div>
              <p className="text-[10px] text-text-tertiary italic">Content will be extracted automatically using local AI</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Content / Notes</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste content or write your thoughts here..."
                required
                rows={4}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>
          )}

          <div className="pt-4 flex items-center space-x-3">
             <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-surface hover:bg-surface-hover text-text-primary font-medium rounded-xl border border-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-3 px-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing with AI...
                </>
              ) : 'Save to MindGraph'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSaveModal;
