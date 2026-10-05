import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, MessageCircle, Newspaper, UserRound } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Footer from "@/components/footer";
import { ArticleViewCounter } from "@/components/article-view-counter";
import { Navbar } from "@/components/navbar";
import { getManagedBlogPosts, getManagedBlogPostBySlug } from "@/lib/blog";
import { absoluteUrl } from "@/lib/site-url";

type BlogDetailPageProps = { params: Promise<{ slug: string }> };

const formatDate = (date: string) => new Date(date).toLocaleDateString("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export async function generateStaticParams() {
  return (await getManagedBlogPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getManagedBlogPostBySlug(slug);
  if (!post) return { title: "Artikel tidak ditemukan" };
  const canonicalPath = `/blog/${post.slug}`;
  const description = post.excerpt.slice(0, 160);
  const images = [{
    url: post.imageUrl || "/images/hero.jpg",
    alt: post.title,
  }];
  return {
    title: post.title,
    description,
    keywords: [...post.tags, "Jelajah Subang", "artikel Subang", "wisata Subang"],
    authors: [{ name: post.author }],
    category: "Artikel dan perjalanan",
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "article",
      locale: "id_ID",
      siteName: "Jelajah Subang",
      url: canonicalPath,
      title: post.title,
      description,
      publishedTime: new Date(post.date).toISOString(),
      authors: [post.author],
      tags: post.tags,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images,
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const [post, posts] = await Promise.all([
    getManagedBlogPostBySlug(slug),
    getManagedBlogPosts(),
  ]);

  if (!post) notFound();

  const relatedPosts = posts
    .filter((item) => item.slug !== post.slug)
    .sort((a, b) => b.viewCount - a.viewCount || b.date.localeCompare(a.date))
    .slice(0, 5);
  const articleContent = post.content.replace(/^#\s+.*(?:\r?\n)+/, "");
  const readingMinutes = Math.max(1, Math.ceil(articleContent.split(/\s+/).filter(Boolean).length / 200));
  const articleUrl = absoluteUrl(`/blog/${post.slug}`);
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`Baca artikel menarik dari Jelajah Subang:\n\n*${post.title}*\n${articleUrl}`)}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: [post.imageUrl || absoluteUrl("/images/hero.jpg")],
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.date).toISOString(),
    inLanguage: "id-ID",
    mainEntityOfPage: articleUrl,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Jelajah Subang",
      logo: { "@type": "ImageObject", url: absoluteUrl("/images/logo.PNG") },
    },
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/ReadAction",
      userInteractionCount: post.viewCount,
    },
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f7f8f4]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <Navbar />
      <main>
        <header className="border-b border-zinc-200 bg-white px-4 pb-10 pt-20 sm:px-6 sm:pb-12 sm:pt-24">
          <div className="mx-auto max-w-7xl">
            <nav className="flex flex-wrap items-center gap-2 text-xs font-bold text-zinc-400" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-emerald-700">Beranda</Link><span>/</span>
              <Link href="/blog" className="hover:text-emerald-700">Artikel</Link><span>/</span>
              <span className="max-w-52 truncate text-zinc-600 sm:max-w-md">{post.title}</span>
            </nav>
            <div className="mt-8 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white"><Newspaper className="h-3.5 w-3.5" />Jelajah Subang</span>
                {post.tags.slice(0, 2).map((tag) => <span key={tag} className="rounded-full bg-zinc-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">{tag}</span>)}
              </div>
              <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-[-0.035em] text-zinc-950 sm:text-5xl lg:text-6xl">{post.title}</h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-600 sm:text-xl">{post.excerpt}</p>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-zinc-200 pt-5 text-xs font-semibold text-zinc-500">
                <span className="inline-flex items-center gap-1.5"><UserRound className="h-4 w-4 text-emerald-700" />{post.author}</span>
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{formatDate(post.date)}</span>
                <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" />{readingMinutes} menit baca</span>
                <ArticleViewCounter slug={post.slug} initialCount={post.viewCount} />
                <a href={whatsappShareUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3.5 py-2 font-black text-white shadow-sm transition hover:bg-[#20bd5a]"><MessageCircle className="h-4 w-4" />Bagikan ke WhatsApp</a>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-14 lg:px-8">
          <div className="min-w-0">
            {post.imageUrl && <figure className="mb-8 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 shadow-sm sm:rounded-3xl"><div className="aspect-[16/9] bg-cover bg-center" style={{ backgroundImage: `url(${post.imageUrl})` }} /><figcaption className="border-t border-zinc-100 bg-white px-4 py-2.5 text-[11px] text-zinc-400">Dokumentasi Jelajah Subang</figcaption></figure>}
            <article className="border-b border-zinc-200 bg-white px-5 py-8 text-[17px] leading-8 text-zinc-700 shadow-sm sm:rounded-3xl sm:border sm:px-10 sm:py-12 lg:px-14">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h2 className="mb-4 mt-10 text-3xl font-black leading-tight tracking-tight text-zinc-950 first:mt-0">{children}</h2>,
                  h2: ({ children }) => <h2 className="mb-4 mt-10 border-l-4 border-emerald-600 pl-4 text-2xl font-black leading-tight tracking-tight text-zinc-950 first:mt-0 sm:text-3xl">{children}</h2>,
                  h3: ({ children }) => <h3 className="mb-3 mt-8 text-xl font-black text-zinc-950">{children}</h3>,
                  p: ({ children }) => <p className="mb-6">{children}</p>,
                  ul: ({ children }) => <ul className="mb-6 list-disc space-y-2 pl-6 marker:text-emerald-600">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-6 list-decimal space-y-2 pl-6 marker:font-bold marker:text-emerald-700">{children}</ol>,
                  li: ({ children }) => <li className="pl-1">{children}</li>,
                  strong: ({ children }) => <strong className="font-black text-zinc-950">{children}</strong>,
                  a: ({ children, href }) => <a href={href} className="font-bold text-emerald-700 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-900">{children}</a>,
                  blockquote: ({ children }) => <blockquote className="my-8 rounded-r-2xl border-l-4 border-emerald-600 bg-emerald-50 px-6 py-5 text-lg font-semibold italic leading-8 text-emerald-950">{children}</blockquote>,
                  hr: () => <hr className="my-10 border-zinc-200" />,
                }}
              >
                {articleContent}
              </ReactMarkdown>
            </article>
            <div className="mt-7 flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
              <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Terus menjelajah</p><p className="mt-1 text-sm font-bold text-zinc-700">Temukan cerita Subang lainnya</p></div>
              <div className="flex shrink-0 items-center gap-2"><a href={whatsappShareUrl} target="_blank" rel="noreferrer" aria-label="Bagikan artikel ke WhatsApp" className="inline-flex items-center justify-center rounded-full bg-[#25D366] p-2.5 text-white hover:bg-[#20bd5a]"><MessageCircle className="h-4 w-4" /></a><Link href="/blog" className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-700"><ArrowLeft className="h-4 w-4" />Semua artikel</Link></div>
            </div>
          </div>

          <aside className="border-t border-zinc-200 pt-8 lg:sticky lg:top-24 lg:border-0 lg:pt-0" aria-label="Artikel lainnya">
            <div className="mb-5 flex items-end justify-between border-b-2 border-zinc-900 pb-3">
              <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Paling banyak dibaca</p><h2 className="mt-1 text-xl font-black text-zinc-950">Artikel populer</h2></div>
              <Link href="/blog" aria-label="Lihat semua artikel" className="rounded-full bg-zinc-100 p-2 text-zinc-700 hover:bg-emerald-100 hover:text-emerald-800"><ArrowRight className="h-4 w-4" /></Link>
            </div>
            {relatedPosts.length > 0 ? <div className="divide-y divide-zinc-200">
              {relatedPosts.map((related, index) => <Link key={related.slug} href={`/blog/${related.slug}`} className="group grid grid-cols-[92px_1fr] gap-3 py-4 first:pt-0">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-emerald-100">
                  {related.imageUrl ? <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${related.imageUrl})` }} /> : <div className="flex h-full items-center justify-center text-2xl font-black text-emerald-700/25">{String(index + 1).padStart(2, "0")}</div>}
                </div>
                <div className="min-w-0 py-0.5"><p className="text-[10px] font-bold text-zinc-400">{formatDate(related.date)} · {related.viewCount.toLocaleString("id-ID")} dibaca</p><h3 className="mt-1 line-clamp-3 text-sm font-black leading-5 text-zinc-900 transition group-hover:text-emerald-700">{related.title}</h3><span className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-emerald-700">Baca artikel<ArrowRight className="h-3 w-3" /></span></div>
              </Link>)}
            </div> : <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">Belum ada artikel lainnya.</div>}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
