import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useLocation, useNavigate } from 'react-router-dom';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-[260px] h-screen flex flex-col">
        <TopBar title={title} />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
