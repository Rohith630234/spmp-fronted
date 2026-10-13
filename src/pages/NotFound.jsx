import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">404</h1>
      <p className="mt-2 text-xl font-semibold text-slate-700">Page Not Found</p>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        The page or resource you are looking for does not exist or has been moved to another location.
      </p>
      <div className="mt-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
