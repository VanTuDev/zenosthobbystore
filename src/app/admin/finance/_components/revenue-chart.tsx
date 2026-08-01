"use client";

import { useRef, useState } from "react";
import { formatVnd } from "@/lib/format";

type RevenuePoint = { date: string; revenue: number; orders: number };

const WIDTH = 600;
const HEIGHT = 180;
const PAD_LEFT = 46;
const PAD_RIGHT = 8;
const PAD_TOP = 10;
const PAD_BOTTOM = 24;
const PLOT_LEFT = PAD_LEFT;
const PLOT_RIGHT = WIDTH - PAD_RIGHT;
const PLOT_TOP = PAD_TOP;
const PLOT_BOTTOM = HEIGHT - PAD_BOTTOM;

function compactVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(amount);
}

function formatDayLabel(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

/** Single-series revenue-over-time line chart — see the `dataviz` skill for the mark/interaction spec this follows. */
export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return <p className="text-on-surface-variant text-[12px] py-lg text-center">Chưa có dữ liệu doanh thu.</p>;
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const plotWidth = PLOT_RIGHT - PLOT_LEFT;
  const plotHeight = PLOT_BOTTOM - PLOT_TOP;
  const stepX = data.length > 1 ? plotWidth / (data.length - 1) : 0;

  const xAt = (i: number) => PLOT_LEFT + i * stepX;
  const yAt = (revenue: number) => PLOT_BOTTOM - (revenue / maxRevenue) * plotHeight;

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(d.revenue).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${xAt(data.length - 1).toFixed(1)} ${PLOT_BOTTOM} L ${xAt(0)} ${PLOT_BOTTOM} Z`;

  const gridSteps = [0, 0.5, 1];
  const lastIndex = data.length - 1;
  const labelIndices = data.length > 1 ? Array.from(new Set([0, Math.floor(lastIndex / 2), lastIndex])) : [0];

  function handleMove(clientX: number) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const svgX = fraction * WIDTH;
    const index = Math.round((svgX - PLOT_LEFT) / (stepX || 1));
    setHoverIndex(Math.min(lastIndex, Math.max(0, index)));
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;
  const tooltipLeftPct = hoverIndex !== null ? (xAt(hoverIndex) / WIDTH) * 100 : 0;

  return (
    <div
      ref={wrapRef}
      className="relative select-none"
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseLeave={() => setHoverIndex(null)}
    >
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" role="img" aria-label="Biểu đồ doanh thu theo ngày">
        {gridSteps.map((step) => {
          const y = PLOT_TOP + step * plotHeight;
          const value = maxRevenue * (1 - step);
          return (
            <g key={step}>
              <line x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={y} y2={y} className="stroke-outline-variant/40" strokeWidth={1} />
              <text x={PLOT_LEFT - 6} y={y + 3} textAnchor="end" className="fill-on-surface-variant text-[9px]">
                {compactVnd(value)}
              </text>
            </g>
          );
        })}

        <path d={areaPath} className="fill-primary/10" stroke="none" />
        <path d={linePath} className="stroke-primary" fill="none" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {hoverIndex !== null && (
          <line
            x1={xAt(hoverIndex)}
            x2={xAt(hoverIndex)}
            y1={PLOT_TOP}
            y2={PLOT_BOTTOM}
            className="stroke-outline-variant"
            strokeWidth={1}
          />
        )}

        {data.map((d, i) => {
          const isLast = i === lastIndex;
          const isHovered = i === hoverIndex;
          if (!isLast && !isHovered) return null;
          return (
            <circle
              key={d.date}
              cx={xAt(i)}
              cy={yAt(d.revenue)}
              r={4}
              className="fill-primary"
              stroke="var(--color-surface-container-lowest)"
              strokeWidth={2}
            />
          );
        })}

        {labelIndices.map((i) => (
          <text key={i} x={xAt(i)} y={HEIGHT - 6} textAnchor="middle" className="fill-on-surface-variant text-[9px]">
            {formatDayLabel(data[i].date)}
          </text>
        ))}
      </svg>

      {hovered && (
        <div
          className="absolute top-0 -translate-x-1/2 bg-on-surface text-surface text-[11px] rounded-lg px-2.5 py-1.5 pointer-events-none whitespace-nowrap shadow-lg"
          style={{ left: `${Math.min(94, Math.max(6, tooltipLeftPct))}%` }}
        >
          <p className="font-bold">{formatVnd(hovered.revenue)}</p>
          <p className="text-surface/70">
            {formatDayLabel(hovered.date)} · {hovered.orders} đơn
          </p>
        </div>
      )}
    </div>
  );
}
