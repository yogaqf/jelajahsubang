"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type ImageUploadFieldProps = {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  label?: string;
  helpText?: string;
};

type SignatureResponse = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
  error?: string;
};

export function ImageUploadField({
  value,
  onChange,
  folder,
  label = "Foto",
  helpText = "JPG, PNG, atau WebP. Maksimal 5 MB.",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setError("");
    if (!acceptedTypes.has(file.type)) {
      setError("Format foto harus JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Ukuran foto maksimal 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const signatureResponse = await fetch("/api/uploads/cloudinary/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });
      const signature = await signatureResponse.json() as SignatureResponse;
      if (!signatureResponse.ok) throw new Error(signature.error || "Gagal menyiapkan unggahan.");

      const payload = new FormData();
      payload.append("file", file);
      payload.append("api_key", signature.apiKey);
      payload.append("timestamp", String(signature.timestamp));
      payload.append("folder", signature.folder);
      payload.append("signature", signature.signature);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/image/upload`,
        { method: "POST", body: payload },
      );
      const uploaded = await uploadResponse.json() as { secure_url?: string; error?: { message?: string } };
      if (!uploadResponse.ok || !uploaded.secure_url) {
        throw new Error(uploaded.error?.message || "Foto gagal diunggah.");
      }
      onChange(uploaded.secure_url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Foto gagal diunggah.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-zinc-700">{label}</p>
          <p className="mt-0.5 text-[10px] font-normal text-zinc-400">{helpText}</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />

      {value ? (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
          <div className="relative aspect-[16/7] min-h-32 w-full overflow-hidden bg-zinc-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt={`Preview ${label.toLowerCase()}`} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-wrap items-center gap-2 p-3">
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              {uploading ? "Mengunggah..." : "Ganti Foto"}
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => { onChange(""); setError(""); }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-[11px] font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />Hapus Foto
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex min-h-32 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-center transition hover:border-emerald-400 hover:bg-emerald-50/50 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-7 w-7 animate-spin text-emerald-600" /> : <ImagePlus className="h-7 w-7 text-emerald-600" />}
          <span className="mt-2 text-xs font-bold text-zinc-700">{uploading ? "Sedang mengunggah..." : "Pilih foto dari perangkat"}</span>
          <span className="mt-1 text-[10px] text-zinc-400">Foto langsung tersimpan ke Cloudinary</span>
        </button>
      )}

      <details className="group">
        <summary className="cursor-pointer list-none text-[10px] font-semibold text-zinc-400 hover:text-zinc-600">Gunakan URL gambar manual</summary>
        <input
          type="url"
          value={value}
          onChange={(event) => { onChange(event.target.value); setError(""); }}
          placeholder="https://..."
          className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs text-zinc-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </details>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">{error}</p>}
    </div>
  );
}
