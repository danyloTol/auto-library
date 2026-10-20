import api from './api';
import { CarDetails } from '../types/car';

export const adminService = {
  async getPendingCars(): Promise<CarDetails[]> {
    const response = await api.get<CarDetails[]>('/admin/pending-cars');
    return response.data;
  },

  async approveCar(id: string): Promise<void> {
    await api.post(`/admin/cars/${id}/approve`);
  },

  async rejectCar(id: string, reason: string): Promise<void> {
    await api.post(`/admin/cars/${id}/reject`, { reason });
  },
};
