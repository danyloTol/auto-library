import React from 'react';
import { Car, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-sage-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-900 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sage-500 flex items-center justify-center text-white">
            <Car className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Auto<span className="text-sage-600 dark:text-sage-400">Library</span>
          </span>
          <span className="text-xs text-slate-400">© 2026 Всі права захищено</span>
        </div>

        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1">
          Зроблено з <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> для автолюбителів
        </div>
      </div>
    </footer>
  );
};
