import { useState, useEffect, useCallback } from 'react';
import {
  Users, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight,
  AlertCircle, Loader2, RefreshCw, FileText
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const COLORS = ['#00f5ff', '#0080ff', '#00c4a7', '#7c3aed', '#f59e0b', '#ec4899'];

interface DashboardStats {
  total_leads: number;
  new_leads: number;
  new_leads_this_week: number;
  won_leads: number;
  conversion_rate: number;
  active_projects: number;
  total_projects: number;
  project_requests: number;
  pending_requests: number;
  revenue_this_month: number;
  total_revenue: number;
  leads_by_status: Record<string, number>;
  leads_by_month: { name: string; leads: number }[];
  revenue_by_month: { name: string; revenue: number }[];
  lead_sources: { name: string; value: number }[];
  project_types: { name: string; value: number }[];
  recent_activity: { id: string; user_name: string; action: string; details?: string; created_at: string }[];
}

function getToken() {
  return localStorage.getItem('admin_token') || '';
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

function StatCard({ title, value, change, changeType, icon: Icon, color }: {
  title: string;
  value: string;
  change?: string;
  changeType?: 'up' | 'down';
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-[#0d0d14] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/50 mb-1">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-white">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${changeType === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
              {changeType === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {change}
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function RecentLeads({ refreshKey }: { refreshKey: number }) {
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    fetch(`/api/leads?limit=6&token=${encodeURIComponent(token)}`, { headers: authHeaders() })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => setRecentLeads(json.data?.leads || []))
      .catch(err => {
        console.error('Failed to fetch recent leads:', err);
        setRecentLeads([]);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/20 text-blue-400',
    contacted: 'bg-yellow-500/20 text-yellow-400',
    interested: 'bg-emerald-500/20 text-emerald-400',
    proposal_sent: 'bg-purple-500/20 text-purple-400',
    negotiating: 'bg-orange-500/20 text-orange-400',
    won: 'bg-cyan-500/20 text-cyan-400',
    lost: 'bg-red-500/20 text-red-400'
  };

  const statusLabels: Record<string, string> = {
    new: 'New', contacted: 'Contacted', interested: 'Interested',
    proposal_sent: 'Proposal Sent', negotiating: 'Negotiating', won: 'Won', lost: 'Lost'
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-400',
    medium: 'bg-yellow-400',
    high: 'bg-red-400',
    urgent: 'bg-red-300'
  };

  return (
    <div className="bg-[#0d0d14] border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <h3 className="font-semibold text-white">Recent Leads</h3>
        <a href="/admin/leads" className="text-sm text-cyan-400 hover:text-cyan-300">View All</a>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
        </div>
      ) : recentLeads.length === 0 ? (
        <div className="py-8 text-center text-white/50 text-sm">No leads yet — they'll appear here the moment someone submits the project form.</div>
      ) : (
        <div className="divide-y divide-white/5">
          {recentLeads.map((lead) => (
            <div key={lead.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${priorityColors[lead.priority] || 'bg-gray-400'}`} />
                  <div>
                    <p className="font-medium text-white">{lead.name}</p>
                    <p className="text-sm text-white/50">{lead.company || lead.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[lead.status] || 'bg-gray-500/20 text-gray-400'}`}>
                    {statusLabels[lead.status] || lead.status}
                  </span>
                  <span className="text-xs text-white/40">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PipelinePanel({ stats }: { stats: DashboardStats | null }) {
  const statusLabels: Record<string, string> = {
    new: 'New', contacted: 'Contacted', interested: 'Interested',
    proposal_sent: 'Proposal Sent', negotiating: 'Negotiating', won: 'Won', lost: 'Lost'
  };
  const entries = Object.entries(stats?.leads_by_status || {})
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...entries.map((e) => e.count));

  return (
    <div className="bg-[#0d0d14] border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <h3 className="font-semibold text-white">Lead Pipeline</h3>
        <a href="/admin/project-requests" className="text-sm text-cyan-400 hover:text-cyan-300">Project Requests</a>
      </div>
      <div className="p-6 space-y-4">
        {entries.length === 0 && (
          <p className="text-sm text-white/40 text-center py-4">No leads yet.</p>
        )}
        {entries.map(({ status, count }) => (
          <div key={status}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-white/60">{statusLabels[status] || status}</span>
              <span className="text-white font-medium">{count}</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityFeed({ refreshKey }: { refreshKey: number }) {
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats/dashboard', { headers: authHeaders() })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then(json => setActivity(json.data?.recent_activity || []))
      .catch(() => setActivity([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <div className="bg-[#0d0d14] border border-white/5 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="font-semibold text-white">Recent Activity</h3>
      </div>
      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          </div>
        ) : activity.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-4">Activity will show up here.</p>
        ) : (
          activity.map((a) => (
            <div key={a.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">
                  <span className="font-medium">{a.user_name}</span>{' '}
                  <span className="text-white/60">{a.action}</span>
                </p>
                {a.details && <p className="text-xs text-white/40 mt-0.5">{a.details}</p>}
                <p className="text-xs text-white/30 mt-1">{new Date(a.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: '#15151f',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#fff'
};

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/stats/dashboard', { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setStats(json.data || null);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    fetchStats();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/50 mt-1">Welcome back! Here's your live business overview.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl font-medium text-white hover:bg-white/10 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
          <button onClick={fetchStats} className="ml-auto text-sm underline">Retry</button>
        </div>
      )}

      {loading && !stats ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : stats && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Leads"
              value={stats.total_leads.toString()}
              change={`${stats.new_leads_this_week} this week`}
              changeType="up"
              icon={Users}
              color="bg-gradient-to-br from-cyan-500 to-blue-600"
            />
            <StatCard
              title="Project Requests"
              value={stats.project_requests.toString()}
              change={`${stats.pending_requests} pending review`}
              changeType={stats.pending_requests > 0 ? 'up' : undefined}
              icon={FileText}
              color="bg-gradient-to-br from-purple-500 to-pink-600"
            />
            <StatCard
              title="Revenue This Month"
              value={`$${Number(stats.revenue_this_month || 0).toLocaleString()}`}
              change={`$${Number(stats.total_revenue || 0).toLocaleString()} all-time`}
              changeType="up"
              icon={DollarSign}
              color="bg-gradient-to-br from-emerald-500 to-teal-600"
            />
            <StatCard
              title="Conversion Rate"
              value={`${stats.conversion_rate}%`}
              change={`${stats.won_leads} won deals`}
              changeType="up"
              icon={TrendingUp}
              color="bg-gradient-to-br from-orange-500 to-red-600"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0d0d14] border border-white/5 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">Leads — Last 6 Months</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.leads_by_month}>
                    <defs>
                      <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00f5ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="leads" stroke="#00f5ff" strokeWidth={2} fill="url(#leadsGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#0d0d14] border border-white/5 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">Lead Sources</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.leads_by_month}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="leads" radius={[4, 4, 0, 0]}>
                      {stats.leads_by_month.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`rgba(0, 245, 255, ${0.4 + index * 0.1})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Pie Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0d0d14] border border-white/5 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">Traffic Sources</h3>
              {stats.lead_sources.length === 0 ? (
                <p className="text-sm text-white/40 text-center py-10">Source breakdown appears once leads arrive.</p>
              ) : (
                <div className="flex items-center">
                  <div className="w-1/2 h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.lead_sources} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                          {stats.lead_sources.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 space-y-2">
                    {stats.lead_sources.map((source, index) => (
                      <div key={source.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-sm text-white/70 capitalize">{source.name}</span>
                        </div>
                        <span className="text-sm font-medium text-white">{source.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#0d0d14] border border-white/5 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">Most Requested Services</h3>
              {stats.project_types.length === 0 ? (
                <p className="text-sm text-white/40 text-center py-10">Service demand appears once leads arrive.</p>
              ) : (
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.project_types} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={12} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} width={130} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" fill="#00c4a7" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ActivityFeed refreshKey={refreshKey} />
            </div>
            <div className="lg:col-span-1">
              <RecentLeads refreshKey={refreshKey} />
            </div>
            <div className="lg:col-span-1">
              <PipelinePanel stats={stats} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
