import { useEffect, useState, useRef } from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Database,
  Mail,
  Save,
  Eye,
  EyeOff,
  Key,
  AlertTriangle,
  Phone,
  MapPin,
  Globe,
  Link as LinkIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
  Trash2,
  Plus,
  X,
  UserPlus,
  Pencil
} from 'lucide-react';
import { mockActivityLog } from '../mockData';

function getToken() {
  return localStorage.getItem('admin_token') || '';
}

function getAuthHeaders(json = true) {
  const h: Record<string, string> = { Authorization: `Bearer ${getToken()}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

type SettingsTab = 'profile' | 'security' | 'notifications' | 'users' | 'system' | 'social';

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'users', label: 'Users', icon: Shield },
  { id: 'social', label: 'Social Links', icon: LinkIcon },
  { id: 'system', label: 'System', icon: Database },
];

function ProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current user from localStorage
  const storedUser = localStorage.getItem('admin_user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',
    website: '',
    bio: ''
  });
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || '');

  useEffect(() => {
    // Load profile settings from backend
    const loadProfile = async () => {
      try {
        const res = await fetch('/backend/api/settings.php?action=get&key=profile_settings', {
          headers: getAuthHeaders(false)
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.value) {
            const profile = JSON.parse(json.data.value);
            setFormData(prev => ({ ...prev, ...profile }));
          }
        }
      } catch (err) {
        console.warn('Profile load failed', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Please select a JPG, PNG, GIF, or WebP image.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be under 2MB.' });
      return;
    }

    setUploadingAvatar(true);
    setMessage({ type: null, text: '' });

    try {
      const form = new FormData();
      form.append('file', file);

      const res = await fetch('/backend/api/upload.php?action=upload&type=image&category=avatars', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form
      });

      const json = await res.json();
      if (res.ok && json.success) {
        const newAvatarUrl = json.data.url;
        setAvatarUrl(newAvatarUrl);

        // Update admin record with new avatar
        if (currentUser?.id) {
          await fetch(`/backend/api/settings.php?action=admin-user&id=${currentUser.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ avatar: newAvatarUrl })
          });

          // Update localStorage
          const updated = { ...currentUser, avatar: newAvatarUrl };
          localStorage.setItem('admin_user', JSON.stringify(updated));
        }

        setMessage({ type: 'success', text: 'Avatar updated successfully!' });
      } else {
        setMessage({ type: 'error', text: json.error || 'Upload failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload avatar.' });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: null, text: '' });
    try {
      // Save profile data as a setting
      const res = await fetch('/backend/api/settings.php?action=set', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ key: 'profile_settings', value: JSON.stringify(formData) })
      });

      // Also update admin username/email if changed
      if (currentUser?.id) {
        await fetch(`/backend/api/settings.php?action=admin-user&id=${currentUser.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ username: formData.username, email: formData.email })
        });

        const updated = { ...currentUser, username: formData.username, email: formData.email };
        localStorage.setItem('admin_user', JSON.stringify(updated));
      }

      if (!res.ok) throw new Error('Save failed');
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-white/70">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
        Loading profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" /> Address Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Street Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">State/Region</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Zip Code</label>
              <input
                type="text"
                value={formData.zipcode}
                onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Bio</h3>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Avatar</h3>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Avatar"
              className="w-20 h-20 rounded-full bg-gray-700 object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
              <User className="w-8 h-8 text-white/40" />
            </div>
          )}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploadingAvatar ? 'Uploading...' : 'Upload New'}
            </button>
            <p className="text-xs text-white/40 mt-2">JPG, PNG, GIF, WebP up to 2MB</p>
          </div>
        </div>
      </div>

      {message.type && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border border-red-500/40 text-red-300'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      <div className="pt-4 border-t border-white/10">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-black hover:opacity-90 transition-opacity disabled:opacity-50">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm text-white/60 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 pr-12"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl max-w-md">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-white font-medium">2FA Authentication</p>
              <p className="text-sm text-white/50">Add an extra layer of security</p>
            </div>
          </div>
          <button
            onClick={() => setTwoFactor(!twoFactor)}
            className={`relative w-12 h-6 rounded-full transition-colors ${twoFactor ? 'bg-cyan-500' : 'bg-white/20'}`}
          >
            <span 
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${twoFactor ? 'translate-x-6' : ''}`}
            />
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Sessions</h3>
        <div className="space-y-3">
          {mockActivityLog.slice(0, 3).map((log) => (
            <div key={log.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-white">{log.action}</p>
                <p className="text-sm text-white/50">{log.ip_address} • {new Date(log.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-black hover:opacity-90 transition-opacity">
          <Save className="w-5 h-5" />
          Update Security
        </button>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    newLeads: true,
    projectUpdates: true,
    testimonials: false,
    weeklyReport: true,
    securityAlerts: true,
  });

  const toggle = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const items = [
    { key: 'newLeads' as const, label: 'New Lead Notifications', description: 'Get notified when a new lead is captured' },
    { key: 'projectUpdates' as const, label: 'Project Updates', description: 'Status changes and milestone updates' },
    { key: 'testimonials' as const, label: 'New Testimonials', description: 'When clients submit testimonials' },
    { key: 'weeklyReport' as const, label: 'Weekly Reports', description: 'Summary of leads and projects' },
    { key: 'securityAlerts' as const, label: 'Security Alerts', description: 'Login attempts and security events' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-white font-medium">{item.label}</p>
                  <p className="text-sm text-white/50">{item.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggle(item.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${notifications[item.key] ? 'bg-cyan-500' : 'bg-white/20'}`}
              >
                <span 
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications[item.key] ? 'translate-x-6' : ''}`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-black hover:opacity-90 transition-opacity">
          <Save className="w-5 h-5" />
          Save Preferences
        </button>
      </div>
    </div>
  );
}

function UsersSettings() {
  const [users, setUsers] = useState<Array<{
    id: number;
    username: string;
    email: string;
    role: string;
    avatar?: string;
    is_active: number | boolean;
    created_at: string;
    last_login?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  // Edit modal state
  const [editUser, setEditUser] = useState<typeof users[0] | null>(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', role: 'admin', password: '' });
  const [editSaving, setEditSaving] = useState(false);

  // Invite modal state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ username: '', email: '', password: '', role: 'admin' });
  const [inviteSaving, setInviteSaving] = useState(false);

  const roleColors: Record<string, string> = {
    admin: 'bg-red-500/20 text-red-400',
    editor: 'bg-cyan-500/20 text-cyan-400',
    viewer: 'bg-gray-500/20 text-gray-400'
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/backend/api/settings.php?action=admin-users', {
        headers: getAuthHeaders(false)
      });
      const json = await res.json();
      if (json.success) {
        setUsers(json.data.users || []);
      } else {
        setError(json.error || 'Failed to load users');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEdit = (user: typeof users[0]) => {
    setEditUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
      password: ''
    });
    setMessage({ type: null, text: '' });
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    setEditSaving(true);
    setMessage({ type: null, text: '' });
    try {
      const body: Record<string, string> = {
        username: editForm.username,
        email: editForm.email,
        role: editForm.role
      };
      if (editForm.password) body.password = editForm.password;

      const res = await fetch(`/backend/api/settings.php?action=admin-user&id=${editUser.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: 'User updated successfully!' });
        setEditUser(null);
        loadUsers();
      } else {
        setMessage({ type: 'error', text: json.error || 'Update failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update user.' });
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      const res = await fetch(`/backend/api/settings.php?action=admin-user&id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(false)
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: 'User deactivated.' });
        loadUsers();
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to deactivate' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to deactivate user.' });
    }
  };

  const handleInvite = async () => {
    if (!inviteForm.username || !inviteForm.email || !inviteForm.password) {
      setMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }
    setInviteSaving(true);
    setMessage({ type: null, text: '' });
    try {
      const res = await fetch('/backend/api/settings.php?action=admin-users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(inviteForm)
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: 'User created successfully!' });
        setShowInvite(false);
        setInviteForm({ username: '', email: '', password: '', role: 'admin' });
        loadUsers();
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to create user' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create user.' });
    } finally {
      setInviteSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-white/70">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
        Loading users...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Team Members</h3>
        <button
          onClick={() => { setShowInvite(true); setMessage({ type: null, text: '' }); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-sm font-medium text-black"
        >
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {message.type && (
        <div className={`p-3 rounded-xl border text-sm flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            : 'bg-red-500/10 border-red-500/40 text-red-300'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl border bg-red-500/10 border-red-500/40 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Invite User Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowInvite(false)}>
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Create New User</h3>
              <button onClick={() => setShowInvite(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Username</label>
                <input
                  type="text"
                  value={inviteForm.username}
                  onChange={(e) => setInviteForm({ ...inviteForm, username: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Email</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Password</label>
                <input
                  type="password"
                  value={inviteForm.password}
                  onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="Set a password"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInvite(false)}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={inviteSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-black hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {inviteSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {inviteSaving ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setEditUser(null)}>
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Edit User</h3>
              <button onClick={() => setEditUser(null)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
                  placeholder="Leave blank to keep current"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleDeactivate(editUser.id)}
                className="px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditUser(null)}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-black hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/5 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 text-sm font-medium text-white/50">User</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-white/50">Role</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-white/50">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-white/50">Last Login</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-white/50">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => {
              const isActive = user.is_active === 1 || user.is_active === true;
              return (
                <tr key={user.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full bg-gray-700 object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                          <User className="w-5 h-5 text-white/40" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">{user.username}</p>
                        <p className="text-sm text-white/50">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleColors[user.role] || roleColors.viewer}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-sm ${isActive ? 'text-emerald-400' : 'text-white/50'}`}>
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-white/50'}`} />
                      {isActive ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/50">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleEdit(user)}
                      className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-white/50">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SystemSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Database</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-sm text-white/50">Database Size</p>
            <p className="text-xl font-bold text-white mt-1">24.5 MB</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-sm text-white/50">Total Records</p>
            <p className="text-xl font-bold text-white mt-1">1,247</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-sm text-white/50">Last Backup</p>
            <p className="text-xl font-bold text-white mt-1">2h ago</p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Cache Management</h3>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white hover:bg-white/20 transition-colors">
            Clear Page Cache
          </button>
          <button className="px-4 py-2 bg-white/10 border border-white/10 rounded-lg text-sm text-white hover:bg-white/20 transition-colors">
            Clear Data Cache
          </button>
          <button className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400 hover:bg-red-500/30 transition-colors">
            Clear All
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Maintenance Mode</h3>
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-medium">Enable Maintenance Mode</p>
            <p className="text-sm text-white/60 mt-1">
              This will show a maintenance page to all visitors. Only logged-in admins can access the site.
            </p>
            <button className="mt-3 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-sm text-yellow-400 hover:bg-yellow-500/30 transition-colors">
              Enable Maintenance
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">System Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-white/50">PHP Version</span>
            <span className="text-white font-mono">8.2.12</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-white/50">MySQL Version</span>
            <span className="text-white font-mono">8.0.35</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-white/50">Server</span>
            <span className="text-white font-mono">Apache/2.4.57</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-white/50">CMS Version</span>
            <span className="text-white font-mono">1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

type SocialKey = 'twitter' | 'linkedin' | 'github' | 'facebook' | 'instagram' | 'youtube' | 'whatsapp';

const socialDefaults: Record<SocialKey, string> = {
  twitter: '',
  linkedin: '',
  github: '',
  facebook: 'https://facebook.com/chronolyte',
  instagram: 'https://instagram.com/chronolyte',
  youtube: '',
  whatsapp: 'https://wa.me/chronolyte'
};

function SocialSettings() {
  const [links, setLinks] = useState<Record<SocialKey, string>>(socialDefaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/backend/api/settings.php?action=get&key=social_links', {
          headers: getAuthHeaders(false)
        });
        if (res.ok) {
          const json = await res.json();
          const parsed = json?.data?.value ? JSON.parse(json.data.value) : {};
          if (mounted) {
            setLinks({ ...socialDefaults, ...parsed });
          }
        }
      } catch (err) {
        console.warn('Social links load failed', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: null, text: '' });
    try {
      const res = await fetch('/backend/api/settings.php?action=set', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ key: 'social_links', value: JSON.stringify(links) })
      });

      if (!res.ok) {
        throw new Error('Save failed');
      }

      setMessage({ type: 'success', text: 'Social links updated' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to save links. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: SocialKey; label: string; placeholder: string }[] = [
    { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/yourhandle' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourcompany' },
    { key: 'github', label: 'GitHub', placeholder: 'https://github.com/yourorg' },
    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourpage' },
    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourhandle' },
    { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel' },
    { key: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/15551234567' }
  ];

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-white/70">
        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
        Loading social links...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-cyan-400" />
            Social Profiles
          </h3>
          <p className="text-sm text-white/50">These links power the social icons on your site footer.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm text-white/60 mb-2">{field.label}</label>
              <input
                type="url"
                value={links[field.key]}
                onChange={(e) => setLinks({ ...links, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          ))}
        </div>
      </div>

      {message.type && (
        <div
          className={`p-3 rounded-xl border text-sm flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/10 border-red-500/40 text-red-300'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      <div className="pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-medium text-black hover:opacity-90 transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Social Links'}
        </button>
      </div>
    </div>
  );
}

export function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileSettings />;
      case 'security': return <SecuritySettings />;
      case 'notifications': return <NotificationSettings />;
      case 'users': return <UsersSettings />;
      case 'social': return <SocialSettings />;
      case 'system': return <SystemSettings />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Settings</h1>
        <p className="text-white/50 mt-1">Manage your account and system settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-[#0d0d14] border border-white/5 rounded-2xl p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-[#0d0d14] border border-white/5 rounded-2xl p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
