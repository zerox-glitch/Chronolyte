import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  Phone, 
  Building2,
  Calendar,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import type { Lead } from '../types';

const API_BASE = '/api/leads';

function getToken() {
  return localStorage.getItem('admin_token') || '';
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

function apiUrl(params: Record<string, string | number> = {}) {
  const token = getToken();
  const p = new URLSearchParams();
  if (token) p.set('token', token);
  for (const [k, v] of Object.entries(params)) p.set(k, String(v));
  return `${API_BASE}?${p.toString()}`;
}

const statusOptions = ['all', 'new', 'contacted', 'interested', 'proposal_sent', 'negotiating', 'won', 'lost'] as const;
const priorityOptions = ['all', 'low', 'medium', 'high', 'urgent'] as const;
const sourceOptions = ['all', 'website', 'referral', 'ads', 'organic', 'social'] as const;

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  contacted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  interested: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  proposal_sent: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  negotiating: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  won: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  lost: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-500/20 text-gray-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-red-500/20 text-red-400',
  urgent: 'bg-red-600/30 text-red-300'
};

const statusLabels: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  proposal_sent: 'Proposal Sent',
  negotiating: 'Negotiating',
  won: 'Won',
  lost: 'Lost'
};

function LeadFormModal({ 
  lead, 
  onClose,
  onSave
}: { 
  lead: Lead | null; 
  onClose: () => void;
  onSave: (data: Partial<Lead>) => void;
}) {
  const [formData, setFormData] = useState(lead || {
    id: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    notes: '',
    service_interested: '',
    budget: '',
    status: 'new' as const,
    priority: 'medium' as const,
    source: 'website' as const,
    assigned_to: '',
    created_at: new Date().toISOString()
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      alert('Please fill in required fields');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#15151f] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#15151f] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {lead ? 'Edit Lead' : 'Add Lead'}
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Name & Email Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
                placeholder="Enter email"
              />
            </div>
          </div>

          {/* Phone & Company Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
                placeholder="Enter phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
                placeholder="Enter company"
              />
            </div>
          </div>

          {/* Service Interested & Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Service Interested</label>
              <input
                type="text"
                value={formData.service_interested || ''}
                onChange={(e) => setFormData({...formData, service_interested: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
                placeholder="e.g. Web Development"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Budget</label>
              <input
                type="text"
                value={formData.budget || ''}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
                placeholder="e.g. $5,000"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Notes</label>
            <textarea
              value={formData.notes || formData.message || ''}
              onChange={(e) => setFormData({...formData, notes: e.target.value, message: e.target.value})}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 resize-none"
              placeholder="Enter notes or message"
            />
          </div>

          {/* Status, Priority, Source */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="new" className="bg-[#15151f]">New</option>
                <option value="contacted" className="bg-[#15151f]">Contacted</option>
                <option value="interested" className="bg-[#15151f]">Interested</option>
                <option value="proposal_sent" className="bg-[#15151f]">Proposal Sent</option>
                <option value="negotiating" className="bg-[#15151f]">Negotiating</option>
                <option value="won" className="bg-[#15151f]">Won</option>
                <option value="lost" className="bg-[#15151f]">Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="low" className="bg-[#15151f]">Low</option>
                <option value="medium" className="bg-[#15151f]">Medium</option>
                <option value="high" className="bg-[#15151f]">High</option>
                <option value="urgent" className="bg-[#15151f]">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value as any})}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="website" className="bg-[#15151f]">Website</option>
                <option value="referral" className="bg-[#15151f]">Referral</option>
                <option value="ads" className="bg-[#15151f]">Ads</option>
                <option value="organic" className="bg-[#15151f]">Organic</option>
                <option value="social" className="bg-[#15151f]">Social</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl font-medium text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-black hover:opacity-90 transition-opacity"
            >
              {lead ? 'Update' : 'Add'} Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadModal({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  if (!lead) return null;

  const displayMessage = lead.notes || lead.message || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#15151f] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#15151f] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Lead Details</h2>
          {lead.reference_number && (
            <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-3 py-1">{lead.reference_number}</span>
          )}
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">{lead.name}</h3>
              {lead.company && (
                <p className="text-white/60 flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4" />
                  {lead.company}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors[lead.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                {statusLabels[lead.status] || lead.status}
              </span>
              {lead.priority && (
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${priorityColors[lead.priority] || 'bg-gray-500/20 text-gray-400'}`}>
                  {lead.priority}
                </span>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-white/50 mb-1">Email</p>
              <a href={`mailto:${lead.email}`} className="text-cyan-400 hover:underline flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {lead.email}
              </a>
            </div>
            {lead.phone && (
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-white/50 mb-1">Phone</p>
                <a href={`tel:${lead.phone}`} className="text-cyan-400 hover:underline flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {lead.phone}
                </a>
              </div>
            )}
          </div>

          {/* Service & Budget */}
          {(lead.service_interested || lead.budget) && (
            <div className="grid grid-cols-2 gap-4">
              {lead.service_interested && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-white/50 mb-1">Service Interested</p>
                  <p className="text-white">{lead.service_interested}</p>
                </div>
              )}
              {lead.budget && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-white/50 mb-1">Budget</p>
                  <p className="text-cyan-400 font-semibold">
                    {Number.isFinite(Number(lead.budget)) && lead.budget !== '' && !String(lead.budget).includes('$')
                      ? `$${Number(lead.budget).toLocaleString()}`
                      : lead.budget}
                  </p>
                </div>
              )}
            </div>
          )}

          {(lead.timeline || (lead.meta as Record<string, unknown> | null)?.contact_preference) && (
            <div className="grid grid-cols-2 gap-4">
              {lead.timeline && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-white/50 mb-1">Timeline</p>
                  <p className="text-white">{lead.timeline}</p>
                </div>
              )}
              {(lead.meta as Record<string, unknown> | null)?.contact_preference && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-white/50 mb-1">Preferred Contact</p>
                  <p className="text-white">{String((lead.meta as Record<string, unknown>).contact_preference)}</p>
                </div>
              )}
            </div>
          )}

          {/* Notes / Message */}
          {displayMessage && (
            <div>
              <p className="text-sm text-white/50 mb-2">Notes</p>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{displayMessage}</p>
              </div>
            </div>
          )}

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-white/50 mb-1">Source</p>
              <p className="text-white capitalize">{lead.source || 'N/A'}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-white/50 mb-1">Created</p>
              <p className="text-white flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(lead.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Leads() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditingLead, setIsEditingLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(apiUrl({ limit: '200' }), {
        headers: authHeaders()
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(errBody || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setLeads(json.data?.leads || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (lead.company?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesSource;
  });

  const handleSaveLead = async (data: Partial<Lead>) => {
    try {
      if (isEditingLead) {
        await fetch(apiUrl({ id: String(isEditingLead.id) }), {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(data)
        });
      } else {
        await fetch(apiUrl(), {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            company: data.company || '',
            notes: data.notes || data.message || '',
            service_interested: data.service_interested || '',
            budget: data.budget || '',
            status: data.status || 'new',
            priority: data.priority || 'medium',
            source: data.source || 'website'
          })
        });
      }
      setIsAddModalOpen(false);
      setIsEditingLead(null);
      fetchLeads();
    } catch {
      alert('Failed to save lead');
    }
  };

  const handleDeleteLead = async (id: string | number) => {
    try {
      await fetch(apiUrl({ id: String(id) }), {
        method: 'DELETE',
        headers: authHeaders()
      });
      fetchLeads();
    } catch {
      alert('Failed to delete lead');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Leads</h1>
          <p className="text-white/50 mt-1">{loading ? 'Loading...' : `${leads.length} total leads`}</p>
        </div>
        <div className="flex gap-3">
          <a
            href={`/api/leads/export?token=${encodeURIComponent(getToken())}`}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl font-medium text-white hover:bg-white/10 transition-colors"
          >
            Export CSV
          </a>
          <button
            onClick={fetchLeads}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl font-medium text-white hover:bg-white/10 transition-colors"
          >
            Refresh
          </button>
          <button 
            onClick={() => {
              setIsEditingLead(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-black hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
          <button onClick={fetchLeads} className="ml-auto text-sm underline">Retry</button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      )}

      {!loading && (
      <>
      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0d0d14] border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 border rounded-xl font-medium transition-colors ${
              showFilters ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-[#0d0d14] border-white/10 text-white/70 hover:text-white'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#0d0d14] border border-white/10 rounded-xl">
            <div>
              <label className="block text-sm text-white/50 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt} className="bg-[#15151f]">{opt === 'all' ? 'All Statuses' : (statusLabels[opt] || opt)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
              >
                {priorityOptions.map(opt => (
                  <option key={opt} value={opt} className="bg-[#15151f]">{opt === 'all' ? 'All Priorities' : opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-2">Source</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
              >
                {sourceOptions.map(opt => (
                  <option key={opt} value={opt} className="bg-[#15151f]">{opt === 'all' ? 'All Sources' : opt}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Leads Table */}
      <div className="bg-[#0d0d14] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-sm font-medium text-white/50">Lead</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/50">Service</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/50">Budget</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/50">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/50">Source</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/50">Created</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-white/50">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-white">{lead.name}</p>
                      <p className="text-sm text-white/50">{lead.company || lead.email}</p>
                      {lead.phone && <p className="text-xs text-white/40">{lead.phone}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-white/70">{lead.service_interested || '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-cyan-400 font-medium">{lead.budget || '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[lead.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                      {statusLabels[lead.status] || lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-white/70 capitalize">{lead.source}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-white/50">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedLead(lead)}
                        className="p-2 text-white/40 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setIsEditingLead(lead);
                          setIsAddModalOpen(true);
                        }}
                        className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('Delete this lead?')) {
                            handleDeleteLead(lead.id);
                          }
                        }}
                        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-white/50">No leads found matching your criteria.</p>
          </div>
        )}
      </div>
      </>
      )}

      {/* Lead Modal */}
      {selectedLead && (
        <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}

      {/* Lead Form Modal */}
      {isAddModalOpen && (
        <LeadFormModal 
          lead={isEditingLead}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditingLead(null);
          }}
          onSave={handleSaveLead}
        />
      )}
    </div>
  );
}
