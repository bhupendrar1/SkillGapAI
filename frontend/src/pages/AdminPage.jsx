import React, { useState, useEffect } from 'react';
import { Shield, Users, Activity, DollarSign, Sliders, CheckCircle2, AlertCircle, RefreshCw, Loader2, ArrowRight } from 'lucide-react';
import {
  getAdminStats,
  getAdminUsers,
  updateAdminUserRole,
  getAdminAnalyses,
  getAdminSettings,
  updateAdminSettings
} from '../services/api';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'analyses' | 'settings'

  // Threshold ablation form
  const [matchedThresh, setMatchedThresh] = useState(0.70);
  const [partialThresh, setPartialThresh] = useState(0.50);
  const [isUpdatingThresh, setIsUpdatingThresh] = useState(false);
  const [threshMsg, setThreshMsg] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  const loadAdminData = async () => {
    setIsLoading(true);
    const statsRes = await getAdminStats();
    const usersRes = await getAdminUsers();
    const anaRes = await getAdminAnalyses();
    const settRes = await getAdminSettings();

    if (statsRes.success) setStats(statsRes.data.stats);
    if (usersRes.success) setUsers(usersRes.data || []);
    if (anaRes.success) setAnalyses(anaRes.data || []);
    if (settRes.success) {
      setMatchedThresh(settRes.data.matched_threshold);
      setPartialThresh(settRes.data.partial_threshold);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const res = await updateAdminUserRole(userId, { role: newRole });
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    }
  };

  const handleTogglePlan = async (userId, currentPlan) => {
    const newPlan = currentPlan === 'pro' ? 'free' : 'pro';
    const res = await updateAdminUserRole(userId, { plan: newPlan });
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u))
      );
    }
  };

  const handleSaveThresholds = async (e) => {
    e.preventDefault();
    setIsUpdatingThresh(true);
    setThreshMsg('');

    const res = await updateAdminSettings({
      matched_threshold: parseFloat(matchedThresh),
      partial_threshold: parseFloat(partialThresh)
    });

    setIsUpdatingThresh(false);
    if (res.success) {
      setThreshMsg('Thresholds dynamically updated for research ablation!');
      setTimeout(() => setThreshMsg(''), 4000);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading system management telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Operations Panel</h2>
              <span className="text-[10px] font-mono uppercase bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200 font-bold">
                Supervisor Privileges
              </span>
            </div>
            <p className="text-xs text-slate-500">Monitor system telemetry, users, and configure research thresholds.</p>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs self-start cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {stats?.total_users || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Platform candidate accounts</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Analyses</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {stats?.total_analyses || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pipelines executed</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pro Subscribers</span>
            <Shield className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {stats?.total_pro_subscribers || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active Pro research licenses</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Revenue</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            ${stats?.total_revenue_usd || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Simulated subscription total</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          User Accounts ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('analyses')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'analyses'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Global Analysis Logs ({analyses.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Research Threshold Ablation
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">User Directory</h3>
            <span className="text-[11px] text-slate-500">Stored in SQLite</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Target Role</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{u.full_name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {u.target_role || 'Not specified'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        u.plan === 'pro'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className="text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                      >
                        Make {u.role === 'admin' ? 'User' : 'Admin'}
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => handleTogglePlan(u.id, u.plan)}
                        className="text-[11px] text-amber-600 hover:underline font-semibold cursor-pointer"
                      >
                        {u.plan === 'pro' ? 'Downgrade' : 'Upgrade Pro'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GLOBAL ANALYSES LOG */}
      {activeTab === 'analyses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Analysis Telemetry Logs</h3>
            <span className="text-[11px] text-slate-500">Recent 50 records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Candidate / User</th>
                  <th className="py-3 px-4">Target Role</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4">Breakdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analyses.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(a.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800">
                      {a.user_email}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {a.target_role}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded ${
                        a.overall_match >= 70
                          ? 'bg-emerald-100 text-emerald-800'
                          : a.overall_match >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {a.overall_match}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[10px] font-mono text-slate-600">
                      <span className="text-emerald-700">{a.matched_skills.length} Matched</span> •{' '}
                      <span className="text-amber-700">{a.partial_skills.length} Partial</span> •{' '}
                      <span className="text-rose-700">{a.missing_skills.length} Missing</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RESEARCH THRESHOLD SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-2xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              <span>Sensitivity & Threshold Ablation Controls</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Adjust prototype baseline thresholds to study classification sensitivity on student resumes. Updates take effect immediately without server restart.
            </p>
          </div>

          {threshMsg && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{threshMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveThresholds} className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-800">
                <label>Matched Threshold (&ge; Score)</label>
                <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {matchedThresh}
                </span>
              </div>
              <input
                type="range"
                min="0.60"
                max="0.95"
                step="0.01"
                value={matchedThresh}
                onChange={(e) => setMatchedThresh(e.target.value)}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Competencies with cosine similarity &ge; this value receive "Matched" status.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-800">
                <label>Partial Threshold (&ge; Score)</label>
                <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {partialThresh}
                </span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.69"
                step="0.01"
                value={partialThresh}
                onChange={(e) => setPartialThresh(e.target.value)}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Competencies between this value and Matched receive "Partially Matched" status. Below this is "Missing".
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600">
              Active Model: <strong>sentence-transformers/all-MiniLM-L6-v2</strong> (384-dimensional dense vectors)
            </div>

            <button
              type="submit"
              disabled={isUpdatingThresh}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {isUpdatingThresh ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sliders className="w-4 h-4" />}
              <span>Save & Apply Thresholds</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

