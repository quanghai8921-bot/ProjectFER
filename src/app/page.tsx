import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/sections/home/hero";
import { Features } from "@/components/sections/home/features";
import { Categories } from "@/components/sections/home/categories";
import { PopularDishes } from "@/components/sections/home/popular-dishes";
import { AISection } from "@/components/sections/home/ai-section";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <Categories />
      <PopularDishes />
      <AISection />
      <Footer />
    </main>
  );
}
