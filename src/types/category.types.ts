export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  level: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  children?: Category[];
}
