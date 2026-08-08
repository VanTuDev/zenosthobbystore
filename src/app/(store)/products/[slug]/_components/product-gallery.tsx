"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import type { ProductVideo } from "@/lib/types";

type ProductGalleryProps = {
  images: string[];
  videos: ProductVideo[];
  name: string;
  badgeLabel?: string;
};

const PROVIDER_ICON: Record<ProductVideo["provider"], string> = {
  tiktok: "music_note",
  youtube: "smart_display",
};

export function ProductGallery({ images, videos, name, badgeLabel }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="w-full lg:w-[65%] flex flex-col gap-md lg:sticky lg:top-28">
      <div className="flex gap-sm">
        {/* Vertical image thumbnails — stretches to match the main image's height (flex default
            align-items: stretch), so however many tiles fit that height show before it scrolls;
            no arbitrary magic-number cap. */}
        <div className="flex flex-col gap-sm w-16 sm:w-20 shrink-0 overflow-y-auto scrollbar-thin">
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={image + index}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Xem góc ảnh ${index + 1}`}
                aria-pressed={isActive}
                className={`relative w-full aspect-square bg-white rounded-lg border overflow-hidden transition-all duration-300 ease-premium p-1 shrink-0 ${
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
        <div className="relative flex-1 aspect-square bg-white rounded-2xl overflow-hidden premium-shadow flex items-center justify-center border border-surface-container-highest/50">
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

      {/* Horizontal video row — fills the gallery's own width, so however many tiles fit that width
          show before it scrolls; no arbitrary magic-number cap. Link-out only, nothing embedded. */}
      {videos.length > 0 && (
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">
            Video sản phẩm
          </p>
          <div className="flex gap-sm overflow-x-auto scrollbar-thin w-full pb-1">
            {videos.map((video, index) => (
              <a
                key={video.url + index}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Xem video ${index + 1} (${video.provider})`}
                className="group relative w-16 sm:w-20 aspect-square rounded-lg overflow-hidden border border-surface-container-highest bg-on-surface shrink-0 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                {video.thumbnail ? (
                  <Image
                    src={video.thumbnail}
                    alt=""
                    fill
                    unoptimized
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-on-surface to-black" />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <Icon name="play_circle" filled className="!text-[26px] text-white drop-shadow" />
                </div>
                <span className="absolute bottom-1 left-1 flex items-center justify-center w-4 h-4 rounded bg-black/60 text-white">
                  <Icon name={PROVIDER_ICON[video.provider]} className="!text-[11px]" />
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
