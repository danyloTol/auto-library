import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { carService } from '../services/carService';
import { favoriteService } from '../services/favoriteService';
import { reviewService } from '../services/reviewService';
import { chatService } from '../services/chatService';
import { CarDetails, FuelType, Transmission } from '../types/car';
import { Review } from '../types/review';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  Star,
  MapPin,
  Gauge,
  Fuel,
  Cog,
  Calendar,
  Phone,
  Mail,
  User,
  MessageSquare,
  Edit,
  Trash2,
  ChevronLeft,
  Send,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { resolveImageUrl } from '../utils/imageUrl';

export const CarDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [car, setCar] = useState<CarDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Actions
  const [isFavorite, setIsFavorite] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        setLoading(true);
        const [carData, reviewsData] = await Promise.all([
          carService.getCarById(id),
          reviewService.getReviews(id),
        ]);
        setCar(carData);
        setReviews(reviewsData);
        setIsFavorite(carData.isFavorite);
      } catch (err: any) {
        setError(err.response?.data?.Message || 'Не вдалося завантажити дані автомобіля.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !car) {
      navigate('/login');
      return;
    }
    try {
      const nextFav = await favoriteService.toggleFavorite(car.id);
      setIsFavorite(nextFav);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!car) return;

    try {
      setStartingChat(true);
      const room = await chatService.getOrCreateRoom(car.id);
      navigate(`/chat?room=${room.id}`);
    } catch (err: any) {
      alert(err.response?.data?.Message || 'Помилка при створенні діалогу');
    } finally {
      setStartingChat(false);
    }
  };

  const handleDelete = async () => {
    if (!car || !window.confirm('Ви впевнені, що бажаєте видалити це оголошення?')) return;
    try {
      await carService.deleteCar(car.id);
      navigate('/');
    } catch (err) {
      alert('Не вдалося видалити авто.');
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car || !comment.trim()) return;

    try {
      setSubmittingReview(true);
      const newReview = await reviewService.addReview(car.id, rating, comment.trim());
      setReviews([newReview, ...reviews]);
      setComment('');
    } catch (err: any) {
      alert(err.response?.data?.Message || 'Помилка при додаванні відгуку.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sage-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Помилка</h2>
        <p className="text-sm text-slate-500">{error || 'Автомобіль не знайдено.'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-sage-600 text-white rounded-xl text-sm font-medium"
        >
          Повернутися в каталог
        </button>
      </div>
    );
  }

  const isOwner = user?.id === car.seller.id;
  const canManage = isOwner || isAdmin;
  const images = car.images.length > 0 ? car.images : [{ id: '1', imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', isPrimary: true }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Owner tools */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-sage-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Назад
        </button>

        {canManage && (
          <div className="flex items-center gap-2">
            <Link
              to={`/cars/${car.id}/edit`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold"
            >
              <Edit className="w-3.5 h-3.5" />
              Редагувати
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Видалити
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Gallery & Description */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Gallery */}
          <div className="bg-white dark:bg-darkbg-800 rounded-3xl p-3 border border-slate-200/80 dark:border-darkbg-700 shadow-sm space-y-3">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 dark:bg-darkbg-900">
              <img
                src={resolveImageUrl(images[activeImageIndex]?.imageUrl)}
                alt={car.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-sage-600 shadow-md scale-95'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={resolveImageUrl(img.imageUrl)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Specs */}
          <div className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 border border-slate-200/80 dark:border-darkbg-700 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Характеристики автомобіля
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-darkbg-700/60">
                  <div className="p-2.5 rounded-xl bg-sage-100 dark:bg-darkbg-600 text-sage-700 dark:text-sage-300">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">Рік випуску</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{car.year}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-darkbg-700/60">
                  <div className="p-2.5 rounded-xl bg-sage-100 dark:bg-darkbg-600 text-sage-700 dark:text-sage-300">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">Пробіг</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{car.mileage.toLocaleString()} км</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-darkbg-700/60">
                  <div className="p-2.5 rounded-xl bg-sage-100 dark:bg-darkbg-600 text-sage-700 dark:text-sage-300">
                    <Fuel className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">Двигун</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {car.fuelType === FuelType.Electric ? 'Електро' : `${car.engineCapacity} л`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-darkbg-700/60">
                  <div className="p-2.5 rounded-xl bg-sage-100 dark:bg-darkbg-600 text-sage-700 dark:text-sage-300">
                    <Cog className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">Трансмісія</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {car.transmission === Transmission.Automatic ? 'Автомат' : 'Механіка'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-darkbg-700/60">
                  <div className="p-2.5 rounded-xl bg-sage-100 dark:bg-darkbg-600 text-sage-700 dark:text-sage-300">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">Місто</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{car.city}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-darkbg-700/60">
                  <div className="p-2.5 rounded-xl bg-sage-100 dark:bg-darkbg-600 text-sage-700 dark:text-sage-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400">Модерація</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Схвалено
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-slate-100 dark:border-darkbg-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Опис від власника</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {car.description}
              </p>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 border border-slate-200/80 dark:border-darkbg-700 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Відгуки та оцінки
                  <span className="text-xs bg-sage-100 dark:bg-darkbg-700 text-sage-700 dark:text-sage-300 px-2 py-0.5 rounded-full font-semibold">
                    {reviews.length}
                  </span>
                </h2>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-800 dark:text-white">
                    {car.averageRating > 0 ? car.averageRating.toFixed(1) : 'Ще немає оцінок'}
                  </span>
                  <span>/ 5.0</span>
                </div>
              </div>
            </div>

            {/* Add Review Form */}
            {isAuthenticated ? (
              <form onSubmit={handleAddReview} className="bg-slate-50 dark:bg-darkbg-700/40 p-4 rounded-2xl border border-slate-200 dark:border-darkbg-600 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ваша оцінка:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={3}
                  placeholder="Напишіть ваші враження про це авто або продавця..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 text-sm rounded-xl bg-white dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 focus:outline-none focus:ring-2 focus:ring-sage-500 text-slate-800 dark:text-white"
                  required
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Опублікувати відгук
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-slate-50 dark:bg-darkbg-700/40 p-4 rounded-2xl text-center text-sm text-slate-500">
                <Link to="/login" className="text-sage-600 dark:text-sage-400 font-semibold underline">
                  Увійдіть
                </Link>
                , щоб залишити відгук.
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl border border-slate-100 dark:border-darkbg-700 bg-slate-50/50 dark:bg-darkbg-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-sage-200 dark:bg-darkbg-600 flex items-center justify-center text-xs font-bold text-sage-800 dark:text-sage-200">
                        {r.userName[0]}
                      </div>
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                        {r.userName}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-darkbg-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {r.comment}
                  </p>
                  <span className="text-[11px] text-slate-400 block">
                    {new Date(r.createdAt).toLocaleDateString('uk-UA')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Seller Box */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 border border-slate-200/80 dark:border-darkbg-700 shadow-sm space-y-6 sticky top-24">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Ціна автомобіля</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-sage-600 dark:text-sage-400 mt-1">
                ${car.price.toLocaleString()}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {!isOwner && (
                <button
                  onClick={handleStartChat}
                  disabled={startingChat}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-semibold shadow-md shadow-sage-600/20 transition-all text-sm"
                >
                  <MessageSquare className="w-5 h-5" />
                  {startingChat ? 'Відкриття чату...' : 'Написати продавцю'}
                </button>
              )}

              <button
                onClick={handleToggleFavorite}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border font-semibold text-sm transition-all ${
                  isFavorite
                    ? 'border-rose-300 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/50'
                    : 'border-slate-200 dark:border-darkbg-700 hover:bg-slate-50 dark:hover:bg-darkbg-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                {isFavorite ? 'В обраному' : 'Додати в обране'}
              </button>
            </div>

            {/* Seller Contact Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-darkbg-700/60 border border-slate-100 dark:border-darkbg-700 space-y-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Інформація про продавця
              </span>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sage-200 dark:bg-darkbg-600 flex items-center justify-center text-sage-800 dark:text-sage-200 font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-800 dark:text-white">
                    {car.seller.fullName}
                  </div>
                  <div className="text-xs text-slate-400">Власник автомобіля</div>
                </div>
              </div>

              {car.seller.phoneNumber && (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200/60 dark:border-darkbg-600">
                  <Phone className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                  <a href={`tel:${car.seller.phoneNumber}`} className="hover:underline">
                    {car.seller.phoneNumber}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <Mail className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                <span>{car.seller.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
