import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


const MemoryCard = ({ title, summary, sourceUrl, type, date, tags, score, onClick }) => {
  const matchPercentage = score ? Math.round(score * 100) : null;

  return (
    <div 
      onClick={onClick}
      className="bg-surface rounded-xl p-5 border border-border hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 cursor-pointer flex flex-col h-64 group relative overflow-hidden"
    >
      {/* Neural Background Glow for High Matches */}
      {matchPercentage >= 70 && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none group-hover:bg-primary/10 transition-colors duration-500"></div>
      )}

      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="flex items-center space-x-1.5">
          {matchPercentage && (
            <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 animate-in fade-in zoom-in duration-300">
              <span className="text-[9px] font-black uppercase tracking-tight">{matchPercentage}% Match</span>
            </div>
          )}
          {type === 'article' && (
            <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM14 4v4h4" />
              </svg>
              <span className="text-[9px] font-black uppercase tracking-tight">Article</span>
            </div>
          )}
          {type === 'tweet' && (
            <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-blue-400/10 text-blue-400 border border-blue-400/20">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              <span className="text-[9px] font-black uppercase tracking-tight">Tweet</span>
            </div>
          )}
          {type === 'pdf' && (
            <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-red-400/10 text-red-400 border border-red-400/20">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-[9px] font-black uppercase tracking-tight">PDF</span>
            </div>
          )}
          {type === 'youtube' && (
            <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-red-600/10 text-red-600 border border-red-600/20">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186c-.273-1.011-1.04-1.802-2.028-2.074C19.694 3.827 12 3.827 12 3.827s-7.694 0-9.47.285C1.542 4.384.775 5.175.502 6.186.225 7.99.225 12 .225 12s0 4.01.277 5.814c.273 1.011 1.04 1.802 2.028 2.074 1.776.285 9.47.285 9.47.285s7.694 0 9.47-.285c.988-.272 1.755-1.063 2.028-2.074.277-1.804.277-5.814.277-5.814s0-4.01-.277-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span className="text-[9px] font-black uppercase tracking-tight">YouTube</span>
            </div>
          )}
          {type === 'image' && (
            <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[9px] font-black uppercase tracking-tight">Image</span>
            </div>
          )}
        </div>
        <span className="text-text-tertiary text-[10px] font-medium">{new Date(date).toLocaleDateString()}</span>
      </div>
      
      <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2 group-hover:text-primary transition-colors tracking-tight">{title}</h3>
      <div className="text-sm text-text-secondary mb-4 flex-1 line-clamp-4 markdown-card-content leading-relaxed overflow-hidden break-all">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {summary}
        </ReactMarkdown>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-auto">
        {tags?.slice(0, 3).map(tag => (
          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border text-text-tertiary">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MemoryCard;
