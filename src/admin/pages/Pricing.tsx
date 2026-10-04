import { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  Loader2,
  Check
} from 'lucide-react';

interface PricingPlan {
  id: number;
  name: string;
  category: 'websites' | 'ai-tools' | 'saas' | 'automation';
  price: number | null;
  price_display: string;
  description: string;
  timeline: string;
  is_popular: boolean;
  features: string[];
  display_order: number;
  is_active: boolean;
}

const CATEGORIES = [
  { value: 'websites', label: 'Websites' },
  { value: 'ai-tools', label: 'AI Tools' },
  { value: 'saas', label: 'SaaS Development' },
  { value: 'automation', label: 'AI Automation' }
];

function getToken() {
  return localStorage.getItem('admin_token') || '';
}

function getAuthHeaders() {
  return {
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
  };
}

interface PlanFormProps {
  plan?: PricingPlan;
  onSave: (plan: Partial<PricingPlan>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function PlanForm({ plan, onSave, onCancel, isSaving }: PlanFormProps) {
  const [formData, setFormData] = useState<Partial<PricingPlan>>(() => {
    if (plan) {
      return {
        ...plan,
        is_popular: Boolean(plan.is_popular) // Convert 0/1 to boolean
      };
    }
    return {
      name: '',
      category: 'websites',
      price: undefined,
      price_display: '',
      description: '',
      timeline: '',
      features: [],
      display_order: 0,
      is_popular: false
    };
  });
  const [featureInput, setFeatureInput] = useState('');

  // Reset form when plan changes (switching between edit targets)
  useEffect(() => {
    if (plan) {
      setFormData({
        ...plan,
        is_popular: Boolean(plan.is_popular)
      });
    } else {
      setFormData({
        name: '',
        category: 'websites',
        price: undefined,
        price_display: '',
        description: '',
        timeline: '',
        features: [],
        display_order: 0,
        is_popular: false
      });
    }
  }, [plan]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure is_popular is always explicitly included as a boolean
    onSave({
      ...formData,
      is_popular: Boolean(formData.is_popular)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-dark-900 border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold">{plan ? 'Edit Plan' : 'Create New Plan'}</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Plan Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value} className="bg-dark-900">
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Price (Numeric)</label>
          <input
            type="number"
            name="price"
            value={formData.price || ''}
            onChange={handleChange}
            placeholder="e.g., 600"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Price Display *</label>
          <input
            type="text"
            name="price_display"
            value={formData.price_display}
            onChange={handleChange}
            required
            placeholder="e.g., $600 or From $2,500"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={2}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors resize-none"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Timeline *</label>
          <input
            type="text"
            name="timeline"
            value={formData.timeline}
            onChange={handleChange}
            required
            placeholder="e.g., 2-3 weeks"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Display Order</label>
          <input
            type="number"
            name="display_order"
            value={formData.display_order}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, is_popular: !prev.is_popular }))}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
            formData.is_popular ? 'bg-cyan-500' : 'bg-white/20'
          }`}
        >
          <span
            className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
              formData.is_popular ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
        <label className="text-sm text-white/70 cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, is_popular: !prev.is_popular }))}>
          Mark as "Most Popular"
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-3">Features</label>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            placeholder="Add a feature..."
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
          />
          <button
            type="button"
            onClick={addFeature}
            className="px-4 py-2 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors"
          >
            Add
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {(formData.features || []).map((feature, index) => (
            <div key={index} className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
              <span className="text-sm text-white/70">{feature}</span>
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 px-4 py-2 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Plan
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function PricingManagement() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/backend/api/pricing.php?action=list', {
        headers: getAuthHeaders()
      });
      const json = await res.json();
      if (json.success) {
        setPlans(json.data);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load plans' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleSave = async (formData: Partial<PricingPlan>) => {
    setIsSaving(true);
    try {
      const endpoint = editingPlan
        ? `/backend/api/pricing.php?action=update&id=${editingPlan.id}`
        : '/backend/api/pricing.php?action=create';

      const method = editingPlan ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: editingPlan ? 'Plan updated!' : 'Plan created!' });
        setShowForm(false);
        setEditingPlan(null);
        loadPlans();
      } else {
        setMessage({ type: 'error', text: json.message || 'Failed to save plan' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error saving plan' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;

    try {
      const res = await fetch(`/backend/api/pricing.php?action=delete&id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: 'Plan deleted!' });
        loadPlans();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete plan' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error deleting plan' });
    }
  };

  const groupedPlans = plans.reduce((acc, plan) => {
    if (!acc[plan.category]) acc[plan.category] = [];
    acc[plan.category].push(plan);
    return acc;
  }, {} as Record<string, PricingPlan[]>);

  const filteredCategory = selectedCategory ? groupedPlans[selectedCategory] || [] : Object.values(groupedPlans).flat();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <DollarSign className="text-cyan-400" />
            Pricing Plans
          </h2>
          <p className="text-white/60 mt-1">Manage your pricing tiers and plans</p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null);
            setShowForm(!showForm);
          }}
          className="px-6 py-2 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Plan
        </button>
      </div>

      {message.type && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-200'
            : 'bg-red-500/20 border border-red-500/50 text-red-200'
        }`}>
          {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      {showForm && (
        <PlanForm
          plan={editingPlan || undefined}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingPlan(null);
          }}
          isSaving={isSaving}
        />
      )}

      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              selectedCategory === null
                ? 'bg-cyan-500 text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                selectedCategory === cat.value
                  ? 'bg-cyan-500 text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/60">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            Loading plans...
          </div>
        ) : filteredCategory.length === 0 ? (
          <div className="text-center py-12 text-white/60">No plans found</div>
        ) : (
          <div className="space-y-4">
            {filteredCategory.map(plan => (
              <div
                key={plan.id}
                className="bg-dark-900 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                      {plan.is_popular && (
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-full">
                          Most Popular
                        </span>
                      )}
                      {!plan.is_active && (
                        <span className="px-3 py-1 bg-red-500/20 text-red-300 text-xs font-semibold rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-sm mb-3">{plan.description}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-cyan-400 font-semibold text-lg">{plan.price_display}</span>
                      <span className="text-white/50">
                        Category: <span className="text-white capitalize">{plan.category.replace('-', ' ')}</span>
                      </span>
                      <span className="text-white/50">
                        Timeline: <span className="text-white">{plan.timeline}</span>
                      </span>
                    </div>
                    {plan.features && plan.features.length > 0 && (
                      <div className="mt-3 text-xs text-white/60">
                        {plan.features.length} features
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingPlan(plan);
                        setShowForm(true);
                      }}
                      className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
