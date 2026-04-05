import React, { useState } from 'react';
import ThemeToggle from '../common/ThemeToggle';
import { Menu, Download } from 'lucide-react';
import ExtensionModal from '../ui/ExtensionModal';

const TopBar = ({ title, onToggleSidebar }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="h-20 fixed top-0 right-0 left-0 lg:left-[260px] border-b border-border bg-background flex items-center px-6 md:px-8 justify-between z-[40]">
        <div className="flex items-center">
          <button 
            onClick={onToggleSidebar}
            className="lg:hidden mr-4 p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-text-primary uppercase truncate max-w-[200px] sm:max-w-none">{title}</h2>
        </div>
        
        <div className="flex items-center space-x-3 md:space-x-5">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group tracking-widest uppercase"
          >
            <Download className="w-3.5 h-3.5 mr-2" />
            <span className="hidden sm:inline">Download Extension</span>
            <span className="sm:hidden">Extension</span>
          </button>
          <ThemeToggle />
        </div>
      </div>
      
      <ExtensionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default TopBar;
