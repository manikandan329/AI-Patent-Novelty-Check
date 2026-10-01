import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AppRoutes from './routes/AppRoutes';

const AppContent = () => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  return (
    <div className="flex flex-col min-h-screen bg-[#0F172A] text-text-main font-sans selection:bg-primary selection:text-white">
      {/* Render Public Landing Navbar only outside of Dashboard */}
      {!isDashboardRoute && <Navbar />}

      {/* Main Application Body */}
      <main className="flex-grow">
        <AppRoutes />
      </main>

      {/* Render Public Landing Footer only outside of Dashboard */}
      {!isDashboardRoute && <Footer />}

      {/* SaaS Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1E293B',
            color: '#F8FAFC',
            border: '1px solid #334155',
            borderRadius: '12px',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
            padding: '12px 16px',
            fontSize: '13px',
          },
          success: {
            iconTheme: {
              primary: '#22C55E',
              secondary: '#0F172A',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#0F172A',
            },
          },
        }}
      />
    </div>
  );
};

export const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
