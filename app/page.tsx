import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import BlogTerbaru from "@/components/blogterbaru";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <BlogTerbaru />
    </div>
  );
}
