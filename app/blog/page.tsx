import Link from "next/link";

import { Navbar } from "@/components/navbar";
import { getAllBlogPosts } from "@/lib/blog";

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-3 py-12 sm:px-4">
        <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">Blog Jelajah Subang</h1>
        <p className="mt-3 text-zinc-600">Kumpulan artikel wisata, kuliner, dan tips perjalanan di Subang.</p>

        <section className="mt-10 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {posts.length === 0 ? (
            <p className="rounded-xl border border-zinc-200 bg-white p-6 text-zinc-600">
              Belum ada artikel yang dipublikasikan.
            </p>
          ) : (
            posts.map((post) => (
              <article key={post.slug} className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                  <span>{post.date}</span>
                  <span>-</span>
                  <span>{post.author}</span>
                </div>
                <h2 className="mt-2 text-xl font-semibold text-black">{post.title}</h2>
                <p className="mt-2 text-zinc-600">{post.excerpt}</p>
                <div className="mt-auto pt-4">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link href={`/blog/${post.slug}`} className="mt-2 inline-block text-sm font-medium text-black">
                    Baca selengkapnya
                  </Link>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
