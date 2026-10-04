import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, CheckCircle, Save } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  price?: number;
}

export function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Service>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);

  const iconOptions = ['Zap', 'Code', 'Rocket', 'Shield', 'Lightbulb', 'Layers', 'Target', 'Gauge'];

  const getToken = () => localStorage.getItem('admin_token') || '';
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const res = await fetch('/api/services');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setServices(json.data);
        return;
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    }
    // Fallback defaults if API empty/unreachable
    setServices([
      { id: '1', title: 'Custom Websites', description: 'Beautiful, fast, and conversion-optimized websites built with modern tech.', icon: 'Code', price: 2500 },
      { id: '2', title: 'SaaS Development', description: 'Complete SaaS platforms with authentication, payments, and analytics.', icon: 'Rocket', price: 5000 }
    ]);
  };

  const startAdd = () => {
    setFormData({ icon: 'Zap' });
    setEditingId('new');
    setShowForm(true);
  };

  const startEdit = (service: Service) => {
    setFormData(service);
    setEditingId(service.id);
    setShowForm(true);
  };

  const saveService = async () => {
    if (!formData.title || !formData.description) {
      setMessage({ type: 'error', text: 'Title and description are required' });
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        icon: formData.icon || 'Zap',
        price: formData.price || 0
      };
      if (editingId === 'new') {
        await fetch('/api/services', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(`/api/services/${editingId}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(payload)
        });
      }
      setMessage({ type: 'success', text: editingId === 'new' ? 'Service added!' : 'Service updated!' });
      setEditingId(null);
      setFormData({});
      setShowForm(false);
      loadServices();
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to save service' });
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    try {
      await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      setMessage({ type: 'success', text: 'Service deleted' });
      loadServices();
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete service' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Services Manager</h1>
          <p className="text-white/50 mt-1">Create and manage your service offerings</p>
        </div>
        <button
          onClick={startAdd}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-medium text-black hover:opacity-90 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30' 
            : 'bg-red-500/10 border border-red-500/30'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <p className={message.type === 'success' ? 'text-emerald-200' : 'text-red-200'}>
            {message.text}
          </p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">
              {editingId === 'new' ? 'Add Service' : 'Edit Service'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({});
              }}
              className="text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Title *</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                placeholder="e.g., Custom Website Design"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Description *</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                placeholder="Describe this service..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Icon</label>
                <select
                  value={formData.icon || 'Zap'}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                >
                  {iconOptions.map(icon => (
                    <option key={icon} value={icon} className="bg-[#15151f]">{icon}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Price (Optional)</label>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="e.g., 2500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={saveService}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-medium text-black hover:opacity-90 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Service
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({});
                }}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg font-medium text-white hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {services.map(service => (
          <div key={service.id} className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6 hover:border-cyan-400/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{service.title}</h3>
                <p className="text-sm text-white/60">{service.icon}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(service)}
                  className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteService(service.id)}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-white/60 text-sm mb-4">{service.description}</p>

            {service.price && (
              <div className="pt-4 border-t border-white/10">
                <p className="text-cyan-400 font-bold">${service.price.toLocaleString()}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {services.length === 0 && !showForm && (
        <div className="text-center py-12">
          <p className="text-white/60 mb-4">No services yet</p>
          <button
            onClick={startAdd}
            className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
          >
            Add your first service
          </button>
        </div>
      )}
    </div>
  );
}

export default ServicesManager;
