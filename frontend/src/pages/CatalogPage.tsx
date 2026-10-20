import React, { useEffect, useState } from 'react';
import { carService } from '../services/carService';
import { CarFilters, PaginatedCars } from '../types/car';
import { CarCard } from '../components/CarCard';
import { FilterSidebar } from '../components/FilterSidebar';
import { Car as CarIcon, ChevronLeft, ChevronRight, SlidersHorizontal, Sparkles } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const [filters, setFilters] = useState<CarFilters>({
    pageIndex: 1,
    pageSize: 9,
    sortBy: 'date_desc',
  });
  const [data, setData] = useState<PaginatedCars | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const res = await carService.getCars(filters);
      setData(res);
    } catch (err) {
      console.error('Failed to load cars', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [filters]);

  const handleReset = () => {
    setFilters({
      pageIndex: 1,
      pageSize: 9,
      sortBy: 'date_desc',
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sage-100 via-sage-50 to-transparent dark:from-darkbg-800 dark:via-darkbg-900 dark:to-transparent py-12 md:py-16 border-b border-sage-200/60 dark:border-darkbg-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-200/80 dark:bg-darkbg-700 text-sage-800 dark:text-sage-300 text-xs font-semibold mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
            <span>Перевірені автомобілі від перевірених власників</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Знайдіть ідеальний автомобіль у <span className="text-sage-600 dark:text-sage-400">AutoLibrary</span>
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Зручний каталог, прозора історія, модерація фото адміністратором та прямий чат із продавцем.
          </p>
        </div>
      </section>

      {/* Main catalog view */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile filter toggle */}
          <div className="lg:hidden flex items-center justify-between">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sage-600 text-white text-sm font-medium shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {mobileFilterOpen ? 'Сховати фільтри' : 'Показати фільтри'}
            </button>

            <span className="text-xs text-slate-500 font-medium">
              Знайдено: {data?.totalCount || 0} авто
            </span>
          </div>

          {/* Sidebar */}
          <div className={`w-full lg:w-72 flex-shrink-0 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <FilterSidebar
              filters={filters}
              onFilterChange={(newFilters) => setFilters(newFilters)}
              onReset={handleReset}
            />
          </div>

          {/* Results grid */}
          <div className="flex-1 space-y-6">
            {/* Sorting bar */}
            <div className="bg-white dark:bg-darkbg-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-darkbg-700 flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Знайдено: <strong className="text-slate-900 dark:text-white">{data?.totalCount || 0}</strong> пропозицій
              </span>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">Сортування:</label>
                <select
                  value={filters.sortBy || 'date_desc'}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value, pageIndex: 1 })}
                  className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-500"
                >
                  <option value="date_desc">Найновіші</option>
                  <option value="price_asc">Спочатку дешевші</option>
                  <option value="price_desc">Спочатку дорожчі</option>
                  <option value="year_desc">Рік (спадання)</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="h-80 rounded-2xl bg-slate-200 dark:bg-darkbg-800 animate-pulse border border-slate-200 dark:border-darkbg-700"
                  />
                ))}
              </div>
            ) : data && data.items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.items.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-darkbg-800 rounded-2xl border border-dashed border-slate-300 dark:border-darkbg-700 p-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-sage-100 dark:bg-darkbg-700 text-sage-600 mx-auto flex items-center justify-center">
                  <CarIcon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Автомобілів не знайдено</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Спробуйте змінити фільтри або скинути параметри пошуку для отримання результатів.
                </p>
                <button
                  onClick={handleReset}
                  className="mt-2 px-4 py-2 text-sm font-medium text-white bg-sage-600 hover:bg-sage-700 rounded-xl transition-colors shadow-sm"
                >
                  Скинути всі фільтри
                </button>
              </div>
            )}

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={!data.hasPreviousPage}
                  onClick={() => setFilters({ ...filters, pageIndex: filters.pageIndex! - 1 })}
                  className="p-2 rounded-xl border border-slate-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-darkbg-700 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300 px-3">
                  Сторінка <span className="font-bold text-sage-600 dark:text-sage-400 mx-1">{data.pageIndex}</span> з {data.totalPages}
                </div>

                <button
                  disabled={!data.hasNextPage}
                  onClick={() => setFilters({ ...filters, pageIndex: filters.pageIndex! + 1 })}
                  className="p-2 rounded-xl border border-slate-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-darkbg-700 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
