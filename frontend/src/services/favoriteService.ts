import api from './api';
import { CarSummary } from '../types/car';

export const favoriteService = {
  async getFavorites(): Promise<CarSummary[]> {
    const response = await api.get<CarSummary[]>('/favorites');
    return response.data;
  },

  async toggleFavorite(carId: string): Promise<boolean> {
    const response = await api.post<{ isFavorite: boolean; message: string }>(`/favorites/${carId}/toggle`);
    return response.data.isFavorite;
  },
};
