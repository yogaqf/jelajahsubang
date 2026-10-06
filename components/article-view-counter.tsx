"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

export function ArticleViewCounter({ slug, initialCount }: { slug: string; initialCount: number }) {
  const [viewCount, setViewCount] = useState(initialCount);

  useEffect(() => {
    let active = true;
    fetch(`/api/portal/views/${encodeURIComponent(slug)}`, { method: "POST", cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<{ viewCount?: number }>;
      })
      .then((data) => {
        if (active && typeof data?.viewCount === "number") setViewCount(data.viewCount);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [slug]);

  return <span className="inline-flex items-center gap-1.5" title="Jumlah view artikel"><Eye className="h-4 w-4" />{viewCount.toLocaleString("id-ID")} view</span>;
}
