import { useState } from 'react';
import type { FormEvent } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { LangSwitcher } from '../ui/LangSwitcher';

export function AdminLoginForm() {
  const { t } = useLanguage();
  const a = t.admin.login;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) { setError(a.supabaseError); return; }
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError(authError.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e1a] via-[#0f1628] to-[#131c35] px-4 py-12">
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#c9a96e 1px, transparent 1px), linear-gradient(90deg, #c9a96e 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Language switcher — top right */}
      <div className="absolute top-5 right-5">
        <LangSwitcher />
      </div>

      <div className="relative w-full max-w-[420px]" style={{ animation: 'fadeSlideUp 0.45s ease both' }}>
        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="bg-[#111827]/90 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 p-8 backdrop-blur-md">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center mb-4 shadow-lg shadow-gold/10">
              <ShieldCheck className="text-gold" size={26} strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-2xl text-white tracking-tight">{t.admin.dashboard.panelTitle}</h1>
            <p className="text-white/45 text-sm mt-1.5 text-center">{a.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider block">
                {a.emailLabel}
              </label>
              <div className="relative group">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-gold/70 transition-colors pointer-events-none" />
                <input type="email" autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                  placeholder="admin@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/10 hover:border-white/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider block">
                {a.passwordLabel}
              </label>
              <div className="relative group">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-gold/70 transition-colors pointer-events-none" />
                <input type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-11 py-3.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/10 hover:border-white/20 transition-all duration-200"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors p-0.5"
                  aria-label={showPassword ? a.hidePass : a.showPass}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-300 text-sm leading-snug">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl font-semibold text-navy text-sm uppercase tracking-wider bg-gold hover:bg-[#e0b84a] active:bg-[#c9a030] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-gold/20">
              {loading ? <><Loader2 size={16} className="animate-spin" />{a.submitting}</> : a.submit}
            </button>
          </form>

          <p className="text-center text-white/20 text-xs mt-8">
            © {new Date().getFullYear()} Iskandar Home
          </p>
        </div>
      </div>
    </div>
  );
}
