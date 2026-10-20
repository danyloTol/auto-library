import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { carService } from '../services/carService';
import { FuelType, Transmission } from '../types/car';
import { Upload, X, Car as CarIcon, AlertCircle } from 'lucide-react';

export const CreateCarPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    fuelType: FuelType.Petrol,
    transmission: Transmission.Automatic,
    engineCapacity: '2.0',
    city: '',
    description: '',
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

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

  const handleRemoveImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);

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

      const carId = await carService.createCar(payload);

      if (selectedFiles.length > 0) {
        await carService.uploadCarImages(carId, selectedFiles);
      }

      navigate('/my-cars');
    } catch (err: any) {
      setError(err.response?.data?.Message || 'Помилка при створенні оголошення.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white dark:bg-darkbg-800 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-darkbg-700 shadow-sm space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-sage-100 dark:bg-darkbg-700 text-sage-800 dark:text-sage-300 text-xs font-semibold mb-2">
            <CarIcon className="w-4 h-4 text-sage-600 dark:text-sage-400" />
            <span>Нове оголошення</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Розмістити автомобіль на продаж
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Після створення оголошення воно буде відправлено на модерацію адміністратором.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Заголовок оголошення *
            </label>
            <input
              type="text"
              name="title"
              placeholder="наприклад: BMW 3 Series M Sport 2022 у відмінному стані"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          {/* Grid Brand, Model, Year, City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Марка *
              </label>
              <input
                type="text"
                name="brand"
                placeholder="BMW"
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
                placeholder="3 Series"
                value={formData.model}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Рік випуску *
              </label>
              <input
                type="number"
                name="year"
                min="1950"
                max={new Date().getFullYear() + 1}
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
                placeholder="Київ"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
          </div>

          {/* Grid Price, Mileage, Fuel, Transmission, Engine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Ціна ($) *
              </label>
              <input
                type="number"
                name="price"
                placeholder="35000"
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
                placeholder="45000"
                value={formData.mileage}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Об'єм двигуна (л)
              </label>
              <input
                type="number"
                step="0.1"
                name="engineCapacity"
                placeholder="2.0"
                value={formData.engineCapacity}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Паливо *
              </label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              >
                <option value={FuelType.Petrol}>Бензин</option>
                <option value={FuelType.Diesel}>Дизель</option>
                <option value={FuelType.Electric}>Електро</option>
                <option value={FuelType.Hybrid}>Гібрид</option>
                <option value={FuelType.Gas}>Газ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Коробка передач *
              </label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              >
                <option value={Transmission.Automatic}>Автомат</option>
                <option value={Transmission.Manual}>Механіка</option>
              </select>
            </div>
          </div>

          {/* Photos Upload */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Фотографії автомобіля (локальне збереження у backend/wwwroot/uploads)
            </label>

            <div className="border-2 border-dashed border-slate-300 dark:border-darkbg-600 hover:border-sage-500 rounded-2xl p-6 text-center cursor-pointer transition-colors relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-sage-50 dark:bg-darkbg-700 text-sage-600 dark:text-sage-400 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Натисніть або перетягніть фото сюди
                </div>
                <div className="text-xs text-slate-400">
                  Підтримуються JPG, PNG, WEBP (можна вибрати кілька)
                </div>
              </div>
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                {previews.map((src, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200 dark:border-darkbg-600">
                    <img src={src} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] bg-sage-600 text-white font-semibold">
                        Головне
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Детальний опис *
            </label>
            <textarea
              name="description"
              rows={5}
              placeholder="Опишіть стан автомобіля, комплектацію, сервісну історію, особливості..."
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-darkbg-700 border border-slate-200 dark:border-darkbg-600 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          {/* Submit button */}
          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-darkbg-700">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-sm shadow-md shadow-sage-600/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Публікація...' : 'Опублікувати оголошення'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
