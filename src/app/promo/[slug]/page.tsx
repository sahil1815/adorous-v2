import { redirect } from 'next/navigation';

interface PromoPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PromoPage({ params }: PromoPageProps) {
  const { slug } = await params;
  redirect(`/collections/${slug}`);
}
