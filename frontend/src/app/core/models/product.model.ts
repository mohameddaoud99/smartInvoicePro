export interface ProductDTO {
  id: number;
  libelle: string;
  code: string;
  description?: string;
  tva: number;
  prix: number;
  categoryId?: number;
  categoryName?: string;
  photo1?: string;
  photo2?: string;
  photo3?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductRequestDTO {
  libelle: string;
  code: string;
  description?: string;
  tva: number;
  prix: number;
  categoryId?: number;
  photo1?: File;
  photo2?: File;
  photo3?: File;
}
