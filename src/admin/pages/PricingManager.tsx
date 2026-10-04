import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, CheckCircle, Save } from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export function PricingManager() {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PricingTier>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    loadTiers();
  }, []);

  const getToken = () => localStorage.getItem('admin_token') || '';
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  });

  const loadTiers = async () => {
    try {
      const res = await fetch('/api/pricing');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTiers(json.data.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          price: Number(p.price) || 0,
          period: p.period || 'one-time',
          description: p.description || '',
          features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : (p.features || []),
          highlighted: !!Number(p.highlighted)
        })));
        return;
      }
    } catch (err) {
      console.error('Failed to load pricing:', err);
    }
    setTiers([
      { id: '1', name: 'Starter', price: 999, period: 'month', description: 'Perfect for small projects', features: ['5 Projects', '10GB Storage', 'Basic Support'], highlighted: false },
      { id: '2', name: 'Professional', price: 2999, period: 'month', description: 'For growing businesses', features: ['Unlimited Projects', '100GB Storage', 'Priority Support', 'Analytics'], highlighted: true },
      { id: '3', name: 'Enterprise', price: 9999, period: 'month', description: 'Custom solutions', features: ['Everything in Pro', 'Dedicated Manager', '24/7 Support', 'Custom Integrations'], highlighted: false }
    ]);
  };

  const startAdd = () => {
    setFormData({ features: [], period: 'month', highlighted: false });
    setEditingId('new');
    setShowForm(true);
  };

  const startEdit = (tier: PricingTier) => {
    setFormData(tier);
    setEditingId(tier.id);
    setShowForm(true);
  };

  const addFeature = () => {
    if (!featureInput) return;
    const features = [...(formData.features || []), featureInput];
    setFormData({ ...formData, features });
    setFeatureInput('');
  };

  const removeFeature = (index: number) => {
    const features = (formData.features || []).filter((_, i) => i !== index);
    setFormData({ ...formData, features });
  };

  const saveTier = async () => {
    if (!formData.name || !formData.price) {
      setMessage({ type: 'error', text: 'Name and price are required' });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        price: Number(formData.price) || 0,
        period: formData.period || 'month',
        description: formData.description || '',
        features: formData.features || [],
        highlighted: formData.highlighted ? 1 : 0,
        category: 'websites',
        active: 1
      };
      if (editingId === 'new') {
        await fetch('/api/pricing', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(`/api/pricing/${editingId}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(payload)
        });
      }
      setMessage({ type: 'success', text: editingId === 'new' ? 'Pricing tier added!' : 'Tier updated!' });
      setEditingId(null);
      setFormData({});
      setShowForm(false);
      loadTiers();
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to save pricing tier' });
    }
  };

  const deleteTier = async (id: string) => {
    if (!confirm('Delete this pricing tier?')) return;
    try {
      await fetch(`/api/pricing/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      setMessage({ type: 'success', text: 'Tier deleted' });
      loadTiers();
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete tier' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Pricing Manager</h1>
          <p className="text-white/50 mt-1">Create and manage pricing tiers</p>
        </div>
        <button
          onClick={startAdd}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-medium text-black hover:opacity-90 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Tier
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
              {editingId === 'new' ? 'Add Pricing Tier' : 'Edit Tier'}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="e.g., Starter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Price *</label>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="2999"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Description</label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                placeholder="e.g., Perfect for small projects"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Billing Period</label>
                <select
                  value={formData.period || 'month'}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="month" className="bg-[#15151f]">Per Month</option>
                  <option value="year" className="bg-[#15151f]">Per Year</option>
                  <option value="one-time" className="bg-[#15151f]">One-Time</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.highlighted || false}
                    onChange={(e) => setFormData({ ...formData, highlighted: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-white text-sm">Highlight this tier</span>
                </label>
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Features</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="Add a feature and press Enter"
                />
                <button
                  onClick={addFeature}
                  className="px-4 py-3 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="space-y-2">
                {(formData.features || []).map((feature, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                    <span className="text-white text-sm">{feature}</span>
                    <button
                      onClick={() => removeFeature(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={saveTier}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-medium text-black hover:opacity-90 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Tier
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

      {/* Pricing Tiers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map(tier => (
          <div
            key={tier.id}
            className={`rounded-2xl p-6 transition-all ${
              tier.highlighted
                ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50'
                : 'bg-[#0d0d14] border border-white/10'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                <p className="text-white/60 text-sm">{tier.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(tier)}
                  className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteTier(tier.id)}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-6 pb-6 border-b border-white/10">
              <p className="text-3xl font-bold text-cyan-400">
                ${tier.price.toLocaleString()}
                <span className="text-lg text-white/60 font-normal">/{tier.period}</span>
              </p>
            </div>

            <div className="space-y-2">
              {tier.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-white/80 text-sm">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {tiers.length === 0 && !showForm && (
        <div className="text-center py-12">
          <p className="text-white/60 mb-4">No pricing tiers yet</p>
          <button
            onClick={startAdd}
            className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
          >
            Create your first tier
          </button>
        </div>
      )}
    </div>
  );
}

export default PricingManager;
