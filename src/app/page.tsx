"use client";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07080d] text-white selection:bg-purple-600 selection:text-white">
      {/* Global Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Core Features: Auto-cut, Subtitles, B-Roll, Viral Text */}
      <Features />

      {/* Pricing: 199,000 ₭ monthly, 1,999,000 ₭ yearly, and Video Credit Packs */}
      <Pricing />

      {/* FAQ Accordion */}
      <FAQ />

      {/* Footer */}
      <Footer />
    </main>
  );
}
