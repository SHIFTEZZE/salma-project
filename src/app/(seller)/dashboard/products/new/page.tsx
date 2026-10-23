'use client';
import { useState, useEffect } from 'react';
import { createProduct } from '@/lib/actions/products';
import { getMyShop } from '@/lib/actions/shop';
import { useRouter } from 'next/navigation';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { FadeInUp } from '@/components/ui/MotionWrapper';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [shopId, setShopId] = useState<string | null>(null);
  const [variants, setVariants] = useState([{ size: '', color: '', stock: '0', price_adj: '0' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [loadingShop, setLoadingShop] = useState(true);

  useEffect(() => { async function loadShop() { const shop = await getMyShop(); if (shop) setShopId(shop.id); setLoadingShop(false); } loadShop(); }, []);

  const addVariant = () => setVariants([...variants, { size: '', color: '', stock: '0', price_adj: '0' }]);
  const removeVariant = (idx: number) => setVariants(variants.filter((_, i) => i !== idx));
  const updateVariant = (idx: number, field: string, value: string) => { const updated = [...variants]; updated[idx] = { ...updated[idx], [field]: value }; setVariants(updated); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!shopId) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set('variants', JSON.stringify(variants));
    formData.set('images', JSON.stringify(imagePaths));
    try { await createProduct(formData); router.push('/dashboard'); } catch (err: any) { alert(err.message); setIsSubmitting(false); }
  };

  if (loadingShop) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" /></div>;
  if (!shopId) return <div className="mx-auto mt-20 max-w-md text-center"><h2 className="font-serif text-2xl text-gray-900">Shop Required</h2><p className="mt-2 text-gray-600">Please create your shop before adding products.</p><Link href="/dashboard" className="btn-primary mt-6 inline-flex">Go to Dashboard</Link></div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <FadeInUp>
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-primary"><ArrowLeft size={16} /> Back to Dashboard</Link>
        <div className="card-premium p-8">
          <h1 className="font-serif text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="mt-2 text-gray-600">Create a listing for your modest fashion piece.</p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div><label className="label-field">Product Title *</label><input name="title" required className="input-field" placeholder="e.g., Emerald Silk Abaya" /></div>
              <div><label className="label-field">Base Price (MAD) *</label><input name="base_price" type="number" step="0.01" min="0" required className="input-field" placeholder="299.00" /></div>
            </div>
            <div><label className="label-field">Description</label><textarea name="description" className="input-field" rows={4} placeholder="Describe the fabric, fit, occasion..." /></div>
            <div><label className="label-field">Status</label><select name="status" className="input-field"><option value="draft">Draft (Hidden from public)</option><option value="active">Active (Visible when shop is approved)</option></select></div>
            <div className="border-t border-gray-100 pt-8"><ImageUploader shopId={shopId} onUploadComplete={setImagePaths} maxFiles={5} /></div>
            <div className="border-t border-gray-100 pt-8">
              <div className="mb-4 flex items-center justify-between"><label className="label-field mb-0">Variants (Sizes, Colors, Stock)</label><button type="button" onClick={addVariant} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline"><Plus size={16} /> Add Variant</button></div>
              <div className="space-y-3">{variants.map((v, idx) => (<div key={idx} className="grid grid-cols-12 items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3"><input placeholder="Size (M)" value={v.size} onChange={e => updateVariant(idx, 'size', e.target.value)} className="input-field col-span-3 !py-2 text-sm" /><input placeholder="Color" value={v.color} onChange={e => updateVariant(idx, 'color', e.target.value)} className="input-field col-span-3 !py-2 text-sm" /><input placeholder="Stock" type="number" min="0" value={v.stock} onChange={e => updateVariant(idx, 'stock', e.target.value)} className="input-field col-span-2 !py-2 text-sm" /><input placeholder="+ Price" type="number" step="0.01" value={v.price_adj} onChange={e => updateVariant(idx, 'price_adj', e.target.value)} className="input-field col-span-3 !py-2 text-sm" />{variants.length > 1 && <button type="button" onClick={() => removeVariant(idx)} className="col-span-1 flex justify-center text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>}</div>))}</div>
            </div>
            <div className="border-t border-gray-100 pt-8">
              <button type="submit" disabled={isSubmitting || imagePaths.length === 0} className="btn-primary w-full">{isSubmitting ? 'Saving Product...' : 'Save Product'}</button>
              {imagePaths.length === 0 && <p className="mt-3 text-center text-sm text-amber-600">Please upload at least one product image</p>}
            </div>
          </form>
        </div>
      </FadeInUp>
    </div>
  );
}
