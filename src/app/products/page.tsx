import { Suspense } from "react";
import { connection } from "next/server";
import { getPublicProducts } from "@/lib/actions/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { SkeletonProduct } from "@/components/ui/SkeletonProduct";

function humanizeSlug(slug: string) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

async function ProductsContent({ categorySlug }: { categorySlug?: string }) {
  await connection();
  const products = await getPublicProducts(categorySlug);

  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 bg-white/60 px-6 py-20 text-center">
        <h3 className="font-serif text-2xl text-gray-900">No products found</h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">Check back soon as more sellers join Project Salma.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const categorySlug = params.category;
  const title = categorySlug ? humanizeSlug(categorySlug) : "All Products";

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <span className="badge-gradient">Marketplace</span>
        <h1 className="mt-4 font-serif text-4xl font-bold text-gray-900">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-500">Browse modest fashion pieces from independent Moroccan sellers.</p>
      </div>

      <Suspense fallback={<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <SkeletonProduct key={i} />)}</div>}>
        <ProductsContent categorySlug={categorySlug} />
      </Suspense>
    </div>
  );
}
