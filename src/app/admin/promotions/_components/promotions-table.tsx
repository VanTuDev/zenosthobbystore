"use client";

import { Icon } from "@/components/ui/icon";
import { StatusDot, type StatusTone } from "@/components/admin/status-dot";
import { formatVnd } from "@/lib/format";
import type { ApiPromotion } from "@/lib/api-types";

const STATUS_META: Record<ApiPromotion["status"], { label: string; tone: StatusTone }> = {
  active: { label: "Đang chạy", tone: "primary" },
  scheduled: { label: "Lên lịch", tone: "outline" },
  expired: { label: "Hết hạn", tone: "muted" },
};

const TYPE_LABEL: Record<ApiPromotion["type"], string> = {
  percentage: "Phần trăm",
  fixed: "Cố định",
  bundle: "Tặng kèm",
};

function formatDateVn(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN");
}

export function PromotionsTable({
  promotions,
  onDelete,
}: {
  promotions: ApiPromotion[];
  onDelete: (promotion: ApiPromotion) => void;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/40 overflow-hidden">
      <div className="px-md py-sm border-b border-outline-variant/40 bg-surface-container-low">
        <h3 className="font-label-md text-label-md text-on-surface font-bold">Danh sách mã khuyến mãi</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] tracking-wide font-bold">
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Mã</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Tên</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Loại</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap text-right">Giá trị</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap text-right">Đã dùng</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Thời gian</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap">Trạng thái</th>
              <th className="px-sm py-xs border border-outline-variant/30 whitespace-nowrap" />
            </tr>
          </thead>
          <tbody>
            {promotions.map((promo, i) => {
              const status = STATUS_META[promo.status];
              return (
                <tr
                  key={promo.id}
                  className={`hover:bg-primary/5 transition-colors ${i % 2 === 1 ? "bg-surface-container-low/40" : ""}`}
                >
                  <td className="px-sm py-xs border border-outline-variant/30 font-bold text-primary tracking-wide whitespace-nowrap">
                    {promo.code}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 text-on-surface whitespace-nowrap">
                    {promo.name}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 text-on-surface-variant whitespace-nowrap">
                    {TYPE_LABEL[promo.type]}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 font-bold text-right whitespace-nowrap">
                    {promo.type === "percentage" ? `${promo.value}%` : formatVnd(promo.value)}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 text-on-surface-variant text-right whitespace-nowrap">
                    {promo.usageCount}/{promo.usageLimit === 0 ? "∞" : promo.usageLimit}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 text-on-surface-variant whitespace-nowrap">
                    {formatDateVn(promo.startDate)} - {formatDateVn(promo.endDate)}
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30">
                    <StatusDot tone={status.tone} label={status.label} />
                  </td>
                  <td className="px-sm py-xs border border-outline-variant/30 text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(promo)}
                      aria-label={`Xóa mã ${promo.code}`}
                      className="p-1 text-on-surface-variant hover:text-error transition-colors"
                    >
                      <Icon name="delete" className="!text-[16px]" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {promotions.length === 0 && (
              <tr>
                <td colSpan={8} className="px-md py-lg border border-outline-variant/30 text-center text-on-surface-variant font-body-md">
                  Chưa có mã khuyến mãi nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
