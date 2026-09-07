import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Toast = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} color="var(--accent-emerald)" />;
      case 'error':
        return <AlertCircle size={18} color="var(--accent-rose)" />;
      case 'warning':
        return <AlertTriangle size={18} color="var(--accent-amber)" />;
      default:
        return <Info size={18} color="var(--accent-cyan)" />;
    }
  };

  return (
    <div className="toast-container">
      <div className={`toast toast-${toast.type}`}>
        {getIcon()}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
