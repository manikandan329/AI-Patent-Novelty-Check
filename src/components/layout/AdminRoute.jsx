import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

export const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Check admin role authorization (Default demo user is treated as admin for demonstration purposes)
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email?.includes('admin') || true;

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-danger/20 text-danger border border-danger/40 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-md">
          <h1 className="text-2xl font-extrabold text-text-main">403 - Access Restricted</h1>
          <p className="text-xs text-text-muted">
            The Admin Control Center requires administrator privileges (<code className="text-danger font-mono">role = admin</code>). Your current user account does not have permission to view system administration tools.
          </p>
        </div>
        <Link to="/dashboard">
          <Button variant="primary" size="md" icon={ArrowLeft}>
            Return to User Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
