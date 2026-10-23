export type Profile = { id: string; role: 'seller' | 'admin'; display_name: string | null; phone: string | null; };
export type Shop = { id: string; owner_id: string; name: string; slug: string; description: string | null; status: 'pending' | 'approved' | 'suspended'; };
export type Category = { id: string; name: string; slug: string; };
export type Product = { 
  id: string; 
  shop_id: string; 
  category_id: string | null; 
  title: string; 
  description: string | null; 
  base_price_cents: number; 
  currency: string; 
  status: 'draft' | 'active' | 'archived'; 
  created_at: string; 
};
export type ProductVariant = { id: string; product_id: string; size: string | null; color: string | null; stock_quantity: number; price_adjustment_cents: number; };
export type ProductImage = { storage_path: string; position: number; };
export type ProductWithVariants = Product & { 
  variants: ProductVariant[]; 
  shop: Pick<Shop, 'name' | 'slug' | 'status'>;
  images?: ProductImage[];
  image_urls?: string[];
};
