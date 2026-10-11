declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetIdOrAction: string | Date,
      params?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

let runtimeGaId =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
  process.env.GA_MEASUREMENT_ID ||
  '';

export const setGaId = (id: string) => {
  runtimeGaId = id;
};

export const getGaId = () => runtimeGaId;

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    const id = runtimeGaId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (id) {
      window.gtag('config', id, {
        page_path: url,
      });
    }
  }
};

export const event = (action: string, params: Record<string, unknown> = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, params);
  }
};

export const trackViewItem = (item: {
  id: string;
  name: string;
  category?: string;
  price: number;
}) => {
  event('view_item', {
    currency: 'BDT',
    value: item.price,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: 1,
      },
    ],
  });
};

export const trackAddToCart = (item: {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity: number;
}) => {
  event('add_to_cart', {
    currency: 'BDT',
    value: item.price * item.quantity,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity,
      },
    ],
  });
};

export const trackBeginCheckout = (params: {
  value: number;
  items: { id: string; name?: string; price?: number; quantity?: number }[];
}) => {
  event('begin_checkout', {
    currency: 'BDT',
    value: params.value,
    items: params.items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity || 1,
    })),
  });
};

export const trackPurchase = (params: {
  transactionId: string;
  value: number;
  items: { id: string; name?: string; price?: number; quantity?: number }[];
}) => {
  event('purchase', {
    transaction_id: params.transactionId,
    currency: 'BDT',
    value: params.value,
    items: params.items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity || 1,
    })),
  });
};
