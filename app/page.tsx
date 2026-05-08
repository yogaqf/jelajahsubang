import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import BlogTerbaru from "@/components/blogterbaru";
import { KulinerFavorit } from "@/components/kulinerfavorit";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <BlogTerbaru />
      <KulinerFavorit />
      <Footer />
    </div>
  );
}
