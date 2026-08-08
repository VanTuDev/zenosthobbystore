"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { resolveProductVideo } from "@/lib/api/products";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiProductVideo } from "@/lib/api-types";

/**
 * Admin pastes a TikTok/YouTube link and the backend resolves the provider's oEmbed cover image —
 * see POST /products/resolve-video. Rendered on the storefront as a horizontal, link-out-only row
 * (ProductGallery); nothing is embedded or re-hosted here.
 */
export function VideoInputEditor({
  videos,
  onChange,
}: {
  videos: ApiProductVideo[];
  onChange: (videos: ApiProductVideo[]) => void;
}) {
  const [url, setUrl] = useState("");
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setError(null);
    setResolving(true);
    try {
      const { provider, thumbnail } = await resolveProductVideo(trimmed);
      onChange([...videos, { url: trimmed, thumbnail, provider }]);
      setUrl("");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Không thêm được video, vui lòng thử lại.");
    } finally {
      setResolving(false);
    }
  }

  function remove(index: number) {
    onChange(videos.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-xs">
      <div className="flex items-center gap-1">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Dán link TikTok hoặc YouTube..."
          disabled={resolving}
          className="flex-1 bg-white border-none rounded-lg px-sm py-1.5 text-[13px] ring-1 ring-outline-variant focus:ring-2 focus:ring-primary transition-all disabled:opacity-60"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={resolving || !url.trim()}
          className="shrink-0 inline-flex items-center gap-1 px-sm py-1.5 rounded-lg bg-primary/10 text-primary font-label-md text-[12px] font-bold hover:bg-primary/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {resolving ? (
            <Icon name="progress_activity" className="!text-[16px] animate-spin" />
          ) : (
            <Icon name="add_circle" className="!text-[16px]" />
          )}
          Thêm video
        </button>
      </div>

      {error && (
        <p className="flex items-center gap-1 text-error text-[12px]">
          <Icon name="error" className="!text-[14px] shrink-0" />
          {error}
        </p>
      )}

      {videos.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {videos.map((video, index) => (
            <div
              key={`${video.url}-${index}`}
              className="group relative w-20 aspect-square rounded-lg overflow-hidden border border-outline-variant/40 bg-on-surface shrink-0"
            >
              {video.thumbnail ? (
                <Image src={video.thumbnail} alt="" fill unoptimized sizes="80px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/70">
                  <Icon name="play_circle" className="!text-[24px]" />
                </div>
              )}
              <span className="absolute bottom-1 left-1 flex items-center justify-center w-4 h-4 rounded bg-black/60 text-white">
                <Icon name={video.provider === "tiktok" ? "music_note" : "smart_display"} className="!text-[11px]" />
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label="Xóa video"
                className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon name="close" className="!text-[12px]" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="font-body-sm text-[11px] text-on-surface-variant">
        {videos.length} video đã thêm · Hỗ trợ link TikTok và YouTube.
      </p>
    </div>
  );
}
