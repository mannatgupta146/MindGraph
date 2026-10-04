import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import api, { API_BASE } from '../api/config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Establishing Neural Link...');
  const [takingLong, setTakingLong] = useState(false);

  axios.defaults.withCredentials = true;

  // Pro-Level Identity Bridge: Sync with MindGraph Siphon Extension
  const syncWithExtension = (token) => {
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
           console.warn('[Neural Link] Extension not found or ID mismatch.');
         } else {
           console.log('[Neural Link] Identity Synchronized ✅');
         }
       });
    }
  };

  const checkUserLoggedIn = async () => {
    setLoading(true);
    setTakingLong(false);
    setStatusMessage('Establishing Neural Link...');

    const timer1 = setTimeout(() => {
      setStatusMessage('Waking up cloud server... (Render cold start)');
    }, 3500);

    const timer2 = setTimeout(() => {
      setTakingLong(true);
      setStatusMessage('Server is taking longer than usual to respond.');
    }, 8000);

    try {
      const { data } = await api.get('/auth/profile');
      setUser(data);
      if (data?.token) syncWithExtension(data.token);
    } catch (error) {
      setUser(null);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    if (data?.token) syncWithExtension(data.token);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setUser(data);
    if (data?.token) syncWithExtension(data.token);
    return data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    syncWithExtension(null);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#09090b] flex flex-col items-center justify-center z-9999 px-4">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-r-2 border-secondary rounded-full animate-spin-reverse opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
          </div>
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary tracking-tighter animate-pulse mb-2">
            MINDGRAPH
          </h2>
          <p className="text-xs font-semibold text-text-secondary tracking-wide">
            {statusMessage}
          </p>

          {takingLong && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 animate-in fade-in duration-500">
              <button
                onClick={checkUserLoggedIn}
                className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Connection
              </button>
              <button
                onClick={() => setLoading(false)}
                className="w-full sm:w-auto px-4 py-2.5 bg-surface border border-border text-text-tertiary text-xs font-medium rounded-xl hover:text-text-primary hover:border-primary/40 transition-all"
              >
                Skip to Login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, syncWithExtension, checkUserLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

