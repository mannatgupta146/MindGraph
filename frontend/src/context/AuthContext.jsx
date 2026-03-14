import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/api/auth/profile');
        setUser(data);
      } catch (error) {
        setUser(null);
      }
      setLoading(false);
    };
    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('http://localhost:3000/api/auth/login', { email, password });
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post('http://localhost:3000/api/auth/register', { name, email, password });
    setUser(data);
    return data;
  };

  const logout = async () => {
    await axios.post('http://localhost:3000/api/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
