import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import { BUSINESS_INFO } from "@/lib/business-info";
import "./globals.css";

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
    icon: "/LogoZENOSTHOBBYSTORE.png",
    shortcut: "/LogoZENOSTHOBBYSTORE.png",
    apple: "/LogoZENOSTHOBBYSTORE.png",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: BUSINESS_INFO.tradeName,
    images: [
      {
        url: "/images/home/hero-og.jpg",
        width: 1200,
        height: 630,
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
      className="scroll-smooth h-full antialiased notranslate"
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
        {/*
          Material Symbols stylesheet loaded WITHOUT blocking first paint: media="print" makes the
          browser fetch it at low priority without holding rendering, and the inline script flips
          it to "all" once loaded (the <noscript> copy covers no-JS). display=block keeps icon
          ligature names (e.g. "keyboard_arrow_down") invisible until the font arrives, instead of
          flashing as raw text. suppressHydrationWarning: the script mutates `media` before hydration.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font, @next/next/google-font-display -- display=block is intentional (hides icon ligature text until loaded); App Router root layout is the correct place for a global font stylesheet next/font/google doesn't cover */}
        <link
          id="material-symbols-css"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
          rel="stylesheet"
          media="print"
          suppressHydrationWarning
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var l=document.getElementById('material-symbols-css');if(!l)return;function s(){l.media='all'}if(l.sheet){s()}else{l.addEventListener('load',s)}})();",
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-page-custom-font, @next/next/google-font-display */}
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
            rel="stylesheet"
          />
        </noscript>
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
