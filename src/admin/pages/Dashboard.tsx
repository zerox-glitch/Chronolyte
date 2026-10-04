import { useState, useEffect } from 'react';
import { 
  Users, 
  FolderKanban, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { 
  mockDashboardStats, 
  mockLeadsByMonth, 
  mockRevenueByMonth, 
  mockLeadSources,
  mockProjectTypes,
  mockProjects,
  mockActivityLog
} from '../mockData';
import type { Lead } from '../types';

const COLORS = ['#00f5ff', '#0080ff', '#00c4a7', '#7c3aed', '#f59e0b'];

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
              {change} from last month
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

function RecentLeads() {
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token') || '';
    const params = new URLSearchParams({ limit: '5', token });
    fetch(`/api/leads?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
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
  }, []);
  
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
    low: 'text-gray-400',
    medium: 'text-yellow-400',
    high: 'text-red-400',
    urgent: 'text-red-300'
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
        <div className="py-8 text-center text-white/50 text-sm">No leads yet</div>
      ) : (
      <div className="divide-y divide-white/5">
        {recentLeads.map((lead) => (
          <div key={lead.id} className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${priorityColors[lead.priority] || 'text-gray-400'}`} />
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

function ActiveProjects() {
  const activeProjects = mockProjects.filter(p => p.status !== 'completed').slice(0, 4);
  
  const statusColors: Record<string, string> = {
    planning: 'bg-gray-500',
    in_progress: 'bg-cyan-500',
    review: 'bg-purple-500',
    completed: 'bg-emerald-500',
    on_hold: 'bg-yellow-500'
  };

  return (
    <div className="bg-[#0d0d14] border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <h3 className="font-semibold text-white">Active Projects</h3>
        <a href="/admin/projects" className="text-sm text-cyan-400 hover:text-cyan-300">View All</a>
      </div>
      <div className="p-4 space-y-4">
        {activeProjects.map((project) => (
          <div key={project.id} className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-white">{project.name}</p>
                <p className="text-sm text-white/50">{project.client_name}</p>
              </div>
              <div className={`w-2 h-2 rounded-full ${statusColors[project.status]}`} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Progress</span>
                <span className="text-white">{project.progress}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Due {new Date(project.deadline).toLocaleDateString()}
                </span>
                <span>${project.budget.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityFeed() {
  return (
    <div className="bg-[#0d0d14] border border-white/5 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="font-semibold text-white">Recent Activity</h3>
      </div>
      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        {mockActivityLog.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">
                <span className="font-medium">{activity.user_name}</span>
                {' '}
                <span className="text-white/60">{activity.action}</span>
              </p>
              {activity.details && (
                <p className="text-xs text-white/40 mt-0.5">{activity.details}</p>
              )}
              <p className="text-xs text-white/30 mt-1">
                {new Date(activity.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-white/50 mt-1">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={mockDashboardStats.total_leads.toString()}
          change="+12.5%"
          changeType="up"
          icon={Users}
          color="bg-gradient-to-br from-cyan-500 to-blue-600"
        />
        <StatCard
          title="Active Projects"
          value={mockDashboardStats.active_projects.toString()}
          icon={FolderKanban}
          color="bg-gradient-to-br from-purple-500 to-pink-600"
        />
        <StatCard
          title="Revenue This Month"
          value={`$${(mockDashboardStats.revenue_this_month / 1000).toFixed(0)}K`}
          change="+23.1%"
          changeType="up"
          icon={DollarSign}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Conversion Rate"
          value={`${mockDashboardStats.conversion_rate}%`}
          change="+2.3%"
          changeType="up"
          icon={TrendingUp}
          color="bg-gradient-to-br from-orange-500 to-red-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-[#0d0d14] border border-white/5 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">Revenue Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRevenueByMonth}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f5ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickFormatter={(v) => `$${v/1000}K`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#15151f', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#00f5ff" 
                  strokeWidth={2}
                  fill="url(#revenueGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads Chart */}
        <div className="bg-[#0d0d14] border border-white/5 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">Leads by Month</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockLeadsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#15151f', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar 
                  dataKey="leads" 
                  fill="url(#barGradient)" 
                  radius={[4, 4, 0, 0]}
                >
                  {mockLeadsByMonth.map((_, index) => (
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
        {/* Lead Sources */}
        <div className="bg-[#0d0d14] border border-white/5 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">Lead Sources</h3>
          <div className="flex items-center">
            <div className="w-1/2 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockLeadSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {mockLeadSources.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#15151f', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2">
              {mockLeadSources.map((source, index) => (
                <div key={source.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-sm text-white/70">{source.name}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{source.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Types */}
        <div className="bg-[#0d0d14] border border-white/5 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">Project Types</h3>
          <div className="flex items-center">
            <div className="w-1/2 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockProjectTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {mockProjectTypes.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#15151f', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2">
              {mockProjectTypes.map((type, index) => (
                <div key={type.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-sm text-white/70">{type.name}</span>
                  </div>
                  <span className="text-sm font-medium text-white">{type.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
        <div className="lg:col-span-1">
          <RecentLeads />
        </div>
        <div className="lg:col-span-1">
          <ActiveProjects />
        </div>
      </div>
    </div>
  );
}
