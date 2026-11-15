'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useRef, Suspense } from 'react';
import { setPixelId, pageview } from '@/lib/fpixel';

function MetaPixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip initial mount because the inline Script already triggers the initial PageView
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (pathname) {
      pageview();
    }
  }, [pathname, searchParams]);

  return null;
}

interface MetaPixelProps {
  pixelId?: string;
}

export default function MetaPixel({ pixelId }: MetaPixelProps) {
  const activePixelId =
    pixelId ||
    process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID ||
    process.env.FACEBOOK_PIXEL_ID ||
    process.env.NEXT_PUBLIC_META_PIXEL_ID ||
    process.env.META_PIXEL_ID;

  useEffect(() => {
    if (activePixelId) {
      setPixelId(activePixelId);
    }
  }, [activePixelId]);

  if (!activePixelId) {
    return null;
  }

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('set', 'autoConfig', false, '${activePixelId}');
            fbq('init', '${activePixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <Suspense fallback={null}>
        <MetaPixelTracker />
      </Suspense>
    </>
  );
}
