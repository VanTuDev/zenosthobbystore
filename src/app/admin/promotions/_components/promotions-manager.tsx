"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { deletePromotion, fetchPromotions } from "@/lib/api/promotions";
import { ApiRequestError } from "@/lib/api-client";
import type { ApiPromotion } from "@/lib/api-types";
import { CouponForm } from "./coupon-form";
import { PromotionsTable } from "./promotions-table";

export function PromotionsManager() {
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [promotions, setPromotions] = useState<ApiPromotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPromotions({ pageSize: 50 })
      .then((res) => {
        if (!cancelled) setPromotions(res.items);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof ApiRequestError ? err.message : "Không thể tải danh sách mã khuyến mãi.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDelete(promotion: ApiPromotion) {
    const confirmed = await confirm({
      title: `Xóa mã "${promotion.code}"?`,
      description: "Hành động này không thể hoàn tác.",
      confirmLabel: "Xóa",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      await deletePromotion(promotion.id);
      setPromotions((prev) => prev.filter((p) => p.id !== promotion.id));
      showToast(`Đã xóa mã "${promotion.code}".`, "success");
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Xóa mã thất bại.", "error");
    }
  }

  return (
    <div className="space-y-lg">
      <div className="max-w-144 bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/20 premium-shadow transition-shadow duration-300 hover:shadow-xl">
        <div className="flex items-center gap-sm mb-lg">
          <span className="flex items-center justify-center w-11 h-11 shrink-0 bg-tertiary-container/20 text-tertiary rounded-xl">
            <Icon name="confirmation_number" />
          </span>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Coupon mới</h2>
            <p className="text-label-sm text-on-surface-variant">Điền thông tin bên dưới để phát hành ngay</p>
          </div>
        </div>

        <CouponForm onCreated={(promotion) => setPromotions((prev) => [promotion, ...prev])} />
      </div>

      {loadError ? (
        <p className="flex items-center gap-xs text-error text-label-md p-sm bg-error-container/20 rounded-lg">
          <Icon name="error" />
          {loadError}
        </p>
      ) : isLoading ? (
        <p className="text-on-surface-variant font-body-md">Đang tải danh sách mã khuyến mãi…</p>
      ) : (
        <PromotionsTable promotions={promotions} onDelete={handleDelete} />
      )}
    </div>
  );
}
