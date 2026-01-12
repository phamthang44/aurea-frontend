"use client";

import { LuxuryNavBar } from "@/components/layout/LuxuryNavBar";
import { Footer } from "@/components/shop/catalog/Footer";
import {
  Hero,
  Features,
  Testimonials,
  CTASection,
} from "@/components/landing";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <LuxuryNavBar />

      {/* Main Content - Add padding-top for fixed navbar */}
      <main className="pt-20">
        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <Features />

        {/* Testimonials Section */}
        <Testimonials />

        {/* CTA Section */}
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
