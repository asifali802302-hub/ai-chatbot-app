import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { 
  X, 
  BarChart3, 
  Users, 
  MessageSquare, 
  Zap, 
  Smile, 
  RefreshCw,
  Code2,
  Coffee,
  Palette,
  Compass
} from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-slate-400">{title}</span>
      <div className={`p-2 rounded-xl ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-100">{value}</div>
      {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const AdminModal = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAnalytics();
      setStats(res.data.data);
    } catch (err) {
      toast.error('Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Admin Intelligence & Analytics</h2>
              <p className="text-xs text-slate-400">Real-time chatbot usage, user volume, and AI performance metrics</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500 animate-pulse">
              Aggregating real-time cluster metrics...
            </div>
          ) : stats ? (
            <>
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  icon={Users}
                  color="bg-indigo-500/10 text-indigo-400"
                  subtitle="Active accounts"
                />
                <StatCard
                  title="Conversations"
                  value={stats.totalSessions}
                  icon={MessageSquare}
                  color="bg-cyan-500/10 text-cyan-400"
                  subtitle="Sessions tracked"
                />
                <StatCard
                  title="Avg AI Latency"
                  value={`${stats.avgResponseTimeMs}ms`}
                  icon={Zap}
                  color="bg-amber-500/10 text-amber-400"
                  subtitle="Streaming speed"
                />
                <StatCard
                  title="Satisfaction"
                  value={`${stats.satisfactionRate}%`}
                  icon={Smile}
                  color="bg-emerald-500/10 text-emerald-400"
                  subtitle={`${stats.positiveRatings} 👍 / ${stats.negativeRatings} 👎`}
                />
              </div>

              {/* Persona Breakdown */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-slate-200 mb-3 uppercase tracking-wider">
                  Persona & Category Utilization
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center space-x-3">
                    <Compass className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="text-xs text-slate-400">General</div>
                      <div className="text-base font-bold text-slate-200">{stats.categoryBreakdown?.general || 0} msgs</div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center space-x-3">
                    <Coffee className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs text-slate-400">Casual</div>
                      <div className="text-base font-bold text-slate-200">{stats.categoryBreakdown?.casual || 0} msgs</div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center space-x-3">
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-xs text-slate-400">Professional</div>
                      <div className="text-base font-bold text-slate-200">{stats.categoryBreakdown?.professional || 0} msgs</div>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center space-x-3">
                    <Palette className="w-4 h-4 text-fuchsia-400" />
                    <div>
                      <div className="text-xs text-slate-400">Creative</div>
                      <div className="text-base font-bold text-slate-200">{stats.categoryBreakdown?.creative || 0} msgs</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-slate-200 mb-3 uppercase tracking-wider">
                  Recent Message Traffic & Telemetry
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 text-[11px]">
                        <th className="pb-2 font-semibold">Sender</th>
                        <th className="pb-2 font-semibold">Content Snippet</th>
                        <th className="pb-2 font-semibold">Category</th>
                        <th className="pb-2 font-semibold">Latency</th>
                        <th className="pb-2 font-semibold">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {stats.recentMessages?.map((m) => (
                        <tr key={m._id} className="text-slate-300">
                          <td className="py-2.5 font-medium capitalize">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                              m.sender === 'ai' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-700 text-slate-300'
                            }`}>
                              {m.sender}
                            </span>
                          </td>
                          <td className="py-2.5 max-w-xs truncate text-slate-400 pr-4">
                            {m.content}
                          </td>
                          <td className="py-2.5 capitalize text-slate-400">{m.category || 'general'}</td>
                          <td className="py-2.5 text-slate-400">{m.responseTimeMs > 0 ? `${m.responseTimeMs}ms` : '—'}</td>
                          <td className="py-2.5">
                            {m.rating?.score === 1 && <span className="text-emerald-400 font-bold">👍 Positive</span>}
                            {m.rating?.score === -1 && <span className="text-rose-400 font-bold">👎 Negative</span>}
                            {(!m.rating || m.rating?.score === 0) && <span className="text-slate-600">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
