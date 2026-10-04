import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, GripVertical, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

function getToken() {
  return localStorage.getItem('admin_token') || '';
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

interface BudgetOption {
  value: string;
  label: string;
  order: number;
}

interface TimelineOption {
  value: string;
  label: string;
  order: number;
}

interface FormConfig {
  budgetOptions: BudgetOption[];
  timelineOptions: TimelineOption[];
  requiredFields: string[];
  formTitle: string;
  formSubtitle: string;
  successMessage: string;
  termsText: string;
}

const defaultConfig: FormConfig = {
  budgetOptions: [
    { value: '1000-3000', label: '$1,000 - $3,000', order: 1 },
    { value: '3000-5000', label: '$3,000 - $5,000', order: 2 },
    { value: '5000-10000', label: '$5,000 - $10,000', order: 3 },
    { value: '10000-20000', label: '$10,000 - $20,000', order: 4 },
    { value: '20000-50000', label: '$20,000 - $50,000', order: 5 },
    { value: '50000+', label: '$50,000+', order: 6 },
    { value: 'custom', label: 'Custom Quote', order: 7 }
  ],
  timelineOptions: [
    { value: '2-4-weeks', label: '2-4 Weeks', order: 1 },
    { value: '1-2-months', label: '1-2 Months', order: 2 },
    { value: '3-months+', label: '3+ Months', order: 3 },
    { value: 'flexible', label: 'Flexible', order: 4 }
  ],
  requiredFields: ['full_name', 'email', 'budget', 'timeline', 'project_description'],
  formTitle: 'Start Your Project',
  formSubtitle: 'Tell us about your vision and we\'ll bring it to life',
  successMessage: 'Thank you! We\'ll be in touch within 24 hours.',
  termsText: 'I agree to the Terms of Service and Privacy Policy'
};

export default function FormSettings() {
  const [config, setConfig] = useState<FormConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'budget' | 'timeline' | 'fields' | 'text'>('budget');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await fetch('/backend/api/form-settings.php?action=get', {
        headers: authHeaders()
      });
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Failed to load form config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch('/backend/api/form-settings.php?action=save', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const addBudgetOption = () => {
    setConfig(prev => ({
      ...prev,
      budgetOptions: [
        ...prev.budgetOptions,
        { value: `option-${Date.now()}`, label: 'New Option', order: prev.budgetOptions.length + 1 }
      ]
    }));
  };

  const updateBudgetOption = (index: number, field: keyof BudgetOption, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      budgetOptions: prev.budgetOptions.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const removeBudgetOption = (index: number) => {
    setConfig(prev => ({
      ...prev,
      budgetOptions: prev.budgetOptions.filter((_, i) => i !== index)
    }));
  };

  const addTimelineOption = () => {
    setConfig(prev => ({
      ...prev,
      timelineOptions: [
        ...prev.timelineOptions,
        { value: `timeline-${Date.now()}`, label: 'New Timeline', order: prev.timelineOptions.length + 1 }
      ]
    }));
  };

  const updateTimelineOption = (index: number, field: keyof TimelineOption, value: string | number) => {
    setConfig(prev => ({
      ...prev,
      timelineOptions: prev.timelineOptions.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const removeTimelineOption = (index: number) => {
    setConfig(prev => ({
      ...prev,
      timelineOptions: prev.timelineOptions.filter((_, i) => i !== index)
    }));
  };

  const toggleRequiredField = (field: string) => {
    setConfig(prev => ({
      ...prev,
      requiredFields: prev.requiredFields.includes(field)
        ? prev.requiredFields.filter(f => f !== field)
        : [...prev.requiredFields, field]
    }));
  };

  const availableFields = [
    { key: 'full_name', label: 'Full Name', required: true },
    { key: 'email', label: 'Email Address', required: true },
    { key: 'phone', label: 'Phone Number', required: false },
    { key: 'company_name', label: 'Company Name', required: false },
    { key: 'budget', label: 'Budget Range', required: true },
    { key: 'timeline', label: 'Timeline', required: true },
    { key: 'project_description', label: 'Project Description', required: true },
    { key: 'must_have_features', label: 'Must-Have Features', required: false },
    { key: 'selected_package', label: 'Selected Package', required: false }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Request Form Settings</h1>
          <p className="text-white/60">Customize the project intake form options and fields</p>
        </div>
        <button
          onClick={saveConfig}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 disabled:opacity-50 font-semibold"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {[
          { key: 'budget', label: 'Budget Options' },
          { key: 'timeline', label: 'Timeline Options' },
          { key: 'fields', label: 'Form Fields' },
          { key: 'text', label: 'Form Text' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Budget Options */}
      {activeTab === 'budget' && (
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Budget Range Options</h2>
            <button
              onClick={addBudgetOption}
              className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
            >
              <Plus className="w-4 h-4" /> Add Option
            </button>
          </div>

          <div className="space-y-3">
            {config.budgetOptions.map((opt, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-dark-800 rounded-lg border border-white/10">
                <GripVertical className="w-5 h-5 text-white/30 cursor-grab" />
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Value (Internal)</label>
                    <input
                      type="text"
                      value={opt.value}
                      onChange={(e) => updateBudgetOption(index, 'value', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Display Label</label>
                    <input
                      type="text"
                      value={opt.label}
                      onChange={(e) => updateBudgetOption(index, 'label', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeBudgetOption(index)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Options */}
      {activeTab === 'timeline' && (
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Timeline Options</h2>
            <button
              onClick={addTimelineOption}
              className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
            >
              <Plus className="w-4 h-4" /> Add Option
            </button>
          </div>

          <div className="space-y-3">
            {config.timelineOptions.map((opt, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-dark-800 rounded-lg border border-white/10">
                <GripVertical className="w-5 h-5 text-white/30 cursor-grab" />
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Value (Internal)</label>
                    <input
                      type="text"
                      value={opt.value}
                      onChange={(e) => updateTimelineOption(index, 'value', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Display Label</label>
                    <input
                      type="text"
                      value={opt.label}
                      onChange={(e) => updateTimelineOption(index, 'label', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-700 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeTimelineOption(index)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Fields */}
      {activeTab === 'fields' && (
        <div className="glass rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Required Fields</h2>
          <p className="text-white/60 text-sm mb-4">Select which fields should be required on the form</p>

          <div className="grid md:grid-cols-2 gap-4">
            {availableFields.map(field => (
              <label
                key={field.key}
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  config.requiredFields.includes(field.key)
                    ? 'bg-cyan-500/20 border-cyan-500/50'
                    : 'bg-dark-800 border-white/10 hover:border-white/20'
                }`}
              >
                <input
                  type="checkbox"
                  checked={config.requiredFields.includes(field.key)}
                  onChange={() => toggleRequiredField(field.key)}
                  disabled={field.required}
                  className="w-5 h-5 rounded bg-dark-700 border-white/20 text-cyan-400 focus:ring-cyan-400"
                />
                <div>
                  <span className="text-white font-medium">{field.label}</span>
                  {field.required && (
                    <span className="ml-2 text-xs text-yellow-400">(Always required)</span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Form Text */}
      {activeTab === 'text' && (
        <div className="glass rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white mb-4">Form Text & Messages</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Form Title</label>
              <input
                type="text"
                value={config.formTitle}
                onChange={(e) => setConfig(prev => ({ ...prev, formTitle: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-700 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">Form Subtitle</label>
              <input
                type="text"
                value={config.formSubtitle}
                onChange={(e) => setConfig(prev => ({ ...prev, formSubtitle: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-700 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">Success Message</label>
              <textarea
                value={config.successMessage}
                onChange={(e) => setConfig(prev => ({ ...prev, successMessage: e.target.value }))}
                rows={2}
                className="w-full px-4 py-3 bg-dark-700 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">Terms & Conditions Text</label>
              <input
                type="text"
                value={config.termsText}
                onChange={(e) => setConfig(prev => ({ ...prev, termsText: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-700 border border-white/10 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview Card */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Preview</h2>
        <div className="bg-dark-800 rounded-lg p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-2">{config.formTitle}</h3>
          <p className="text-white/60 mb-4">{config.formSubtitle}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-xs text-white/50">Budget Options:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {config.budgetOptions.slice(0, 3).map((opt, i) => (
                  <span key={i} className="px-2 py-1 bg-dark-700 text-white/70 text-xs rounded">{opt.label}</span>
                ))}
                {config.budgetOptions.length > 3 && (
                  <span className="px-2 py-1 bg-dark-700 text-white/50 text-xs rounded">+{config.budgetOptions.length - 3} more</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-xs text-white/50">Timeline Options:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {config.timelineOptions.map((opt, i) => (
                  <span key={i} className="px-2 py-1 bg-dark-700 text-white/70 text-xs rounded">{opt.label}</span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <span className="text-green-400 text-sm">{config.successMessage}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
