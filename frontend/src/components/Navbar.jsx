import React, { useState } from 'react';
import { Cpu, User, Shield, Sparkles, LogOut, LogIn, ChevronDown, Clock, Briefcase } from 'lucide-react';

export default function Navbar({
  currentPage,
  onNavigate,
  backendStatus,
  currentUser,
  onOpenAuthModal,
  onOpenPaymentModal,
  onLogout
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">AI Skill Gap Analyzer</span>
              <span className="text-[11px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200/60">
                Academic Prototype
              </span>
            </div>
            <p className="text-xs text-slate-500">Explainable AI-Based Candidate & Job Competency Analysis</p>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-3 text-sm">
          {/* Backend Status indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === 'online'
                  ? 'bg-emerald-500 animate-pulse'
                  : backendStatus === 'offline'
                  ? 'bg-rose-500'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-600">
              {backendStatus === 'online' ? 'API Online' : backendStatus === 'offline' ? 'API Offline' : 'Checking API...'}
            </span>
          </div>

          {/* Primary Nav */}
          <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                currentPage === 'home'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onNavigate('input')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                currentPage === 'input'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Analysis
            </button>
            {currentPage === 'results' && (
              <button
                onClick={() => onNavigate('results')}
                className="px-3 py-1.5 rounded-lg font-bold bg-blue-600 text-white shadow-2xs cursor-pointer"
              >
                Dashboard
              </button>
            )}
          </nav>

          {/* Pro Upgrade Quick Button */}
          {currentUser && currentUser.plan !== 'pro' && (
            <button
              onClick={onOpenPaymentModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-xs shadow-xs cursor-pointer transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade Pro</span>
            </button>
          )}

          {/* User Auth Section */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 capitalize">
                    {currentUser.plan} • {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  onMouseLeave={() => setIsDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 text-xs z-50 animate-in fade-in duration-150"
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-900 truncate">{currentUser.full_name}</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email}</p>
                  </div>

                  <button
                    onClick={() => { setIsDropdownOpen(false); onNavigate('profile'); }}
                    className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile & History</span>
                  </button>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => { setIsDropdownOpen(false); onNavigate('admin'); }}
                      className="w-full px-3 py-2 text-left text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Shield className="w-4 h-4 text-indigo-500" />
                      <span>Admin Operations Panel</span>
                    </button>
                  )}

                  <button
                    onClick={() => { setIsDropdownOpen(false); onOpenPaymentModal(); }}
                    className="w-full px-3 py-2 text-left text-amber-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Subscriptions & Plans</span>
                  </button>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => { setIsDropdownOpen(false); onLogout(); }}
                      className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Demo</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
