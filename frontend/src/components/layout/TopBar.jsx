import React from 'react';
import ThemeToggle from '../common/ThemeToggle';

const TopBar = ({ title }) => {
  return (
    <div className="h-20 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10 flex items-center px-8 justify-between">
      <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
      
      <div className="flex items-center space-x-6">
        <ThemeToggle />
        <button className="relative px-5 py-2 bg-primary text-white font-medium rounded-full hover:bg-primary-hover transition-colors shadow-sm flex items-center group">
          Quick Save 
          <span className="text-blue-200 ml-2 text-sm border border-blue-400/30 rounded px-1.5 py-0.5 group-hover:border-blue-200/50 transition-colors">⌘K</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
