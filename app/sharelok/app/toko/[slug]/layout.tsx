import type { Metadata } from "next";

import { getMerchants } from "@/lib/sharelok-db";
import { absoluteUrl } from "@/lib/site-url";

type MerchantLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

async function findMerchant(slug: string) {
  return (await getMerchants()).find((merchant) => merchant.slug === slug && merchant.isActive) || null;
}

export async function generateMetadata({ params }: MerchantLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const merchant = await findMerchant(slug);
  if (!merchant) return { title: "Toko tidak ditemukan", robots: { index: false, follow: false } };
  const description = merchant.description || `Lihat menu dan pesan makanan dari ${merchant.name} melalui Sharelok.`;
  const canonicalPath = `/sharelok/app/toko/${merchant.slug}`;
  return {
    title: `${merchant.name} — Menu dan Pesan Online`,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "website",
      url: canonicalPath,
      title: `${merchant.name} di Sharelok`,
      description,
      images: merchant.imageUrl ? [{ url: merchant.imageUrl, alt: merchant.name }] : [{ url: "/images/hero.jpg", alt: merchant.name }],
    },
  };
}

export default async function MerchantLayout({ children, params }: MerchantLayoutProps) {
  const { slug } = await params;
  const merchant = await findMerchant(slug);
  const structuredData = merchant ? {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": absoluteUrl(`/sharelok/app/toko/${merchant.slug}#restaurant`),
    name: merchant.name,
    description: merchant.description || undefined,
    image: merchant.imageUrl || absoluteUrl("/images/hero.jpg"),
    url: absoluteUrl(`/sharelok/app/toko/${merchant.slug}`),
    telephone: merchant.phone || merchant.whatsapp || undefined,
    address: merchant.address ? { "@type": "PostalAddress", streetAddress: merchant.address, addressLocality: merchant.area?.name, addressRegion: "Jawa Barat", addressCountry: "ID" } : undefined,
    areaServed: merchant.area?.name || "Kabupaten Subang",
  } : null;
  return <>{structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />}{children}</>;
}
