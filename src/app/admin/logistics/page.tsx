'use client';

import React, { useState } from 'react';
import { useOrders, AdminOrder } from '@/context/OrdersContext';
import {
  Truck,
  Printer,
  FileCheck,
  Building2,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function AdminLogisticsPage() {
  const { orders, updateOrderCourier } = useOrders();

  const [filterPartner, setFilterPartner] = useState('all');

  // Orders ready for or currently in dispatch
  const dispatchOrders = orders.filter((o) => {
    const isDispatchReady =
      o.status === 'verified' ||
      o.status === 'packaging' ||
      o.status === 'handed_to_courier';

    const matchesPartner =
      filterPartner === 'all' || o.courierPartner === filterPartner;

    return isDispatchReady && matchesPartner;
  });

  const totalCodValue = dispatchOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const dhakaCount = dispatchOrders.filter((o) =>
    o.customer.district.toLowerCase().includes('dhaka')
  ).length;
  const outsideCount = dispatchOrders.length - dhakaCount;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Manifest Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-paper font-normal">
            Courier Dispatch Manifest
          </h1>
          <p className="text-xs text-paper/60 mt-1">
            Generate and print daily handover manifests for Steadfast & Pathao courier pickup riders across Bangladesh.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2.5 bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-wider uppercase rounded-xs transition-all flex items-center space-x-2 shadow-sm shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Print Daily Manifest</span>
        </button>
      </div>

      {/* Logistics Overview Cards (Hidden on Print) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
        <div className="bg-[#171717] border border-white/10 p-4 rounded-xs">
          <span className="text-[10px] uppercase text-paper/50 block font-medium">Manifest Parcels</span>
          <span className="text-2xl font-serif text-paper font-semibold mt-0.5 block">
            {dispatchOrders.length}
          </span>
          <span className="text-[10px] text-paper/40">Ready for pickup</span>
        </div>

        <div className="bg-[#171717] border border-gold/30 p-4 rounded-xs">
          <span className="text-[10px] uppercase text-gold block font-medium">Total COD to Collect</span>
          <span className="text-2xl font-serif text-gold-light font-semibold mt-0.5 block">
            ৳{totalCodValue.toLocaleString('en-US')}
          </span>
          <span className="text-[10px] text-gold/50">Courier remittance</span>
        </div>

        <div className="bg-[#171717] border border-white/10 p-4 rounded-xs">
          <span className="text-[10px] uppercase text-paper/50 block font-medium">Rajshahi Metro</span>
          <span className="text-2xl font-serif text-paper font-semibold mt-0.5 block">
            {dhakaCount}
          </span>
          <span className="text-[10px] text-paper/40">24–48h delivery</span>
        </div>

        <div className="bg-[#171717] border border-white/10 p-4 rounded-xs">
          <span className="text-[10px] uppercase text-paper/50 block font-medium">Outside Dhaka</span>
          <span className="text-2xl font-serif text-paper font-semibold mt-0.5 block">
            {outsideCount}
          </span>
          <span className="text-[10px] text-paper/40">63 Districts (Steadfast)</span>
        </div>
      </div>

      {/* Manifest Document Body */}
      <div className="bg-[#171717] print:bg-white print:text-black border border-white/10 print:border-none p-6 sm:p-8 rounded-xs space-y-6">
        {/* Manifest Official Header */}
        <div className="border-b border-white/10 print:border-black/20 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif text-xl sm:text-2xl tracking-[0.16em] uppercase text-gold print:text-black font-semibold">
                Adorous Fashion Dhaka
              </span>
              <span className="px-2 py-0.5 bg-sand print:bg-gray-100 text-ink text-[10px] uppercase font-bold rounded-xs">
                Logistics Desk
              </span>
            </div>
            <p className="text-xs text-paper/60 print:text-gray-600 mt-1">
              Adorous Fashion Dispatch Office · Tejgaon Hub Pickup Branch
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-paper/70 print:text-gray-700 space-y-1">
            <div className="flex items-center sm:justify-end gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-gold print:text-black" />
              <span>Manifest Date: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</span>
            </div>
            <div className="text-[11px] text-paper/40 print:text-gray-500 font-mono">
              Batch: ADO-LOG-{new Date().toISOString().slice(0, 10).replace(/-/g, '')}
            </div>
          </div>
        </div>

        {/* Courier Partner Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#1C1C1C] print:bg-gray-50 p-4 rounded-xs border border-white/5 print:border-gray-200">
          <div>
            <span className="text-[10px] uppercase text-paper/50 print:text-gray-500 font-semibold block">
              Primary Courier Service Partner:
            </span>
            <strong className="text-sm text-gold-light print:text-black block mt-0.5">
              Steadfast Courier Bangladesh Ltd.
            </strong>
            <span className="text-[11px] text-paper/60 print:text-gray-600">
              Contract Merchant Account · Daily 5:00 PM Handover
            </span>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] uppercase text-paper/50 print:text-gray-500 font-semibold block">
              Merchant Contact / Helpline:
            </span>
            <span className="font-mono text-paper print:text-black mt-0.5 block">
              +880 15-7773-1381 (Adorous Logistics)
            </span>
            <span className="text-[11px] text-paper/60 print:text-gray-600">
              Steadfast Tejgaon Hub Hotline: 09678-045045
            </span>
          </div>
        </div>

        {/* Manifest Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 print:border-black text-[11px] uppercase tracking-wider text-paper/50 print:text-gray-600 bg-[#141414] print:bg-gray-100">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Order Ref</th>
                <th className="py-2.5 px-3">Consignment ID</th>
                <th className="py-2.5 px-3">Recipient & Phone</th>
                <th className="py-2.5 px-3">District / Destination</th>
                <th className="py-2.5 px-3 text-right">COD Amount (৳)</th>
                <th className="py-2.5 px-3 text-center print:table-cell hidden sm:table-cell">Rider Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 print:divide-gray-200">
              {dispatchOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-paper/40 print:text-gray-500">
                    No orders currently queued for courier handover.
                  </td>
                </tr>
              ) : (
                dispatchOrders.map((order, index) => (
                  <tr key={order.orderId} className="hover:bg-white/5 print:hover:bg-transparent">
                    <td className="py-3 px-3 font-mono text-paper/50 print:text-gray-500">{index + 1}</td>
                    <td className="py-3 px-3 font-mono font-bold text-gold print:text-black">
                      {order.orderId}
                    </td>
                    <td className="py-3 px-3 font-mono text-paper print:text-black">
                      {order.consignmentId || 'Awaiting Hub Scan'}
                    </td>
                    <td className="py-3 px-3">
                      <strong className="text-paper print:text-black block">{order.customer.fullName}</strong>
                      <span className="font-mono text-[11px] text-paper/60 print:text-gray-600">
                        {order.customer.phone}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <strong className="text-gold-light print:text-black block">{order.customer.district}</strong>
                      <span className="text-[11px] text-paper/60 print:text-gray-600 line-clamp-1">
                        {order.customer.address}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-paper print:text-black text-sm">
                      ৳{order.grandTotal.toLocaleString('en-US')}
                    </td>
                    <td className="py-3 px-3 text-center print:table-cell hidden sm:table-cell">
                      <div className="w-5 h-5 border border-white/20 print:border-black rounded-xs mx-auto" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-white/20 print:border-black font-semibold bg-[#141414] print:bg-gray-100 text-xs">
                <td colSpan={5} className="py-3 px-3 text-right text-paper print:text-black uppercase tracking-wider">
                  Total Courier Remittance Receivable ({dispatchOrders.length} Parcels):
                </td>
                <td className="py-3 px-3 text-right text-gold print:text-black font-mono text-base font-bold">
                  ৳{totalCodValue.toLocaleString('en-US')}
                </td>
                <td className="print:table-cell hidden sm:table-cell" />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Handover Signatures Row */}
        <div className="pt-8 border-t border-white/10 print:border-black/30 grid grid-cols-2 gap-8 text-xs">
          <div className="space-y-8">
            <span className="text-[11px] uppercase tracking-wider text-paper/50 print:text-gray-600 block font-semibold">
              Dispatched By (Adorous Staff):
            </span>
            <div className="border-b border-white/30 print:border-black w-48" />
            <span className="text-[11px] text-paper/40 print:text-gray-500 block">
              Signature & Time Stamp
            </span>
          </div>

          <div className="space-y-8 text-right">
            <span className="text-[11px] uppercase tracking-wider text-paper/50 print:text-gray-600 block font-semibold">
              Received By (Steadfast Courier Rider):
            </span>
            <div className="border-b border-white/30 print:border-black w-48 ml-auto" />
            <span className="text-[11px] text-paper/40 print:text-gray-500 block">
              Rider ID, Signature & Seal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
