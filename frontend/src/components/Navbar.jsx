import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Laptop, LogOut, ShieldCheck } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
          <Laptop className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-2">
            Laptop Pricing & Config Engine
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              v1.0
            </span>
          </h1>
          <p className="text-xs text-slate-500">91social Tech Engineering Suite</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                {user.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                <p className="text-[10px] text-blue-600 uppercase font-bold tracking-wider">{user.role}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Guest Access Mode
          </div>
        )}
      </div>
    </header>
  );
};

