"use client";

import { useState } from "react";
import Image from "next/image";

type ProductGalleryProps = {
  images: string[];
  name: string;
  badgeLabel?: string;
};

export function ProductGallery({ images, name, badgeLabel }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="w-full lg:w-[65%] flex flex-col md:flex-row gap-md md:sticky md:top-28">
      {/* Vertical thumbnails */}
      <div className="flex md:flex-col gap-sm overflow-x-auto no-scrollbar md:w-20 order-2 md:order-1">
        {images.map((image, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={image + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Xem góc ảnh ${index + 1}`}
              aria-pressed={isActive}
              className={`relative w-16 md:w-full aspect-square bg-white rounded-lg border overflow-hidden transition-all duration-300 ease-premium p-1 flex-shrink-0 ${
                isActive
                  ? "border-2 border-primary opacity-100 shadow-sm"
                  : "border-surface-container-highest opacity-60 hover:opacity-100 hover:border-primary"
              }`}
            >
              <Image
                src={image}
                alt={`${name} - góc ${index + 1}`}
                fill
                unoptimized={image.startsWith("blob:")}
                sizes="80px"
                className="object-contain"
              />
            </button>
          );
        })}
      </div>

      {/* Main display */}
      <div className="relative flex-1 aspect-square bg-white rounded-2xl overflow-hidden premium-shadow flex items-center justify-center order-1 md:order-2 border border-surface-container-highest/50">
        <Image
          key={activeImage}
          src={activeImage}
          alt={name}
          fill
          priority
          unoptimized={activeImage.startsWith("blob:")}
          sizes="(min-width: 1024px) 65vw, 100vw"
          className="object-contain p-lg animate-fade-in"
        />
        {badgeLabel && (
          <span className="absolute top-6 right-6 bg-primary text-on-primary px-4 py-2 font-label-md text-label-md rounded-full uppercase tracking-wider shadow-lg">
            {badgeLabel}
          </span>
        )}
      </div>
    </div>
  );
}
