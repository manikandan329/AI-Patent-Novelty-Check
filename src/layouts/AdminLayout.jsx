import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  LayoutDashboard,
  Database,
  Cpu,
  Users,
  Activity,
  ArrowLeft,
  Search,
  Bell,
  CheckCircle2,
  LogOut,
  ChevronLeft,
  Menu,
  Server,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';

export const AdminLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const adminNavItems = [
    { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'System Monitor', path: '/admin/monitoring', icon: Server },
    { label: 'Knowledge Base', path: '/admin/knowledge-base', icon: Database },
    { label: 'Vector Index Manager', path: '/admin/vector-index', icon: Cpu },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'System Audit Logs', path: '/admin/logs', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-text-main flex overflow-hidden">
      
      {/* Admin Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        className="h-screen bg-[#0B1120] border-r border-card-border/80 flex flex-col justify-between p-4 sticky top-0 z-30 shrink-0"
      >
        <div className="space-y-6">
          {/* Logo & Collapse Button */}
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-danger/20 text-danger border border-danger/40 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h1 className="text-sm font-extrabold text-text-main tracking-tight">Patentiq Admin</h1>
                  <span className="text-[10px] text-danger font-mono font-bold uppercase">Control Center</span>
                </div>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg border border-card-border hover:bg-card text-text-subtle hover:text-text-main mx-auto"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Admin Nav Items */}
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-danger/15 border border-danger/40 text-danger shadow-glow-primary'
                        : 'text-text-muted hover:bg-card/60 hover:text-text-main border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Return to SaaS App */}
        <div className="space-y-2 border-t border-card-border/60 pt-4">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/dashboard')}
            className="w-full justify-center text-xs"
          >
            {!collapsed && 'Back to User Dashboard'}
          </Button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-text-subtle hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-card-border/80 bg-[#0B1120]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-mono text-text-subtle">
              System Status: <strong className="text-success">All 8 Micro-Services Operational</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-card p-1 px-3 rounded-xl border border-card-border text-xs">
              <ShieldCheck className="w-4 h-4 text-danger" />
              <span className="font-bold text-text-main">{currentUser?.displayName || 'Admin Console'}</span>
              <span className="text-[10px] bg-danger/20 text-danger px-1.5 py-0.5 rounded font-mono font-bold">ADMIN</span>
            </div>
          </div>
        </header>

        {/* Page Canvas Outlet */}
        <main className="p-6 flex-1">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;
