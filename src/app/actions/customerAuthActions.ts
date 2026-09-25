'use server';

import { prisma } from '@/lib/db';
import {
  hashPassword,
  verifyPassword,
  signCustomerToken,
  setCustomerSessionCookie,
  clearCustomerSessionCookie,
  getCustomerSessionFromCookie,
} from '@/lib/customerAuth';
import { CustomerProfile, SavedAddress } from '@/types';
import { revalidatePath } from 'next/cache';

// Helper to sanitize phone number (ensures 11-digit BD standard like 017XXXXXXXX)
function sanitizeBdPhone(raw: string): string {
  let cleaned = raw.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+880')) {
    cleaned = cleaned.replace('+880', '0');
  } else if (cleaned.startsWith('880')) {
    cleaned = cleaned.replace('880', '0');
  }
  return cleaned;
}

function sanitizeProfile(user: any): CustomerProfile {
  return {
    id: user.id,
    fullName: user.fullName,
    phone: user.phone,
    email: user.email ?? null,
    district: user.district ?? null,
    address: user.address ?? null,
    whatsappUpdates: Boolean(user.whatsappUpdates),
    createdAt: user.createdAt.toISOString(),
    savedAddresses: (user.savedAddresses || []).map((addr: any) => ({
      id: addr.id,
      label: addr.label,
      recipientName: addr.recipientName,
      phone: addr.phone,
      district: addr.district,
      address: addr.address,
      isDefault: Boolean(addr.isDefault),
    })),
  };
}

// ── Register New Customer ──
export async function customerRegisterAction(data: {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
  district?: string;
  address?: string;
  whatsappUpdates?: boolean;
}) {
  try {
    const fullName = data.fullName.trim();
    if (fullName.length < 2) {
      return { success: false, error: 'Please enter your full name.' };
    }

    const cleanPhone = sanitizeBdPhone(data.phone);
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      return {
        success: false,
        error: 'Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678).',
      };
    }

    const cleanEmail = data.email?.trim().toLowerCase() || null;
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Check existing phone
    const existingPhone = await prisma.customerUser.findUnique({
      where: { phone: cleanPhone },
    });
    if (existingPhone) {
      return {
        success: false,
        error: 'An account with this phone number already exists. Please sign in instead.',
      };
    }

    // Check existing email if provided
    if (cleanEmail) {
      const existingEmail = await prisma.customerUser.findUnique({
        where: { email: cleanEmail },
      });
      if (existingEmail) {
        return {
          success: false,
          error: 'An account with this email address already exists. Please sign in instead.',
        };
      }
    }

    const passwordHash = hashPassword(data.password);

    // Create user and initial address if provided
    const user = await prisma.customerUser.create({
      data: {
        fullName,
        phone: cleanPhone,
        email: cleanEmail,
        passwordHash,
        district: data.district?.trim() || null,
        address: data.address?.trim() || null,
        whatsappUpdates: data.whatsappUpdates ?? true,
        savedAddresses:
          data.address?.trim() && data.district?.trim()
            ? {
                create: {
                  label: 'Home',
                  recipientName: fullName,
                  phone: cleanPhone,
                  district: data.district.trim(),
                  address: data.address.trim(),
                  isDefault: true,
                },
              }
            : undefined,
      },
      include: { savedAddresses: true },
    });

    // Retroactively link past guest orders placed with this phone number
    try {
      const pastOrders = await prisma.order.findMany({
        where: {
          customer: { phone: cleanPhone },
          customerUserId: null,
        },
      });
      if (pastOrders.length > 0) {
        await prisma.order.updateMany({
          where: { id: { in: pastOrders.map((o) => o.id) } },
          data: { customerUserId: user.id },
        });
      }
    } catch (e) {
      console.warn('[customerRegisterAction] Could not link past orders:', e);
    }

    // Generate JWT and set secure cookie
    const token = await signCustomerToken({
      sub: user.id,
      phone: user.phone,
      name: user.fullName,
      email: user.email,
    });
    await setCustomerSessionCookie(token);

    revalidatePath('/account');
    revalidatePath('/checkout');

    return { success: true, customer: sanitizeProfile(user) };
  } catch (error: any) {
    console.error('[customerRegisterAction] Error registering customer:', error);
    return { success: false, error: error?.message || 'Failed to create your account. Please try again.' };
  }
}

// ── Customer Login ──
export async function customerLoginAction(data: {
  identifier: string; // phone or email
  password: string;
}) {
  try {
    const rawIdentifier = data.identifier.trim();
    if (!rawIdentifier) {
      return { success: false, error: 'Please enter your phone number or email address.' };
    }
    if (!data.password) {
      return { success: false, error: 'Please enter your account password.' };
    }

    const cleanPhone = sanitizeBdPhone(rawIdentifier);
    const cleanEmail = rawIdentifier.toLowerCase();

    // Query user by phone or email
    const user = await prisma.customerUser.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { email: cleanEmail },
          { phone: rawIdentifier },
        ],
      },
      include: { savedAddresses: true },
    });

    if (!user) {
      return {
        success: false,
        error: 'No account found with this phone number or email. Please check details or create a new account.',
      };
    }

    const isValid = verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Issue session token
    const token = await signCustomerToken({
      sub: user.id,
      phone: user.phone,
      name: user.fullName,
      email: user.email,
    });
    await setCustomerSessionCookie(token);

    revalidatePath('/account');
    revalidatePath('/checkout');

    return { success: true, customer: sanitizeProfile(user) };
  } catch (error: any) {
    console.error('[customerLoginAction] Error logging in:', error);
    return { success: false, error: error?.message || 'Login failed. Please try again.' };
  }
}

// ── Customer Logout ──
export async function customerLogoutAction() {
  await clearCustomerSessionCookie();
  revalidatePath('/');
  revalidatePath('/account');
  revalidatePath('/checkout');
  return { success: true };
}

// ── Get Current Customer Profile ──
export async function getCurrentCustomerAction(): Promise<CustomerProfile | null> {
  try {
    const session = await getCustomerSessionFromCookie();
    if (!session || !session.sub) return null;

    const user = await prisma.customerUser.findUnique({
      where: { id: session.sub },
      include: { savedAddresses: { orderBy: { isDefault: 'desc' } } },
    });

    if (!user) {
      await clearCustomerSessionCookie();
      return null;
    }

    return sanitizeProfile(user);
  } catch (error) {
    console.warn('[getCurrentCustomerAction] Error fetching session:', error);
    return null;
  }
}

// ── Update Customer Profile ──
export async function updateCustomerProfileAction(data: {
  fullName?: string;
  email?: string;
  phone?: string;
  district?: string;
  address?: string;
  whatsappUpdates?: boolean;
}) {
  try {
    const session = await getCustomerSessionFromCookie();
    if (!session || !session.sub) {
      return { success: false, error: 'You must be signed in to update your profile.' };
    }

    const updateData: any = {};
    if (data.fullName?.trim()) updateData.fullName = data.fullName.trim();
    if (data.district !== undefined) updateData.district = data.district?.trim() || null;
    if (data.address !== undefined) updateData.address = data.address?.trim() || null;
    if (data.whatsappUpdates !== undefined) updateData.whatsappUpdates = data.whatsappUpdates;

    if (data.email !== undefined) {
      const cleanEmail = data.email?.trim().toLowerCase() || null;
      if (cleanEmail) {
        const conflicting = await prisma.customerUser.findFirst({
          where: { email: cleanEmail, NOT: { id: session.sub } },
        });
        if (conflicting) {
          return { success: false, error: 'This email is already in use by another account.' };
        }
      }
      updateData.email = cleanEmail;
    }

    if (data.phone) {
      const cleanPhone = sanitizeBdPhone(data.phone);
      if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
        return { success: false, error: 'Please enter a valid 11-digit Bangladeshi mobile number.' };
      }
      const conflicting = await prisma.customerUser.findFirst({
        where: { phone: cleanPhone, NOT: { id: session.sub } },
      });
      if (conflicting) {
        return { success: false, error: 'This phone number is already registered to another account.' };
      }
      updateData.phone = cleanPhone;
    }

    const updated = await prisma.customerUser.update({
      where: { id: session.sub },
      data: updateData,
      include: { savedAddresses: true },
    });

    // Refresh token with updated details
    const newToken = await signCustomerToken({
      sub: updated.id,
      phone: updated.phone,
      name: updated.fullName,
      email: updated.email,
    });
    await setCustomerSessionCookie(newToken);

    revalidatePath('/account');
    return { success: true, customer: sanitizeProfile(updated) };
  } catch (error: any) {
    console.error('[updateCustomerProfileAction] Error:', error);
    return { success: false, error: error?.message || 'Failed to update profile.' };
  }
}

// ── Get Customer Orders ──
export async function getCustomerOrdersAction() {
  try {
    const session = await getCustomerSessionFromCookie();
    if (!session || !session.sub) {
      return { success: false, error: 'Not authenticated', orders: [] };
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { customerUserId: session.sub },
          { customer: { phone: session.phone } },
        ],
      },
      include: {
        items: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const serializedOrders = orders.map((o) => ({
      id: o.id,
      orderId: o.orderId,
      status: o.status,
      courierPartner: o.courierPartner,
      consignmentId: o.consignmentId,
      paymentMethod: o.paymentMethod,
      subtotal: o.subtotal,
      shippingFee: o.shippingFee,
      discountAmount: o.discountAmount,
      couponCode: o.couponCode,
      grandTotal: o.grandTotal,
      createdAt: o.createdAt.toISOString(),
      customer: o.customer
        ? {
            fullName: o.customer.fullName,
            phone: o.customer.phone,
            address: o.customer.address,
            district: o.customer.district,
          }
        : null,
      items: o.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        productName: i.productName,
        productImage: i.productImage,
        price: i.price,
        quantity: i.quantity,
        colorName: i.colorName,
        colorHex: i.colorHex,
        selectedSize: i.selectedSize,
      })),
    }));

    return { success: true, orders: serializedOrders };
  } catch (error: any) {
    console.error('[getCustomerOrdersAction] Error:', error);
    return { success: false, error: error?.message || 'Failed to fetch orders', orders: [] };
  }
}

// ── Saved Addresses Management ──
export async function addSavedAddressAction(data: {
  label: string;
  recipientName: string;
  phone: string;
  district: string;
  address: string;
  isDefault?: boolean;
}) {
  try {
    const session = await getCustomerSessionFromCookie();
    if (!session || !session.sub) {
      return { success: false, error: 'Not authenticated' };
    }

    if (!data.recipientName.trim() || !data.address.trim() || !data.district.trim()) {
      return { success: false, error: 'Recipient name, address, and district are required.' };
    }

    const cleanPhone = sanitizeBdPhone(data.phone);

    if (data.isDefault) {
      await prisma.savedAddress.updateMany({
        where: { customerUserId: session.sub },
        data: { isDefault: false },
      });
    }

    const created = await prisma.savedAddress.create({
      data: {
        customerUserId: session.sub,
        label: data.label.trim() || 'Home',
        recipientName: data.recipientName.trim(),
        phone: cleanPhone,
        district: data.district.trim(),
        address: data.address.trim(),
        isDefault: Boolean(data.isDefault),
      },
    });

    revalidatePath('/account');
    revalidatePath('/account/addresses');
    revalidatePath('/checkout');

    return {
      success: true,
      address: {
        id: created.id,
        label: created.label,
        recipientName: created.recipientName,
        phone: created.phone,
        district: created.district,
        address: created.address,
        isDefault: created.isDefault,
      },
    };
  } catch (error: any) {
    console.error('[addSavedAddressAction] Error:', error);
    return { success: false, error: error?.message || 'Failed to save address' };
  }
}

export async function deleteSavedAddressAction(addressId: string) {
  try {
    const session = await getCustomerSessionFromCookie();
    if (!session || !session.sub) {
      return { success: false, error: 'Not authenticated' };
    }

    await prisma.savedAddress.deleteMany({
      where: { id: addressId, customerUserId: session.sub },
    });

    revalidatePath('/account');
    revalidatePath('/account/addresses');
    return { success: true };
  } catch (error: any) {
    console.error('[deleteSavedAddressAction] Error:', error);
    return { success: false, error: error?.message || 'Failed to remove address' };
  }
}
