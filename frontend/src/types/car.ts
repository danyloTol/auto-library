export enum FuelType {
  Petrol = 1,
  Diesel = 2,
  Electric = 3,
  Hybrid = 4,
  Gas = 5,
}

export enum Transmission {
  Automatic = 1,
  Manual = 2,
}

export enum CarStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
}

export interface CarImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
}

export interface Seller {
  id: string;
  fullName: string;
  phoneNumber?: string;
  email: string;
}

export interface CarSummary {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: FuelType;
  transmission: Transmission;
  city: string;
  primaryImageUrl?: string;
  status: CarStatus;
  rejectionReason?: string;
  favoritesCount: number;
  averageRating: number;
  reviewsCount: number;
  isFavorite: boolean;
  createdAt: string;
}

export interface CarDetails {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: FuelType;
  transmission: Transmission;
  engineCapacity: number;
  description: string;
  city: string;
  status: CarStatus;
  rejectionReason?: string;
  seller: Seller;
  images: CarImage[];
  favoritesCount: number;
  averageRating: number;
  reviewsCount: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginatedCars {
  items: CarSummary[];
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CarFilters {
  search?: string;
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuelType?: FuelType;
  transmission?: Transmission;
  city?: string;
  sortBy?: string;
  pageIndex?: number;
  pageSize?: number;
}
