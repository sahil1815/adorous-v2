import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Atelier & Concierge | Adorous Fashion',
  description:
    'Get in touch with the Adorous Fashion atelier concierge team via WhatsApp (+8801577731381), phone, or email for styling advice, custom sizing, and order tracking.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
