import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
<<<<<<< HEAD
import { KeyRound, UserPlus, Sparkles, Shield, UserCheck, Eye } from 'lucide-react';
=======
import { KeyRound, UserPlus, Sparkles } from 'lucide-react';
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

<<<<<<< HEAD
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>('admin');
  const [password, setPassword] = useState<string>('password123');
=======
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c

  const [regUsername, setRegUsername] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regFullName, setRegFullName] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
<<<<<<< HEAD
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
=======
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
    setIsLoading(true);
    setError(null);
    try {
      await login(usernameOrEmail, password);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
<<<<<<< HEAD
      setError(axiosErr.response?.data?.message || 'Invalid username or password. Please try again.');
=======
      setError(axiosErr.response?.data?.message || 'Invalid username or password.');
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
  const handleQuickLogin = async (user: string, pass: string, presetName: string) => {
    setUsernameOrEmail(user);
    setPassword(pass);
    setActivePreset(presetName);
    setIsLoading(true);
    setError(null);
    try {
      await login(user, pass);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || `Failed to sign in as ${user}.`);
    } finally {
      setIsLoading(false);
      setActivePreset(null);
    }
  };

=======
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await register(regUsername, regEmail, regPassword, regFullName);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Registration failed. Check details.');
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
=======
  const handleQuickDemoAdmin = async () => {
    setUsernameOrEmail('admin');
    setPassword('password123');
    setIsLoading(true);
    setError(null);
    try {
      await login('admin', 'password123');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to auto-sign in admin.');
    } finally {
      setIsLoading(false);
    }
  };

>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      title={isRegisterMode ? 'Create ChangeRipple Account' : 'Sign in to ChangeRipple'}
      description="Authentication is required to view and analyze project dependency architectures."
<<<<<<< HEAD
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Quick Demo Accounts Selection */}
        {!isRegisterMode && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#FBC02D]">
                <Sparkles className="w-3.5 h-3.5" />
                Quick 1-Click Demo Accounts
              </span>
              <span className="text-[11px] text-slate-500 font-mono">No typing required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Admin Button */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('admin', 'password123', 'admin')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                  activePreset === 'admin'
                    ? 'bg-[#FBC02D]/15 border-[#FBC02D] shadow-md shadow-orange-950/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/60 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="p-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Shield className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    Full Admin
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100">Administrator</div>
                  <div className="text-[11px] text-slate-400">admin / password123</div>
                </div>
                <div className="text-[10px] text-[#FBC02D] font-medium flex items-center gap-1 pt-1 border-t border-slate-800/80">
                  {isLoading && activePreset === 'admin' ? 'Signing in...' : 'Click to Sign In →'}
                </div>
              </button>

              {/* Lead Developer Button */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('lead', 'password123', 'lead')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                  activePreset === 'lead'
                    ? 'bg-[#FBC02D]/15 border-[#FBC02D] shadow-md shadow-orange-950/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/60 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="p-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <UserCheck className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    Lead / Owner
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100">Tech Lead</div>
                  <div className="text-[11px] text-slate-400">lead / password123</div>
                </div>
                <div className="text-[10px] text-[#FBC02D] font-medium flex items-center gap-1 pt-1 border-t border-slate-800/80">
                  {isLoading && activePreset === 'lead' ? 'Signing in...' : 'Click to Sign In →'}
                </div>
              </button>

              {/* QA Reviewer Button */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin('viewer', 'password123', 'viewer')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                  activePreset === 'viewer'
                    ? 'bg-[#FBC02D]/15 border-[#FBC02D] shadow-md shadow-orange-950/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/60 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Eye className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    Read-Only
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100">QA / Reviewer</div>
                  <div className="text-[11px] text-slate-400">viewer / password123</div>
                </div>
                <div className="text-[10px] text-[#FBC02D] font-medium flex items-center gap-1 pt-1 border-t border-slate-800/80">
                  {isLoading && activePreset === 'viewer' ? 'Signing in...' : 'Click to Sign In →'}
                </div>
              </button>
            </div>
=======
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Quick Demo Preset Button */}
        {!isRegisterMode && (
          <div className="p-3.5 rounded-xl bg-brand-950/40 border border-brand-800/60 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-brand-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                Quick Evaluation Mode
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Use pre-configured administrator account</div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={handleQuickDemoAdmin}
              isLoading={isLoading}
            >
              Sign In as Admin
            </Button>
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300">
            {error}
          </div>
        )}

<<<<<<< HEAD
        {/* Manual Credentials Form */}
        {!isRegisterMode ? (
          <form onSubmit={handleLogin} className="space-y-3.5 pt-2 border-t border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Or Sign In Manually
            </div>

=======
        {!isRegisterMode ? (
          <form onSubmit={handleLogin} className="space-y-4">
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Username or Email</label>
              <input
                type="text"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
<<<<<<< HEAD
                placeholder="admin or admin@changeripple.io"
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
=======
                placeholder="admin or email@domain.com"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
<<<<<<< HEAD
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
=======
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
              />
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
                <KeyRound className="w-4 h-4 mr-2" />
                Sign In
              </Button>

              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setError(null);
                }}
                className="text-xs text-slate-400 hover:text-brand-400 transition-colors py-1 text-center"
              >
                Don't have an account? Create one now
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="Ada Lovelace"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
              <input
                type="text"
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="developer123"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="dev@changeripple.io"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password (min 6 characters)</label>
              <input
                type="password"
                required
                minLength={6}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </Button>

              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setError(null);
                }}
                className="text-xs text-slate-400 hover:text-brand-400 transition-colors py-1 text-center"
              >
                Already have an account? Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
