import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  axios.defaults.withCredentials = true;

  // Pro-Level Identity Bridge: Sync with MindGraph Siphon Extension
  const syncWithExtension = (token) => {
    // 🛡️ RE-VERIFY YOUR EXTENSION ID IN chrome://extensions
    const EXTENSION_ID = 'jaclokibcknmolijpnmolijpnmolijp'; 
    
    if (token) {
      console.log('[Neural Link] Token Found. Copy this for Manual Bridge:', token);
      localStorage.setItem('mindgraph_token', token);
    } else {
      localStorage.removeItem('mindgraph_token');
    }

    if (window.chrome && chrome.runtime && chrome.runtime.sendMessage) {
       chrome.runtime.sendMessage(EXTENSION_ID, { 
         type: 'MINDGRAPH_IDENTITY_SYNC', 
         token 
       }, (response) => {
         if (chrome.runtime.lastError) {
           console.warn('[Neural Link] Extension not found or ID mismatch. Ensure ID matches in AuthContext.jsx.');
         } else {
           console.log('[Neural Link] Identity Synchronized ✅');
         }
       });
    }
  };

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'https://mindgraph.onrender.com/api';
        const { data } = await axios.get(`${baseUrl}/auth/profile`);
        setUser(data);
        // Silently sync if user found
        if (data.token) syncWithExtension(data.token);
      } catch (error) {
        setUser(null);
      }
      setLoading(false);
    };
    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://mindgraph.onrender.com/api';
    const { data } = await axios.post(`${baseUrl}/auth/login`, { email, password });
    setUser(data);
    if (data.token) syncWithExtension(data.token);
    return data;
  };

  const register = async (name, email, password) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://mindgraph.onrender.com/api';
    const { data } = await axios.post(`${baseUrl}/auth/register`, { name, email, password });
    setUser(data);
    if (data.token) syncWithExtension(data.token);
    return data;
  };

  const logout = async () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://mindgraph.onrender.com/api';
    await axios.post(`${baseUrl}/auth/logout`);
    setUser(null);
    // Optional: Clear extension token on logout
    syncWithExtension(null);
  };

  // Final Neural Shield: Ensure UI never hangs in a black state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#09090b] flex flex-col items-center justify-center z-[9999]">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-r-2 border-secondary rounded-full animate-spin-reverse opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-tighter animate-pulse">
            MINDGRAPH
          </h2>
          <p className="text-[10px] uppercase font-bold text-text-tertiary tracking-widest mt-2 opacity-50">Establishing Neural Link...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, syncWithExtension }}>
      {children}
    </AuthContext.Provider>
  );
};
