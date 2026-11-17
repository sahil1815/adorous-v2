import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileStickyBar from "@/components/layout/MobileStickyBar";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { InventoryProvider } from "@/context/InventoryContext";
import { CouponsProvider } from "@/context/CouponsContext";
import { ReviewsProvider } from "@/context/ReviewsContext";
import { ProductOrderingProvider } from "@/context/ProductOrderingContext";
import { LandingPagesProvider } from "@/context/LandingPagesContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { NewVisitorOfferProvider } from "@/context/NewVisitorOfferContext";
import StorefrontLayoutWrapper from "@/components/layout/StorefrontLayoutWrapper";
import MetaPixel from "@/components/analytics/MetaPixel";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import WebMcpProvider from "@/components/agent/WebMcpProvider";
import { ROOT_JSON_LD } from "@/lib/jsonLd";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-jost",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FAF8F4",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://adorousfashion.store'),
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
  alternates: {
    canonical: 'https://adorousfashion.store',
  },
  openGraph: {
    title: "Adorous Fashion — Boutique Accessories & Fine Jewelry",
    description: "Curated premium jewelry sets, churi bangles, and luxury bags. Cash on Delivery across Bangladesh.",
    url: "https://adorousfashion.store",
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
  twitter: {
    card: "summary_large_image",
    title: "Adorous Fashion — Boutique Accessories & Fine Jewelry",
    description: "Curated premium jewelry sets, churi bangles, and luxury bags. Cash on Delivery across Bangladesh.",
    images: ["/images/hero/hero-still-life.jpg"],
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
  const fbPixelId =
    process.env.FACEBOOK_PIXEL_ID ||
    process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID ||
    process.env.META_PIXEL_ID ||
    process.env.NEXT_PUBLIC_META_PIXEL_ID;

  const gaMeasurementId =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    process.env.GA_MEASUREMENT_ID;

  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ROOT_JSON_LD) }}
        />
      </head>
      <body className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden bg-paper text-ink selection:bg-gold-light selection:text-ink">
        <InventoryProvider>
          <CouponsProvider>
            <ReviewsProvider>
              <ProductOrderingProvider>
                <LandingPagesProvider>
                  <CartProvider>
                    <WishlistProvider>
                      <CustomerAuthProvider>
                        <NewVisitorOfferProvider>
                          <StorefrontLayoutWrapper>
                            {children}
                          </StorefrontLayoutWrapper>
                        </NewVisitorOfferProvider>
                      </CustomerAuthProvider>
                    </WishlistProvider>
                  </CartProvider>
                </LandingPagesProvider>
              </ProductOrderingProvider>
            </ReviewsProvider>
          </CouponsProvider>
        </InventoryProvider>
        <Analytics />
        <MetaPixel pixelId={fbPixelId} />
        <GoogleAnalytics gaId={gaMeasurementId} />
        <WebMcpProvider />
      </body>
    </html>
  );
}
