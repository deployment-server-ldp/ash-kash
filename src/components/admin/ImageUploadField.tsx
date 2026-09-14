"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";

const MAX_INLINE_BYTES = 350 * 1024;

export function ImageUploadField({
  name,
  defaultValue,
  label,
  onValueChange,
  storeInline = false,
}: {
  name: string;
  defaultValue?: string | null;
  label?: string;
  onValueChange?: (url: string) => void;
  /**
   * When true, the file is embedded directly into the field as a base64 data URL instead
   * of being uploaded to /public/uploads. Use this for small, critical assets (store logo,
   * favicon) that must survive every redeploy — some hosts don't persist locally-written
   * files across deploys, but a value saved straight into the database always does.
   */
  storeInline?: boolean;
}) {
  const [url, setUrlState] = useState(defaultValue ?? "");
  const setUrl = (value: string) => {
    setUrlState(value);
    onValueChange?.(value);
  };
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      if (storeInline) {
        if (file.size > MAX_INLINE_BYTES) {
          throw new Error(`Image is too large (max ${Math.round(MAX_INLINE_BYTES / 1024)}KB). Please use a smaller file.`);
        }
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Could not read the file."));
          reader.readAsDataURL(file);
        });
        setUrl(dataUrl);
      } else {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed.");
        setUrl(data.url);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {label ? <label className="label">{label}</label> : null}
      <div className="flex items-center gap-3">
        {url ? (
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden border border-stone bg-stone">
            <Image src={url} alt="" fill className="object-cover" />
          </div>
        ) : null}
        {storeInline ? (
          <>
            <input type="hidden" name={name} value={url} />
            <div className="input flex items-center justify-between text-sm text-noir/60">
              <span>{url ? "Image set" : "No image set"}</span>
              {url ? (
                <button type="button" onClick={() => setUrl("")} aria-label="Remove image" className="text-noir/40 hover:text-noir">
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <input name={name} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Image URL, or upload below" className="input" />
        )}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="btn-outline shrink-0 px-3 py-2.5"
        >
          <Upload className="h-4 w-4" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
      {uploading ? <p className="mt-1 text-xs text-noir/50">Uploading…</p> : null}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
