import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, ShieldAlert, ShieldCheck, UserX, Trash2, Edit2, Mail, Calendar } from 'lucide-react';
import { getAdminUsersList, toggleUserStatus, deleteUserAccount } from '../../services/adminManagementService';
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';

export const UserManagementView = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getAdminUsersList().then(setUsers);
  }, []);

  const handleToggleStatus = async (uid) => {
    const updated = await toggleUserStatus(uid);
    setUsers(updated);
    toast.success('User status updated successfully');
  };

  const handleDeleteUser = async (uid, name) => {
    if (window.confirm(`Are you sure you want to delete user account "${name}"?`)) {
      const updated = await deleteUserAccount(uid);
      setUsers(updated);
      toast.success('User account deleted');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-card-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-text-main">User Management</h1>
            <Badge variant="primary" size="sm">{users.length} Platform Accounts</Badge>
          </div>
          <p className="text-xs text-text-muted">
            Inspect user activity, modify roles, suspend accounts, and manage system access permissions.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Registered User Accounts</CardTitle>
            <CardDescription>User account status, generated reports, and security roles</CardDescription>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0F172A] border border-card-border rounded-xl py-2 pl-10 pr-3 text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-card-border/60">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0F172A] font-bold text-text-subtle uppercase border-b border-card-border">
                <th className="py-3.5 px-4">User Name & Email</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Analyses / Reports</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/40">
              {filteredUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-card/60 transition-colors">
                  
                  {/* Name & Email */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-text-main">{u.name}</div>
                    <div className="text-[10px] text-text-subtle font-mono">{u.email}</div>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 px-4">
                    <Badge variant={u.role === 'admin' ? 'danger' : 'outline'} size="sm">
                      {u.role.toUpperCase()}
                    </Badge>
                  </td>

                  {/* Analyses / Reports */}
                  <td className="py-3.5 px-4 font-mono text-text-muted">
                    {u.totalAnalyses} Scans / {u.reportsGenerated} PDF Reports
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <Badge variant={u.status === 'Active' ? 'success' : 'danger'} size="sm">
                      {u.status}
                    </Badge>
                  </td>

                  {/* Joined Date */}
                  <td className="py-3.5 px-4 font-mono text-text-subtle">{u.joinedDate}</td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant={u.status === 'Active' ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleStatus(u.uid)}
                        className="text-[11px] px-2.5"
                      >
                        {u.status === 'Active' ? 'Suspend' : 'Activate'}
                      </Button>

                      <button
                        onClick={() => handleDeleteUser(u.uid, u.name)}
                        className="p-1.5 rounded-lg text-text-subtle hover:text-danger hover:bg-danger/10 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
};

export default UserManagementView;
