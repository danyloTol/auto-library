import React, { useEffect, useState } from 'react';
import { favoriteService } from '../services/favoriteService';
import { CarSummary } from '../types/car';
import { CarCard } from '../components/CarCard';
import { Heart, Car as CarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<CarSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoriteService.getFavorites();
      setFavorites(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleFavoriteToggle = (carId: string, isFav: boolean) => {
    if (!isFav) {
      setFavorites((prev) => prev.filter((c) => c.id !== carId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-500">
          <Heart className="w-6 h-6 fill-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Обрані автомобілі
          </h1>
          <p className="text-sm text-slate-500">
            Збережені пропозиції ({favorites.length})
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-slate-200 dark:bg-darkbg-800 animate-pulse" />
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {favorites.map((car) => (
            <CarCard key={car.id} car={car} onFavoriteToggle={handleFavoriteToggle} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-darkbg-800 rounded-3xl border border-dashed border-slate-200 dark:border-darkbg-700 p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-darkbg-700 text-rose-400 mx-auto flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">У вас поки немає обраних авто</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Натискайте на сердечко на картках автомобілів, щоб зберегти їх тут.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-sm font-semibold transition-colors"
          >
            <CarIcon className="w-4 h-4" />
            Перейти в каталог
          </Link>
        </div>
      )}
    </div>
  );
};
