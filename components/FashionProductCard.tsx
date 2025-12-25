'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useState } from 'react';

interface FashionProductCardProps {
  id: string;
  imageUrl: string;
  brand: string;
  name: string;
  price: number;
  currency?: string;
  spanCols?: number;
}

export function FashionProductCard({
  id,
  imageUrl,
  brand,
  name,
  price,
  currency = 'USD',
  spanCols = 1,
}: FashionProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);

  return (
    <div
      className={spanCols === 2 ? 'col-span-1 sm:col-span-2 lg:col-span-2' : ''}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${id}`} className="group block no-underline">
        <div className="flex flex-col space-y-3">
          {/* Image Container - Tall aspect ratio (3:4) */}
          <div className="relative w-full aspect-[3/4] overflow-hidden bg-muted">
            <Image
              src={imageUrl}
              alt={`${brand} - ${name}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            
            {/* Quick View Button - Appears on hover */}
            <div
              className={`
                absolute inset-0 flex items-center justify-center
                bg-background/20 backdrop-blur-sm
                transition-all duration-300 ease-out
                ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}
              `}
            >
              <Button
                variant="outline"
                className="rounded-sm border-foreground/20 bg-background/90 backdrop-blur-md text-foreground hover:bg-background hover:border-foreground transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  // Quick view logic would go here
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Quick View
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-light tracking-wider text-muted-foreground uppercase">
              {brand}
            </p>
            <h3 className="text-sm font-light tracking-wide text-foreground group-hover:text-foreground/70 transition-all duration-300">
              {name}
            </h3>
            <p className="text-sm font-light tracking-wide text-foreground">
              {formattedPrice}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}

