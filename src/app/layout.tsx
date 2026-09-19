import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileStickyBar from "@/components/layout/MobileStickyBar";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { OrdersProvider } from "@/context/OrdersContext";
import { InventoryProvider } from "@/context/InventoryContext";
import { CouponsProvider } from "@/context/CouponsContext";
import { ReviewsProvider } from "@/context/ReviewsContext";
import { LandingPagesProvider } from "@/context/LandingPagesContext";
import StorefrontLayoutWrapper from "@/components/layout/StorefrontLayoutWrapper";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FAF8F4",
};

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://adorousfashion.com'),
  title: "Adorous Fashion — Boutique Accessories & Fine Jewelry | Rajshahi, Bangladesh",
  description: "Curated premium jewelry sets, velvet churi bangles, luxury bags, and fashion accessories. Cash on Delivery across all 64 districts in Bangladesh.",
  keywords: [
    "Adorous Fashion",
    "boutique jewelry Bangladesh",
    "churi set price in bangladesh",
    "bridal jewelry Dhaka",
    "ladies handbag Bangladesh",
    "jhumka earrings online BD",
    "fashion accessories Dhaka"
  ],
  openGraph: {
    title: "Adorous Fashion — Boutique Accessories & Fine Jewelry",
    description: "Curated premium jewelry sets, churi bangles, and luxury bags. Cash on Delivery across Bangladesh.",
    url: "https://adorousfashion.com",
    siteName: "Adorous Fashion",
    images: [
      {
        url: "/images/hero/hero-still-life.jpg",
        width: 1200,
        height: 675,
        alt: "Adorous Fashion Still Life Collection",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: [
      { url: '/images/logo/logo-monogram.png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/images/logo/logo-monogram.png',
    apple: '/images/logo/logo-monogram.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden bg-paper text-ink selection:bg-gold-light selection:text-ink">
        <AdminAuthProvider>
          <OrdersProvider>
            <InventoryProvider>
              <CouponsProvider>
                <ReviewsProvider>
                  <LandingPagesProvider>
                    <CartProvider>
                      <WishlistProvider>
                        <StorefrontLayoutWrapper>
                          {children}
                        </StorefrontLayoutWrapper>
                      </WishlistProvider>
                    </CartProvider>
                  </LandingPagesProvider>
                </ReviewsProvider>
              </CouponsProvider>
            </InventoryProvider>
          </OrdersProvider>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
