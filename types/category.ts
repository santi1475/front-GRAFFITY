export interface Category {
  id: number;
  title: string;                    
  image: string | null;
  icon_name: string;                
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;               
  updated_at: string;               
}

export interface CategoryResponse {
  total: number;
  paginate: number;
  categories: Category[];
}

export interface CategoryMutationResponse {
  code: number;
  message: string;
  categorie: Category;              
}