import {
  Package,
  Users,
  ShoppingBag,
  Truck,
  Layers,
  PlusCircle,
  ArrowUpDown,
  BookOpen,
  BarChart3,
  Tag,
  FileText,
  MessageSquare,
  Sparkles,
  MessageCircle,
  CreditCard,
  LucideIcon,
} from 'lucide-react';

export interface AdminNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  badgeKey?: 'pendingOrders' | 'pendingReviews';
  description?: string;
  shortcut?: string;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    title: 'Fulfillment & COD',
    items: [
      {
        title: 'Orders & COD Desk',
        href: '/admin',
        icon: Package,
        exact: true,
        badgeKey: 'pendingOrders',
        description: 'Manage live customer orders, verification, and dispatch stages',
      },
      {
        title: 'Customers & Patrons',
        href: '/admin/customers',
        icon: Users,
        description: 'Browse registered accounts and unique guest customer histories',
      },
      {
        title: 'Drafts & Leads',
        href: '/admin/drafts',
        icon: ShoppingBag,
        description: 'Recover abandoned checkout carts and registration leads',
      },
      {
        title: 'Courier Manifest',
        href: '/admin/logistics',
        icon: Truck,
        description: 'Print daily Steadfast & Pathao courier dispatch manifests',
      },
    ],
  },
  {
    title: 'Catalogue & Merchandising',
    items: [
      {
        title: 'Inventory & Stock',
        href: '/admin/inventory',
        icon: Layers,
        exact: true,
        description: 'Manage real-time inventory count, prices, badges & visibility',
      },
      {
        title: 'Add New Product',
        href: '/admin/inventory/new',
        icon: PlusCircle,
        description: 'Publish a new luxury still-life piece to the live catalogue',
      },
      {
        title: 'Product Ordering',
        href: '/admin/product-ordering',
        icon: ArrowUpDown,
        description: 'Visual drag-and-drop merchandising and category hero photos',
      },
      {
        title: 'Atelier Lookbook',
        href: '/admin/lookbook',
        icon: BookOpen,
        description: 'Curate editorial ensembles, color harmonies & still-life studies',
      },
    ],
  },
  {
    title: 'Growth & Marketing',
    items: [
      {
        title: 'Performance & Cash Flow',
        href: '/admin/analytics',
        icon: BarChart3,
        description: 'Revenue trends, courier remittance tracking, and regional demand',
      },
      {
        title: 'Coupons & Promos',
        href: '/admin/coupons',
        icon: Tag,
        description: 'Manage luxury vouchers, seasonal discounts & free shipping',
      },
      {
        title: 'Landing Pages',
        href: '/admin/landing-pages',
        icon: FileText,
        description: 'Create tailored promotional campaign landing pages',
      },
      {
        title: 'Review Moderation',
        href: '/admin/reviews',
        icon: MessageSquare,
        badgeKey: 'pendingReviews',
        description: 'Approve or reject customer reviews and flat-lay photos',
      },
    ],
  },
  {
    title: 'Atelier Configuration',
    items: [
      {
        title: 'Welcome Offer Engine',
        href: '/admin/welcome-offer',
        icon: Sparkles,
        description: 'Configure new visitor popups, timers, and discount rules',
      },
      {
        title: 'WhatsApp Message Format',
        href: '/admin/whatsapp',
        icon: MessageCircle,
        description: 'Customize order verification templates and variable placeholders',
      },
      {
        title: 'Payment & MFS Settings',
        href: '/admin/payment-settings',
        icon: CreditCard,
        description: 'Configure bKash, Nagad numbers, account types & online discount',
      },
    ],
  },
];

export function getBreadcrumbFromPathname(pathname: string): {
  sectionTitle: string;
  itemTitle: string;
  href: string;
} {
  // Direct matches
  for (const section of ADMIN_NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.exact ? pathname === item.href : pathname.startsWith(item.href)) {
        // Special case for /admin/inventory/edit/[id]
        if (pathname.startsWith('/admin/inventory/edit')) {
          return {
            sectionTitle: 'Catalogue & Merchandising',
            itemTitle: 'Edit Product',
            href: pathname,
          };
        }
        return {
          sectionTitle: section.title,
          itemTitle: item.title,
          href: item.href,
        };
      }
    }
  }

  // Fallback
  return {
    sectionTitle: 'Operations',
    itemTitle: 'Dashboard',
    href: '/admin',
  };
}
