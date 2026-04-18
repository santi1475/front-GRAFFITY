export interface Product {
  id: number;
  title: string;
  sku: string;
  price_general: string;
  image: string | null;
  state: boolean;
  unidad_medida: string;
  category_id: number | null;
  brand_id: number | null;
  is_deleted: boolean;
}

export interface ProductResponse {
  total: number;
  page: number;
  page_size: number;
  products: Product[];
}

export interface ProductMutationResponse {
  code: number;
  message: string;
  product?: Product;
}

export interface ProductConfigResponse {
  brands: { id: number; name: string }[];
  categories: { id: number; title: string }[];
  next_product_id?: number;
}
