import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { BUSINESS_INFO } from "@/lib/business-info";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zenosthobbystore.com"),
  title: {
    default: `${BUSINESS_INFO.tradeName} | Phòng Trưng Bày Mô Hình Anime Tuyển Chọn`,
    template: `%s | ${BUSINESS_INFO.tradeName}`,
  },
  description:
    "ZENOST Hobby Store - tuyển chọn mô hình anime, statue và mô hình lắp ráp cao cấp: Pokemon, Gundam, Naruto. Nhập khẩu chính hãng, cam kết chất lượng gallery.",
  keywords: [
    "mô hình anime",
    "figure cao cấp",
    "gundam",
    "nendoroid",
    "zenost hobby store",
  ],
  icons: {
    icon: [
      { url: "/Logo/zenost-favicon.svg", type: "image/svg+xml" },
      { url: "/Logo/zenost-favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/Logo/zenost-favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/Logo/zenost-favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/Logo/zenost-favicon-180.png",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: BUSINESS_INFO.tradeName,
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvwQ0f86ZUBeXffdd5itRCijimyP9QYcccuAser2hE3-IN12KM9eCRy1-c-i5PtpfAAU-knVEC7W0_-bojhggh3lhObxhuoUVuCAtOpcQDGoUF0CXkyz8a3yKVS-W0-BDvYn5znYCgKTqIsuomBAvef_onZzmmdpi3NMHF6mfWIKqtvJqB9cXInkeR43dysgF9Ib3Ez2mA-K-slydemNGaSxuHD0f0rMgL3f5QdSp3_frw2AkGRgVDx0A3gSjksovRy1_dcOuIdjY",
        width: 1600,
        height: 900,
        alt: `Phòng trưng bày mô hình anime cao cấp ${BUSINESS_INFO.tradeName}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS_INFO.tradeName} | Phòng Trưng Bày Mô Hình Anime Tuyển Chọn`,
    description:
      "Tuyển chọn mô hình anime, statue và mô hình lắp ráp cao cấp: Pokemon, Gundam, Naruto.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      translate="no"
      className={`${montserrat.variable} ${inter.variable} scroll-smooth h-full antialiased notranslate`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Chrome's built-in "Translate this page" prompt (and several translate/dictionary
          extensions that respect this convention) inject DOM nodes into <head>/<body> before
          React hydrates, which then shows up as a false-positive hydration mismatch in the
          console — nothing in this app renders that markup. These two signals opt the page out.
        */}
        <meta name="google" content="notranslate" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router root layout is the correct place for a global font stylesheet next/font/google doesn't cover */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      {/*
        suppressHydrationWarning here (same as on <html> above) only ignores attribute mismatches
        on this exact tag — not its children — so it can't hide a real bug deeper in the tree.
        It's needed because browser extensions (ColorZilla's `cz-shortcut-listen`, Grammarly's
        `data-gramm`, password managers, dark-mode extensions, ...) commonly stamp attributes onto
        <body> before React hydrates; that's expected noise, not something this app renders.
      */}
      <body
        className="min-h-full flex flex-col bg-surface text-on-surface font-body-md text-body-md"
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
