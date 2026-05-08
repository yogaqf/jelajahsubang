import React from 'react';
import Link from "next/link";
import { getLatestBlogPosts } from "@/lib/blog";

const BlogTerbaru: React.FC = () => {
      const latestBlogs = getLatestBlogPosts(3);

      return (
            <main className="mx-auto w-full max-w-7xl px-3 py-12 sm:px-4">
                  <header>
                        <h2 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">Blog Terbaru</h2>
                        <p className="mt-3 max-w-2xl text-zinc-600">
                              Temukan cerita menarik, tips perjalanan, dan rekomendasi kuliner terbaru dari Subang.
                        </p>
                  </header>
                  <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {latestBlogs.map((blog) => (
                              <article key={blog.slug} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                                    <Link href={`/blog/${blog.slug}`} className="block">
                                          <h3 className="text-xl font-semibold text-black">{blog.title}</h3>
                                          <p className="mt-2 text-sm text-zinc-600">{blog.excerpt}</p>
                                          <p className="mt-4 text-xs text-zinc-500">{new Date(blog.date).toLocaleDateString()}</p>
                                    </Link>
                              </article>
                        ))}
                  </section>
            </main>
      );
};

export default BlogTerbaru;