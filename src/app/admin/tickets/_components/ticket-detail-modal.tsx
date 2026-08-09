"use client";

import { useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/modal";
import { Icon } from "@/components/ui/icon";
import { StatusDot } from "@/components/admin/status-dot";
import { updateContactTicketStatus } from "@/lib/api/contact-tickets";
import { ApiRequestError } from "@/lib/api-client";
import { SUBJECT_LABEL, TICKET_STATUS_META } from "./tickets-table";
import type { ApiContactTicket } from "@/lib/api-types";

const STATUS_OPTIONS: ApiContactTicket["status"][] = ["open", "in_progress", "resolved"];

function formatDateVn(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function TicketDetailModal({
  ticket,
  onClose,
  onUpdated,
}: {
  ticket: ApiContactTicket;
  onClose: () => void;
  onUpdated: (ticket: ApiContactTicket) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const statusMeta = TICKET_STATUS_META[ticket.status];

  async function handleStatusChange(status: ApiContactTicket["status"]) {
    if (status === ticket.status) return;
    setSaving(true);
    setError(null);
    try {
      const { ticket: updated } = await updateContactTicketStatus(ticket.id, status);
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Cập nhật trạng thái thất bại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      onClose={onClose}
      closeDisabled={saving}
      labelledBy="ticket-detail-title"
      icon="support_agent"
      title={ticket.customerName}
      subtitle={`${SUBJECT_LABEL[ticket.subject]} · ${formatDateVn(ticket.createdAt)}`}
      maxWidthClassName="max-w-2xl"
    >
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        <div className="flex flex-wrap items-center gap-sm">
          <StatusDot tone={statusMeta.tone} label={statusMeta.label} />
          {ticket.orderCode && (
            <span className="font-label-sm text-label-sm text-on-surface-variant">Mã tham chiếu: {ticket.orderCode}</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant mb-1">Họ và tên</p>
            <p className="font-body-md text-on-surface">{ticket.customerName}</p>
          </div>
          <div>
            <p className="font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant mb-1">Email nhận phản hồi</p>
            <a href={`mailto:${ticket.customerEmail}`} className="font-body-md text-primary hover:underline break-all">
              {ticket.customerEmail}
            </a>
          </div>
        </div>

        <div>
          <p className="font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant mb-1">Nội dung yêu cầu</p>
          <p className="font-body-md text-on-surface whitespace-pre-wrap bg-surface-container-low rounded-lg p-3">
            {ticket.message}
          </p>
        </div>

        {ticket.images.length > 0 && (
          <div>
            <p className="font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant mb-1">
              Hình ảnh đính kèm
            </p>
            <div className="flex flex-wrap gap-2">
              {ticket.images.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-outline-variant/30 shrink-0"
                >
                  <Image src={url} alt="Ảnh đính kèm" fill sizes="80px" className="object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5">
            Cập nhật trạng thái
          </p>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((status) => {
              const meta = TICKET_STATUS_META[status];
              const isActive = status === ticket.status;
              return (
                <button
                  key={status}
                  type="button"
                  disabled={saving}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-1.5 rounded-lg font-label-md text-xs font-medium border transition-colors disabled:opacity-50 ${
                    isActive
                      ? "bg-primary text-on-primary border-primary"
                      : "border-outline-variant/60 text-on-surface-variant hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-error font-label-md text-xs">
            <Icon name="error" className="shrink-0 !text-[16px]" />
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
