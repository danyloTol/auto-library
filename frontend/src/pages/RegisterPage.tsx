import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Car, Lock, Mail, User, Phone, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const res = await authService.register({
        fullName,
        email,
        phoneNumber,
        password,
      });
      login(res.token, res.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.Message || 'Помилка при реєстрації. Перевірте дані.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-darkbg-800 rounded-3xl p-8 border border-slate-200/80 dark:border-darkbg-700 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sage-500 text-white flex items-center justify-center mx-auto shadow-md shadow-sage-500/20">
            <Car className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Створення акаунту
          </h2>
          <p className="text-xs text-slate-500">
            Приєднуйтесь до спільноти автолюбителів AutoLibrary
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
              Ім'я та прізвище *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Іван Петренко"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email *
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
              Номер телефону (для покупців)
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="+380..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Пароль *
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Мінімум 6 символів"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
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
            {loading ? 'Реєстрація...' : 'Зареєструватися'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Вже маєте акаунт?{' '}
          <Link to="/login" className="text-sage-600 dark:text-sage-400 font-semibold hover:underline">
            Увійти
          </Link>
        </div>
      </div>
    </div>
  );
};
