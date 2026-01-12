import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { resolveProductSlug, getProductDetailByIdServer } from '@/lib/api/products';
import { ProductDetailClient } from './ProductDetailClient';
import { LuxuryNavBar } from '@/components/layout/LuxuryNavBar';
import { Footer } from '@/components/shop/catalog/Footer';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    // Step 1: Resolve slug to productId
    const resolved = await resolveProductSlug(slug);
    
    if (!resolved) {
      return {
        title: 'Product Not Found | AUREA',
        description: 'The product you are looking for could not be found.',
      };
    }

    // Step 2: Get full product by ID
    const result = await getProductDetailByIdServer(resolved.productId);
    const product = result.data;
    
    if (!product) {
      return {
        title: 'Product Not Found | AUREA',
        description: 'The product you are looking for could not be found.',
      };
    }

    const thumbnailImage = product.assets?.find(a => a.isThumbnail)?.url || product.thumbnail;

    return {
      title: `${product.name} | ${product.categoryName || 'AUREA'}`,
      description: product.description?.substring(0, 160) || `Shop ${product.name} at AUREA - Luxury Fashion`,
      openGraph: {
        title: product.name,
        description: product.description?.substring(0, 160),
        images: thumbnailImage ? [{ url: thumbnailImage, alt: product.name }] : [],
        type: 'website',
        url: `/product/${slug}`,
      },
      alternates: {
        canonical: `/product/${slug}`,
      },
    };
  } catch {
    return {
      title: 'Product Not Found | AUREA',
      description: 'The product you are looking for could not be found.',
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  
  try {
    // Step 1: Resolve slug to productId
    const resolved = await resolveProductSlug(slug);
    
    if (!resolved) {
      notFound();
    }

    // Step 2: Get full product details by ID
    const result = await getProductDetailByIdServer(resolved.productId);
    const product = result.data;

    if (!product) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-[#FDFCF8] dark:bg-[#0D0D0D]">
        <LuxuryNavBar />
        
        <main className="pt-20 lg:pt-24">
          <ProductDetailClient product={product} />
        </main>

        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch product:', error);
    notFound();
  }
}
