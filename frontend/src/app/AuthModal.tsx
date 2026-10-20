import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { KeyRound, UserPlus, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

  const [usernameOrEmail, setUsernameOrEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [regUsername, setRegUsername] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regFullName, setRegFullName] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(usernameOrEmail, password);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      title={isRegisterMode ? 'Create ChangeRipple Account' : 'Sign in to ChangeRipple'}
      description="Authentication is required to view and analyze project dependency architectures."
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
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300">
            {error}
          </div>
        )}

        {!isRegisterMode ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Username or Email</label>
              <input
                type="text"
                required
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="admin or email@domain.com"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
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
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
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
