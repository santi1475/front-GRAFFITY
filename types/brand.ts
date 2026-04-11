export interface Brand {
  id: number;
  name: string;
  image: string | null;
  icon_name: string | null;
  is_active: boolean;
  is_deleted: boolean;
}

export interface BrandResponse {
  total: number;
  paginate: number;
  brands: Brand[];
}

export interface BrandMutationResponse {
    code: number;
    message: string;
    brand?: Brand;
}
