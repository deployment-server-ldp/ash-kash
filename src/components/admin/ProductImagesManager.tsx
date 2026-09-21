"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import type { ProductImage } from "@prisma/client";
import { ImageUploadField } from "./ImageUploadField";
import { ReorderButtons } from "./ReorderButtons";
import { addProductImage, deleteProductImage, reorderProductImage, setPrimaryImage } from "@/actions/admin/products";

export function ProductImagesManager({ productId, images }: { productId: string; images: ProductImage[] }) {
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {images.map((img, i) => (
          <div key={img.id} className="relative border border-stone p-2">
            <div className="relative aspect-square overflow-hidden bg-stone">
              <Image src={img.url} alt={img.altText ?? ""} fill className="object-cover" />
            </div>
            {img.isPrimary ? (
              <span className="absolute left-3 top-3 bg-noir px-2 py-0.5 text-[10px] uppercase text-ivory">Primary</span>
            ) : null}
            <div className="mt-2 flex items-center justify-between">
              <ReorderButtons
                onMoveUp={reorderProductImage.bind(null, img.id, productId, "up")}
                onMoveDown={reorderProductImage.bind(null, img.id, productId, "down")}
                disableUp={i === 0}
                disableDown={i === images.length - 1}
              />
              <div className="flex gap-2 text-xs">
                {!img.isPrimary ? (
                  <button
                    disabled={pending}
                    onClick={() => startTransition(async () => { await setPrimaryImage(img.id, productId); })}
                    className="underline"
                  >
                    Make Primary
                  </button>
                ) : null}
                <button
                  disabled={pending}
                  onClick={() => startTransition(async () => { await deleteProductImage(img.id, productId); })}
                  className="text-red-600 underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 max-w-md space-y-3 border-t border-stone pt-6">
        <ImageUploadField name="_new_image_url" label="Add New Image" onValueChange={setUrl} />
        <input placeholder="Alt text (for SEO/accessibility)" value={altText} onChange={(e) => setAltText(e.target.value)} className="input" />
        <button
          type="button"
          disabled={pending || !url}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await addProductImage(productId, url, altText);
              if (result.error) {
                setError(result.error);
                return;
              }
              setAltText("");
              setUrl("");
            });
          }}
          className="btn-outline"
        >
          Add Image
        </button>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
