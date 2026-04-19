import api from "./api";
import type { 
  Product, 
  ProductResponse, 
  ProductMutationResponse, 
  ProductConfigResponse 
} from "@/types/product";

export const productService = {
  getProducts: async (params: {
    search?: string;
    categorie_id?: number | string;
    brand_id?: number | string;
    state?: boolean | string;
    unidad_medida?: string;
    page?: number;
  }): Promise<ProductResponse> => {
    const { data } = await api.get<ProductResponse>("/api/products", { params });
    return data;
  },

  getProductConfig: async (): Promise<ProductConfigResponse> => {
    const { data } = await api.get<ProductConfigResponse>("/api/products/config");
    return data;
  },

  createProduct: async (formData: FormData): Promise<ProductMutationResponse> => {
    const { data } = await api.post<ProductMutationResponse>("/api/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  updateProduct: async (id: number, formData: FormData): Promise<ProductMutationResponse> => {
    const { data } = await api.put<ProductMutationResponse>(`/api/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  deleteProduct: async (id: number): Promise<ProductMutationResponse> => {
    const { data } = await api.delete<ProductMutationResponse>(`/api/products/${id}`);
    return data;
  },

  scanProduct: async (payload: { barcode: string; channel_uuid: string }): Promise<any> => {
    const { data } = await api.post("/api/products/scan", payload);
    return data;
  },
};
