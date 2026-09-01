import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { AccountProvider } from "@/context/account-context";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  resolveSiteUrl,
} from "@/lib/site-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
  title: `${SITE_NAME} — Khám phá Việt Nam theo cách của bạn`,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "tour Việt Nam",
    "du lịch Việt Nam",
    "tour ghép",
    "tour riêng",
    "lịch trình du lịch AI",
  ],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Biến Việt Nam thành một hành trình đẹp`,
    description: SITE_DESCRIPTION,
    url: "/",
    images: [
      {
        url: "/images/viet-kham-pha-hero-v1.png",
        alt: "Non nước Việt Nam qua góc nhìn Việt Khám Phá",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Biến Việt Nam thành một hành trình đẹp`,
    description: SITE_DESCRIPTION,
    images: ["/images/viet-kham-pha-hero-v1.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <AccountProvider>
            {children}
            <Toaster position="top-center" richColors />
          </AccountProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
