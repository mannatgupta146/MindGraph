import React from 'react';
import ThemeToggle from '../common/ThemeToggle';

const TopBar = ({ title }) => {
  return (
    <div className="h-20 shrink-0 border-b border-border bg-background flex items-center px-8 justify-between">
      <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
      
      <div className="flex items-center space-x-6">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default TopBar;
