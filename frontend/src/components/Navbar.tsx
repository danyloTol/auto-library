import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Car, Heart, MessageSquare, PlusCircle, Shield, User, LogOut, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-darkbg-900/80 border-b border-sage-200 dark:border-darkbg-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-sage-500 group-hover:bg-sage-600 flex items-center justify-center text-white shadow-md shadow-sage-500/20 transition-all">
              <Car className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Auto<span className="text-sage-600 dark:text-sage-400">Library</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 -mt-1 font-medium">каталог авто</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-sage-600 dark:hover:text-sage-400 transition-colors"
            >
              Каталог
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/favorites"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-sage-600 dark:hover:text-sage-400 flex items-center gap-1.5 transition-colors"
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  Обране
                </Link>
                <Link
                  to="/chat"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-sage-600 dark:hover:text-sage-400 flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                  Повідомлення
                </Link>
                <Link
                  to="/my-cars"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-sage-600 dark:hover:text-sage-400 transition-colors"
                >
                  Мої авто
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Адмінка
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/cars/create"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-sage-600 hover:bg-sage-700 rounded-xl shadow-sm transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  Продати авто
                </Link>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-darkbg-700">
                  <div className="w-8 h-8 rounded-full bg-sage-100 dark:bg-darkbg-700 flex items-center justify-center text-sage-700 dark:text-sage-300">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold max-w-[120px] truncate text-slate-700 dark:text-slate-300">
                    {user?.fullName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    title="Вийти"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-sage-600 dark:hover:text-sage-400 transition-colors"
                >
                  Вхід
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-sage-600 hover:bg-sage-700 rounded-xl shadow-sm transition-colors"
                >
                  Реєстрація
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkbg-800 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-900 px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkbg-800"
          >
            Каталог
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/cars/create"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sage-600 dark:text-sage-400 hover:bg-sage-50 dark:hover:bg-darkbg-800"
              >
                <PlusCircle className="w-4 h-4" />
                Продати авто
              </Link>
              <Link
                to="/favorites"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkbg-800"
              >
                <Heart className="w-4 h-4 text-rose-500" />
                Обране
              </Link>
              <Link
                to="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkbg-800"
              >
                <MessageSquare className="w-4 h-4 text-sage-600" />
                Повідомлення
              </Link>
              <Link
                to="/my-cars"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkbg-800"
              >
                Мої авто
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-darkbg-800"
                >
                  <Shield className="w-4 h-4" />
                  Панель модератора
                </Link>
              )}
              <div className="pt-2 border-t border-slate-200 dark:border-darkbg-700 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{user?.fullName}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm font-medium text-rose-600"
                >
                  <LogOut className="w-4 h-4" />
                  Вийти
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-200 dark:border-darkbg-700 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-sage-300 dark:border-darkbg-700 text-sm font-medium"
              >
                Вхід
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-sage-600 text-white text-sm font-medium"
              >
                Реєстрація
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
