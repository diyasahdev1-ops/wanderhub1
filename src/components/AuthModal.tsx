import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Compass, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthModal: React.FC = () => {
  const { authModalOpen, closeAuthModal, authModalMode, openAuthModal, login, register, loginAsDemo } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginAsDemo();
      closeAuthModal();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-purple-100 p-6 sm:p-8"
      >
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-100/70 border border-purple-200/80 flex items-center justify-center text-[#8b75d7] mx-auto mb-3 shadow-sm">
            <Compass className="w-6 h-6 text-[#8b75d7]" />
          </div>
          <h2 className="font-serif-title text-2xl font-bold text-slate-900">
            {authModalMode === 'login' ? 'Welcome Back to WanderHub' : 'Join the WanderHub Collective'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {authModalMode === 'login'
              ? 'Access your saved trips, budget plans, and bucket list'
              : 'Save AI-generated itineraries, track budgets, and explore dream hubs'}
          </p>
        </div>

        {/* 1-Click Demo Traveler banner */}
        <div className="mb-5 p-3.5 rounded-2xl bg-[#faf9ff] border border-purple-100 text-left">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Instant Access (Demo Mode)</span>
              <span className="text-[11px] text-slate-500">Explore with Alex Vance's pre-loaded trips</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="px-3.5 py-1.5 bg-[#8b75d7] hover:bg-[#7c66d1] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              Continue as Demo
            </motion.button>
          </div>
        </div>

        {/* Mode Toggle Tabs with smooth floating pill */}
        <div className="flex items-center p-1 bg-purple-50/70 rounded-2xl mb-5 text-xs font-semibold border border-purple-100">
          {(['login', 'register'] as const).map(mode => {
            const isActive = authModalMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setError(null);
                  openAuthModal(mode);
                }}
                className={`relative flex-1 py-2 rounded-xl transition-colors z-10 ${
                  isActive ? 'text-purple-900' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                {isActive && (
                  <motion.div
                    layoutId="authModalTabPill"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm border border-purple-100/80 -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#faf9ff] border border-purple-100 rounded-xl text-xs focus:ring-2 focus:ring-[#8b75d7]/40 focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#faf9ff] border border-purple-100 rounded-xl text-xs focus:ring-2 focus:ring-[#8b75d7]/40 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-[#faf9ff] border border-purple-100 rounded-xl text-xs focus:ring-2 focus:ring-[#8b75d7]/40 focus:outline-none"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#8b75d7] to-[#7c66d1] hover:from-[#7c66d1] hover:to-[#6a54bd] text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-purple-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span>{authModalMode === 'login' ? 'Sign In to WanderHub' : 'Create WanderHub Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};
