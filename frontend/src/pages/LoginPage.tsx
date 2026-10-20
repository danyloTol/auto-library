import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Car, Lock, Mail, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const res = await authService.login({ email, password });
      login(res.token, res.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.Message || 'Невірний email або пароль.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-darkbg-800 rounded-3xl p-8 border border-slate-200/80 dark:border-darkbg-700 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sage-500 text-white flex items-center justify-center mx-auto shadow-md shadow-sage-500/20">
            <Car className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Вхід в акаунт
          </h2>
          <p className="text-xs text-slate-500">
            Введіть дані або оберіть готовий тестовий акаунт нижче
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Пароль
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-sm shadow-md shadow-sage-600/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>

        {/* Quick Demo Fill Buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-darkbg-700 space-y-2">
          <span className="text-[11px] text-slate-400 font-semibold block text-center uppercase tracking-wider">
            Швидкий тестовий вхід (Демо акаунти в 1 клік)
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@autolib.com', 'Admin123!')}
              className="py-2 px-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors text-left"
            >
              👑 Гол. Адмін
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('moderator@autolib.com', 'Admin123!')}
              className="py-2 px-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors text-left"
            >
              🛡 Модератор
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('user@autolib.com', 'User123!')}
              className="py-2 px-2.5 rounded-xl border border-sage-300 dark:border-darkbg-600 bg-sage-50 dark:bg-darkbg-700 text-sage-800 dark:text-sage-200 text-xs font-semibold hover:bg-sage-100 transition-colors text-left"
            >
              🚗 Продавець
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('buyer@autolib.com', 'Buyer123!')}
              className="py-2 px-2.5 rounded-xl border border-sage-300 dark:border-darkbg-600 bg-sage-50 dark:bg-darkbg-700 text-sage-800 dark:text-sage-200 text-xs font-semibold hover:bg-sage-100 transition-colors text-left"
            >
              🛒 Покупець
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Ще не маєте акаунту?{' '}
          <Link to="/register" className="text-sage-600 dark:text-sage-400 font-semibold hover:underline">
            Зареєструватися
          </Link>
        </div>
      </div>
    </div>
  );
};
