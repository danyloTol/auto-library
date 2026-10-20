import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { carService } from '../services/carService';
import { FuelType, Transmission } from '../types/car';
import { AlertCircle, Upload, X } from 'lucide-react';

export const EditCarPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: 2020,
    price: '',
    mileage: '',
    fuelType: FuelType.Petrol,
    transmission: Transmission.Automatic,
    engineCapacity: '2.0',
    city: '',
    description: '',
  });

  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetchCar = async () => {
      try {
        setLoading(true);
        const car = await carService.getCarById(id);
        setFormData({
          title: car.title,
          brand: car.brand,
          model: car.model,
          year: car.year,
          price: car.price.toString(),
          mileage: car.mileage.toString(),
          fuelType: car.fuelType,
          transmission: car.transmission,
          engineCapacity: car.engineCapacity.toString(),
          city: car.city,
          description: car.description,
        });
        setExistingImages(car.images);
      } catch (err: any) {
        setError(err.response?.data?.Message || 'Не вдалося завантажити авто');
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArr]);
      const newPreviews = filesArr.map((f) => URL.createObjectURL(f));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        title: formData.title,
        brand: formData.brand,
        model: formData.model,
        year: Number(formData.year),
        price: Number(formData.price),
        mileage: Number(formData.mileage),
        fuelType: Number(formData.fuelType),
        transmission: Number(formData.transmission),
        engineCapacity: Number(formData.engineCapacity) || 0,
        city: formData.city,
        description: formData.description,
      };

      await carService.updateCar(id, payload);

      if (selectedFiles.length > 0) {
        await carService.uploadCarImages(id, selectedFiles);
      }

      navigate(`/cars/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.Message || 'Помилка при оновленні.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-8 h-8 border-4 border-sage-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-darkbg-700 shadow-sm space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Редагувати оголошення
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Зверніть увагу: після зміни критичних даних оголошення повертається на модерацію.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Заголовок *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Марка *
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Модель *
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Рік *
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Місто *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Ціна ($) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Пробіг (км) *
              </label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Об'єм (л)
              </label>
              <input
                type="number"
                step="0.1"
                name="engineCapacity"
                value={formData.engineCapacity}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
          </div>

          {/* Existing images list */}
          {existingImages.length > 0 && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Поточні фото
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative w-24 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-darkbg-600 flex-shrink-0">
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add more photos */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Додати додаткові фото
            </label>
            <div className="border-2 border-dashed border-slate-300 dark:border-darkbg-600 hover:border-sage-500 rounded-2xl p-5 text-center cursor-pointer transition-colors relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300 pointer-events-none">
                <Upload className="w-5 h-5 text-sage-600" />
                <span>Виберіть нові файли для завантаження</span>
              </div>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-3">
                {previews.map((src, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200 dark:border-darkbg-600">
                    <img src={src} alt="new-preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Опис *
            </label>
            <textarea
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-darkbg-700">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-darkbg-600 text-slate-700 dark:text-slate-300 text-sm font-medium"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'Збереження...' : 'Зберегти зміни'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
