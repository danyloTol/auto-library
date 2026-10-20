import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { carService } from '../services/carService';
import { CarSummary } from '../types/car';
import { CarCard } from '../components/CarCard';
import { Car as CarIcon, PlusCircle } from 'lucide-react';

export const MyCarsPage: React.FC = () => {
  const [cars, setCars] = useState<CarSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCars = async () => {
    try {
      setLoading(true);
      const data = await carService.getMyCars();
      setCars(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Мої оголошення
          </h1>
          <p className="text-sm text-slate-500">
            Керуйте вашими автомобілями та відстежуйте статус модерації
          </p>
        </div>

        <Link
          to="/cars/create"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-sm font-semibold shadow-md shadow-sage-600/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Додати автомобіль
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-slate-200 dark:bg-darkbg-800 animate-pulse" />
          ))}
        </div>
      ) : cars.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} showStatusBadge={true} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-darkbg-800 rounded-3xl border border-dashed border-slate-200 dark:border-darkbg-700 p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-sage-100 dark:bg-darkbg-700 text-sage-600 mx-auto flex items-center justify-center">
            <CarIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">У вас ще немає доданих авто</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Створіть своє перше оголошення прямо зараз, щоб знайти покупця!
          </p>
          <Link
            to="/cars/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-sm font-semibold transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Створити оголошення
          </Link>
        </div>
      )}
    </div>
  );
};
