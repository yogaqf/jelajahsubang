import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Navbar } from "@/components/navbar";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

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
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl px-3 py-12 sm:px-4">
        <Link href="/blog" className="text-sm text-zinc-600">
          ← Kembali ke Blog
        </Link>

        <header className="mt-6 border-b border-zinc-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            <span>{post.date}</span>
            <span>-</span>
            <span>{post.author}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600">
                {tag}
              </span>
            ))}
          </div>
        </header>

        <article className="mt-8 space-y-4 text-zinc-700">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => <h1 className="mt-8 text-3xl font-bold text-black first:mt-0">{children}</h1>,
              h2: ({ children }) => <h2 className="mt-7 text-2xl font-semibold text-black">{children}</h2>,
              h3: ({ children }) => <h3 className="mt-6 text-xl font-semibold text-black">{children}</h3>,
              p: ({ children }) => <p className="leading-7">{children}</p>,
              ul: ({ children }) => <ul className="list-disc space-y-2 pl-5">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal space-y-2 pl-5">{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-black">{children}</strong>,
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>
      </main>
    </div>
  );
}
