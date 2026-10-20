import React from 'react';
import { CarFilters, FuelType, Transmission } from '../types/car';
import { Filter, RotateCcw, Search } from 'lucide-react';

interface FilterSidebarProps {
  filters: CarFilters;
  onFilterChange: (filters: CarFilters) => void;
  onReset: () => void;
}

const BRANDS = [
  'Всі марки',
  'BMW',
  'Audi',
  'Mercedes-Benz',
  'Tesla',
  'Porsche',
  'Toyota',
  'Volkswagen',
  'Volvo',
  'Ford',
  'Hyundai',
  'Kia',
  'Nissan'
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFilterChange, onReset }) => {
  const handleChange = (key: keyof CarFilters, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value === '' ? undefined : value,
      pageIndex: 1, // reset page on filter
    });
  };

  return (
    <aside className="w-full bg-white dark:bg-darkbg-800 rounded-2xl p-5 border border-slate-200/80 dark:border-darkbg-700 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-darkbg-700">
        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <Filter className="w-4 h-4 text-sage-600 dark:text-sage-400" />
          <span>Фільтри авто</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs flex items-center gap-1 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Скинути
        </button>
      </div>

      {/* Search keyword */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Пошук
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Марка, модель, місто..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 focus:outline-none focus:ring-2 focus:ring-sage-500 text-slate-800 dark:text-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Brand select */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Марка
        </label>
        <select
          value={filters.brand || ''}
          onChange={(e) => handleChange('brand', e.target.value === 'Всі марки' ? undefined : e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 focus:outline-none focus:ring-2 focus:ring-sage-500 text-slate-800 dark:text-white"
        >
          {BRANDS.map((b) => (
            <option key={b} value={b === 'Всі марки' ? '' : b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Ціна ($)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Від"
            value={filters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 focus:outline-none focus:ring-2 focus:ring-sage-500 text-slate-800 dark:text-white"
          />
          <input
            type="number"
            placeholder="До"
            value={filters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 focus:outline-none focus:ring-2 focus:ring-sage-500 text-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Year range */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Рік випуску
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Від"
            value={filters.minYear || ''}
            onChange={(e) => handleChange('minYear', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 focus:outline-none focus:ring-2 focus:ring-sage-500 text-slate-800 dark:text-white"
          />
          <input
            type="number"
            placeholder="До"
            value={filters.maxYear || ''}
            onChange={(e) => handleChange('maxYear', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 focus:outline-none focus:ring-2 focus:ring-sage-500 text-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Fuel Type */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Тип палива
        </label>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Всі', value: undefined },
            { label: 'Бензин', value: FuelType.Petrol },
            { label: 'Дизель', value: FuelType.Diesel },
            { label: 'Електро', value: FuelType.Electric },
            { label: 'Гібрид', value: FuelType.Hybrid },
            { label: 'Газ', value: FuelType.Gas },
          ].map((item) => {
            const isSelected = filters.fuelType === item.value;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleChange('fuelType', item.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-sage-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-darkbg-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-darkbg-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transmission */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Коробка передач
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'Всі', value: undefined },
            { label: 'Автомат', value: Transmission.Automatic },
            { label: 'Механіка', value: Transmission.Manual },
          ].map((item) => {
            const isSelected = filters.transmission === item.value;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleChange('transmission', item.value)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-all ${
                  isSelected
                    ? 'bg-sage-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-darkbg-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-darkbg-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
