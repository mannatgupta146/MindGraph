import React from 'react';

const MemoryCard = ({ title, summary, sourceUrl, type, date, tags }) => {
  return (
    <div className="bg-surface rounded-xl p-5 border border-border hover:border-primary/50 transition-colors cursor-pointer flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          {type === 'article' && <span className="text-secondary text-xs font-semibold px-2 py-1 rounded bg-secondary/10 uppercase">Article</span>}
          {type === 'tweet' && <span className="text-accent text-xs font-semibold px-2 py-1 rounded bg-accent/10 uppercase">Tweet</span>}
          {type === 'pdf' && <span className="text-primary text-xs font-semibold px-2 py-1 rounded bg-primary/10 uppercase">PDF</span>}
        </div>
        <span className="text-text-tertiary text-xs">{new Date(date).toLocaleDateString()}</span>
      </div>
      
      <h3 className="text-lg font-semibold text-text-primary mb-2 transition-colors">{title}</h3>
      <p className="text-sm text-text-secondary mb-4 flex-1">{summary}</p>
      
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
