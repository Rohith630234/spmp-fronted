import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User as UserIcon, BookOpen, ShieldCheck, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800"><ShieldCheck className="w-3 h-3 mr-1" /> Admin</span>;
      case 'ROLE_GUIDE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800"><Award className="w-3 h-3 mr-1" /> Faculty Guide</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800"><BookOpen className="w-3 h-3 mr-1" /> Student</span>;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-500 rounded-lg lg:hidden hover:bg-slate-100 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
            SP
          </div>
          <span className="hidden sm:inline-block font-bold text-slate-900 text-lg tracking-tight">
            ProjectPortal <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full ml-1">v1.0</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-800">{user.fullName}</span>
              <div className="mt-0.5">{getRoleBadge(user.role)}</div>
            </div>

            <Link to="/profile" className="relative group">
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                alt={user.fullName}
                className="w-9 h-9 rounded-full ring-2 ring-indigo-500/20 group-hover:ring-indigo-600 transition"
              />
            </Link>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
