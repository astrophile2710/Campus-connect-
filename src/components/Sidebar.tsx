import React from 'react';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  PlusCircle,
  ListTodo,
  BarChart3,
  HelpCircle,
  ShieldAlert,
  PhoneCall,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  userRole: UserRole;
  pendingCount: number;
  slaBreachCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  userRole,
  pendingCount,
  slaBreachCount,
}) => {
  const isAdminOrOfficer = userRole === 'admin' || userRole === 'officer';

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none font-sans">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Primary Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Campus Portal
          </p>

          {/* Dashboard */}
          <button
            onClick={() => onTabChange('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-orange-600 text-white font-semibold shadow-lg shadow-orange-600/20'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview Dashboard</span>
            </div>
          </button>

          {/* Submit New Complaint (Students Only) */}
          {userRole === 'student' && (
            <button
              onClick={() => onTabChange('submit')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                currentTab === 'submit'
                  ? 'bg-orange-600 text-white font-semibold shadow-lg shadow-orange-600/20'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Log Complaint</span>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-md font-bold">
                New
              </span>
            </button>
          )}

          {/* Track & Manage Complaints */}
          <button
            onClick={() => onTabChange('track')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
              currentTab === 'track'
                ? 'bg-orange-600 text-white font-semibold shadow-lg shadow-orange-600/20'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <ListTodo className="w-4 h-4" />
              <span>
                {isAdminOrOfficer ? 'Manage Complaints' : 'My Grievances'}
              </span>
            </div>
            {pendingCount > 0 && (
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-500/30">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Management & Analytics Section */}
        <div className="space-y-1 border-t border-slate-800/80 pt-4">
          <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Analytics & Reports
          </p>

          <button
            onClick={() => onTabChange('analytics')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
              currentTab === 'analytics'
                ? 'bg-orange-600 text-white font-semibold shadow-lg shadow-orange-600/20'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>SLA & Department Stats</span>
            </div>
            {slaBreachCount > 0 && (
              <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-rose-500/30">
                {slaBreachCount} SLA
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('help')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
              currentTab === 'help'
                ? 'bg-orange-600 text-white font-semibold shadow-lg shadow-orange-600/20'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span>Campus Policy & FAQ</span>
            </div>
          </button>
        </div>

        {/* Anti-Ragging & Emergency Box */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-2xl p-3.5 border border-slate-700/80 shadow-md">
          <div className="flex items-center space-x-2 text-rose-400 mb-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <p className="text-xs font-bold">Anti-Ragging Helpline</p>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight mb-2.5">
            24/7 UGC National Helpline for emergency assistance on campus.
          </p>
          <a
            href="tel:18001805522"
            className="flex items-center justify-center space-x-2 w-full bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 border border-rose-500/30 rounded-xl py-1.5 text-xs font-bold transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>1800-180-5522</span>
          </a>
        </div>
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span>SRM Portal v2.4</span>
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          UGC Active
        </span>
      </div>
    </aside>
  );
};
