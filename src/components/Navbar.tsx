import React, { useState } from 'react';
import { User } from '../types';
import { DEMO_USERS } from '../data/mockData';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Search,
  LogOut,
  Sparkles,
  ChevronDown,
  Building2,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  onLogout: () => void;
  onOpenAiAssist: () => void;
  onSearchChange?: (term: string) => void;
  searchTerm?: string;
  pendingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSelectUser,
  onLogout,
  onOpenAiAssist,
  onSearchChange,
  searchTerm = '',
  pendingCount,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-lg">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 min-w-[240px]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                SRM Campus Connect
              </h1>
              <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Portal
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              SRM Institute Grievance & Resolution Platform
            </p>
          </div>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-xl mx-4 relative hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search by Complaint ID (e.g., CC-2024-108), RA Roll No, location..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Quick Action Items & User Selector */}
        <div className="flex items-center space-x-3">
          {/* AI Helper Trigger */}
          <button
            onClick={onOpenAiAssist}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 text-purple-200 border border-purple-500/40 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow-purple-500/10 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
            <span className="hidden lg:inline">AI Help Assistant</span>
          </button>

          {/* Role Badge */}
          <div className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
            {currentUser.role === 'admin' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : currentUser.role === 'officer' ? (
              <Building2 className="w-4 h-4 text-blue-400" />
            ) : (
              <UserCheck className="w-4 h-4 text-indigo-400" />
            )}
            <span className="capitalize font-semibold text-slate-200">
              {currentUser.role} Mode
            </span>
          </div>

          {/* User Profile & Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl p-1.5 pr-3 transition-colors cursor-pointer"
            >
              {/* Initials Badge instead of photo */}
              <div className="w-7 h-7 rounded-lg bg-orange-600 text-white font-extrabold flex items-center justify-center text-xs border border-orange-500">
                {getInitials(currentUser.name)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-100 leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-medium">
                  {currentUser.role === 'student' ? currentUser.studentId : currentUser.role}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Account Switcher Dropdown */}
            {showUserDropdown && (
              <div
                className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
                onMouseLeave={() => setShowUserDropdown(false)}
              >
                <div className="px-3 py-2 border-b border-slate-700/80 mb-2">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch SRM Account
                  </p>
                  <p className="text-xs text-slate-300">
                    Test Student vs Warden / Admin roles
                  </p>
                </div>

                <div className="space-y-1">
                  {DEMO_USERS.map((user) => {
                    const isSelected = user.id === currentUser.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          onSelectUser(user);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full flex items-center space-x-3 p-2 rounded-xl text-left transition-colors text-xs ${
                          isSelected
                            ? 'bg-orange-600 text-white font-bold'
                            : 'hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 text-orange-400 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{user.name}</p>
                          <p className="text-[10px] opacity-80 uppercase tracking-wide">
                            {user.role === 'student' ? user.studentId : user.role} {user.department ? `• ${user.department}` : ''}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-700/80 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full flex items-center space-x-2 p-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out / Lock Portal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
