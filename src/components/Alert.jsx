import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  if (!message) return null;

  const styles = {
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    },
  }[type] || styles.info;

  return (
    <div className={`flex items-start p-3.5 border rounded-lg text-sm shadow-xs ${styles.bg} ${className}`}>
      <div className="mr-3">{styles.icon}</div>
      <div className="flex-1 font-medium">{message}</div>
      {onClose && (
        <button onClick={onClose} className="ml-2 hover:opacity-75 focus:outline-none">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
