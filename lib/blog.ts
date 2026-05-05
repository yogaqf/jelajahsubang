import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  author: string;
  tags: string[];
  published: boolean;
};

export type BlogPostDetail = BlogPost & {
  content: string;
};

function parsePostFromFile(file: string): BlogPostDetail {
  const filePath = path.join(BLOG_DIR, file);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const fallbackSlug = file.replace(/\.mdx$/, "");

  return {
    title: String(data.title ?? fallbackSlug),
    slug: String(data.slug ?? fallbackSlug),
    excerpt: String(data.excerpt ?? ""),
    date: String(data.date ?? ""),
    author: String(data.author ?? "Admin"),
    tags: Array.isArray(data.tags) ? data.tags.map((tag) => String(tag)) : [],
    published: Boolean(data.published ?? true),
    content,
  };
}

export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => parsePostFromFile(file))
    .filter((post) => post.published)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((post) => ({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      date: post.date,
      author: post.author,
      tags: post.tags,
      published: post.published,
    }));
}

export function getBlogPostBySlug(slug: string): BlogPostDetail | null {
  if (!fs.existsSync(BLOG_DIR)) return null;

  const file = fs.readdirSync(BLOG_DIR).find((entry) => entry.endsWith(".mdx") && parsePostFromFile(entry).slug === slug);
  if (!file) return null;

  const post = parsePostFromFile(file);
  if (!post.published) return null;
  return post;
}
