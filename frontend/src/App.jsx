import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ComponentManager } from './pages/ComponentManager';
import { ConfigBuilder } from './pages/ConfigBuilder';
import { QuoteList } from './pages/QuoteList';

const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500 font-medium">
        Loading Laptop Pricing System...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col min-w-[1200px]">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto space-y-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/builder" element={<ConfigBuilder />} />
              <Route path="/components" element={<ComponentManager />} />
              <Route path="/quotations" element={<QuoteList />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

