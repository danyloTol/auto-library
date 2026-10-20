import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CarSummary, FuelType, Transmission, CarStatus } from '../types/car';
import { favoriteService } from '../services/favoriteService';
import { useAuth } from '../context/AuthContext';
import { Heart, Star, Gauge, Fuel, Cog, MapPin, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { resolveImageUrl } from '../utils/imageUrl';

interface CarCardProps {
  car: CarSummary;
  onFavoriteToggle?: (carId: string, isFav: boolean) => void;
  showStatusBadge?: boolean;
}

const getFuelName = (type: FuelType) => {
  switch (type) {
    case FuelType.Petrol: return 'Бензин';
    case FuelType.Diesel: return 'Дизель';
    case FuelType.Electric: return 'Електро';
    case FuelType.Hybrid: return 'Гібрид';
    case FuelType.Gas: return 'Газ';
    default: return 'Інше';
  }
};

const getTransmissionName = (type: Transmission) => {
  return type === Transmission.Automatic ? 'Автомат' : 'Механіка';
};

export const CarCard: React.FC<CarCardProps> = ({ car, onFavoriteToggle, showStatusBadge = false }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(car.isFavorite);
  const [favCount, setFavCount] = useState(car.favoritesCount);
  const [isLiking, setIsLiking] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || isLiking) return;

    try {
      setIsLiking(true);
      const nextFav = await favoriteService.toggleFavorite(car.id);
      setIsFavorite(nextFav);
      setFavCount((prev) => (nextFav ? prev + 1 : Math.max(0, prev - 1)));
      if (onFavoriteToggle) {
        onFavoriteToggle(car.id, nextFav);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const imageUrl = resolveImageUrl(car.primaryImageUrl);

  return (
    <div className="group relative bg-white dark:bg-darkbg-800 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-darkbg-700 hover:border-sage-400 dark:hover:border-sage-600 transition-all duration-300 hover:shadow-lg hover:shadow-sage-500/10 flex flex-col">
      {/* Image container */}
      <Link to={`/cars/${car.id}`} className="block relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-darkbg-900">
        <img
          src={imageUrl}
          alt={car.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Favorite Button */}
        {isAuthenticated && (
          <button
            onClick={handleToggleFavorite}
            disabled={isLiking}
            className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
              isFavorite
                ? 'bg-rose-500/90 text-white shadow-md shadow-rose-500/20'
                : 'bg-black/30 hover:bg-black/50 text-white'
            }`}
            title={isFavorite ? 'Видалити з обраного' : 'Додати в обране'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Status Badge for My Cars */}
        {showStatusBadge && (
          <div className="absolute top-3 left-3">
            {car.status === CarStatus.Pending && (
              <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/90 text-white backdrop-blur-md">
                <Clock className="w-3.5 h-3.5" /> На модерації
              </span>
            )}
            {car.status === CarStatus.Approved && (
              <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600/90 text-white backdrop-blur-md">
                <CheckCircle className="w-3.5 h-3.5" /> Схвалено
              </span>
            )}
            {car.status === CarStatus.Rejected && (
              <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-600/90 text-white backdrop-blur-md">
                <AlertCircle className="w-3.5 h-3.5" /> Відхилено
              </span>
            )}
          </div>
        )}

        <div className="absolute bottom-2 left-3 flex items-center gap-1 text-xs font-medium text-white/90 drop-shadow">
          <MapPin className="w-3.5 h-3.5 text-sage-300" />
          {car.city}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xl font-bold text-sage-700 dark:text-sage-400">
              ${car.price.toLocaleString()}
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{car.averageRating > 0 ? car.averageRating.toFixed(1) : 'Новий'}</span>
              {car.reviewsCount > 0 && <span className="text-slate-400">({car.reviewsCount})</span>}
            </div>
          </div>

          <Link to={`/cars/${car.id}`} className="mt-1 block">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-sage-600 dark:group-hover:text-sage-400 transition-colors line-clamp-1">
              {car.brand} {car.model} • {car.year}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
              {car.title}
            </p>
          </Link>
        </div>

        {/* Specs pills */}
        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100 dark:border-darkbg-700 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-darkbg-700/50 p-1.5 rounded-lg justify-center">
            <Gauge className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
            <span>{(car.mileage / 1000).toFixed(0)} тис. км</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-darkbg-700/50 p-1.5 rounded-lg justify-center">
            <Fuel className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
            <span>{getFuelName(car.fuelType)}</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-darkbg-700/50 p-1.5 rounded-lg justify-center">
            <Cog className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
            <span>{getTransmissionName(car.transmission)}</span>
          </div>
        </div>

        {/* Rejection reason notice if rejected */}
        {showStatusBadge && car.status === CarStatus.Rejected && car.rejectionReason && (
          <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg border border-rose-200 dark:border-rose-900/50">
            <span className="font-semibold">Причина відхилення:</span> {car.rejectionReason}
          </div>
        )}
      </div>
    </div>
  );
};
