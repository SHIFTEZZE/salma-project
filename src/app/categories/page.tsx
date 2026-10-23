import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { getActiveCategories } from "@/lib/actions/categories";

async function CategoryGrid() {
  await connection();
  const categories = await getActiveCategories();

  if (categories.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 bg-white/60 px-6 py-20 text-center">
        <p className="text-sm text-gray-500">No categories available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/products?category=${category.slug}`}
          className="card-premium group block overflow-hidden"
        >
          <div className="aspect-[16/9] image-placeholder" />
          <div className="p-6">
            <h2 className="font-serif text-2xl text-gray-900 transition-colors group-hover:text-brand-primary">
              {category.name}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Explore products in this category →
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <span className="badge-soft">Browse by Category</span>
        <h1 className="mt-4 font-serif text-4xl font-bold text-gray-900">
          Modest Fashion Categories
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-500">
          Find abayas, hijabs, khimars, niqabs, jilbabs, and accessories from
          trusted independent sellers.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="card-premium overflow-hidden">
                <div className="aspect-[16/9] animate-pulse bg-gray-200" />
                <div className="p-6">
                  <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        <CategoryGrid />
      </Suspense>
    </div>
  );
}
