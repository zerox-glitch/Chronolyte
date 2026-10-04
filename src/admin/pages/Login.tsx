import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    if (token && user) {
      window.location.href = '/admin';
    }
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

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        setError(data?.error || data?.message || 'Login failed. Check your credentials.');
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1b] to-[#1a1f2e] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#14192a]/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-2xl">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {/* Animated Hourglass Logo */}
              <svg 
                viewBox="0 0 100 120" 
                className="w-24 h-28 drop-shadow-[0_0_25px_rgba(0,245,255,0.7)]"
              >
                <defs>
                  <linearGradient id="hourglassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f5ff" />
                    <stop offset="50%" stopColor="#0080ff" />
                    <stop offset="100%" stopColor="#0040aa" />
                  </linearGradient>
                  <linearGradient id="sandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00f5ff" />
                    <stop offset="100%" stopColor="#0080ff" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <clipPath id="topSandClip">
                    <path d="M20 15 L80 15 L80 50 L20 50 Z" />
                  </clipPath>
                  <clipPath id="bottomSandClip">
                    <path d="M20 50 L80 50 L80 85 L20 85 Z" />
                  </clipPath>
                </defs>
                
                {/* Rotating hourglass group */}
                <g style={{ transformOrigin: '50px 50px' }}>
                  <animateTransform 
                    attributeName="transform" 
                    type="rotate" 
                    values="0 50 50; 0 50 50; 180 50 50; 180 50 50; 360 50 50" 
                    keyTimes="0; 0.45; 0.5; 0.95; 1"
                    dur="6s" 
                    repeatCount="indefinite"
                  />
                  
                  {/* Hourglass outer frame */}
                  <path 
                    d="M15 10 L85 10 L85 15 C85 15 70 35 52 50 C70 65 85 85 85 85 L85 90 L15 90 L15 85 C15 85 30 65 48 50 C30 35 15 15 15 15 Z" 
                    fill="rgba(0,20,40,0.5)" 
                    stroke="url(#hourglassGradient)" 
                    strokeWidth="3"
                    filter="url(#glow)"
                  />
                  
                  {/* Top cap */}
                  <rect x="10" y="5" width="80" height="8" rx="2" fill="url(#hourglassGradient)" filter="url(#glow)" />
                  
                  {/* Bottom cap */}
                  <rect x="10" y="87" width="80" height="8" rx="2" fill="url(#hourglassGradient)" filter="url(#glow)" />
                  
                  {/* Sand in top - shrinking */}
                  <path fill="url(#sandGradient)" opacity="0.8">
                    <animate 
                      attributeName="d" 
                      values="M25 18 L75 18 L55 43 L45 43 Z;M35 18 L65 18 L52 35 L48 35 Z;M48 18 L52 18 L51 22 L49 22 Z;M25 18 L75 18 L55 43 L45 43 Z"
                      keyTimes="0; 0.4; 0.5; 1"
                      dur="6s" 
                      repeatCount="indefinite"
                    />
                  </path>
                  
                  {/* Sand stream falling */}
                  <g>
                    <rect x="48" y="43" width="4" height="20" fill="#00f5ff" opacity="0.9" rx="2">
                      <animate attributeName="opacity" values="0.9;0.5;0.9" dur="0.5s" repeatCount="indefinite" />
                      <animate attributeName="height" values="20;15;20" dur="0.3s" repeatCount="indefinite" />
                    </rect>
                    {/* Sand particles */}
                    <circle cx="50" cy="55" r="1.5" fill="#00f5ff">
                      <animate attributeName="cy" values="55;70;55" dur="0.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="48" cy="58" r="1" fill="#0080ff">
                      <animate attributeName="cy" values="58;72;58" dur="0.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0;0.8" dur="0.6s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="52" cy="52" r="1" fill="#00f5ff">
                      <animate attributeName="cy" values="52;68;52" dur="0.7s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0;0.7" dur="0.7s" repeatCount="indefinite" />
                    </circle>
                  </g>
                  
                  {/* Sand in bottom - growing pile */}
                  <path fill="url(#sandGradient)" opacity="0.8">
                    <animate 
                      attributeName="d" 
                      values="M45 82 L50 78 L55 82 Z;M35 82 L50 68 L65 82 Z;M25 82 L50 58 L75 82 Z;M45 82 L50 78 L55 82 Z"
                      keyTimes="0; 0.4; 0.5; 1"
                      dur="6s" 
                      repeatCount="indefinite"
                    />
                  </path>
                </g>
                
                {/* Light effects - don't rotate */}
                <line 
                  x1="78" y1="12" 
                  x2="95" y2="-5" 
                  stroke="white" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  opacity="0.9"
                  filter="url(#glow)"
                >
                  <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite" />
                </line>
                <line 
                  x1="82" y1="22" 
                  x2="92" y2="12" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                  opacity="0.7"
                >
                  <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite" />
                </line>
                
                {/* Glowing particles around hourglass */}
                <circle cx="15" cy="30" r="2" fill="#00f5ff" opacity="0.6">
                  <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="r" values="2;3;2" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="85" cy="70" r="2" fill="#0080ff" opacity="0.5">
                  <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="r" values="2;3.5;2" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="20" cy="80" r="1.5" fill="#00f5ff" opacity="0.4">
                  <animate attributeName="opacity" values="0.4;0.1;0.4" dur="1.8s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Chronolyte</h1>
            <p className="text-cyan-400 font-semibold text-lg">Super Admin Panel</p>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username or Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-cyan-500/30 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
