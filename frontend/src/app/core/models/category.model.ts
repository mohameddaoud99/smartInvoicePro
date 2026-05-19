export interface CategoryDTO {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  parentName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryRequestDTO {
  name: string;
  description?: string;
  parentId?: number;
}
