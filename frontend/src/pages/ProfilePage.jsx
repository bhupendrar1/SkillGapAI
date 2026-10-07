import React, { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Award, Clock, ArrowRight, Shield, CheckCircle2, RotateCcw, Sparkles, Loader2, Save } from 'lucide-react';
import { getUserProfile, updateUserProfile, getAnalysisHistory } from '../services/api';
import SkillBadge from '../components/SkillBadge';

export default function ProfilePage({ currentUser, onSelectPastAnalysis, onOpenUpgradeModal }) {
  const [profileData, setProfileData] = useState(null);
  const [history, setHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [bio, setBio] = useState('');
  const [expLevel, setExpLevel] = useState('Entry-Level');
  const [skillsList, setSkillsList] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    const profRes = await getUserProfile();
    const histRes = await getAnalysisHistory();

    if (profRes.success) {
      setProfileData(profRes.data);
      setFullName(profRes.data.user.full_name || '');
      setTargetRole(profRes.data.profile.target_role || 'Software Developer');
      setBio(profRes.data.profile.bio || '');
      setExpLevel(profRes.data.profile.experience_level || 'Entry-Level');
      setSkillsList(profRes.data.profile.skills_list || '');
    }

    if (histRes.success) {
      setHistory(histRes.data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMsg('');

    const res = await updateUserProfile({
      full_name: fullName,
      target_role: targetRole,
      bio,
      experience_level: expLevel,
      skills_list: skillsList
    });

    setIsSaving(false);
    if (res.success) {
      setSaveMsg('Profile updated successfully!');
      setIsEditing(false);
      loadData();
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading your researcher profile & past analyses...</p>
      </div>
    );
  }

  const user = profileData?.user || currentUser;
  const profile = profileData?.profile || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{user?.full_name}</h2>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                user?.plan === 'pro'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {user?.plan === 'pro' ? '⭐ Pro Researcher' : 'Academic Free'}
              </span>
              {user?.role === 'admin' && (
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-mono">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user?.plan !== 'pro' && (
            <button
              onClick={onOpenUpgradeModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade to Pro</span>
            </button>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {saveMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Main Grid: Profile Info & Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Summary Details */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Competency Profile
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Target Career Role</span>
              <span className="font-semibold text-slate-800">{profile.target_role || 'Not specified'}</span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Experience Level</span>
              <span className="font-semibold text-slate-800">{profile.experience_level || 'Entry-Level'}</span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Known Skills Inventory</span>
              <p className="text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1 font-mono text-[11px]">
                {profile.skills_list || 'No skills listed yet.'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Research Bio / Goals</span>
              <p className="text-slate-600 italic mt-0.5 leading-relaxed text-[11px]">
                {profile.bio || 'No bio provided.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right 2-Cols: Edit Form or History */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Edit Career Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Career Role</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Software Developer"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
                <select
                  value={expLevel}
                  onChange={(e) => setExpLevel(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:border-blue-500"
                >
                  <option value="Student / Intern">Student / Intern</option>
                  <option value="Entry-Level">Entry-Level (0-2 yrs)</option>
                  <option value="Mid-Level">Mid-Level (3-5 yrs)</option>
                  <option value="Senior">Senior (5+ yrs)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Known Skills (comma-separated)</label>
                <input
                  type="text"
                  value={skillsList}
                  onChange={(e) => setSkillsList(e.target.value)}
                  placeholder="JavaScript, React, Node.js, Git, MongoDB"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / Research Objectives</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief summary of your professional goals and research focus..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Changes</span>
              </button>
            </form>
          ) : (
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Saved Analysis History ({history.length})</span>
                </h3>
                <span className="text-[11px] text-slate-400">Stored in SQLite</span>
              </div>

              {history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Target Role</th>
                        <th className="py-2.5 px-3 text-center">Match %</th>
                        <th className="py-2.5 px-3">Status Overview</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {item.target_role}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold">
                            <span className={`px-2 py-0.5 rounded ${
                              item.overall_match >= 70
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.overall_match >= 50
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {item.overall_match}%
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex gap-1.5 text-[10px] font-mono">
                              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                {item.matched_skills.length} matched
                              </span>
                              <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                {item.missing_skills.length} missing
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => onSelectPastAnalysis(item)}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-xs cursor-pointer inline-flex items-center gap-1"
                            >
                              <span>View</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs">
                  <p>No past analyses recorded yet.</p>
                  <p className="text-[11px] mt-1">Run an analysis to save your results here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

