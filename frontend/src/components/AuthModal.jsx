import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { loginUser, signupUser } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFillDemo = (type) => {
    setErrorMsg('');
    if (type === 'admin') {
      setEmail('admin@skillgap.ai');
      setPassword('Admin@123');
      setTab('login');
    } else {
      setEmail('student@example.com');
      setPassword('Student@123');
      setTab('login');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    let res;
    if (tab === 'login') {
      res = await loginUser({ email, password });
    } else {
      res = await signupUser({ email, password, full_name: fullName });
    }

    setIsLoading(false);

    if (res.success) {
      onAuthSuccess(res.data.user);
      onClose();
    } else {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs border border-blue-100">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {tab === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Access your profile, saved analysis history, and AI coaching.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              tab === 'login' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              tab === 'signup' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* 1-Click Demo Fillers for Viva / Review */}
        <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase font-bold text-blue-700 tracking-wider">
              Quick Viva Demo Accounts
            </span>
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="flex-1 py-1.5 px-2 bg-white rounded-lg border border-blue-200 text-[11px] font-semibold text-blue-800 hover:bg-blue-100/50 transition-colors shadow-2xs cursor-pointer truncate"
            >
              Demo Admin (Supervisor)
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('student')}
              className="flex-1 py-1.5 px-2 bg-white rounded-lg border border-blue-200 text-[11px] font-semibold text-blue-800 hover:bg-blue-100/50 transition-colors shadow-2xs cursor-pointer truncate"
            >
              Demo Student (Candidate)
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-md shadow-blue-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{tab === 'login' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

