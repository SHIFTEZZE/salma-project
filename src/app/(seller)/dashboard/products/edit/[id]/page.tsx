import { connection } from "next/server";
import { getProductForEditing } from "@/lib/actions/products";
import { notFound } from "next/navigation";
import EditProductForm from "./EditProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  
  const product = await getProductForEditing(id);
  
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <EditProductForm initialData={product} />
    </div>
  );
}
