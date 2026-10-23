"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/lib/actions/products";
import { Eye, Edit3, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

export function ProductActions({ productId }: { productId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    
    setDeleting(true);
    try {
      await deleteProduct(productId);
      router.refresh(); 
    } catch (error) {
      alert("Failed to delete product");
      setDeleting(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Link href={`/products/${productId}`} className="p-2 text-gray-400 hover:text-brand-primary transition-colors" title="View Public Page">
        <Eye size={18} />
      </Link>
      <Link href={`/dashboard/products/edit/${productId}`} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
        <Edit3 size={18} />
      </Link>
      <button 
        onClick={handleDelete} 
        disabled={deleting}
        className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50" 
        title="Delete"
      >
        {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
      </button>
    </div>
  );
}
