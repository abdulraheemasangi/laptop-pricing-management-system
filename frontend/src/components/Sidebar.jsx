import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Cpu, FileText, PlusCircle } from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { path: '/', label: 'Dashboard Overview', icon: LayoutDashboard },
    { path: '/builder', label: 'Laptop Builder', icon: PlusCircle },
    { path: '/components', label: 'Component Catalog', icon: Cpu },
    { path: '/quotations', label: 'Saved Quotations', icon: FileText },
  ];

  return (
    <aside className="no-print w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          );
        })}
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
        <p className="font-semibold text-slate-900">Historical Pricing Active</p>
        <p className="text-[11px] leading-relaxed text-slate-500">
          All quotation components snapshot exact prices at creation time. Catalog updates will not alter existing quotes.
        </p>
      </div>
    </aside>
  );
};

