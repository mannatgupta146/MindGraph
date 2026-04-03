import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


const MemoryCard = ({ title, summary, sourceUrl, type, date, tags, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-surface rounded-xl p-5 border border-border hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 cursor-pointer flex flex-col h-full min-h-[240px] group"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          {type === 'article' && (
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-secondary/10 text-secondary border border-secondary/20">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM14 4v4h4" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-tight">Article</span>
            </div>
          )}
          {type === 'tweet' && (
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-blue-400/10 text-blue-400 border border-blue-400/20">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-tight">Tweet</span>
            </div>
          )}
          {type === 'pdf' && (
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-red-400/10 text-red-400 border border-red-400/20">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-tight">PDF</span>
            </div>
          )}
          {type === 'youtube' && (
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-red-600/10 text-red-600 border border-red-600/20">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186c-.273-1.011-1.04-1.802-2.028-2.074C19.694 3.827 12 3.827 12 3.827s-7.694 0-9.47.285C1.542 4.384.775 5.175.502 6.186.225 7.99.225 12 .225 12s0 4.01.277 5.814c.273 1.011 1.04 1.802 2.028 2.074 1.776.285 9.47.285 9.47.285s7.694 0 9.47-.285c.988-.272 1.755-1.063 2.028-2.074.277-1.804.277-5.814.277-5.814s0-4.01-.277-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-tight">YouTube</span>
            </div>
          )}
          {type === 'image' && (
            <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-purple-400/10 text-purple-400 border border-purple-400/20">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-tight">Image</span>
            </div>
          )}
        </div>
        <span className="text-text-tertiary text-xs">{new Date(date).toLocaleDateString()}</span>
      </div>
      
      <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
      <div className="text-sm text-text-secondary mb-4 flex-1 line-clamp-3 markdown-card-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {summary}
        </ReactMarkdown>
      </div>

      
      <div className="flex flex-wrap gap-2 mt-auto">
        {tags?.map(tag => (
          <span key={tag} className="text-xs px-2 py-1 rounded-full bg-background border border-border text-text-secondary hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors cursor-pointer">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MemoryCard;
