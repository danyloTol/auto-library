import api from './api';
import { Review } from '../types/review';

export const reviewService = {
  async getReviews(carId: string): Promise<Review[]> {
    const response = await api.get<Review[]>(`/reviews/car/${carId}`);
    return response.data;
  },

  async addReview(carId: string, rating: number, comment: string): Promise<Review> {
    const response = await api.post<Review>(`/reviews/car/${carId}`, { rating, comment });
    return response.data;
  },
};
