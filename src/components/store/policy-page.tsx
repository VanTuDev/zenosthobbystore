import { Breadcrumbs } from "@/components/store/breadcrumbs";
import type { ReactNode } from "react";

export function PolicyPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="pt-28 pb-xl px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto">
      <Breadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: title }]} />

      <div className="max-w-3xl">
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-background mb-md">
          {title}
        </h1>
        {intro && <p className="text-on-surface-variant font-body-lg mb-lg">{intro}</p>}
        <div className="space-y-lg [&_h2]:font-headline-sm [&_h2]:text-headline-sm [&_h2]:text-on-surface [&_h2]:mb-sm [&_p]:text-on-surface-variant [&_p]:font-body-md [&_p]:leading-relaxed [&_li]:text-on-surface-variant [&_li]:font-body-md [&_ul]:list-disc [&_ul]:pl-lg [&_ul]:space-y-xs">
          {children}
        </div>
      </div>
    </div>
  );
}
