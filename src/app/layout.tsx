import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Link from "next/link";
import { Menu, User } from "lucide-react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Project Salma | Moroccan Modest Fashion Marketplace",
  description:
    "Discover authentic abayas, hijabs, khimars, and modest accessories from independent Moroccan creators.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/85 backdrop-blur-md">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center">
              <span className="font-serif text-2xl font-bold tracking-tight text-brand-primary">
                Project Salma
              </span>
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              <Link
                href="/products"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-brand-primary"
              >
                Shop All
              </Link>
              <Link
                href="/categories"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-brand-primary"
              >
                Categories
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-brand-primary hover:text-brand-primary"
              >
                <User size={16} />
                <span className="hidden sm:inline">Seller Portal</span>
              </Link>

              <button
                type="button"
                aria-label="Open menu"
                className="rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
              >
                <Menu size={20} />
              </button>
            </div>
          </nav>
        </header>

        <main className="flex-grow">{children}</main>

        <footer className="mt-20 border-t border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
              <div className="md:col-span-2">
                <h3 className="font-serif text-xl font-bold text-brand-primary">
                  Project Salma
                </h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-500">
                  A curated Moroccan marketplace for modest fashion and Islamic
                  lifestyle products, built to support independent sellers.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Marketplace
                </h4>
                <ul className="mt-4 space-y-3 text-sm text-gray-500">
                  <li>
                    <Link href="/products" className="hover:text-brand-primary">
                      All Products
                    </Link>
                  </li>
                  <li>
                    <Link href="/categories" className="hover:text-brand-primary">
                      Categories
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  For Sellers
                </h4>
                <ul className="mt-4 space-y-3 text-sm text-gray-500">
                  <li>
                    <Link href="/register" className="hover:text-brand-primary">
                      Start Selling
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="hover:text-brand-primary">
                      Seller Login
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 border-t border-gray-100 pt-8 text-center text-xs text-gray-400">
              © 2026 Project Salma. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
