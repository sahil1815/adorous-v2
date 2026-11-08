'use client';

import React, { useState } from 'react';
import { useOrders } from '@/context/OrdersContext';
import { DateRangeConfig } from '@/components/admin/analytics/types';
import { useAnalyticsData } from '@/components/admin/analytics/useAnalyticsData';
import DateRangeSelector from '@/components/admin/analytics/DateRangeSelector';
import FinancialHealthCards from '@/components/admin/analytics/FinancialHealthCards';
import OrderFunnelSection from '@/components/admin/analytics/OrderFunnelSection';
import RevenueTrendChart from '@/components/admin/analytics/RevenueTrendChart';
import ProductIntelligenceSection from '@/components/admin/analytics/ProductIntelligenceSection';
import CustomerRegionalSection from '@/components/admin/analytics/CustomerRegionalSection';
import { BarChart3 } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { orders } = useOrders();

  // Date range filter state (defaults to 30 days)
  const [dateConfig, setDateConfig] = useState<DateRangeConfig>({
    preset: '30d',
    startDate: '',
    endDate: '',
  });

  const [compareWithPrevious, setCompareWithPrevious] = useState<boolean>(true);

  // Compute all analytics metrics using the custom data engine
  const {
    dateRange,
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
  } = useAnalyticsData(orders, dateConfig, compareWithPrevious);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Page Header */}
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Performance & Cash Flow
            </h1>
            <span className="bg-gold/20 text-gold text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-xs border border-gold/30">
              Realtime BI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 font-medium mt-1">
            Financial health, courier cash remittance tracking, fulfillment velocity, and regional demand intelligence.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs text-zinc-400 font-mono">
            {orders.length} total database records
          </span>
        </div>
      </div>

      {/* 2. Global Date Range Selector Bar */}
      <DateRangeSelector
        config={dateConfig}
        onChangeConfig={setDateConfig}
        compareWithPrevious={compareWithPrevious}
        onToggleCompare={setCompareWithPrevious}
        onExportCsv={generateCsvData}
        dateRange={dateRange}
      />

      {/* 3. Section 1: 5 Financial Headline KPI Cards */}
      <FinancialHealthCards
        kpis={kpiMetrics}
        compareWithPrevious={compareWithPrevious}
      />

      {/* 4. Section 2: Order Fulfillment Funnel & Operational Health */}
      <OrderFunnelSection
        funnelSteps={funnelSteps}
        operationalRates={operationalRates}
        compareWithPrevious={compareWithPrevious}
      />

      {/* 5. Section 3: Revenue & Order Velocity Dynamics (Dual Axis Chart) */}
      <RevenueTrendChart
        trendData={trendData}
        compareWithPrevious={compareWithPrevious}
      />

      {/* 6. Section 4: Product Intelligence, SKU Demand & Promo Vouchers */}
      <ProductIntelligenceSection
        topProducts={topProducts}
        categoriesDemand={categoriesDemand}
        couponImpact={couponImpact}
      />

      {/* 7. Section 5: Regional Demand, Patron Loyalty & Courier Logistics */}
      <CustomerRegionalSection
        regionalDemand={regionalDemand}
        customerLoyalty={customerLoyalty}
        courierPerformance={courierPerformance}
      />

      {/* 8. Audit Footer */}
      <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-3.5 h-3.5 text-gold" />
          <span>Adorous Executive Business Intelligence Desk</span>
        </div>
        <div>Calculated in real-time from courier consignment feeds and verified sales logs</div>
      </div>
    </div>
  );
}
