import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 rounded-xl transition-colors bg-sage-100 hover:bg-sage-200 dark:bg-darkbg-700 dark:hover:bg-darkbg-600 text-sage-800 dark:text-sage-200"
      title={theme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
      aria-label="Перемикач теми"
    >
      {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-sage-700" />}
    </button>
  );
};
