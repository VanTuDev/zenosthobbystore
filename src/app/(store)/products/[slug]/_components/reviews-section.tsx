"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { StarRating } from "@/components/ui/star-rating";
import { textFieldClass } from "@/components/ui/form-field";
import { ApiRequestError } from "@/lib/api-client";
import { createReview, fetchReviews } from "@/lib/api/reviews";
import type { ApiReview, PaginationMeta } from "@/lib/api-types";

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!user) {
    return (
      <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
        <p className="text-on-surface-variant font-body-md">Đăng nhập để viết đánh giá cho sản phẩm này.</p>
        <Button type="button" onClick={openLoginModal}>
          Đăng nhập với Google
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 flex items-center gap-3 mb-10">
        <Icon name="check_circle" filled className="text-primary" />
        <p className="text-on-surface font-label-md">Cảm ơn bạn đã đánh giá sản phẩm!</p>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!comment.trim()) {
      setError("Vui lòng nhập nội dung đánh giá.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { review } = await createReview(productId, { rating, comment: comment.trim() });
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
      className="p-6 bg-white rounded-2xl border border-surface-container-highest/50 premium-shadow mb-10 space-y-4"
    >
      <h3 className="font-headline-sm text-headline-sm text-on-surface">Viết đánh giá của bạn</h3>
      <div>
        <p className="font-label-md text-[13px] font-semibold text-on-surface mb-1">Số sao</p>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>
      <div>
        <label htmlFor="review-comment" className="block font-label-md text-[13px] font-semibold text-on-surface mb-1">
          Nhận xét
        </label>
        <textarea
          id="review-comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
          className={`${textFieldClass} resize-none`}
        />
      </div>
      {error && (
        <div className="flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-xl text-error font-label-md text-xs">
          <Icon name="error" className="shrink-0 !text-[16px] mt-0.5" />
          <span className="leading-snug">{error}</span>
        </div>
      )}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Đang gửi..." : "Gửi đánh giá"}
      </Button>
    </form>
  );
}

export function ReviewsSection({
  productId,
  initialReviews,
  initialPagination,
}: {
  productId: string;
  initialReviews: ApiReview[];
  initialPagination: PaginationMeta;
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [pagination, setPagination] = useState(initialPagination);
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

  return (
    <div>
      <WriteReviewForm productId={productId} onSubmitted={(review) => setReviews((prev) => [review, ...prev])} />

      {reviews.length === 0 ? (
        <p className="text-on-surface-variant font-body-md text-center py-8">
          Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên chia sẻ cảm nhận!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {reviews.map((review, i) => (
            <Reveal key={review.id} delay={(i % 4) * 80}>
              <article className="flex flex-col gap-4 p-8 rounded-3xl bg-white premium-shadow border border-surface-container-highest/30 transition-shadow duration-300 hover:shadow-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center font-bold text-primary"
                      aria-hidden="true"
                    >
                      {initialsOf(review.customerName)}
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface">{review.customerName}</p>
                      <p className="text-[12px] text-on-surface-variant flex items-center gap-1">
                        <Icon name="verified_user" filled className="text-[14px] text-primary" />
                        Đã mua hàng
                      </p>
                    </div>
                  </div>
                  <span className="text-label-sm text-on-surface-variant">{timeAgoVn(review.createdAt)}</span>
                </div>
                <StarRating value={review.rating} size="sm" />
                <p className="font-body-md text-on-surface-variant leading-relaxed">{review.comment}</p>
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
          className="mx-auto mt-12 px-8 py-3 border-2 border-primary text-primary font-label-md rounded-full hover:bg-primary hover:text-on-primary active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60"
        >
          {loadingMore ? "Đang tải..." : "Xem thêm đánh giá"}
          <Icon name="expand_more" />
        </button>
      )}
    </div>
  );
}
