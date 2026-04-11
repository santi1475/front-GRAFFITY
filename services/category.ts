import api from './api';
import { CategoryResponse, CategoryMutationResponse } from '@/types/category';

export const categoryService = {
  /** GET /api/catalog/categories — Listado paginado */
  getCategories: async (page = 1, search = ''): Promise<CategoryResponse> => {
    const { data } = await api.get(`/api/catalog/categories?page=${page}&search=${search}`);
    return data;
  },

  /** GET /api/catalog/categories/:id — Detalle */
  getCategory: async (id: number) => {
    const { data } = await api.get(`/api/catalog/categories/${id}`);
    return data;
  },

  /** POST /api/catalog/categories — Crear */
  createCategory: async (categoryData: any): Promise<CategoryMutationResponse> => {
    const formData = _buildFormData(categoryData);
    const { data } = await api.post('/api/catalog/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /** PUT /api/catalog/categories/:id — Reemplazar */
  updateCategory: async (id: number, categoryData: any): Promise<CategoryMutationResponse> => {
    const formData = _buildFormData(categoryData);
    const { data } = await api.put(`/api/catalog/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /** PATCH /api/catalog/categories/:id — Parcial */
  patchCategory: async (id: number, partial: Record<string, any>): Promise<CategoryMutationResponse> => {
    const formData = _buildFormData(partial);
    const { data } = await api.patch(`/api/catalog/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /** DELETE /api/catalog/categories/:id — Eliminar */
  deleteCategory: async (id: number) => {
    const { data } = await api.delete(`/api/catalog/categories/${id}`);
    return data;
  },
};

function _buildFormData(obj: Record<string, any>): FormData {
  const fd = new FormData();
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value !== null && value !== undefined && value !== 'null') {
      fd.append(key, value as string | Blob);
    }
  });
  return fd;
}