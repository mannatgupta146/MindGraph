import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useLocation } from 'react-router-dom';

const AppLayout = ({ children }) => {
  const location = useLocation();
  
  // Extract title from path
  const path = location.pathname.substring(1);
  const title = path.charAt(0).toUpperCase() + path.slice(1) || 'Dashboard';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-[260px] min-h-screen flex flex-col">
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
