'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageCircle, Truck, ShieldCheck } from 'lucide-react';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalItems,
    subtotal,
    freeShippingThreshold,
    remainingForFreeShipping,
  } = useCart();

  if (!isOpen) return null;

  // WhatsApp order text generation
  const generateWhatsAppOrderUrl = () => {
    let text = `Hello Adorous Fashion, I would like to place a Cash on Delivery order for:\n\n`;
    items.forEach((item, index) => {
      text += `${index + 1}. ${item.product.name}\n   Colour: ${item.selectedColor.name}\n`;
      if (item.selectedSize) {
        text += `   Size: ${item.selectedSize}\n`;
      }
      text += `   Qty: ${item.quantity} × ৳${item.product.price} = ৳${item.product.price * item.quantity}\n\n`;
    });
    text += `Subtotal: ৳${subtotal.toLocaleString('en-US')}\n`;
    if (remainingForFreeShipping === 0) {
      text += `Delivery: Free (Order > ৳2,000)\n`;
    } else {
      text += `Delivery: Dhaka ৳70 / Outside Dhaka ৳130\n`;
    }
    text += `\nPlease confirm my order.`;
    return `https://wa.me/8801577731381?text=${encodeURIComponent(text)}`;
  };

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/75 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeCart}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-paper shadow-2xl flex flex-col z-50 border-l border-line">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-ink text-paper flex items-center justify-between border-b border-gold/30">
          <div className="flex items-center space-x-2.5">
            <ShoppingBag className="w-5 h-5 text-gold" />
            <span className="font-serif text-lg tracking-wider uppercase text-gold-light font-semibold">
              Your Bag ({totalItems})
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-paper/70 hover:text-gold transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-sand/70 p-3.5 border-b border-line text-xs">
          <div className="flex items-center justify-between font-medium text-ink mb-1.5">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-gold-deep" />
              {remainingForFreeShipping > 0 ? (
                <span>
                  Add <strong className="text-gold-deep tabular-nums">৳{remainingForFreeShipping.toLocaleString('en-US')}</strong> more for <strong className="text-gold-deep">FREE Delivery</strong>
                </span>
              ) : (
                <span className="text-success font-semibold">
                  Congratulations! You unlocked Free Delivery across Bangladesh.
                </span>
              )}
            </span>
            <span className="text-text-muted tabular-nums">{progressPercent}%</span>
          </div>
          <div className="w-full bg-line h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                remainingForFreeShipping === 0 ? 'bg-success' : 'bg-gold'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-line">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center text-text-muted">
                <ShoppingBag className="w-8 h-8 text-gold" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-medium text-ink">Your bag is empty</h4>
                <p className="text-xs text-text-muted mt-1 max-w-xs">
                  Discover our curated jewelry sets, churi bangles, and boutique bags.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="inline-flex items-center px-6 py-2.5 bg-ink text-gold-light text-xs uppercase tracking-wider font-semibold rounded-[2px] hover:bg-ink-soft transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.product.id}-${item.selectedColor.id}-${item.selectedSize}`} className="py-4 first:pt-0 last:pb-0 flex space-x-4">
                {/* Thumbnail */}
                <div className="relative w-20 h-24 bg-stone shrink-0 border border-line overflow-hidden">
                  <Image
                    src={item.product.featuredImage}
                    alt={item.product.name}
                    fill
                    className="object-cover object-center"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <h5 className="font-medium text-sm text-ink line-clamp-1">
                        {item.product.name}
                      </h5>
                      <button
                        onClick={() => removeItem(item.product.id, item.selectedColor.id, item.selectedSize)}
                        className="text-text-muted hover:text-danger p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Color & Size Info */}
                    <div className="mt-1 flex items-center space-x-2 text-xs text-text-muted">
                      <span className="flex items-center space-x-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20"
                          style={{ backgroundColor: item.selectedColor.hex }}
                        />
                        <span>{item.selectedColor.name}</span>
                      </span>
                      {item.selectedSize && (
                        <>
                          <span>•</span>
                          <span>Size: {item.selectedSize}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-line rounded-[2px] bg-sand/40">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedColor.id, item.quantity - 1, item.selectedSize)}
                        className="p-1 text-ink hover:bg-sand transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold tabular-nums text-ink">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedColor.id, item.quantity + 1, item.selectedSize)}
                        className="p-1 text-ink hover:bg-sand transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-sm font-semibold text-ink tabular-nums">
                      ৳{(item.product.price * item.quantity).toLocaleString('en-US')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer / Checkout */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-sand/80 border-t border-line space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted font-medium">Estimated Subtotal</span>
              <span className="font-semibold text-lg text-ink tabular-nums">
                ৳{subtotal.toLocaleString('en-US')}
              </span>
            </div>

            <p className="text-[11px] text-text-muted flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
              <span>Cash on Delivery (COD) · Zero advance payment required</span>
            </p>

            <div className="space-y-2 pt-1">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-gold hover:bg-gold-light text-ink font-semibold text-xs tracking-wider uppercase rounded-[2px] transition-colors shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={generateWhatsAppOrderUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 py-2.5 bg-ink text-gold-light hover:bg-ink-soft border border-gold/40 text-xs tracking-wider uppercase font-medium rounded-[2px] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-whatsapp" />
                <span>Instant Order via WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
