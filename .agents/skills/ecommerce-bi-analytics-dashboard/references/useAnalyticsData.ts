'use client';

import { useMemo } from 'react';
import { AdminOrder } from '@/context/OrdersContext';
import {
  DateRangeConfig,
  KpiMetric,
  MetricDelta,
  FunnelStep,
  OperationalRates,
  TrendDataPoint,
  ProductPerformance,
  CategoryDemand,
  CouponImpact,
  RegionalDemand,
  CustomerLoyalty,
  CourierPerformance,
} from './types';
import { formatPrice } from '@/lib/formatPrice';

function calculateDelta(current: number, previous: number): MetricDelta {
  if (previous === 0) {
    return {
      current,
      previous,
      percentChange: current > 0 ? 100 : 0,
      trend: current > 0 ? 'up' : 'neutral',
    };
  }
  const pct = Math.round(((current - previous) / previous) * 1000) / 10;
  return {
    current,
    previous,
    percentChange: Math.abs(pct),
    trend: pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral',
  };
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function useAnalyticsData(
  allOrders: AdminOrder[],
  config: DateRangeConfig,
  compareWithPrevious: boolean = true
) {
  return useMemo(() => {
    // 1. Establish start and end date boundaries
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);

    if (config.preset === '7d') {
      start.setDate(now.getDate() - 6);
    } else if (config.preset === '30d') {
      start.setDate(now.getDate() - 29);
    } else if (config.preset === '90d') {
      start.setDate(now.getDate() - 89);
    } else if (config.preset === 'all') {
      if (allOrders.length > 0) {
        const sortedDates = allOrders
          .map((o) => new Date(o.createdAt).getTime())
          .filter((t) => !isNaN(t))
          .sort((a, b) => a - b);
        if (sortedDates.length > 0) {
          start = new Date(sortedDates[0]);
          end = new Date(sortedDates[sortedDates.length - 1]);
        } else {
          start.setDate(now.getDate() - 30);
        }
      } else {
        start.setDate(now.getDate() - 30);
      }
    } else if (config.preset === 'custom') {
      if (config.startDate) start = new Date(config.startDate);
      if (config.endDate) end = new Date(config.endDate);
    }

    // Set start to midnight and end to end-of-day
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const periodDurationMs = end.getTime() - start.getTime();

    // Previous comparison period
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - periodDurationMs);
    prevStart.setHours(0, 0, 0, 0);

    // 2. Filter orders into Current & Previous periods
    const currentOrders = allOrders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= start && orderDate <= end;
    });

    const previousOrders = allOrders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= prevStart && orderDate <= prevEnd;
    });

    // Helper functions for order metrics
    const isOrderValid = (o: AdminOrder) => o.status !== 'cancelled' && o.status !== 'returned';
    const getNetRevenue = (ords: AdminOrder[]) =>
      ords.filter(isOrderValid).reduce((acc, o) => acc + (o.grandTotal || 0), 0);
    const getDeliveredRevenue = (ords: AdminOrder[]) =>
      ords.filter((o) => o.status === 'delivered').reduce((acc, o) => acc + (o.grandTotal || 0), 0);
    const getInTransitRevenue = (ords: AdminOrder[]) =>
      ords
        .filter((o) => o.status === 'handed_to_courier' || o.status === 'packaging')
        .reduce((acc, o) => acc + (o.grandTotal || 0), 0);
    const getLostRevenue = (ords: AdminOrder[]) =>
      ords
        .filter((o) => o.status === 'cancelled' || o.status === 'returned')
        .reduce((acc, o) => acc + (o.grandTotal || 0), 0);
    const getAov = (ords: AdminOrder[]) => {
      const valid = ords.filter(isOrderValid);
      if (valid.length === 0) return 0;
      return Math.round(getNetRevenue(ords) / valid.length);
    };

    // Current metrics
    const currentNetRevenue = getNetRevenue(currentOrders);
    const prevNetRevenue = getNetRevenue(previousOrders);

    const currentDeliveredRevenue = getDeliveredRevenue(currentOrders);
    const prevDeliveredRevenue = getDeliveredRevenue(previousOrders);

    const currentInTransitRevenue = getInTransitRevenue(currentOrders);
    const prevInTransitRevenue = getInTransitRevenue(previousOrders);

    const currentAov = getAov(currentOrders);
    const prevAov = getAov(previousOrders);

    const currentLostRevenue = getLostRevenue(currentOrders);
    const prevLostRevenue = getLostRevenue(previousOrders);

    const currentGrossRevenue = currentOrders.reduce((acc, o) => acc + (o.grandTotal || 0), 0);

    // 3. Generate Sparkline points for each KPI (7 slices of current period)
    const numSparkPoints = 7;
    const sliceDuration = periodDurationMs / numSparkPoints;

    const sparklines = {
      netRevenue: [] as number[],
      delivered: [] as number[],
      inTransit: [] as number[],
      aov: [] as number[],
      lost: [] as number[],
    };

    for (let i = 0; i < numSparkPoints; i++) {
      const sliceStart = new Date(start.getTime() + i * sliceDuration);
      const sliceEnd = new Date(start.getTime() + (i + 1) * sliceDuration);
      const sliceOrders = currentOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= sliceStart && d < sliceEnd;
      });

      sparklines.netRevenue.push(getNetRevenue(sliceOrders));
      sparklines.delivered.push(getDeliveredRevenue(sliceOrders));
      sparklines.inTransit.push(getInTransitRevenue(sliceOrders));
      sparklines.aov.push(getAov(sliceOrders));
      sparklines.lost.push(getLostRevenue(sliceOrders));
    }

    // 4. Five Key Financial KPI Metrics
    const kpiMetrics: {
      netRevenue: KpiMetric;
      delivered: KpiMetric;
      inTransit: KpiMetric;
      aov: KpiMetric;
      lostRevenue: KpiMetric;
    } = {
      netRevenue: {
        value: currentNetRevenue,
        formattedValue: `৳${formatPrice(currentNetRevenue)}`,
        delta: compareWithPrevious ? calculateDelta(currentNetRevenue, prevNetRevenue) : undefined,
        sparkline: sparklines.netRevenue,
        label: 'Net Pipeline Revenue',
        sublabel: 'Excludes cancelled & returned orders',
        tooltip: 'Realizable sales pipeline: delivered, in transit, packaging, and verified checkouts.',
      },
      delivered: {
        value: currentDeliveredRevenue,
        formattedValue: `৳${formatPrice(currentDeliveredRevenue)}`,
        delta: compareWithPrevious
          ? calculateDelta(currentDeliveredRevenue, prevDeliveredRevenue)
          : undefined,
        sparkline: sparklines.delivered,
        label: 'Collected Remittance',
        sublabel: 'Cash collected by courier',
        tooltip: 'Parcels verified as delivered by Steadfast/Pathao with funds remitted to boutique account.',
      },
      inTransit: {
        value: currentInTransitRevenue,
        formattedValue: `৳${formatPrice(currentInTransitRevenue)}`,
        delta: compareWithPrevious
          ? calculateDelta(currentInTransitRevenue, prevInTransitRevenue)
          : undefined,
        sparkline: sparklines.inTransit,
        label: 'COD in Transit',
        sublabel: 'With couriers & in packing',
        tooltip: 'Active parcels currently out with riders or being packed in the atelier awaiting handover.',
      },
      aov: {
        value: currentAov,
        formattedValue: `৳${formatPrice(currentAov)}`,
        delta: compareWithPrevious ? calculateDelta(currentAov, prevAov) : undefined,
        sparkline: sparklines.aov,
        label: 'Average Order Value (AOV)',
        sublabel: 'Per successful checkout',
        tooltip: 'Average spend per valid order. Driven higher by luxury sets and multi-piece pairings.',
      },
      lostRevenue: {
        value: currentLostRevenue,
        formattedValue: `৳${formatPrice(currentLostRevenue)}`,
        delta: compareWithPrevious ? calculateDelta(currentLostRevenue, prevLostRevenue) : undefined,
        sparkline: sparklines.lost,
        label: 'Revenue Lost (RTO & Cancels)',
        sublabel: 'Returns & unverified cancellations',
        tooltip: 'Value of orders lost due to customer cancellations, phone unreachable, or courier RTO.',
        isInverseGood: true,
      },
    };

    // 5. Order Funnel Calculations
    const totalCurrentOrders = currentOrders.length;
    const verifiedOrders = currentOrders.filter(
      (o) =>
        o.status === 'verified' ||
        o.status === 'packaging' ||
        o.status === 'handed_to_courier' ||
        o.status === 'delivered'
    );
    const packagingOrders = currentOrders.filter(
      (o) =>
        o.status === 'packaging' ||
        o.status === 'handed_to_courier' ||
        o.status === 'delivered'
    );
    const courierOrders = currentOrders.filter(
      (o) => o.status === 'handed_to_courier' || o.status === 'delivered'
    );
    const deliveredOrders = currentOrders.filter((o) => o.status === 'delivered');
    const returnedOrders = currentOrders.filter((o) => o.status === 'returned');
    const cancelledOrders = currentOrders.filter((o) => o.status === 'cancelled');

    const funnelSteps: FunnelStep[] = [
      {
        id: 'placed',
        label: '1. Placed / Logged',
        statusKey: 'all',
        count: totalCurrentOrders,
        value: currentGrossRevenue,
        percentOfTotal: 100,
        color: '#C6A96E',
        bgTint: 'bg-gold/10',
        borderColor: 'border-gold/30',
      },
      {
        id: 'verified',
        label: '2. Phone Verified',
        statusKey: 'verified',
        count: verifiedOrders.length,
        value: verifiedOrders.reduce((s, o) => s + o.grandTotal, 0),
        percentOfTotal:
          totalCurrentOrders > 0
            ? Math.round((verifiedOrders.length / totalCurrentOrders) * 100)
            : 0,
        conversionFromPrev:
          totalCurrentOrders > 0
            ? Math.round((verifiedOrders.length / totalCurrentOrders) * 100)
            : 0,
        color: '#E4D2A8',
        bgTint: 'bg-amber-950/20',
        borderColor: 'border-amber-500/30',
      },
      {
        id: 'packaging',
        label: '3. Handcrafted & Packed',
        statusKey: 'packaging',
        count: packagingOrders.length,
        value: packagingOrders.reduce((s, o) => s + o.grandTotal, 0),
        percentOfTotal:
          totalCurrentOrders > 0
            ? Math.round((packagingOrders.length / totalCurrentOrders) * 100)
            : 0,
        conversionFromPrev:
          verifiedOrders.length > 0
            ? Math.round((packagingOrders.length / verifiedOrders.length) * 100)
            : 0,
        color: '#c084fc',
        bgTint: 'bg-purple-950/20',
        borderColor: 'border-purple-500/30',
      },
      {
        id: 'dispatched',
        label: '4. Dispatched with Courier',
        statusKey: 'handed_to_courier',
        count: courierOrders.length,
        value: courierOrders.reduce((s, o) => s + o.grandTotal, 0),
        percentOfTotal:
          totalCurrentOrders > 0
            ? Math.round((courierOrders.length / totalCurrentOrders) * 100)
            : 0,
        conversionFromPrev:
          packagingOrders.length > 0
            ? Math.round((courierOrders.length / packagingOrders.length) * 100)
            : 0,
        color: '#38bdf8',
        bgTint: 'bg-sky-950/20',
        borderColor: 'border-sky-500/30',
      },
      {
        id: 'delivered',
        label: '5. Delivered & Remitted',
        statusKey: 'delivered',
        count: deliveredOrders.length,
        value: currentDeliveredRevenue,
        percentOfTotal:
          totalCurrentOrders > 0
            ? Math.round((deliveredOrders.length / totalCurrentOrders) * 100)
            : 0,
        conversionFromPrev:
          courierOrders.length > 0
            ? Math.round((deliveredOrders.length / courierOrders.length) * 100)
            : 0,
        color: '#10b981',
        bgTint: 'bg-emerald-950/20',
        borderColor: 'border-emerald-500/30',
      },
    ];

    // 6. Operational Health Rates
    const completedOrReturned = deliveredOrders.length + returnedOrders.length;
    const returnRate =
      completedOrReturned > 0
        ? Math.round((returnedOrders.length / completedOrReturned) * 1000) / 10
        : 0;

    const cancelRate =
      totalCurrentOrders > 0
        ? Math.round((cancelledOrders.length / totalCurrentOrders) * 1000) / 10
        : 0;

    const deliverySuccessRate =
      completedOrReturned > 0
        ? Math.round((deliveredOrders.length / completedOrReturned) * 1000) / 10
        : totalCurrentOrders > 0
        ? 100 - cancelRate
        : 100;

    // Previous operational rates for deltas
    const prevDelivered = previousOrders.filter((o) => o.status === 'delivered').length;
    const prevReturned = previousOrders.filter((o) => o.status === 'returned').length;
    const prevCancelled = previousOrders.filter((o) => o.status === 'cancelled').length;
    const prevCompleted = prevDelivered + prevReturned;
    const prevReturnRate =
      prevCompleted > 0 ? Math.round((prevReturned / prevCompleted) * 1000) / 10 : 0;
    const prevCancelRate =
      previousOrders.length > 0
        ? Math.round((prevCancelled / previousOrders.length) * 1000) / 10
        : 0;
    const prevSuccessRate =
      prevCompleted > 0 ? Math.round((prevDelivered / prevCompleted) * 1000) / 10 : 100;

    const operationalRates: OperationalRates = {
      returnRate,
      cancelRate,
      deliverySuccessRate,
      returnedCount: returnedOrders.length,
      cancelledCount: cancelledOrders.length,
      deliveredCount: deliveredOrders.length,
      totalOrders: totalCurrentOrders,
      deltaReturnRate: compareWithPrevious
        ? calculateDelta(returnRate, prevReturnRate)
        : undefined,
      deltaCancelRate: compareWithPrevious
        ? calculateDelta(cancelRate, prevCancelRate)
        : undefined,
      deltaSuccessRate: compareWithPrevious
        ? calculateDelta(deliverySuccessRate, prevSuccessRate)
        : undefined,
    };

    // 7. Time-series Revenue Trend Chart Data
    // Group by Day (or grouped appropriately if longer)
    const dayMap: Record<
      string,
      {
        date: string;
        fullDate: string;
        netRevenue: number;
        grossRevenue: number;
        ordersCount: number;
        deliveredRevenue: number;
      }
    > = {};

    // Initialize all dates in current range
    const cursor = new Date(start);
    while (cursor <= end) {
      const key = formatDateKey(cursor);
      const label = cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dayMap[key] = {
        date: label,
        fullDate: key,
        netRevenue: 0,
        grossRevenue: 0,
        ordersCount: 0,
        deliveredRevenue: 0,
      };
      cursor.setDate(cursor.getDate() + 1);
    }

    currentOrders.forEach((o) => {
      const key = formatDateKey(new Date(o.createdAt));
      if (dayMap[key]) {
        dayMap[key].ordersCount += 1;
        dayMap[key].grossRevenue += o.grandTotal || 0;
        if (isOrderValid(o)) {
          dayMap[key].netRevenue += o.grandTotal || 0;
        }
        if (o.status === 'delivered') {
          dayMap[key].deliveredRevenue += o.grandTotal || 0;
        }
      }
    });

    // Populate previous period comparisons aligned by day index
    const sortedDayKeys = Object.keys(dayMap).sort();
    const trendData: TrendDataPoint[] = sortedDayKeys.map((k, idx) => {
      const item = dayMap[k];
      let prevRev = 0;
      let prevOrders = 0;

      if (compareWithPrevious && previousOrders.length > 0) {
        // Find corresponding offset in previous period
        const dayOffsetMs = idx * 24 * 60 * 60 * 1000;
        const targetPrevStart = new Date(prevStart.getTime() + dayOffsetMs);
        const targetPrevEnd = new Date(targetPrevStart.getTime() + 24 * 60 * 60 * 1000);

        const matchedPrev = previousOrders.filter((po) => {
          const d = new Date(po.createdAt);
          return d >= targetPrevStart && d < targetPrevEnd;
        });

        prevRev = getNetRevenue(matchedPrev);
        prevOrders = matchedPrev.length;
      }

      return {
        ...item,
        prevRevenue: prevRev,
        prevOrdersCount: prevOrders,
      };
    });

    // 8. Product Intelligence: Top 5 Best-Selling Products
    const productStatsMap: Record<
      string,
      {
        id: string;
        name: string;
        category: string;
        featuredImage: string;
        unitsSold: number;
        revenue: number;
        ordersCount: number;
      }
    > = {};

    currentOrders.filter(isOrderValid).forEach((order) => {
      order.items.forEach((item) => {
        const prodId = item.product?.id || item.product?.name || 'unknown';
        if (!productStatsMap[prodId]) {
          productStatsMap[prodId] = {
            id: prodId,
            name: item.product?.name || 'Luxury Ensemble',
            category: item.product?.category || 'Jewelry',
            featuredImage: item.product?.featuredImage || '',
            unitsSold: 0,
            revenue: 0,
            ordersCount: 0,
          };
        }
        productStatsMap[prodId].unitsSold += item.quantity || 1;
        productStatsMap[prodId].revenue += (item.product?.price || 0) * (item.quantity || 1);
        productStatsMap[prodId].ordersCount += 1;
      });
    });

    const topProducts: ProductPerformance[] = Object.values(productStatsMap)
      .map((p) => ({
        ...p,
        shareOfRevenue:
          currentNetRevenue > 0
            ? Math.round((p.revenue / currentNetRevenue) * 1000) / 10
            : 0,
        avgUnitPrice: p.unitsSold > 0 ? Math.round(p.revenue / p.unitsSold) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    // 9. Category Demand & Revenue Share
    const categoryMap: Record<string, { units: number; revenue: number }> = {};
    currentOrders.filter(isOrderValid).forEach((order) => {
      order.items.forEach((item) => {
        const rawCat = (item.product?.category || 'jewelry').toLowerCase().trim();
        const formatted =
          rawCat === 'jewelry'
            ? 'Fine Jewelry'
            : rawCat === 'churi'
            ? 'Churi & Bangles'
            : rawCat === 'earrings'
            ? 'Earrings & Jhumkas'
            : rawCat === 'bags'
            ? 'Clutches & Bags'
            : rawCat === 'umbrellas'
            ? 'Loom Umbrellas'
            : rawCat.charAt(0).toUpperCase() + rawCat.slice(1);

        if (!categoryMap[formatted]) {
          categoryMap[formatted] = { units: 0, revenue: 0 };
        }
        categoryMap[formatted].units += item.quantity || 1;
        categoryMap[formatted].revenue += (item.product?.price || 0) * (item.quantity || 1);
      });
    });

    const categoriesDemand: CategoryDemand[] = Object.entries(categoryMap)
      .map(([name, data]) => ({
        name,
        categoryKey: name.toLowerCase(),
        units: data.units,
        revenue: data.revenue,
        percentage:
          currentNetRevenue > 0
            ? Math.round((data.revenue / currentNetRevenue) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // 10. Coupons & Promotional Impact
    const ordersWithCoupons = currentOrders.filter(
      (o) => (o.couponCode && o.couponCode.trim() !== '') || (o.discountAmount && o.discountAmount > 0)
    );
    const totalDiscountGiven = ordersWithCoupons.reduce(
      (sum, o) => sum + (o.discountAmount || 0),
      0
    );

    const couponCodeMap: Record<string, { usageCount: number; discountGiven: number }> = {};
    ordersWithCoupons.forEach((o) => {
      const code = (o.couponCode || 'PROMO_DISCOUNT').toUpperCase();
      if (!couponCodeMap[code]) {
        couponCodeMap[code] = { usageCount: 0, discountGiven: 0 };
      }
      couponCodeMap[code].usageCount += 1;
      couponCodeMap[code].discountGiven += o.discountAmount || 0;
    });

    const topCoupons = Object.entries(couponCodeMap)
      .map(([code, d]) => ({
        code,
        usageCount: d.usageCount,
        discountGiven: d.discountGiven,
      }))
      .sort((a, b) => b.usageCount - a.usageCount);

    const aovWithCoupon =
      ordersWithCoupons.length > 0
        ? Math.round(
            ordersWithCoupons.reduce((s, o) => s + o.grandTotal, 0) / ordersWithCoupons.length
          )
        : 0;

    const ordersWithoutCoupons = currentOrders.filter(
      (o) => !o.couponCode && (!o.discountAmount || o.discountAmount === 0)
    );
    const aovWithoutCoupon =
      ordersWithoutCoupons.length > 0
        ? Math.round(
            ordersWithoutCoupons.reduce((s, o) => s + o.grandTotal, 0) / ordersWithoutCoupons.length
          )
        : 0;

    const couponImpact: CouponImpact = {
      totalOrdersWithCoupon: ordersWithCoupons.length,
      totalDiscountGiven,
      aovWithCoupon,
      aovWithoutCoupon,
      couponAdoptionRate:
        totalCurrentOrders > 0
          ? Math.round((ordersWithCoupons.length / totalCurrentOrders) * 1000) / 10
          : 0,
      topCoupons,
    };

    // 11. Regional Demand (Inside Dhaka vs Outside Dhaka Districts)
    let insideDhakaCount = 0;
    let insideDhakaRevenue = 0;
    let outsideDhakaCount = 0;
    let outsideDhakaRevenue = 0;

    const districtMap: Record<
      string,
      { ordersCount: number; revenue: number; deliveredCount: number; returnedCount: number }
    > = {};

    currentOrders.forEach((o) => {
      const rawDistrict = (o.customer?.district || 'Dhaka').trim();
      const isDhaka = rawDistrict.toLowerCase().includes('dhaka');

      if (isDhaka) {
        insideDhakaCount += 1;
        insideDhakaRevenue += o.grandTotal || 0;
      } else {
        outsideDhakaCount += 1;
        outsideDhakaRevenue += o.grandTotal || 0;
      }

      const normDistrict = rawDistrict.charAt(0).toUpperCase() + rawDistrict.slice(1).toLowerCase();
      if (!districtMap[normDistrict]) {
        districtMap[normDistrict] = {
          ordersCount: 0,
          revenue: 0,
          deliveredCount: 0,
          returnedCount: 0,
        };
      }
      districtMap[normDistrict].ordersCount += 1;
      districtMap[normDistrict].revenue += o.grandTotal || 0;
      if (o.status === 'delivered') districtMap[normDistrict].deliveredCount += 1;
      if (o.status === 'returned') districtMap[normDistrict].returnedCount += 1;
    });

    const topDistricts = Object.entries(districtMap)
      .map(([district, data]) => {
        const completed = data.deliveredCount + data.returnedCount;
        const returnRate =
          completed > 0 ? Math.round((data.returnedCount / completed) * 1000) / 10 : 0;
        return {
          district,
          ordersCount: data.ordersCount,
          revenue: data.revenue,
          deliveredCount: data.deliveredCount,
          returnRate,
        };
      })
      .sort((a, b) => b.ordersCount - a.ordersCount)
      .slice(0, 8);

    const regionalDemand: RegionalDemand = {
      insideDhakaCount,
      insideDhakaRevenue,
      outsideDhakaCount,
      outsideDhakaRevenue,
      topDistricts,
    };

    // 12. Customer Loyalty & Retention (Repeat vs First-Time Patrons)
    // Compute historical phone frequency across allOrders to recognize lifetime customers
    const phoneHistoryMap = new Map<string, number>();
    allOrders.forEach((o) => {
      const phone = (o.customer?.phone || '').trim();
      if (phone) {
        phoneHistoryMap.set(phone, (phoneHistoryMap.get(phone) || 0) + 1);
      }
    });

    const uniquePhonesInPeriod = new Set<string>();
    let repeatCustomersCount = 0;
    let newCustomersCount = 0;
    let repeatCustomersRevenue = 0;
    let newCustomersRevenue = 0;

    currentOrders.filter(isOrderValid).forEach((o) => {
      const phone = (o.customer?.phone || '').trim();
      if (phone) {
        uniquePhonesInPeriod.add(phone);
        const totalLifetimeOrders = phoneHistoryMap.get(phone) || 1;
        if (totalLifetimeOrders > 1) {
          repeatCustomersCount += 1;
          repeatCustomersRevenue += o.grandTotal || 0;
        } else {
          newCustomersCount += 1;
          newCustomersRevenue += o.grandTotal || 0;
        }
      }
    });

    const uniqueCustomersCount = uniquePhonesInPeriod.size;
    const repeatRate =
      uniqueCustomersCount > 0
        ? Math.round((repeatCustomersCount / currentOrders.length) * 1000) / 10
        : 0;
    const repeatRevenueShare =
      currentNetRevenue > 0
        ? Math.round((repeatCustomersRevenue / currentNetRevenue) * 1000) / 10
        : 0;

    const customerLoyalty: CustomerLoyalty = {
      uniqueCustomersCount,
      newCustomersCount,
      repeatCustomersCount,
      repeatRate,
      newCustomersRevenue,
      repeatCustomersRevenue,
      repeatRevenueShare,
    };

    // 13. Courier Partner Logistics Comparison
    const courierMap: Record<
      string,
      {
        totalAssigned: number;
        delivered: number;
        inTransit: number;
        returned: number;
        totalCodValue: number;
      }
    > = {};

    currentOrders.forEach((o) => {
      const partner = (o.courierPartner || 'Steadfast Courier').trim();
      if (!courierMap[partner]) {
        courierMap[partner] = {
          totalAssigned: 0,
          delivered: 0,
          inTransit: 0,
          returned: 0,
          totalCodValue: 0,
        };
      }
      courierMap[partner].totalAssigned += 1;
      courierMap[partner].totalCodValue += o.grandTotal || 0;
      if (o.status === 'delivered') courierMap[partner].delivered += 1;
      if (o.status === 'handed_to_courier' || o.status === 'packaging') courierMap[partner].inTransit += 1;
      if (o.status === 'returned') courierMap[partner].returned += 1;
    });

    const courierPerformance: CourierPerformance[] = Object.entries(courierMap)
      .map(([courierName, data]) => {
        const completed = data.delivered + data.returned;
        const successRate =
          completed > 0 ? Math.round((data.delivered / completed) * 1000) / 10 : 100;
        return {
          courierName,
          totalAssigned: data.totalAssigned,
          delivered: data.delivered,
          inTransit: data.inTransit,
          returned: data.returned,
          successRate,
          totalCodValue: data.totalCodValue,
        };
      })
      .sort((a, b) => b.totalAssigned - a.totalAssigned);

    // 14. CSV Export Generator
    const generateCsvData = () => {
      const rows: string[][] = [
        ['ADOROUS LUXURY ATELIER — PERFORMANCE & CASH FLOW AUDIT'],
        ['Generated Local Time', new Date().toLocaleString('en-US')],
        ['Period Preset', config.preset.toUpperCase()],
        ['Range', `${formatDateKey(start)} to ${formatDateKey(end)}`],
        [''],
        ['FINANCIAL HEADLINES', 'CURRENT PERIOD', 'PREVIOUS PERIOD', 'VARIANCE %'],
        [
          'Net Pipeline Revenue',
          `৳${currentNetRevenue}`,
          `৳${prevNetRevenue}`,
          `${kpiMetrics.netRevenue.delta?.percentChange ?? 0}%`,
        ],
        [
          'Collected Remittance',
          `৳${currentDeliveredRevenue}`,
          `৳${prevDeliveredRevenue}`,
          `${kpiMetrics.delivered.delta?.percentChange ?? 0}%`,
        ],
        [
          'COD in Transit',
          `৳${currentInTransitRevenue}`,
          `৳${prevInTransitRevenue}`,
          `${kpiMetrics.inTransit.delta?.percentChange ?? 0}%`,
        ],
        [
          'Average Order Value (AOV)',
          `৳${currentAov}`,
          `৳${prevAov}`,
          `${kpiMetrics.aov.delta?.percentChange ?? 0}%`,
        ],
        [
          'Revenue Lost (RTO + Cancels)',
          `৳${currentLostRevenue}`,
          `৳${prevLostRevenue}`,
          `${kpiMetrics.lostRevenue.delta?.percentChange ?? 0}%`,
        ],
        [''],
        ['OPERATIONAL EFFICIENCY', 'VALUE'],
        ['Total Orders Logged', `${totalCurrentOrders}`],
        ['Delivered Parcels', `${deliveredOrders.length}`],
        ['Returned Parcels (RTO)', `${returnedOrders.length}`],
        ['Cancelled Orders', `${cancelledOrders.length}`],
        ['Return Rate (RTO %)', `${returnRate}%`],
        ['Cancellation Rate', `${cancelRate}%`],
        ['Delivery Success Rate', `${deliverySuccessRate}%`],
        [''],
        ['TOP SELLING PRODUCTS', 'UNITS SOLD', 'REVENUE (BDT)', 'SHARE %'],
        ...topProducts.map((p) => [
          p.name,
          `${p.unitsSold}`,
          `৳${p.revenue}`,
          `${p.shareOfRevenue}%`,
        ]),
        [''],
        ['REGIONAL & DISTRICT DEMAND', 'ORDERS', 'REVENUE (BDT)', 'RETURN RATE %'],
        ...topDistricts.map((d) => [
          d.district,
          `${d.ordersCount}`,
          `৳${d.revenue}`,
          `${d.returnRate}%`,
        ]),
        [''],
        ['COURIER PARTNERS', 'ASSIGNED', 'DELIVERED', 'IN TRANSIT', 'RETURNED', 'SUCCESS %'],
        ...courierPerformance.map((c) => [
          c.courierName,
          `${c.totalAssigned}`,
          `${c.delivered}`,
          `${c.inTransit}`,
          `${c.returned}`,
          `${c.successRate}%`,
        ]),
      ];

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `Adorous_Analytics_${formatDateKey(start)}_to_${formatDateKey(end)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return {
      dateRange: { start, end, prevStart, prevEnd },
      currentOrdersCount: totalCurrentOrders,
      kpiMetrics,
      funnelSteps,
      operationalRates,
      trendData,
      topProducts,
      categoriesDemand,
      couponImpact,
      regionalDemand,
      customerLoyalty,
      courierPerformance,
      generateCsvData,
    };
  }, [allOrders, config, compareWithPrevious]);
}
