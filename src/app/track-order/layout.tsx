import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Your Parcel | Adorous Fashion',
  description:
    'Track your Adorous Fashion Cash on Delivery (COD) order in real time. Enter your Order ID or phone number to see fulfillment, packaging, and courier transit updates.',
  alternates: {
    canonical: '/track-order',
  },
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
