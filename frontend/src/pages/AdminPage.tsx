import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { CarDetails } from '../types/car';
import { Shield, Check, X, Clock, Eye, AlertCircle, Phone, Mail, User } from 'lucide-react';
import { resolveImageUrl } from '../utils/imageUrl';

export const AdminPage: React.FC = () => {
  const [pendingCars, setPendingCars] = useState<CarDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<CarDetails | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPending = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingCars();
      setPendingCars(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await adminService.approveCar(id);
      setPendingCars((prev) => prev.filter((c) => c.id !== id));
      if (selectedCar?.id === id) setSelectedCar(null);
    } catch (err) {
      alert('Помилка при схваленні');
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenReject = (car: CarDetails) => {
    setSelectedCar(car);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedCar || !rejectReason.trim()) return;

    try {
      setProcessingId(selectedCar.id);
      await adminService.rejectCar(selectedCar.id, rejectReason.trim());
      setPendingCars((prev) => prev.filter((c) => c.id !== selectedCar.id));
      setRejectModalOpen(false);
      setSelectedCar(null);
    } catch (err) {
      alert('Помилка при відхиленні');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-darkbg-700">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Панель модерації зображень та авто
            </h1>
            <p className="text-sm text-slate-500">
              Очікують перевірки: <strong className="text-amber-600">{pendingCars.length}</strong>
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-48 rounded-3xl bg-slate-100 dark:bg-darkbg-800 animate-pulse" />
          ))}
        </div>
      ) : pendingCars.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {pendingCars.map((car) => (
            <div
              key={car.id}
              className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 border border-slate-200/80 dark:border-darkbg-700 shadow-sm flex flex-col lg:flex-row gap-6 items-start justify-between"
            >
              {/* Images preview reel */}
              <div className="w-full lg:w-96 flex-shrink-0 space-y-2">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700">
                  <img
                    src={resolveImageUrl(car.images[0]?.imageUrl)}
                    alt={car.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-amber-500/90 text-white text-[11px] font-semibold flex items-center gap-1 backdrop-blur-md">
                    <Clock className="w-3 h-3" /> На перевірці
                  </span>
                </div>

                {/* Additional photos thumbnails */}
                {car.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {car.images.map((img) => (
                      <div key={img.id} className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 dark:border-darkbg-700">
                        <img src={resolveImageUrl(img.imageUrl)} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      {car.brand} {car.model} ({car.year})
                    </span>
                    <span className="text-lg font-extrabold text-sage-600 dark:text-sage-400">
                      ${car.price.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-500 mt-0.5">{car.title}</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-darkbg-700">
                    <span className="text-slate-400 block">Пробіг:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{car.mileage.toLocaleString()} км</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-darkbg-700">
                    <span className="text-slate-400 block">Місто:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{car.city}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-darkbg-700">
                    <span className="text-slate-400 block">Двигун:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{car.engineCapacity} л</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-darkbg-700">
                    <span className="text-slate-400 block">Фото:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{car.images.length} шт.</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 bg-slate-50 dark:bg-darkbg-700/50 p-3 rounded-2xl">
                  {car.description}
                </p>

                {/* Seller info */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-darkbg-700">
                  <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                    <User className="w-3.5 h-3.5 text-sage-600" /> {car.seller.fullName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {car.seller.email}
                  </span>
                  {car.seller.phoneNumber && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {car.seller.phoneNumber}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="w-full lg:w-44 flex-shrink-0 flex flex-col gap-2.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-darkbg-700">
                <button
                  disabled={processingId === car.id}
                  onClick={() => handleApprove(car.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Схвалити
                </button>

                <button
                  disabled={processingId === car.id}
                  onClick={() => handleOpenReject(car)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 dark:text-rose-400 text-xs font-bold transition-all disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Відхилити
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-darkbg-800 rounded-3xl border border-dashed border-slate-200 dark:border-darkbg-700 p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-darkbg-700 text-emerald-500 mx-auto flex items-center justify-center">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Черга модерації порожня!</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Усі додані оголошення та фотографії перевірені та опубліковані.
          </p>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-darkbg-800 rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-darkbg-700 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Відхилити оголошення
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Вкажіть причину відхилення для користувача (наприклад: «Неякісні фото», «Некоректний VIN», «Заборонений контент»).
            </p>

            <textarea
              rows={4}
              placeholder="Причина відхилення..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Скасувати
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim() || processingId === selectedCar.id}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                Підтвердити відхилення
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
