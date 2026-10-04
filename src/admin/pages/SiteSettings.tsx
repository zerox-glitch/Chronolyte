import { useState, useEffect } from 'react';
import {
  Settings,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Link as LinkIcon,
  FileText,
  Type
} from 'lucide-react';

type SettingsTab = 'general' | 'contact' | 'social' | 'footer' | 'seo';

interface SiteSettingsData {
  // General
  site_name: string;
  site_tagline: string;
  site_description: string;
  site_logo: string;
  favicon: string;
  
  // Contact
  contact_email: string;
  contact_phone: string;
  contact_phone_secondary: string;
  contact_address: string;
  contact_city: string;
  contact_state: string;
  contact_country: string;
  contact_zipcode: string;
  contact_map_embed: string;
  
  // Social
  social_twitter: string;
  social_linkedin: string;
  social_github: string;
  social_facebook: string;
  social_instagram: string;
  social_youtube: string;
  social_whatsapp: string;
  
  // Footer
  footer_copyright: string;
  footer_tagline: string;
  footer_show_social: boolean;
  footer_show_newsletter: boolean;
  
  // SEO
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  seo_og_image: string;
}

const defaultSettings: SiteSettingsData = {
  site_name: 'Chronolyte',
  site_tagline: 'We bend time with AI',
  site_description: 'Premium web development and AI solutions',
  site_logo: '',
  favicon: '',
  
  contact_email: 'contact@chronolyte.com',
  contact_phone: '+1 (555) 000-0000',
  contact_phone_secondary: '',
  contact_address: '123 Business Street',
  contact_city: 'New York',
  contact_state: 'NY',
  contact_country: 'United States',
  contact_zipcode: '10001',
  contact_map_embed: '',
  
  social_twitter: 'https://twitter.com/chronolyte',
  social_linkedin: 'https://linkedin.com/company/chronolyte',
  social_github: '',
  social_facebook: 'https://facebook.com/chronolyte',
  social_instagram: 'https://instagram.com/chronolyte',
  social_youtube: '',
  social_whatsapp: '',
  
  footer_copyright: '© 2025 Chronolyte. All rights reserved.',
  footer_tagline: 'We bend time with AI.',
  footer_show_social: true,
  footer_show_newsletter: false,
  
  seo_title: 'Chronolyte - Premium Web & AI Solutions',
  seo_description: 'Transform your business with cutting-edge websites, AI tools, and automation solutions.',
  seo_keywords: 'web development, AI, automation, SaaS, websites',
  seo_og_image: ''
};

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'contact', label: 'Contact Info', icon: Phone },
  { id: 'social', label: 'Social Links', icon: LinkIcon },
  { id: 'footer', label: 'Footer', icon: FileText },
  { id: 'seo', label: 'SEO', icon: Globe }
];

function getToken() {
  return localStorage.getItem('admin_token') || '';
}

function getAuthHeaders(json = true) {
  const h: Record<string, string> = { Authorization: `Bearer ${getToken()}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

export function SiteSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<SiteSettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/backend/api/settings.php?action=get&key=site_settings', {
        headers: getAuthHeaders(false)
      });
      const json = await res.json();
      if (json.success && json.data?.setting_value) {
        const saved = JSON.parse(json.data.setting_value);
        setSettings({ ...defaultSettings, ...saved });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage({ type: null, text: '' });
    
    try {
      const res = await fetch('/backend/api/settings.php?action=set', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          key: 'site_settings',
          value: JSON.stringify(settings),
          type: 'json',
          description: 'Global site settings'
        })
      });
      
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to save settings' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof SiteSettingsData, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Site Settings</h1>
          <p className="text-white/60 mt-1">Manage your website's global settings</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-medium text-black hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Message */}
      {message.type && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-dark-800/50 rounded-xl border border-white/5 p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Type className="w-5 h-5 text-cyan-400" />
              General Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => updateSetting('site_name', e.target.value)}
                  className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Tagline</label>
                <input
                  type="text"
                  value={settings.site_tagline}
                  onChange={(e) => updateSetting('site_tagline', e.target.value)}
                  className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Site Description</label>
              <textarea
                value={settings.site_description}
                onChange={(e) => updateSetting('site_description', e.target.value)}
                rows={3}
                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none resize-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Logo URL</label>
                <input
                  type="text"
                  value={settings.site_logo}
                  onChange={(e) => updateSetting('site_logo', e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Favicon URL</label>
                <input
                  type="text"
                  value={settings.favicon}
                  onChange={(e) => updateSetting('favicon', e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="w-5 h-5 text-cyan-400" />
              Contact Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => updateSetting('contact_email', e.target.value)}
                  className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={settings.contact_phone}
                  onChange={(e) => updateSetting('contact_phone', e.target.value)}
                  className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Secondary Phone</label>
                <input
                  type="tel"
                  value={settings.contact_phone_secondary}
                  onChange={(e) => updateSetting('contact_phone_secondary', e.target.value)}
                  className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-md font-medium mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Address
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white/80 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={settings.contact_address}
                    onChange={(e) => updateSetting('contact_address', e.target.value)}
                    className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">City</label>
                  <input
                    type="text"
                    value={settings.contact_city}
                    onChange={(e) => updateSetting('contact_city', e.target.value)}
                    className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">State/Province</label>
                  <input
                    type="text"
                    value={settings.contact_state}
                    onChange={(e) => updateSetting('contact_state', e.target.value)}
                    className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Country</label>
                  <input
                    type="text"
                    value={settings.contact_country}
                    onChange={(e) => updateSetting('contact_country', e.target.value)}
                    className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">ZIP/Postal Code</label>
                  <input
                    type="text"
                    value={settings.contact_zipcode}
                    onChange={(e) => updateSetting('contact_zipcode', e.target.value)}
                    className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Google Maps Embed Code</label>
              <textarea
                value={settings.contact_map_embed}
                onChange={(e) => updateSetting('contact_map_embed', e.target.value)}
                rows={3}
                placeholder="<iframe src='...'></iframe>"
                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none resize-none font-mono text-sm"
              />
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-cyan-400" />
              Social Media Links
            </h2>
            <p className="text-white/60 text-sm">Leave empty to hide the social icon</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'social_twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/yourhandle' },
                { key: 'social_linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourcompany' },
                { key: 'social_github', label: 'GitHub', placeholder: 'https://github.com/yourprofile' },
                { key: 'social_facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
                { key: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
                { key: 'social_youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
                { key: 'social_whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/1234567890' }
              ].map(social => (
                <div key={social.key}>
                  <label className="block text-sm font-medium text-white/80 mb-2">{social.label}</label>
                  <input
                    type="url"
                    value={settings[social.key as keyof SiteSettingsData] as string}
                    onChange={(e) => updateSetting(social.key as keyof SiteSettingsData, e.target.value)}
                    placeholder={social.placeholder}
                    className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'footer' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Footer Settings
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Copyright Text</label>
              <input
                type="text"
                value={settings.footer_copyright}
                onChange={(e) => updateSetting('footer_copyright', e.target.value)}
                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Footer Tagline</label>
              <input
                type="text"
                value={settings.footer_tagline}
                onChange={(e) => updateSetting('footer_tagline', e.target.value)}
                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
            
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.footer_show_social}
                  onChange={(e) => updateSetting('footer_show_social', e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-dark-700 text-cyan-400 focus:ring-cyan-400"
                />
                <span className="text-white/80">Show Social Icons</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.footer_show_newsletter}
                  onChange={(e) => updateSetting('footer_show_newsletter', e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-dark-700 text-cyan-400 focus:ring-cyan-400"
                />
                <span className="text-white/80">Show Newsletter Signup</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              SEO Settings
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Default Page Title</label>
              <input
                type="text"
                value={settings.seo_title}
                onChange={(e) => updateSetting('seo_title', e.target.value)}
                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Meta Description</label>
              <textarea
                value={settings.seo_description}
                onChange={(e) => updateSetting('seo_description', e.target.value)}
                rows={3}
                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none resize-none"
              />
              <p className="text-white/40 text-xs mt-1">{settings.seo_description.length}/160 characters recommended</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Meta Keywords</label>
              <input
                type="text"
                value={settings.seo_keywords}
                onChange={(e) => updateSetting('seo_keywords', e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Open Graph Image URL</label>
              <input
                type="url"
                value={settings.seo_og_image}
                onChange={(e) => updateSetting('seo_og_image', e.target.value)}
                placeholder="https://..."
                className="w-full bg-dark-700 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
              />
              <p className="text-white/40 text-xs mt-1">Recommended size: 1200x630 pixels</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
