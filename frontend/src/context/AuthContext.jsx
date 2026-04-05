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
        const { data } = await axios.get('https://mindgraph.onrender.com/api/auth/profile');
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
    const { data } = await axios.post('https://mindgraph.onrender.com/api/auth/login', { email, password });
    setUser(data);
    if (data.token) syncWithExtension(data.token);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post('https://mindgraph.onrender.com/api/auth/register', { name, email, password });
    setUser(data);
    if (data.token) syncWithExtension(data.token);
    return data;
  };

  const logout = async () => {
    await axios.post('https://mindgraph.onrender.com/api/auth/logout');
    setUser(null);
    // Optional: Clear extension token on logout
    syncWithExtension(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, syncWithExtension }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
