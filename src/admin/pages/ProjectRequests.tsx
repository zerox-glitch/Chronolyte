import { useState, useEffect, useCallback } from 'react';
import { 
  Search, Eye, Trash2, 
  User, Mail, Building, Phone, FileText,
  CreditCard, Copy, Settings, Link2, ExternalLink,
  RefreshCw, X, Loader2, Save
} from 'lucide-react';

// Auth helpers
function getToken() {
  return localStorage.getItem('admin_token') || '';
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

interface ProjectRequest {
  id: number;
  reference_number: string;
  full_name: string;
  email: string;
  company_name: string | null;
  phone: string | null;
  selected_package: string | null;
  budget: string;
  timeline: string;
  project_description: string;
  must_have_features: string | null;
  status: string;
  admin_notes: string | null;
  rejection_reason: string | null;
  quoted_amount: number | null;
  deposit_percentage: number;
  deposit_amount: number | null;
  payment_status: string;
  paddle_payment_link: string | null;
  created_at: string;
  updated_at: string;
  activity_log?: any[];
}

interface Stats {
  total: number;
  by_status: Record<string, number>;
  by_payment_status: Record<string, number>;
  this_month: number;
  total_revenue: number;
  pending_revenue: number;
}

const statusOptions = [
  { value: 'new', label: 'New', color: 'bg-blue-500' },
  { value: 'reviewing', label: 'Reviewing', color: 'bg-yellow-500' },
  { value: 'approved', label: 'Approved', color: 'bg-green-500' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500' },
  { value: 'pending_payment', label: 'Pending Payment', color: 'bg-purple-500' },
  { value: 'paid', label: 'Paid', color: 'bg-emerald-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-cyan-500' },
  { value: 'completed', label: 'Completed', color: 'bg-teal-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-500' }
];

const budgetLabels: Record<string, string> = {
  '1000-3000': '$1,000 - $3,000',
  '3000-5000': '$3,000 - $5,000',
  '5000-10000': '$5,000 - $10,000',
  '10000-20000': '$10,000 - $20,000',
  '20000-50000': '$20,000 - $50,000',
  '50000+': '$50,000+',
  'custom': 'Custom Quote'
};

const timelineLabels: Record<string, string> = {
  '2-4-weeks': '2-4 Weeks',
  '1-2-months': '1-2 Months',
  '3-months+': '3+ Months',
  'flexible': 'Flexible'
};

export default function ProjectRequests() {
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaddleConfig, setShowPaddleConfig] = useState(false);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updating, setUpdating] = useState(false);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      
      const res = await fetch(`/backend/api/project-requests.php?${params}`, {
        headers: authHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.success) {
        setRequests(data.data.requests || []);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  }, [filters]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/backend/api/project-requests.php?action=stats', {
        headers: authHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchRequests(), fetchStats()]);
      setLoading(false);
    };
    load();
  }, [fetchRequests, fetchStats]);

  // Show message
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Update request
  const updateRequest = async (id: number, data: Partial<ProjectRequest>) => {
    setUpdating(true);
    try {
      const res = await fetch(`/backend/api/project-requests.php?id=${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (result.success) {
        showMessage('success', 'Request updated successfully');
        fetchRequests();
        fetchStats();
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to update');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Delete request
  const deleteRequest = async (id: number) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    
    try {
      const res = await fetch(`/backend/api/project-requests.php?id=${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
        credentials: 'include'
      });
      const result = await res.json();
      
      if (result.success) {
        showMessage('success', 'Request deleted');
        fetchRequests();
        fetchStats();
        setShowDetailModal(false);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to delete');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showMessage('success', 'Copied to clipboard!');
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const opt = statusOptions.find(s => s.value === status) || { label: status, color: 'bg-gray-500' };
    return (
      <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${opt.color}`}>
        {opt.label}
      </span>
    );
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Requests</h1>
          <p className="text-gray-600">Manage project intake and payments</p>
        </div>
        <button
          onClick={() => setShowPaddleConfig(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <Settings className="w-4 h-4" />
          Paddle Settings
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Requests</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
            <div className="text-2xl font-bold text-blue-600">{stats.by_status?.new || 0}</div>
            <div className="text-sm text-gray-500">New</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
            <div className="text-2xl font-bold text-yellow-600">{stats.by_status?.reviewing || 0}</div>
            <div className="text-sm text-gray-500">Reviewing</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
            <div className="text-2xl font-bold text-green-600">{stats.by_status?.approved || 0}</div>
            <div className="text-sm text-gray-500">Approved</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
            <div className="text-2xl font-bold text-emerald-600">${stats.total_revenue?.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Revenue</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
            <div className="text-2xl font-bold text-purple-600">${stats.pending_revenue?.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            placeholder="Search by name, email, or reference..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          onClick={() => { fetchRequests(); fetchStats(); }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reference</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Package</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Budget</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    No project requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-blue-600">{request.reference_number}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{request.full_name}</div>
                      <div className="text-sm text-gray-500">{request.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{request.selected_package || 'Custom'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{budgetLabels[request.budget] || request.budget}</span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${
                        request.payment_status === 'fully_paid' ? 'text-emerald-600 font-medium' :
                        request.payment_status === 'deposit_paid' ? 'text-blue-600' :
                        request.payment_status === 'refunded' ? 'text-red-600' :
                        'text-gray-500'
                      }`}>
                        {request.payment_status === 'fully_paid' ? 'Fully Paid' :
                         request.payment_status === 'deposit_paid' ? 'Deposit Paid' :
                         request.payment_status === 'refunded' ? 'Refunded' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailModal(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(request.status === 'approved' || request.status === 'pending_payment') && (
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowPaymentModal(true);
                            }}
                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                            title="Generate Payment Link"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                        {request.paddle_payment_link && (
                          <button
                            onClick={() => copyToClipboard(request.paddle_payment_link!)}
                            className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                            title="Copy Payment Link"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteRequest(request.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <DetailModal
          request={selectedRequest}
          onClose={() => { setShowDetailModal(false); setSelectedRequest(null); }}
          onUpdate={updateRequest}
          onDelete={deleteRequest}
          updating={updating}
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedRequest && (
        <PaymentModal
          request={selectedRequest}
          onClose={() => { setShowPaymentModal(false); setSelectedRequest(null); }}
          onSuccess={() => { fetchRequests(); fetchStats(); }}
          showMessage={showMessage}
        />
      )}

      {/* Paddle Config Modal */}
      {showPaddleConfig && (
        <PaddleConfigModal
          onClose={() => setShowPaddleConfig(false)}
          showMessage={showMessage}
        />
      )}
    </div>
  );
}

// Detail Modal Component
function DetailModal({ request, onClose, onUpdate, onDelete, updating, getStatusBadge, formatDate }: {
  request: ProjectRequest;
  onClose: () => void;
  onUpdate: (id: number, data: any) => Promise<boolean>;
  onDelete: (id: number) => void;
  updating: boolean;
  getStatusBadge: (status: string) => JSX.Element;
  formatDate: (date: string) => string;
}) {
  const [editData, setEditData] = useState({
    status: request.status,
    admin_notes: request.admin_notes || '',
    quoted_amount: request.quoted_amount || '',
    deposit_percentage: request.deposit_percentage || 50
  });

  const handleSave = async () => {
    const success = await onUpdate(request.id, editData);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{request.reference_number}</h2>
            <p className="text-sm text-gray-500">Submitted {formatDate(request.created_at)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Client Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4" /> Client Information
              </h3>
              <div className="space-y-2 text-sm text-gray-900">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{request.full_name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${request.email}`} className="text-blue-600 hover:underline">{request.email}</a>
                </div>
                {request.company_name && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{request.company_name}</span>
                  </div>
                )}
                {request.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{request.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Project Details
              </h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">Package:</span> <span className="font-medium text-gray-900">{request.selected_package || 'Custom'}</span></div>
                <div><span className="text-gray-500">Budget:</span> <span className="font-medium text-gray-900">{budgetLabels[request.budget] || request.budget || 'Not specified'}</span></div>
                <div><span className="text-gray-500">Timeline:</span> <span className="font-medium text-gray-900">{timelineLabels[request.timeline] || request.timeline || 'Not specified'}</span></div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Project Description</h3>
            <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{request.project_description || 'No description provided'}</p>
          </div>

          {request.must_have_features && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Must-Have Features</h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{request.must_have_features}</p>
            </div>
          )}

          {/* Edit Section */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Update Request</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData(d => ({ ...d, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value} className="text-gray-900">{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quoted Amount ($)</label>
                <input
                  type="number"
                  value={editData.quoted_amount}
                  onChange={(e) => setEditData(d => ({ ...d, quoted_amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
              <textarea
                value={editData.admin_notes}
                onChange={(e) => setEditData(d => ({ ...d, admin_notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                placeholder="Internal notes..."
              />
            </div>
          </div>

          {/* Payment Link */}
          {request.paddle_payment_link && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Link2 className="w-4 h-4" /> Payment Link
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={request.paddle_payment_link}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(request.paddle_payment_link!)}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={request.paddle_payment_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button
            onClick={() => onDelete(request.id)}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            Delete Request
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Payment Modal Component
function PaymentModal({ request, onClose, onSuccess, showMessage }: {
  request: ProjectRequest;
  onClose: () => void;
  onSuccess: () => void;
  showMessage: (type: 'success' | 'error', text: string) => void;
}) {
  const [amount, setAmount] = useState(request.quoted_amount?.toString() || '');
  const [depositPercent, setDepositPercent] = useState(request.deposit_percentage || 50);
  const [description, setDescription] = useState(`Project Deposit - ${request.reference_number}`);
  const [generating, setGenerating] = useState(false);
  const [paymentLink, setPaymentLink] = useState(request.paddle_payment_link || '');

  const depositAmount = amount ? (parseFloat(amount) * (depositPercent / 100)).toFixed(2) : '0.00';

  const generateLink = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showMessage('error', 'Please enter a valid amount');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch(`/backend/api/paddle.php?action=generate-link&id=${request.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: parseFloat(amount),
          deposit_percentage: depositPercent,
          description
        })
      });
      const data = await res.json();

      if (data.success) {
        setPaymentLink(data.data.payment_link);
        showMessage('success', 'Payment link generated!');
        onSuccess();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to generate link');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Generate Payment Link</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Client: <strong>{request.full_name}</strong></p>
            <p className="text-sm text-gray-600">Reference: <strong>{request.reference_number}</strong></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Project Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Percentage</label>
            <select
              value={depositPercent}
              onChange={(e) => setDepositPercent(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={25}>25%</option>
              <option value={50}>50%</option>
              <option value={75}>75%</option>
              <option value={100}>100% (Full Payment)</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              Deposit Amount: <strong>${depositAmount}</strong>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {paymentLink && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-800 mb-2">Payment Link Generated!</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={paymentLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-green-200 rounded-lg text-sm"
                />
                <button
                  onClick={() => { navigator.clipboard.writeText(paymentLink); showMessage('success', 'Copied!'); }}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
          <button
            onClick={generateLink}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            Generate Payment Link
          </button>
        </div>
      </div>
    </div>
  );
}

// Paddle Config Modal
function PaddleConfigModal({ onClose, showMessage }: {
  onClose: () => void;
  showMessage: (type: 'success' | 'error', text: string) => void;
}) {
  const [config, setConfig] = useState({
    vendor_id: '',
    api_key: '',
    webhook_secret: '',
    environment: 'sandbox',
    is_active: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/backend/api/paddle.php?action=config', { credentials: 'include' });
        const data = await res.json();
        if (data.success && data.data) {
          setConfig({
            vendor_id: data.data.vendor_id || '',
            api_key: data.data.api_key || '',
            webhook_secret: data.data.webhook_secret || '',
            environment: data.data.environment || 'sandbox',
            is_active: !!data.data.is_active
          });
        }
      } catch (error) {
        console.error('Failed to load Paddle config');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch('/backend/api/paddle.php?action=config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        showMessage('success', 'Paddle configuration saved!');
        onClose();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Paddle Configuration</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              Configure your Paddle credentials to enable payment processing. 
              Get your credentials from <a href="https://vendors.paddle.com" target="_blank" rel="noopener noreferrer" className="underline">Paddle Dashboard</a>.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor ID</label>
            <input
              type="text"
              value={config.vendor_id}
              onChange={(e) => setConfig(c => ({ ...c, vendor_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Your Paddle Vendor ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={config.api_key}
              onChange={(e) => setConfig(c => ({ ...c, api_key: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Your Paddle API Key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret (Optional)</label>
            <input
              type="password"
              value={config.webhook_secret}
              onChange={(e) => setConfig(c => ({ ...c, webhook_secret: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="For verifying webhook signatures"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
            <select
              value={config.environment}
              onChange={(e) => setConfig(c => ({ ...c, environment: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="sandbox">Sandbox (Testing)</option>
              <option value="live">Live (Production)</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="paddle_active"
              checked={config.is_active}
              onChange={(e) => setConfig(c => ({ ...c, is_active: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="paddle_active" className="text-sm font-medium text-gray-700">
              Enable Paddle Integration
            </label>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Webhook URL</p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 break-all">
              {window.location.origin}/backend/api/paddle.php?action=webhook
            </code>
            <p className="text-xs text-gray-500 mt-2">
              Add this URL to your Paddle webhook settings to receive payment notifications.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={saveConfig}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
