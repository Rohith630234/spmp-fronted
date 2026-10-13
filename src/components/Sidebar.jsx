import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  FolderGit2,
  FolderPlus,
  Layers,
  Users,
  Award,
  UserCheck,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const role = user?.role;

  const navItemClass = ({ isActive }) =>
    `flex items-center px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-1/0 lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 lg:hidden">
            <span className="font-bold text-slate-900 text-lg">Menu</span>
            <button
              onClick={closeSidebar}
              className="p-1 text-slate-500 rounded-md hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Overview
            </div>
            <NavLink to="/dashboard" onClick={closeSidebar} className={navItemClass}>
              <LayoutDashboard className="w-4 h-4 mr-3 text-slate-500" />
              Dashboard
            </NavLink>

            <div className="pt-5 px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Projects & Deadlines
            </div>
            <NavLink to="/projects" onClick={closeSidebar} className={navItemClass}>
              <FolderGit2 className="w-4 h-4 mr-3 text-slate-500" />
              All Projects
            </NavLink>

            <NavLink to="/my-projects" onClick={closeSidebar} className={navItemClass}>
              <Award className="w-4 h-4 mr-3 text-slate-500" />
              My Projects
            </NavLink>

            {(role === 'ROLE_STUDENT' || role === 'ROLE_ADMIN') && (
              <NavLink to="/projects/new" onClick={closeSidebar} className={navItemClass}>
                <FolderPlus className="w-4 h-4 mr-3 text-slate-500" />
                Submit Proposal
              </NavLink>
            )}

            <div className="pt-5 px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Administration & People
            </div>
            <NavLink to="/domains" onClick={closeSidebar} className={navItemClass}>
              <Layers className="w-4 h-4 mr-3 text-slate-500" />
              Technical Domains
            </NavLink>

            <NavLink to="/guides" onClick={closeSidebar} className={navItemClass}>
              <Users className="w-4 h-4 mr-3 text-slate-500" />
              Faculty Mentors
            </NavLink>

            <NavLink to="/profile" onClick={closeSidebar} className={navItemClass}>
              <UserCheck className="w-4 h-4 mr-3 text-slate-500" />
              My Profile
            </NavLink>
          </div>

          {/* User footer summary */}
          {user && (
            <div className="p-4 border-t border-slate-200 bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{user.fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{user.rollOrEmpId}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
