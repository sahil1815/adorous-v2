import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Artisanal Keepsake Gift Boxes',
  description:
    'Curated festive gift boxes, bridal trousseau sets, and velvet keepsake presentations by Adorous Fashion. Beautifully packaged with nationwide Cash on Delivery.',
  alternates: {
    canonical: 'https://adorousfashion.store/gifting',
  },
  openGraph: {
    title: 'Artisanal Keepsake Gift Boxes | Adorous Fashion',
    description:
      'Curated festive gift boxes, bridal trousseau sets, and velvet keepsake presentations by Adorous Fashion. Beautifully packaged with nationwide Cash on Delivery.',
    url: 'https://adorousfashion.store/gifting',
    siteName: 'Adorous Fashion',
    locale: 'en_US',
    type: 'website',
  },
};

export default function GiftingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
