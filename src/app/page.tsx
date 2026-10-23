import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { getPublicProducts } from "@/lib/actions/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { SkeletonProduct } from "@/components/ui/SkeletonProduct";
import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/ui/MotionWrapper";

async function FeaturedProducts() {
  await connection();
  const products = await getPublicProducts();
  const featured = products.slice(0, 8);

  if (featured.length === 0) {
    return (
      <FadeInUp>
        <div className="rounded-3xl border-2 border-dashed border-brand-secondary/30 bg-white/80 px-8 py-24 text-center backdrop-blur-sm">
          <h3 className="font-serif text-3xl text-gray-900">Marketplace Coming Soon</h3>
          <p className="mx-auto mt-4 max-w-md text-gray-600">
            Independent Moroccan sellers are preparing their collections.
          </p>
          <Link href="/register" className="btn-primary mt-8">
            Become a Seller
          </Link>
        </div>
      </FadeInUp>
    );
  }

  return (
    <StaggerContainer className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {featured.map((product) => (
        <StaggerItem key={product.id}>
          <ProductCard product={product} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="mb-24 text-center">
        <FadeInUp delay={0.1}>
          <span className="badge-gradient mb-6 inline-block">
            ✨ Curated Moroccan Modest Fashion
          </span>
        </FadeInUp>

        <FadeInUp delay={0.2}>
          <h1 className="font-serif text-5xl font-bold leading-tight text-gray-900 md:text-7xl">
            Elegance in Every Thread
            <br />
            <span className="bg-gradient-to-r from-brand-primary via-teal-500 to-brand-secondary bg-clip-text text-transparent">
              Authentic Craftsmanship
            </span>
          </h1>
        </FadeInUp>

        <FadeInUp delay={0.3}>
          <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-gray-600">
            Discover exclusive abayas, khimars, hijabs, and modest accessories from 
            independent designers across Morocco. One marketplace, endless style.
          </p>
        </FadeInUp>

        <FadeInUp delay={0.4}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/products" className="btn-primary w-full sm:w-auto">
              Browse Collection
            </Link>
            <Link href="/register" className="btn-secondary w-full sm:w-auto">
              Sell With Us
            </Link>
          </div>
        </FadeInUp>
      </section>

      <section>
        <FadeInUp>
          <div className="mb-12 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-4xl font-bold text-gray-900">Latest Arrivals</h2>
              <p className="mt-3 text-gray-600">Fresh pieces from approved independent sellers</p>
            </div>
            <Link href="/products" className="hidden text-sm font-bold text-brand-primary hover:underline sm:block">
              View all →
            </Link>
          </div>
        </FadeInUp>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonProduct key={i} />
              ))}
            </div>
          }
        >
          <FeaturedProducts />
        </Suspense>
      </section>
    </div>
  );
}
