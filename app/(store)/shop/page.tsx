import {
  StorefrontNavBar,
  StorefrontHero,
  CategoryShowcase,
  FeaturedProducts,
  LookbookBanner,
  StorefrontFooter,
} from '@/components/shop/sections';

export const metadata = {
  title: 'AUREA Store | Luxury Fashion & Lifestyle',
  description: 'Discover timeless elegance at AUREA. Premium luxury fashion, accessories, and lifestyle products.',
};

export default function DemoStorefrontPage() {
  return (
    <div className="min-h-screen bg-[#FDFCF8] dark:bg-[#0D0D0D]">
      <StorefrontNavBar />
      
      <main>
        {/* Hero Section */}
        <StorefrontHero />
        
        {/* Category Showcase */}
        <CategoryShowcase />
        
        {/* Featured Products */}
        <FeaturedProducts limit={8} />
        
        {/* Lookbook Banner */}
        <LookbookBanner />
        
        {/* More Featured Products - New Arrivals */}
        <FeaturedProducts limit={4} />
      </main>
      
      <StorefrontFooter />
    </div>
  );
}


