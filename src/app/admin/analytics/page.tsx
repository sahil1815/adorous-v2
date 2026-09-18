'use client';

import React, { useMemo } from 'react';
import { useOrders } from '@/context/OrdersContext';
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Truck,
  Layers,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const ADOROUS_GOLD = '#C5A059';
const ADOROUS_EMERALD = '#10b981';
const ADOROUS_DARK = '#1C1C1C';
const ADOROUS_MUTED = '#a1a1aa';

export default function AdminAnalyticsPage() {
  const { orders } = useOrders();

  // Basic Metrics
  const totalOrdersCount = orders.length;
  const totalGrossRevenue = orders.reduce((s, o) => s + o.grandTotal, 0);
  const deliveredRevenue = orders
    .filter((o) => o.status === 'delivered')
    .reduce((s, o) => s + o.grandTotal, 0);
  const inTransitRevenue = orders
    .filter((o) => o.status === 'handed_to_courier' || o.status === 'packaging')
    .reduce((s, o) => s + o.grandTotal, 0);

  const aov = totalOrdersCount > 0 ? Math.round(totalGrossRevenue / totalOrdersCount) : 0;

  // Process data for charts
  const { lineChartData, pieChartData, barChartData } = useMemo(() => {
    // 1. Revenue over time (Last 7 days approx based on seed data)
    const revenueMap: Record<string, number> = {};
    const today = new Date();
    
    // Initialize past 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      revenueMap[dateStr] = 0;
    }

    // Accumulate revenue
    orders.forEach((o) => {
      const date = new Date(o.createdAt);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (revenueMap[dateStr] !== undefined) {
        revenueMap[dateStr] += o.grandTotal;
      } else {
        // Just in case there are older orders, add them (though we primarily want recent 7 days)
        revenueMap[dateStr] = (revenueMap[dateStr] || 0) + o.grandTotal;
      }
    });

    const lineData = Object.keys(revenueMap).slice(-7).map(date => ({
      date,
      Revenue: revenueMap[date],
    }));

    // 2. Regional Delivery Split (Pie Chart)
    const dhakaOrders = orders.filter((o) => o.customer.district.toLowerCase().includes('dhaka')).length;
    const outsideOrders = totalOrdersCount - dhakaOrders;
    
    const pieData = [
      { name: 'Rajshahi Metro', value: dhakaOrders },
      { name: 'Outside Dhaka', value: outsideOrders },
    ];

    // 3. Category Unit Demand (Bar Chart)
    const categoryCounts: Record<string, number> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const cat = item.product.category || 'Jewelry Sets';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + item.quantity;
      });
    });

    const barData = Object.entries(categoryCounts)
      .map(([name, units]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), Units: units }))
      .sort((a, b) => b.Units - a.Units);

    return { lineChartData: lineData, pieChartData: pieData, barChartData: barData };
  }, [orders, totalOrdersCount]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#222] border border-[#333] p-3 shadow-lg">
          <p className="text-paper text-xs font-semibold mb-1">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="text-xs" style={{ color: p.color }}>
              {p.name}: {p.name === 'Revenue' ? `৳${p.value.toLocaleString()}` : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const COLORS = [ADOROUS_GOLD, ADOROUS_EMERALD, '#a1a1aa', '#52525b'];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl text-paper font-normal">
          Performance & Cash Flow
        </h1>
        <p className="text-xs text-paper/60 mt-1">
          Financial health, Cash on Delivery courier remittances, and regional demand analytics.
        </p>
      </div>

      {/* 4 Financial Headline Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#171717] border border-gold/30 p-5 rounded-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-gold tracking-wider">
              Gross Pipeline Revenue
            </span>
            <TrendingUp className="w-4 h-4 text-gold" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-gold-light font-bold tabular-nums">
            ৳{totalGrossRevenue.toLocaleString('en-US')}
          </div>
          <span className="text-[10px] text-paper/40 block">Total order value logged</span>
        </div>

        <div className="bg-[#171717] border border-emerald-600/30 p-5 rounded-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
              Collected Remittance
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-emerald-300 font-bold tabular-nums">
            ৳{deliveredRevenue.toLocaleString('en-US')}
          </div>
          <span className="text-[10px] text-emerald-200/50 block">Remitted by courier</span>
        </div>

        <div className="bg-[#171717] border border-amber-600/30 p-5 rounded-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-amber-400 tracking-wider">
              COD in Transit
            </span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-amber-300 font-bold tabular-nums">
            ৳{inTransitRevenue.toLocaleString('en-US')}
          </div>
          <span className="text-[10px] text-amber-200/50 block">With Steadfast riders</span>
        </div>

        <div className="bg-[#171717] border border-white/10 p-5 rounded-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-paper/50 tracking-wider">
              Average Order Value (AOV)
            </span>
            <DollarSign className="w-4 h-4 text-paper/40" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif text-paper font-bold tabular-nums">
            ৳{aov.toLocaleString('en-US')}
          </div>
          <span className="text-[10px] text-paper/40 block">Per patron checkout</span>
        </div>
      </div>

      {/* Revenue Trend Line Chart */}
      <div className="bg-[#171717] border border-white/10 p-6 rounded-xs space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-serif text-base text-paper font-medium">Revenue Trend</h3>
            <span className="text-[11px] text-paper/50">Gross pipeline revenue over the last 7 days</span>
          </div>
          <LineChartIcon className="w-4 h-4 text-gold" />
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#666" 
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#666" 
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `৳${val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="Revenue" 
                stroke={ADOROUS_GOLD} 
                strokeWidth={3}
                dot={{ fill: ADOROUS_GOLD, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#fff', stroke: ADOROUS_GOLD, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid for Pie and Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Regional Order Split Pie Chart */}
        <div className="bg-[#171717] border border-white/10 p-6 rounded-xs space-y-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-serif text-base text-paper font-medium">Regional Delivery Demand</h3>
              <span className="text-[11px] text-paper/50">Rajshahi Metro vs. 63 Outside Districts</span>
            </div>
            <PieChartIcon className="w-4 h-4 text-emerald-400" />
          </div>
          
          <div className="h-64 w-full flex-grow relative flex items-center justify-center">
            {totalOrdersCount === 0 ? (
              <p className="text-text-muted text-xs">No order data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value, entry, index) => <span className="text-paper/80 text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {totalOrdersCount > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-8">
                <div className="text-center">
                  <span className="block text-2xl font-serif text-paper">{totalOrdersCount}</span>
                  <span className="block text-[9px] uppercase tracking-wider text-paper/50">Orders</span>
                </div>
              </div>
            )}
          </div>
          <div className="pt-2 border-t border-white/5 text-[11px] text-paper/50 text-center">
            Free shipping threshold of ৳2,000 drives higher basket sizes outside Dhaka.
          </div>
        </div>

        {/* Category Unit Demand Bar Chart */}
        <div className="bg-[#171717] border border-white/10 p-6 rounded-xs space-y-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-serif text-base text-paper font-medium">Category Unit Demand</h3>
              <span className="text-[11px] text-paper/50">Total units sold per category</span>
            </div>
            <Layers className="w-4 h-4 text-gold" />
          </div>
          
          <div className="h-64 w-full flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a1a1aa', fontSize: 11 }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: '#222' }} 
                  content={<CustomTooltip />}
                />
                <Bar dataKey="Units" fill={ADOROUS_GOLD} radius={[0, 4, 4, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? ADOROUS_GOLD : '#715a31'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-2 border-t border-white/5 text-[11px] text-paper/50 text-center">
            Fine Jewelry Sets and Churi stacks represent the highest demand.
          </div>
        </div>
        
      </div>
    </div>
  );
}
