"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";

export function ImageUploadField({
  name,
  defaultValue,
  label,
  onValueChange,
}: {
  name: string;
  defaultValue?: string | null;
  label?: string;
  onValueChange?: (url: string) => void;
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
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      setUrl(data.url);
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
        <input name={name} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Image URL, or upload below" className="input" />
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
