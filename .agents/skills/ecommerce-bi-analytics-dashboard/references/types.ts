export type DatePreset = '7d' | '30d' | '90d' | 'all' | 'custom';

export interface DateRangeConfig {
  preset: DatePreset;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface MetricDelta {
  current: number;
  previous: number;
  percentChange: number | null; // null if previous is 0
  trend: 'up' | 'down' | 'neutral';
}

export interface KpiMetric {
  value: number;
  formattedValue: string;
  delta?: MetricDelta;
  sparkline: number[];
  label: string;
  sublabel: string;
  tooltip?: string;
  isInverseGood?: boolean; // e.g. lower revenue lost or lower return rate is good
}

export interface FunnelStep {
  id: string;
  label: string;
  statusKey: string;
  count: number;
  value: number;
  percentOfTotal: number;
  conversionFromPrev?: number;
  color: string;
  bgTint: string;
  borderColor: string;
}

export interface OperationalRates {
  returnRate: number;
  cancelRate: number;
  deliverySuccessRate: number;
  returnedCount: number;
  cancelledCount: number;
  deliveredCount: number;
  totalOrders: number;
  deltaReturnRate?: MetricDelta;
  deltaCancelRate?: MetricDelta;
  deltaSuccessRate?: MetricDelta;
}

export interface TrendDataPoint {
  date: string;
  fullDate: string;
  netRevenue: number;
  grossRevenue: number;
  ordersCount: number;
  deliveredRevenue: number;
  prevRevenue?: number;
  prevOrdersCount?: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  category: string;
  featuredImage: string;
  unitsSold: number;
  revenue: number;
  ordersCount: number;
  shareOfRevenue: number;
  avgUnitPrice: number;
}

export interface CategoryDemand {
  name: string;
  categoryKey: string;
  units: number;
  revenue: number;
  percentage: number;
}

export interface CouponImpact {
  totalOrdersWithCoupon: number;
  totalDiscountGiven: number;
  aovWithCoupon: number;
  aovWithoutCoupon: number;
  couponAdoptionRate: number;
  topCoupons: {
    code: string;
    usageCount: number;
    discountGiven: number;
  }[];
}

export interface RegionalDemand {
  insideDhakaCount: number;
  insideDhakaRevenue: number;
  outsideDhakaCount: number;
  outsideDhakaRevenue: number;
  topDistricts: {
    district: string;
    ordersCount: number;
    revenue: number;
    deliveredCount: number;
    returnRate: number;
  }[];
}

export interface CustomerLoyalty {
  uniqueCustomersCount: number;
  newCustomersCount: number;
  repeatCustomersCount: number;
  repeatRate: number; // percentage
  newCustomersRevenue: number;
  repeatCustomersRevenue: number;
  repeatRevenueShare: number; // percentage
}

export interface CourierPerformance {
  courierName: string;
  totalAssigned: number;
  delivered: number;
  inTransit: number;
  returned: number;
  successRate: number;
  totalCodValue: number;
}
