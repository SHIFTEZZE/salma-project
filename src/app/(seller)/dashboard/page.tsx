import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { getMyShop } from "@/lib/actions/shop";
import { getSellerProducts } from "@/lib/actions/products";
import { signOut } from "@/lib/actions/auth";
import { formatPrice } from "@/lib/utils";
import { Plus } from "lucide-react";
import { ProductActions } from "@/components/ui/ProductActions"; // <-- Crucial Import

async function DashboardContent() {
  await connection();
  const shop = await getMyShop();
  
  if (!shop) {
    return (
      <div className="mx-auto max-w-2xl mt-10 p-8 bg-white rounded-lg border border-gray-100 text-center">
        <h1 className="text-2xl font-serif mb-4">Set Up Your Shop</h1>
        <p className="text-gray-600 mb-6">You don't have a shop yet. Create one to start selling.</p>
        <Link href="/dashboard/setup" className="btn-primary inline-flex items-center gap-2">
          <Plus size={18} /> Create Shop
        </Link>
      </div>
    );
  }

  const products = await getSellerProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">{shop.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Status: <span className={`font-semibold uppercase ${shop.status === 'approved' ? 'text-green-600' : 'text-orange-600'}`}>{shop.status}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/products/new" className="btn-primary inline-flex items-center gap-2">
            <Plus size={18} /> Add Product
          </Link>
          <form action={signOut}>
            <button className="btn-secondary">Logout</button>
          </form>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card-premium p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Products</p>
          <p className="text-2xl font-bold text-brand-primary">{products.length}</p>
        </div>
        <div className="card-premium p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Active Listings</p>
          <p className="text-2xl font-bold text-green-600">{products.filter(p => p.status === 'active').length}</p>
        </div>
        <div className="card-premium p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Drafts</p>
          <p className="text-2xl font-bold text-gray-400">{products.filter(p => p.status === 'draft').length}</p>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No products yet. <Link href="/dashboard/products/new" className="text-brand-primary hover:underline">Add your first product</Link>.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const totalStock = product.variants.reduce((sum, v) => sum + v.stock_quantity, 0);
                  const mainImage = product.image_urls?.[0];

                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            {mainImage ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={mainImage} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-300"><Plus size={16}/></div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{product.title}</p>
                            <p className="text-xs text-gray-500">{product.description?.slice(0, 30)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          product.status === 'active' ? 'bg-green-100 text-green-700' :
                          product.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {formatPrice(product.base_price_cents)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {totalStock} units
                      </td>
                      <td className="px-6 py-4 text-right">
                        {/* USE THE CLIENT COMPONENT HERE */}
                        <ProductActions productId={product.id} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
