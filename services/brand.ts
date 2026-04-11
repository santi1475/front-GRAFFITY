import api from './api';
import { Brand, BrandResponse, BrandMutationResponse } from '@/types/brand';

export const brandService = {
  /** GET /api/catalog/brands — Listado paginado */
  getBrands: async (page = 1, search = ''): Promise<BrandResponse> => {
    const { data } = await api.get(`/api/catalog/brands?page=${page}&search=${search}`);
    return data;
  },

  /** GET /api/catalog/brands/:id — Detalle */
  getBrand: async (id: number): Promise<Brand> => {
    const { data } = await api.get(`/api/catalog/brands/${id}`);
    return data;
  },

  /** POST /api/catalog/brands — Crear */
  createBrand: async (brandData: any): Promise<BrandMutationResponse> => {
    const formData = _buildFormData(brandData);
    const { data } = await api.post('/api/catalog/brands', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /** PUT /api/catalog/brands/:id — Reemplazar */
  updateBrand: async (id: number, brandData: any): Promise<BrandMutationResponse> => {
    const formData = _buildFormData(brandData);
    const { data } = await api.put(`/api/catalog/brands/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /** PATCH /api/catalog/brands/:id — Actualización parcial */
  patchBrand: async (id: number, partial: Record<string, any>): Promise<BrandMutationResponse> => {
    const formData = _buildFormData(partial);
    const { data } = await api.patch(`/api/catalog/brands/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /** DELETE /api/catalog/brands/:id — Eliminar */
  deleteBrand: async (id: number): Promise<BrandMutationResponse> => {
    const { data } = await api.delete(`/api/catalog/brands/${id}`);
    return data;
  },
};

/** Helper: Convierte un objeto plano a FormData, filtrando nulls */
function _buildFormData(obj: Record<string, any>): FormData {
  const fd = new FormData();
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value !== null && value !== undefined && value !== 'null') {
      fd.append(key, value);
    }
  });
  return fd;
}