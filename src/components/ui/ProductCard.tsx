"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { ProductWithVariants } from "@/types/database";

export function ProductCard({ product }: { product: ProductWithVariants }) {
  const lowestAdjustment = product.variants.length > 0
    ? Math.min(...product.variants.map((v) => v.price_adjustment_cents))
    : 0;
  const finalPrice = product.base_price_cents + lowestAdjustment;
  const inStock = product.variants.some((v) => v.stock_quantity > 0);
  const mainImage = product.image_urls?.[0];

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <motion.article
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="card-premium flex h-full flex-col overflow-hidden"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="image-placeholder flex h-full items-center justify-center">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-primary/40">No Image</span>
            </div>
          )}

          {!inStock && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-3 top-3 rounded-full bg-red-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg"
            >
              Sold Out
            </motion.div>
          )}
        </div>

        <div className="flex flex-grow flex-col p-6">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-secondary">
            {product.shop.name}
          </p>
          <h3 className="line-clamp-2 font-serif text-xl leading-snug text-gray-900 transition-colors group-hover:text-brand-primary">
            {product.title}
          </h3>
          <div className="mt-auto flex items-center justify-between pt-6">
            <span className="text-lg font-bold text-brand-primary">{formatPrice(finalPrice)}</span>
            <motion.span whileHover={{ x: 5 }} className="text-sm font-semibold text-brand-secondary">View →</motion.span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
