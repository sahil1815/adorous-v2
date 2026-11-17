import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Artisanal Keepsake Gift Boxes | Adorous Fashion',
  description:
    'Curated festive gift boxes, bridal trousseau sets, and velvet keepsake presentations by Adorous Fashion. Beautifully packaged with nationwide Cash on Delivery.',
  alternates: {
    canonical: '/gifting',
  },
};

export default function GiftingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
