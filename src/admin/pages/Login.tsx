import { BrandLockup } from '../../components/editorial/Brand';
import { StudioArtwork } from '../../components/editorial/StudioArtwork';
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail } from 'lucide-react';

type ApiStatus = { state: 'checking' | 'ok' | 'error'; message: string };

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({ state: 'checking', message: 'Checking admin API…' });

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    if (token && user) {
      window.location.href = '/admin';
    }
  }, []);

  // Self-diagnosis on load: ping the public /api/diag endpoint so the screen
  // can tell "API healthy" (green) apart from deployment/routing/seed
  // problems (red) BEFORE the user even types a password.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/diag', { headers: { Accept: 'application/json' } });
        const ct = String(res.headers.get('content-type') || '').toLowerCase();
        if (!ct.includes('application/json')) {
          if (!cancelled) {
            setApiStatus({
              state: 'error',
              message: 'Admin API not reached — the server returned the website page (HTML) instead of JSON. The /api route is not deployed on this build.'
            });
          }
          return;
        }
        const data = await res.json().catch(() => null);
        const d = data?.data;
        if (!res.ok || !data?.success || !d) {
          if (!cancelled) {
            setApiStatus({
              state: 'error',
              message: data?.error || data?.detail || `Admin API unhealthy (HTTP ${res.status}). Check the Vercel function logs.`
            });
          }
          return;
        }
        if (d.lead_storage_ready === false) {
          if (!cancelled) {
            setApiStatus({
              state: 'error',
              message: 'Lead storage is temporary on this Vercel deployment. Set DATABASE_URL to a persistent Neon database in Project Settings, then redeploy.'
            });
          }
          return;
        }
        if (d.env_admin_set && d.env_admin_in_db === false) {
          if (!cancelled) {
            setApiStatus({
              state: 'error',
              message: `Admin API connected, but user "${d.env_admin_username}" is missing from the database. Check the seed logs, then redeploy.`
            });
          }
          return;
        }
        if (d.env_admin_set && d.env_admin_active === false) {
          if (!cancelled) {
            setApiStatus({
              state: 'error',
              message: `Admin API connected, but "${d.env_admin_username}" is disabled in the database. Redeploy to re-activate it from the environment.`
            });
          }
          return;
        }
        if (!cancelled) setApiStatus({ state: 'ok', message: 'Admin API connected' });
      } catch {
        if (!cancelled) {
          setApiStatus({
            state: 'error',
            message: 'Cannot reach the admin API (network error). The site may still be deploying — retry in a moment.'
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email.trim(), password }),
      });

      // The API must answer with JSON. If it answers with HTML (or a bare 404)
      // the request was rewritten to the SPA shell instead of reaching the API,
      // which is a deployment/routing problem — not a wrong password.
      const contentType = String(response.headers.get('content-type') || '').toLowerCase();
      let data: any = null;
      let rawText = '';
      if (contentType.includes('application/json')) {
        data = await response.json().catch(() => null);
      } else {
        rawText = await response.text().catch(() => '');
      }

      if (!response.ok || !data?.success) {
        if (!contentType.includes('application/json')) {
          const looksHtml = /^\s*(<!doctype html|<html)/i.test(rawText);
          if (response.status === 404) {
            setError(
              looksHtml
                ? 'Admin API not reached: the server returned the website page (HTML) instead of JSON. The API route was not deployed or the rewrite is missing — check the latest Vercel deployment.'
                : 'Admin API not found (HTTP 404). The API route was not deployed — check the latest Vercel deployment.'
            );
          } else {
            setError(
              `Admin API returned an unexpected HTTP ${response.status}${
                looksHtml ? ' HTML' : ''
              } response instead of JSON. Please retry in a moment, or check the Vercel function logs.`
            );
          }
        } else {
          setError(data?.error || data?.message || 'Login failed. Check your credentials.');
        }
        setIsLoading(false);
        return;
      }

      const payload = data.data || {};
      if (payload.token) {
        localStorage.setItem('admin_token', payload.token);
        localStorage.setItem('auth_token', payload.token);
        localStorage.setItem('admin_user', JSON.stringify(payload.user || payload.admin || {}));
        setTimeout(() => {
          window.location.href = '/admin';
        }, 100);
      } else {
        setError('Invalid response from server');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Cannot reach the server. Please try again in a moment.');
      setIsLoading(false);
    }
  };

  return (
    <div className="desk desk-login">
      <div className="login-studio"><BrandLockup /><StudioArtwork kind="gyroscope" /></div>
      <div className="login-workspace">
        <div className="login-form">
          <div className="mb-8">
            <p className="studio-eyebrow"><span className="signal-rule" /> Chronolyte</p>
            <h1>Super Admin Panel</h1>
          </div>

          {/* API connectivity self-check */}
          <div
            data-testid="api-status"
            className={`mb-6 p-3 rounded-lg border flex items-center gap-2.5 text-sm ${
              apiStatus.state === 'ok'
                ? 'bg-emerald-500/10 border-emerald-500/40'
                : apiStatus.state === 'error'
                  ? 'bg-red-500/10 border-red-500/50'
                  : 'bg-white/5 border-white/10'
            }`}
          >
            {apiStatus.state === 'ok' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            {apiStatus.state === 'error' && (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            {apiStatus.state === 'checking' && (
              <span className="w-4 h-4 flex-shrink-0 border-2 border-gray-500/40 border-t-gray-300 rounded-full animate-spin" />
            )}
            <p
              className={
                apiStatus.state === 'ok'
                  ? 'text-emerald-400 font-medium'
                  : apiStatus.state === 'error'
                    ? 'text-red-400'
                    : 'text-gray-400'
              }
            >
              {apiStatus.message}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="admin-user" className="block text-sm font-medium text-gray-300 mb-2">
                Username or Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="admin-user" autoComplete="username" type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin or admin@chronolyte.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-cyan-500/30 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="admin-pass" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="admin-pass" autoComplete="current-password" type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-cyan-500/30 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-cyan-500/50 bg-white/5 checked:bg-cyan-500 cursor-pointer"
                  defaultChecked
                />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In to Admin Panel'
              )}
            </button>
          </form>

          {/* Security Notice */}
          <p className="text-center text-xs text-gray-500 mt-6">
            🔒 This is a secure, encrypted connection. All login attempts are logged.
          </p>
        </div>
      </div>
    </div>
  );
}
