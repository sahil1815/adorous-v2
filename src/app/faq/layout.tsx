import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Answers to common questions regarding nationwide Cash on Delivery, delivery fees, 7-day doorstep exchange, 6-month guarantee, and churi sizing by Adorous Fashion.',
  alternates: {
    canonical: 'https://adorousfashion.store/faq',
  },
  openGraph: {
    title: 'Frequently Asked Questions | Adorous Fashion',
    description:
      'Answers to common questions regarding nationwide Cash on Delivery, delivery fees, 7-day doorstep exchange, 6-month guarantee, and churi sizing by Adorous Fashion.',
    url: 'https://adorousfashion.store/faq',
    siteName: 'Adorous Fashion',
    locale: 'en_US',
    type: 'website',
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
