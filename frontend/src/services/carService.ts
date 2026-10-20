import api from './api';
import { CarDetails, CarFilters, CarImage, CarSummary, PaginatedCars } from '../types/car';

export const carService = {
  async getCars(filters: CarFilters = {}): Promise<PaginatedCars> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.model) params.append('model', filters.model);
    if (filters.minPrice !== undefined && filters.minPrice !== null) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined && filters.maxPrice !== null) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.minYear !== undefined && filters.minYear !== null) params.append('minYear', filters.minYear.toString());
    if (filters.maxYear !== undefined && filters.maxYear !== null) params.append('maxYear', filters.maxYear.toString());
    if (filters.fuelType) params.append('fuelType', filters.fuelType.toString());
    if (filters.transmission) params.append('transmission', filters.transmission.toString());
    if (filters.city) params.append('city', filters.city);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.pageIndex) params.append('pageIndex', filters.pageIndex.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    const response = await api.get<PaginatedCars>(`/cars?${params.toString()}`);
    return response.data;
  },

  async getCarById(id: string): Promise<CarDetails> {
    const response = await api.get<CarDetails>(`/cars/${id}`);
    return response.data;
  },

  async getMyCars(): Promise<CarSummary[]> {
    const response = await api.get<CarSummary[]>('/cars/my');
    return response.data;
  },

  async createCar(data: any): Promise<string> {
    const response = await api.post<string>('/cars', data);
    return response.data;
  },

  async updateCar(id: string, data: any): Promise<void> {
    await api.put(`/cars/${id}`, data);
  },

  async deleteCar(id: string): Promise<void> {
    await api.delete(`/cars/${id}`);
  },

  async uploadCarImages(id: string, files: File[]): Promise<CarImage[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const response = await api.post<CarImage[]>(`/cars/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
