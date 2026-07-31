import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
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
  metadataBase: new URL("https://zenoshobbystore.vn"),
  title: {
    default: "ZENOS Hobby Store | Phòng Trưng Bày Mô Hình Anime Tuyển Chọn",
    template: "%s | ZENOS Hobby Store",
  },
  description:
    "ZENOS Hobby Store - tuyển chọn mô hình anime, statue và mô hình lắp ráp cao cấp: Pokemon, Gundam, Naruto. Nhập khẩu chính hãng, cam kết chất lượng gallery.",
  keywords: [
    "mô hình anime",
    "figure cao cấp",
    "gundam",
    "nendoroid",
    "zenos hobby store",
  ],
  icons: {
    icon: "/LogoZENOSTHOBBYSTORE.jpg",
    shortcut: "/LogoZENOSTHOBBYSTORE.jpg",
    apple: "/LogoZENOSTHOBBYSTORE.jpg",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "ZENOS Hobby Store",
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCvwQ0f86ZUBeXffdd5itRCijimyP9QYcccuAser2hE3-IN12KM9eCRy1-c-i5PtpfAAU-knVEC7W0_-bojhggh3lhObxhuoUVuCAtOpcQDGoUF0CXkyz8a3yKVS-W0-BDvYn5znYCgKTqIsuomBAvef_onZzmmdpi3NMHF6mfWIKqtvJqB9cXInkeR43dysgF9Ib3Ez2mA-K-slydemNGaSxuHD0f0rMgL3f5QdSp3_frw2AkGRgVDx0A3gSjksovRy1_dcOuIdjY",
        width: 1600,
        height: 900,
        alt: "Phòng trưng bày mô hình anime cao cấp ZENOS Hobby Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZENOS Hobby Store | Phòng Trưng Bày Mô Hình Anime Tuyển Chọn",
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
      className={`${montserrat.variable} ${inter.variable} scroll-smooth h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router root layout is the correct place for a global font stylesheet next/font/google doesn't cover */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-on-surface font-body-md text-body-md">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
