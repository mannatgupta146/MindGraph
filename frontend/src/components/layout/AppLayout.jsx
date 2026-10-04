import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useLocation, useNavigate } from 'react-router-dom';

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Global Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ⌘K or Ctrl+K for Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate('/search');
      }
      // ⌘I or Ctrl+I for Inbox
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        navigate('/inbox');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
  
  // Extract title from path
  const path = location.pathname.substring(1);
  const base = path.split('/')[0];
  const title = base ? (base.charAt(0).toUpperCase() + base.slice(1)) : 'Dashboard';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 min-h-screen flex flex-col transition-all duration-300 w-full relative overflow-x-hidden lg:pl-[260px]">
        <TopBar title={title} onToggleSidebar={() => setIsSidebarOpen(true)} />
        {/* mt-20 (80px) perfectly clears the h-20 fixed TopBar */}
        <main className="flex-1 p-6 md:p-10 mt-20 min-h-[calc(100vh-80px)]">
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
