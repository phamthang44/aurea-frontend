import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { resolveProductSlug, getProductDetailByIdServer } from '@/lib/api/products';
import { ProductDetailClient } from './ProductDetailClient';
import { LuxuryNavBar } from '@/components/layout/LuxuryNavBar';
import { Footer } from '@/components/shop/catalog/Footer';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Regex to extract ID from slug formatted as "name-i.12345"
const ID_REGEX = /-i\.(\d+)$/;

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    // Optimization: Try to extract ID from slug directly (e.g., "ao-thun-i.12345")
    const match = slug.match(ID_REGEX);
    let productId = match ? match[1] : null;

    // Fallback: If no ID in slug, resolve via API (legacy support)
    if (!productId) {
      const resolved = await resolveProductSlug(slug);
      if (!resolved) return notFoundMetadata();
      productId = resolved.productId;
    }

    const result = await getProductDetailByIdServer(productId);
    const product = result.data;
    
    if (!product) return notFoundMetadata();

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
  } catch (error) {
    console.error('Metadata generation error:', error);
    return notFoundMetadata();
  }
}

function notFoundMetadata(): Metadata {
  return {
    title: 'Product Not Found | AUREA',
    description: 'The product you are looking for could not be found.',
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  
  try {
    // Optimization: Try to extract ID from slug directly
    const match = slug.match(ID_REGEX);
    let productId = match ? match[1] : null;

    // Fallback: resolve via API (legacy or URL mismatch)
    if (!productId) {
      const resolved = await resolveProductSlug(slug);
      if (!resolved) notFound();
      productId = resolved.productId;
    }

    // Call only one detail API
    const result = await getProductDetailByIdServer(productId);
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
