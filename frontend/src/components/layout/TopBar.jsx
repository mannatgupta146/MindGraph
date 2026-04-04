import React from 'react';
import ThemeToggle from '../common/ThemeToggle';
import { Menu } from 'lucide-react';

const TopBar = ({ title, onToggleSidebar }) => {
  return (
    <div className="h-20 shrink-0 border-b border-border bg-background flex items-center px-6 md:px-8 justify-between sticky top-0 z-30">
      <div className="flex items-center">
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden mr-4 p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-text-primary uppercase truncate max-w-[200px] sm:max-w-none">{title}</h2>
      </div>
      
      <div className="flex items-center space-x-4 md:space-x-6">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default TopBar;
