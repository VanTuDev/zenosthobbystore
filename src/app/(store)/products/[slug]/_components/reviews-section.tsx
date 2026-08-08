"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { StarRating } from "@/components/ui/star-rating";
import { textFieldClass } from "@/components/ui/form-field";
import { ImageDropzone, type DraftImage } from "@/components/ui/image-dropzone";
import { ApiRequestError } from "@/lib/api-client";
import { createReview, fetchReviews } from "@/lib/api/reviews";
import { uploadReviewImage } from "@/lib/api/uploads";
import type { ApiReview, PaginationMeta, ReviewsRatingSummary } from "@/lib/api-types";

function timeAgoVn(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Hôm nay";
  if (days === 1) return "1 ngày trước";
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

function WriteReviewForm({ productId, onSubmitted }: { productId: string; onSubmitted: (review: ApiReview) => void }) {
  const { user, openLoginModal } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<DraftImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!user) {
    return (
      <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/15 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <p className="text-on-surface-variant text-[13px]">Đăng nhập để viết đánh giá cho sản phẩm này.</p>
        <Button type="button" size="sm" onClick={openLoginModal}>
          Đăng nhập với Google
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="p-4 bg-primary/5 rounded-xl border border-primary/15 flex items-center gap-2.5 mb-6">
        <Icon name="check_circle" filled className="text-primary !text-[20px]" />
        <p className="text-on-surface text-[13px]">Cảm ơn bạn đã đánh giá sản phẩm!</p>
      </div>
    );
  }

  const isUploadingImages = images.some((img) => img.status === "uploading");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!comment.trim()) {
      setError("Vui lòng nhập nội dung đánh giá.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { review } = await createReview(productId, {
        rating,
        comment: comment.trim(),
        images: images.filter((img) => img.status === "done").map((img) => img.url),
      });
      onSubmitted(review);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Gửi đánh giá thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/15 mb-6 space-y-3"
    >
      <h3 className="text-label-md font-bold text-on-surface">Viết đánh giá của bạn</h3>
      <StarRating value={rating} onChange={setRating} size="md" />
      <div>
        <label htmlFor="review-comment" className="sr-only">
          Nhận xét
        </label>
        <textarea
          id="review-comment"
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
          className={`${textFieldClass} resize-none text-[13px]`}
        />
      </div>
      <ImageDropzone
        images={images}
        onChange={setImages}
        uploadFn={uploadReviewImage}
        maxImages={4}
        tileClassName="w-14 h-14"
        helperLabel="ảnh đánh giá"
      />
      {error && (
        <div className="flex items-start gap-2 p-2.5 bg-error/10 border border-error/15 rounded-lg text-error text-xs">
          <Icon name="error" className="shrink-0 !text-[14px] mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}
      <Button type="submit" size="sm" disabled={submitting || isUploadingImages}>
        {isUploadingImages ? "Đang tải ảnh..." : submitting ? "Đang gửi..." : "Gửi đánh giá"}
      </Button>
    </form>
  );
}

export function ReviewsSection({
  productId,
  initialReviews,
  initialPagination,
  initialSummary,
}: {
  productId: string;
  initialReviews: ApiReview[];
  initialPagination: PaginationMeta;
  initialSummary: ReviewsRatingSummary;
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [pagination, setPagination] = useState(initialPagination);
  const [summary, setSummary] = useState(initialSummary);
  const [loadingMore, setLoadingMore] = useState(false);

  async function loadMore() {
    if (loadingMore || pagination.page >= pagination.totalPages) return;
    setLoadingMore(true);
    try {
      const next = await fetchReviews(productId, { page: pagination.page + 1, pageSize: pagination.pageSize });
      setReviews((prev) => [...prev, ...next.items]);
      setPagination(next.pagination);
    } finally {
      setLoadingMore(false);
    }
  }

  function handleSubmitted(review: ApiReview) {
    setReviews((prev) => [review, ...prev]);
    setSummary((prev) => ({
      averageRating: Math.round(((prev.averageRating * prev.count + review.rating) / (prev.count + 1)) * 10) / 10,
      count: prev.count + 1,
    }));
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Đánh giá từ cộng đồng</h2>
          <p className="text-on-surface-variant text-[13px] mt-0.5">
            Chia sẻ trải nghiệm sưu tầm của bạn cùng Zenos
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/15 self-start sm:self-auto">
          <div className="text-center pr-3 border-r border-outline-variant/25">
            <span className="block font-headline-sm text-headline-sm text-on-surface leading-none">
              {summary.averageRating.toFixed(1)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <StarRating value={summary.averageRating} size="sm" />
            <span className="text-[11px] text-on-surface-variant">{summary.count} đánh giá</span>
          </div>
        </div>
      </div>

      <WriteReviewForm productId={productId} onSubmitted={handleSubmitted} />

      {reviews.length === 0 ? (
        <p className="text-on-surface-variant text-[13px] text-center py-6">
          Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên chia sẻ cảm nhận!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reviews.map((review, i) => (
            <Reveal key={review.id} delay={(i % 4) * 60}>
              <article className="flex flex-col gap-2 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/15">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-[12px] font-bold text-primary"
                      aria-hidden="true"
                    >
                      {initialsOf(review.customerName)}
                    </div>
                    <div>
                      <p className="text-label-sm font-bold text-on-surface leading-tight">{review.customerName}</p>
                      <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                        <Icon name="verified_user" filled className="text-[12px] text-primary" />
                        Đã mua hàng
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-on-surface-variant shrink-0">{timeAgoVn(review.createdAt)}</span>
                </div>
                <StarRating value={review.rating} size="sm" />
                <p className="text-[13px] text-on-surface-variant leading-relaxed">{review.comment}</p>
                {review.images.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {review.images.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative w-14 h-14 rounded-lg overflow-hidden border border-outline-variant/20 shrink-0 hover:opacity-90 transition-opacity"
                      >
                        <Image src={url} alt="Ảnh đánh giá" fill sizes="56px" className="object-cover" />
                      </a>
                    ))}
                  </div>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      )}

      {pagination.page < pagination.totalPages && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="mx-auto mt-8 px-6 py-2 border border-primary text-primary text-[13px] font-bold rounded-full hover:bg-primary hover:text-on-primary active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-60"
        >
          {loadingMore ? "Đang tải..." : "Xem thêm đánh giá"}
          <Icon name="expand_more" className="!text-[18px]" />
        </button>
      )}
    </div>
  );
}
