"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, MapPin, X } from "lucide-react";

interface DestinationCardProps {
  title: string;
  summary: string;
  description: string;
  district: string;
  imageUrl: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
}

export function DestinationCard({ title, summary, description, district, imageUrl, ctaLabel, ctaUrl }: DestinationCardProps) {
  const [open, setOpen] = useState(false);
  const modal = open && typeof document !== "undefined" ? createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div role="dialog" aria-modal="true" aria-label={`Detail ${title}`} className="max-h-[90vh] w-full overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:max-w-2xl sm:rounded-[2rem]">
        <div className="relative aspect-[16/9] overflow-hidden bg-zinc-100"><div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} /><div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" /><button type="button" onClick={() => setOpen(false)} aria-label="Tutup detail" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md"><X className="h-5 w-5" /></button><div className="absolute inset-x-0 bottom-0 p-6 text-white"><p className="flex items-center gap-1.5 text-xs font-bold text-emerald-200"><MapPin className="h-4 w-4" />Kecamatan {district}</p><h3 className="mt-2 text-2xl font-black sm:text-3xl">{title}</h3></div></div>
        <div className="p-6 sm:p-8"><p className="whitespace-pre-line text-sm leading-7 text-zinc-600 sm:text-base">{description || summary}</p>{ctaLabel && ctaUrl && <a href={ctaUrl} target={ctaUrl.startsWith("http") ? "_blank" : undefined} rel={ctaUrl.startsWith("http") ? "noreferrer" : undefined} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3.5 text-sm font-black text-white transition hover:bg-emerald-800">{ctaLabel}<ArrowRight className="h-4 w-4" /></a>}</div>
      </div>
    </div>,
    document.body,
  ) : null;

  return <>
    <article className="group flex h-full w-[82vw] max-w-[340px] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:w-auto sm:max-w-none">
      <div className="aspect-[4/3] shrink-0 overflow-hidden bg-zinc-100"><div className="h-full w-full bg-cover bg-center transition duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${imageUrl})` }} /></div>
      <div className="relative flex flex-1 flex-col bg-white p-5"><p className="flex items-center gap-1 text-xs font-bold text-emerald-700"><MapPin className="h-3.5 w-3.5" />Kecamatan {district}</p><h4 className="mt-2 text-xl font-black text-zinc-950">{title}</h4><p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-500">{summary}</p><button type="button" onClick={() => setOpen(true)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700">Lihat Detail<ArrowRight className="h-4 w-4" /></button></div>
    </article>
    {modal}
  </>;
}
