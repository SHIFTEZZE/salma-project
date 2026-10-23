"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  shopId: string;
  productId?: string;
  onUploadComplete: (paths: string[]) => void;
  maxFiles?: number;
}

export function ImageUploader({ 
  shopId, 
  productId, 
  onUploadComplete, 
  maxFiles = 5 
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedPaths, setUploadedPaths] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) return "Only JPEG, PNG, and WebP images are allowed";
    if (file.size > 2 * 1024 * 1024) return "Images must be under 2MB";
    return null;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    const newFiles = Array.from(files);

    for (const file of newFiles) {
      const validationError = validateFile(file);
      if (validationError) { setError(validationError); return; }
    }

    if (previews.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const newPaths: string[] = [];
    const newPreviews: string[] = [];

    try {
      for (const file of newFiles) {
        const objectUrl = URL.createObjectURL(file);
        newPreviews.push(objectUrl);

        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const folder = productId ? `products/${productId}` : "products/temp";
        const filePath = `shops/${shopId}/${folder}/${timestamp}_${randomStr}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file, { cacheControl: "3600", upsert: false, contentType: file.type });

        if (uploadError) throw uploadError;
        newPaths.push(filePath);
      }

      setPreviews((prev) => [...prev, ...newPreviews]);
      setUploadedPaths((prev) => [...prev, ...newPaths]);
      onUploadComplete([...uploadedPaths, ...newPaths]);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err.message || "Failed to upload images");
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = async (index: number) => {
    const pathToRemove = uploadedPaths[index];
    const previewToRemove = previews[index];
    URL.revokeObjectURL(previewToRemove);

    if (pathToRemove) {
      const supabase = createClient();
      await supabase.storage.from("product-images").remove([pathToRemove]);
    }

    const newPreviews = previews.filter((_, i) => i !== index);
    const newPaths = uploadedPaths.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    setUploadedPaths(newPaths);
    onUploadComplete(newPaths);
  };

  return (
    <div className="space-y-4">
      <label className="label-field">Product Images (Max {maxFiles})</label>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        <AnimatePresence>
          {previews.map((preview, index) => (
            <motion.div key={preview} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <img src={preview} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
              <button type="button" onClick={() => removeImage(index)} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"><X size={14} /></button>
              {index === 0 && <div className="absolute bottom-1 left-1 rounded bg-brand-primary px-1.5 py-0.5 text-[10px] font-bold text-white">MAIN</div>}
            </motion.div>
          ))}
        </AnimatePresence>
        {previews.length < maxFiles && (
          <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white text-gray-500 transition-colors hover:border-brand-primary hover:text-brand-primary disabled:opacity-50">
            {uploading ? <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <><Upload size={24} className="mb-2" /><span className="text-xs font-medium">Add Photo</span></>}
          </motion.button>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"><AlertCircle size={16} />{error}</motion.div>}
      <p className="text-xs text-gray-500">Supported: JPEG, PNG, WebP • Max 2MB per image • First image is the main photo</p>
    </div>
  );
}
