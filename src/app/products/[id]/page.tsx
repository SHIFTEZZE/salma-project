import { Suspense } from "react";
import { connection } from "next/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/actions/products";
import { formatPrice } from "@/lib/utils";

async function ProductContent({ id }: { id: string }) {
  await connection();
  const product = await getProductById(id);
  if (!product) notFound();

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock_quantity, 0);
  const hasOptions = product.variants.some((v) => v.size || v.color);
  const images = product.image_urls || [];
  const mainImage = images[0];

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
      <div className="space-y-4">
        {mainImage ? (
          <div className="card-premium relative w-full aspect-[3/4] overflow-hidden bg-gray-100">
            <Image src={mainImage} alt={product.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
          </div>
        ) : (
          <div className="card-premium aspect-[3/4] image-placeholder flex items-center justify-center">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-primary/40">No Image</span>
          </div>
        )}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {images.slice(1).map((url, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-gray-200">
                <Image src={url} alt={`${product.title} ${i + 2}`} fill className="object-cover" sizes="100px" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <Link href={`/sellers/${product.shop.slug}`} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-secondary hover:text-brand-primary">Sold by {product.shop.name}</Link>
        <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-gray-900">{product.title}</h1>
        <p className="mt-6 text-3xl font-semibold text-brand-primary">{formatPrice(product.base_price_cents)}</p>

        <div className="mt-8 border-t border-gray-100 pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Description</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{product.description || "No description provided."}</p>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Availability</h2>
          {totalStock > 0 ? <p className="mt-3 text-sm font-medium text-green-700">In stock — {totalStock} item{totalStock === 1 ? "" : "s"} available</p> : <p className="mt-3 text-sm font-medium text-red-600">Currently out of stock</p>}
          {hasOptions && (
            <div className="mt-5 space-y-3">
              {product.variants.map((v) => (
                <div key={v.id} className="flex items-center justify-between border-b border-gray-100 pb-3 text-sm last:border-0">
                  <span className="text-gray-700">{v.size || "Standard"}{v.color ? ` / ${v.color}` : ""}</span>
                  <span className={v.stock_quantity > 0 ? "font-medium text-green-700" : "font-medium text-red-600"}>{v.stock_quantity > 0 ? `${v.stock_quantity} in stock` : "Sold out"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link href={`/sellers/${product.shop.slug}`} className="btn-primary flex-1">Visit Seller Store</Link>
          <Link href="/products" className="btn-secondary flex-1">Continue Browsing</Link>
        </div>
      </div>
    </div>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-sm text-gray-500">
        <Link href="/products" className="hover:text-brand-primary">Shop All</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Product Details</span>
      </div>

      <Suspense fallback={<div className="grid grid-cols-1 gap-12 lg:grid-cols-2"><div className="aspect-[3/4] skeleton rounded-2xl" /><div className="space-y-4"><div className="h-8 w-1/3 skeleton" /><div className="h-10 w-2/3 skeleton" /><div className="h-6 w-1/4 skeleton" /></div></div>}>
        <ProductContent id={id} />
      </Suspense>
    </div>
  );
}
