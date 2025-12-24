export interface Product {
  id: string;
  name: string;
  category: string | null;
  categorySlug?: string | null;
  description: string;
  inStock: boolean;
  image: string;

  // Solo admin (backend lo devuelve en /admin/products)
  stockQty?: number | null;
}

export interface CartItem extends Product {
  quantity: number;
}
