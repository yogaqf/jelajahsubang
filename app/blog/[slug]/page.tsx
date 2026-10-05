import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3, UserRound } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { getManagedBlogPosts, getManagedBlogPostBySlug } from "@/lib/blog";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return (await getManagedBlogPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getManagedBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Artikel tidak ditemukan",
    };
  }

  return {
    title: `${post.title} | Blog Jelajah Subang`,
    description: post.excerpt,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getManagedBlogPostBySlug(slug);

  if (!post) notFound();

  const formattedDate = new Date(post.date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f7f8f4]">
      <Navbar />
      <main>
        <header className="relative overflow-hidden bg-emerald-950 px-4 pb-32 pt-16 text-white sm:px-6 sm:pb-40 sm:pt-20">
          <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-emerald-500/20 blur-[90px]" />
          <div className="relative mx-auto max-w-4xl">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-white/65 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Kembali ke Blog</Link>
            <div className="mt-8 flex flex-wrap gap-2">{post.tags.map((tag) => <span key={tag} className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">{tag}</span>)}</div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.08] tracking-tight sm:text-6xl">{post.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/65 sm:text-lg">{post.excerpt}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-white/55"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{formattedDate}</span><span className="inline-flex items-center gap-1.5"><UserRound className="h-4 w-4" />{post.author}</span><span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" />5 menit baca</span></div>
          </div>
        </header>

        <div className="mx-auto -mt-20 max-w-5xl px-4 pb-20 sm:-mt-28 sm:px-6">
          {post.imageUrl && <div className="relative z-10 aspect-[16/8] overflow-hidden rounded-[2rem] bg-zinc-200 bg-cover bg-center shadow-2xl shadow-zinc-900/20" style={{ backgroundImage: `url(${post.imageUrl})` }}><div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" /></div>}
          <article className={`${post.imageUrl ? "mt-8" : "relative z-10"} space-y-5 rounded-[2rem] border border-zinc-200 bg-white px-6 py-8 text-[15px] leading-8 text-zinc-700 shadow-sm sm:px-12 sm:py-12 sm:text-base`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className="mt-10 text-3xl font-black tracking-tight text-zinc-950 first:mt-0">{children}</h1>,
              h2: ({ children }) => <h2 className="mt-10 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">{children}</h2>,
              h3: ({ children }) => <h3 className="mt-8 text-xl font-black text-zinc-950">{children}</h3>,
              p: ({ children }) => <p>{children}</p>,
              ul: ({ children }) => <ul className="list-disc space-y-2 pl-6 marker:text-emerald-600">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal space-y-2 pl-6 marker:font-bold marker:text-emerald-700">{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              strong: ({ children }) => <strong className="font-bold text-zinc-950">{children}</strong>,
              a: ({ children, href }) => <a href={href} className="font-bold text-emerald-700 underline decoration-emerald-300 underline-offset-4">{children}</a>,
              blockquote: ({ children }) => <blockquote className="rounded-r-2xl border-l-4 border-emerald-500 bg-emerald-50 px-5 py-4 font-medium italic text-emerald-950">{children}</blockquote>,
            }}
          >
            {post.content}
          </ReactMarkdown>
          </article>
          <div className="mt-8 flex justify-center"><Link href="/blog" className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm font-black text-zinc-800 transition hover:border-emerald-600 hover:text-emerald-700"><ArrowLeft className="h-4 w-4" />Lihat artikel lainnya</Link></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
