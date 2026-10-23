import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getPublicShopBySlug } from "@/lib/actions/shop";
import { getShopPublicProducts } from "@/lib/actions/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { SkeletonProduct } from "@/components/ui/SkeletonProduct";

async function SellerContent({ slug }: { slug: string }) {
  await connection();

  const shop = await getPublicShopBySlug(slug);

  if (!shop) notFound();

  const products = await getShopPublicProducts(shop.id);

  return (
    <div>
      <section className="card-premium overflow-hidden">
        <div className="h-40 image-placeholder" />
        <div className="p-8">
          <span className="badge-soft">Verified Marketplace Seller</span>
          <h1 className="mt-4 font-serif text-4xl font-bold text-gray-900">
            {shop.name}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-600">
            {shop.description ||
              "This independent seller presents modest fashion pieces through Project Salma."}
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-3xl font-bold text-gray-900">
          Products
        </h2>

        {products.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-gray-200 bg-white/60 px-6 py-20 text-center">
            <p className="text-sm text-gray-500">
              This seller has not published any active products yet.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default async function SellerPage({
  params,
}: {
  params: Promise<{ shopSlug: string }>;
}) {
  const { shopSlug } = await params;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="space-y-10">
            <div className="card-premium overflow-hidden">
              <div className="h-40 animate-pulse bg-gray-200" />
              <div className="space-y-4 p-8">
                <div className="h-8 w-1/3 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonProduct key={index} />
              ))}
            </div>
          </div>
        }
      >
        <SellerContent slug={shopSlug} />
      </Suspense>
    </div>
  );
}
