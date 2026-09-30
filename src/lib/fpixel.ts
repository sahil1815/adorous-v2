let runtimePixelId =
  process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID ||
  process.env.FACEBOOK_PIXEL_ID ||
  process.env.NEXT_PUBLIC_META_PIXEL_ID ||
  process.env.META_PIXEL_ID ||
  '';

export const setPixelId = (id: string) => {
  runtimePixelId = id;
};

export const getPixelId = () => runtimePixelId;

export const pageview = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView');
  }
};

export const event = (name: string, options: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', name, options);
  }
};
