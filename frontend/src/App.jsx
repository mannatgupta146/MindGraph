import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import KnowledgeGraph from './pages/KnowledgeGraph';
import Inbox from './pages/Inbox';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import AppLayout from './components/layout/AppLayout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  return user ? <AppLayout>{children}</AppLayout> : <Navigate to="/login" />;
};

// Placeholders for other pages
const PlaceholderPage = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[60vh]">
    <h2 className="text-3xl font-semibold text-text-primary mb-2">{title}</h2>
    <p className="text-text-secondary">This section is under construction.</p>
  </div>
);

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/inbox" element={<PrivateRoute><Inbox /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
        <Route path="/collections" element={<PrivateRoute><Collections /></PrivateRoute>} />
        <Route path="/collections/:id" element={<PrivateRoute><CollectionDetail /></PrivateRoute>} />
        <Route path="/graph" element={<PrivateRoute><KnowledgeGraph /></PrivateRoute>} />
        <Route path="/resurface" element={<PrivateRoute><PlaceholderPage title="Memory Resurfacing" /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><PlaceholderPage title="Settings" /></PrivateRoute>} />
        
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
