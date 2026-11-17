import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Adorous Fashion',
  description:
    'Answers to common questions regarding nationwide Cash on Delivery, delivery fees, 7-day doorstep exchange, churi sizing, and jewelry care by Adorous Fashion.',
  alternates: {
    canonical: '/faq',
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
