import { LuxuryNavBar } from '@/components/NavBar/LuxuryNavBar';
import { FashionProductCard } from '@/components/FashionProductCard';
import Image from 'next/image';

// Mock data for demonstration with masonry layout configuration
const newArrivals = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1200&fit=crop',
    brand: 'AUREA',
    name: 'Minimalist Wool Coat',
    price: 1299,
    spanCols: 2, // Spans 2 columns
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&h=1200&fit=crop',
    brand: 'AUREA',
    name: 'Silk Evening Dress',
    price: 1899,
    spanCols: 1,
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1200&fit=crop',
    brand: 'AUREA',
    name: 'Cashmere Sweater',
    price: 899,
    spanCols: 1,
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&h=1200&fit=crop',
    brand: 'AUREA',
    name: 'Tailored Blazer',
    price: 1499,
    spanCols: 2, // Spans 2 columns
  },
  {
    id: '5',
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=1200&fit=crop',
    brand: 'AUREA',
    name: 'Leather Jacket',
    price: 2199,
    spanCols: 1,
  },
  {
    id: '6',
    imageUrl: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&h=1200&fit=crop',
    brand: 'AUREA',
    name: 'Silk Scarf',
    price: 299,
    spanCols: 1,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <LuxuryNavBar />

      {/* Hero Section - Full Viewport Height with Ken Burns Effect */}
      <section className="relative h-[90vh] w-full overflow-hidden">
        {/* Background Image with Ken Burns Effect */}
        <div className="absolute inset-0 z-0">
        <Image
            src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=1920&h=1080&fit=crop"
            alt="Luxury Fashion"
            fill
            className="object-cover ken-burns"
          priority
            sizes="100vw"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-foreground/20" />
        </div>

        {/* Subtle Radial Gradient Overlay - The "Aurea" Glow */}
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 sm:px-8 lg:px-12">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tighter leading-none text-background mb-8">
            AUREA
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl font-light tracking-wider text-background/90 max-w-2xl">
            Where timeless elegance meets modern luxury
          </p>
        </div>
      </section>

      {/* New Arrivals Section - Masonry Grid */}
      <section className="py-24 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-light tracking-[0.05em] mb-4">
              New Arrivals
            </h2>
            <p className="text-sm font-light tracking-wide text-muted-foreground">
              Discover our latest collection
            </p>
          </div>

          {/* Masonry/Asymmetrical Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-max gap-8 lg:gap-12">
            {newArrivals.map((product) => (
              <FashionProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm font-light tracking-wide text-muted-foreground">
              © 2024 AUREA. All rights reserved.
            </p>
            <div className="flex gap-8">
              <a
                href="#"
                className="text-sm font-light tracking-wide text-muted-foreground hover:text-foreground transition-all duration-300 ease-out magnetic-link no-underline"
          >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm font-light tracking-wide text-muted-foreground hover:text-foreground transition-all duration-300 ease-out magnetic-link no-underline"
              >
                Terms
          </a>
          <a
                href="#"
                className="text-sm font-light tracking-wide text-muted-foreground hover:text-foreground transition-all duration-300 ease-out magnetic-link no-underline"
          >
                Contact
          </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
