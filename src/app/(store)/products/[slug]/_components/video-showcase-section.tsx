import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import type { ProductVideo } from "@/lib/types";

const PROVIDER_ICON: Record<ProductVideo["provider"], string> = {
  tiktok: "music_note",
  youtube: "smart_display",
};

/**
 * Every video for the product, laid out as a grid (not the compact scrolling row in
 * ProductGallery) so all of them show at once — anchor target for the "Xem video thực tế" CTA.
 * Link-out only: clicking opens the original TikTok/YouTube page, nothing is embedded here.
 */
export function VideoShowcaseSection({ videos, name }: { videos: ProductVideo[]; name: string }) {
  if (videos.length === 0) return null;

  return (
    <section id="video-san-pham" className="mt-24 scroll-mt-28">
      <Reveal>
        <div className="mb-8">
          <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface">
            Video sản phẩm
          </h2>
          <p className="text-on-surface-variant mt-2">
            Video thực tế trên TikTok &amp; YouTube — bấm để xem trên trang gốc
          </p>
        </div>
      </Reveal>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-md">
        {videos.map((video, index) => (
          <li key={video.url + index}>
            <Reveal delay={(index % 5) * 60}>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Xem video ${name} - video ${index + 1} (${video.provider})`}
                className="group relative block aspect-square rounded-2xl overflow-hidden border border-surface-container-highest bg-on-surface premium-shadow transition-transform duration-300 ease-premium hover:-translate-y-1"
              >
                {video.thumbnail ? (
                  <Image
                    src={video.thumbnail}
                    alt=""
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-on-surface to-black" />
                )}
                <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white/90 text-on-surface shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <Icon name="play_arrow" filled className="!text-[26px]" />
                  </span>
                </div>
                <span className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-white text-[11px] font-bold uppercase">
                  <Icon name={PROVIDER_ICON[video.provider]} className="!text-[13px]" />
                  {video.provider}
                </span>
              </a>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
