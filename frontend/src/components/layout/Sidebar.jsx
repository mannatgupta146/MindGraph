import React, { useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { X, LogOut, Link, RefreshCcw } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../../api/config';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const [pairingPin, setPairingPin] = useState(null);
  const [loadingPin, setLoadingPin] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let interval;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && pairingPin) {
      setPairingPin(null);
    }
    return () => clearInterval(interval);
  }, [timeLeft, pairingPin]);

  const generatePin = async () => {
    setLoadingPin(true);
    try {
      const { data } = await axios.post(`${API_BASE}/auth/generate-pin`, {}, { withCredentials: true });
      setPairingPin(data.pin);
      setTimeLeft(600); // 10 Minutes
    } catch (err) {
      console.error('Failed to generate sync code');
    }
    setLoadingPin(false);
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { name: 'Inbox', path: '/inbox', icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' },
    { name: 'Archives', path: '/archives', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
    { name: 'Search', path: '/search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { name: 'Collections', path: '/collections', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
    { name: 'Graph', path: '/graph', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
    { name: 'Resurface', path: '/resurface', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-surface border-r border-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-tighter">
          MindGraph
        </h1>
        <button onClick={onClose} className="lg:hidden p-2 text-text-tertiary hover:text-text-primary transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-primary/10 text-primary font-bold shadow-[inset_3px_0_0_0_var(--color-primary)]'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`
            }
          >
            <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d={item.icon} />
            </svg>
            <span className="tracking-tight">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border/40 mt-auto bg-surface/50 backdrop-blur-sm">
        {/* 🔗 SYNC OVERLAY */}
        <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-primary tracking-widest">Extension Sync</span>
            {pairingPin && <span className="text-[10px] text-primary font-bold">Expires in {formatTime(timeLeft)}</span>}
          </div>
          
          {pairingPin ? (
            <div className="flex items-center justify-between bg-background/60 p-2 rounded-lg border border-primary/30">
              <span className="text-xl font-black text-primary tracking-[0.2em] ml-2">{pairingPin}</span>
              <button onClick={() => setPairingPin(null)} className="p-1 hover:bg-surface rounded-md text-text-tertiary"><X className="w-4 h-4"/></button>
            </div>
          ) : (
            <button 
              onClick={generatePin}
              disabled={loadingPin}
              className="w-full flex items-center justify-center p-2 rounded-lg bg-primary text-white text-xs font-bold hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loadingPin ? <RefreshCcw className="w-3 h-3 animate-spin mr-2" /> : <Link className="w-3 h-3 mr-2" />}
              {loadingPin ? 'Generating...' : 'Get Sync Code'}
            </button>
          )}
          <p className="mt-2 text-[9px] text-text-tertiary text-center font-medium opacity-80 uppercase tracking-tighter">Code unique to account • Valid for 10m</p>
        </div>

        <div className="flex items-center p-3 rounded-xl bg-background/40 border border-border/40 group hover:border-border transition-colors">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm mr-3 border border-primary/10">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-black text-text-primary truncate tracking-tight">{user?.name || 'User'}</p>
            <p className="text-[10px] uppercase font-bold text-text-tertiary truncate tracking-wider">{user?.email || 'user@example.com'}</p>
          </div>
          <button onClick={logout} className="ml-2 p-2 text-text-tertiary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
