"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProduct } from '@/lib/actions/products';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import Link from 'next/link';
import { ProductWithVariants } from '@/types/database';

interface Props {
  initialData: ProductWithVariants;
}

export default function EditProductForm({ initialData }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [variants, setVariants] = useState(
    initialData.variants.map(v => ({
      size: v.size || '',
      color: v.color || '',
      stock: String(v.stock_quantity),
      price_adj: String(v.price_adjustment_cents / 100)
    }))
  );
  
  const [newImagePaths, setNewImagePaths] = useState<string[]>([]);
  const existingStoragePaths = initialData.images?.map(img => img.storage_path) || [];

  const addVariant = () => setVariants([...variants, { size: '', color: '', stock: '0', price_adj: '0' }]);
  const removeVariant = (idx: number) => setVariants(variants.filter((_, i) => i !== idx));
  const updateVariantField = (idx: number, field: string, value: string) => {
    const updated = [...variants];
    updated[idx] = { ...updated[idx], [field]: value };
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    formData.set('productId', initialData.id);
    formData.set('variants', JSON.stringify(variants));
    
    // Combine existing paths + new uploaded paths
    const finalImagePaths = [...existingStoragePaths, ...newImagePaths];
    formData.set('images', JSON.stringify(finalImagePaths));

    try {
      await updateProduct(formData);
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message || "Update failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card-premium p-8">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-primary">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <h1 className="font-serif text-3xl font-bold text-gray-900">Edit Product</h1>
      <p className="mt-2 text-gray-600">Update your listing details.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="label-field">Product Title *</label>
            <input name="title" defaultValue={initialData.title} required className="input-field" />
          </div>
          <div>
            <label className="label-field">Base Price (MAD) *</label>
            <input name="base_price" type="number" step="0.01" min="0" defaultValue={(initialData.base_price_cents / 100).toFixed(2)} required className="input-field" />
          </div>
        </div>

        <div>
          <label className="label-field">Description</label>
          <textarea name="description" defaultValue={initialData.description || ''} className="input-field" rows={4} />
        </div>

        <div>
          <label className="label-field">Status</label>
          <select name="status" defaultValue={initialData.status} className="input-field">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>
        </div>

        {/* Existing Images Display */}
        {initialData.image_urls && initialData.image_urls.length > 0 && (
          <div className="border-t border-gray-100 pt-8">
            <label className="label-field">Current Images</label>
            <div className="grid grid-cols-4 gap-3">
              {initialData.image_urls.map((url, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Uploads */}
        <div className="border-t border-gray-100 pt-8">
          <ImageUploader 
            shopId={initialData.shop_id} 
            productId={initialData.id}
            onUploadComplete={setNewImagePaths} 
            maxFiles={5}
          />
        </div>

        {/* Variants */}
        <div className="border-t border-gray-100 pt-8">
          <div className="mb-4 flex items-center justify-between">
            <label className="label-field mb-0">Variants</label>
            <button type="button" onClick={addVariant} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline">
              <Plus size={16} /> Add Variant
            </button>
          </div>
          
          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div key={idx} className="grid grid-cols-12 items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
                <input placeholder="Size" defaultValue={v.size} onChange={e => updateVariantField(idx, 'size', e.target.value)} className="input-field col-span-3 !py-2 text-sm" />
                <input placeholder="Color" defaultValue={v.color} onChange={e => updateVariantField(idx, 'color', e.target.value)} className="input-field col-span-3 !py-2 text-sm" />
                <input placeholder="Stock" type="number" min="0" defaultValue={v.stock} onChange={e => updateVariantField(idx, 'stock', e.target.value)} className="input-field col-span-2 !py-2 text-sm" />
                <input placeholder="+ Price" type="number" step="0.01" defaultValue={v.price_adj} onChange={e => updateVariantField(idx, 'price_adj', e.target.value)} className="input-field col-span-3 !py-2 text-sm" />
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(idx)} className="col-span-1 flex justify-center text-gray-400 hover:text-red-500">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8">
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
