import React from 'react';
import type { UserRole } from '../types';

interface BadgeProps {
  role?: UserRole;
  text?: string;
  variant?: 'indigo' | 'emerald' | 'amber' | 'slate';
}

export const Badge: React.FC<BadgeProps> = ({ role, text, variant }) => {
  if (role) {
    if (role === 'ADMIN') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950/80 text-purple-300 border border-purple-800/50">
          System Admin
        </span>
      );
    }
    if (role === 'STORE_OWNER') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/50">
          Store Owner
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
        Normal User
      </span>
    );
  }

  const variants = {
    indigo: 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/50',
    emerald: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50',
    amber: 'bg-amber-950/80 text-amber-300 border border-amber-800/50',
    slate: 'bg-slate-800 text-slate-300 border border-slate-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant || 'indigo']}`}>
      {text}
    </span>
  );
};
