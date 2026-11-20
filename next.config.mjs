/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: 'https', hostname: 'ik.imagekit.io' },
      { protocol: 'https', hostname: 'imagekit.io' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/umbrellas',
        destination: '/more',
        permanent: true,
      },
      {
        source: '/umbrellas/:slug*',
        destination: '/more/:slug*',
        permanent: true,
      },
      {
        source: '/collections',
        destination: '/shop',
        permanent: false,
      },
      {
        source: '/promo',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/promo/:slug*',
        destination: '/collections/:slug*',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/_vercel/insights/:path*',
          destination: '/api/noop-script',
        },
      ],
      afterFiles: [],
      fallback: [
        {
          source: '/_next/static/media/:path*.woff2',
          destination: '/fonts/fallback.woff2',
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:file(favicon.ico|icon.png|apple-icon.png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/',
        headers: [
          {
            key: 'Link',
            value: '</llms.txt>; rel="describedby"; type="text/plain", </>; rel="alternate"; type="text/markdown"',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Link',
            value: '</llms.txt>; rel="describedby"; type="text/plain"',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
