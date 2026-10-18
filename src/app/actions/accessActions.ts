'use server';

import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { InvitationData } from '@/types';

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Gracefully ignore when executed outside Next request pipeline
  }
}

// ── 1. Create a New Invitation ──
export async function createInvitationAction(data: {
  name: string;
  email: string;
  note?: string;
}) {
  try {
    const inviteeName = data.name.trim();
    const inviteeEmail = data.email.trim().toLowerCase();

    if (!inviteeName || inviteeName.length < 2) {
      return { success: false, error: 'Please provide a valid recipient name.' };
    }

    if (!inviteeEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteeEmail)) {
      return { success: false, error: 'Please enter a valid recipient email address.' };
    }

    // Check if there is already an active pending invitation for this email
    const existingInvite = await prisma.invitation.findFirst({
      where: {
        inviteeEmail,
        status: 'PENDING',
      },
    });

    if (existingInvite) {
      return {
        success: true,
        alreadyExisted: true,
        invitation: existingInvite,
        inviteLink: `/invite/${existingInvite.token}`,
        message: 'An active invitation already exists for this email address.',
      };
    }

    // Generate secure random token
    const token = 'inv_' + crypto.randomBytes(12).toString('hex');

    const invitation = await prisma.invitation.create({
      data: {
        token,
        inviteeName,
        inviteeEmail,
        note: data.note?.trim() || null,
        status: 'PENDING',
      },
    });

    safeRevalidate('/admin/access');

    return {
      success: true,
      invitation,
      inviteLink: `/invite/${token}`,
    };
  } catch (error: any) {
    console.error('[createInvitationAction] Error:', error);
    return { success: false, error: error?.message || 'Failed to create invitation link.' };
  }
}

// ── 2. Retrieve Invitation by Token (for Invitee verification) ──
export async function getInvitationByTokenAction(token: string) {
  try {
    if (!token || typeof token !== 'string') {
      return { success: false, error: 'Invalid invitation link token.' };
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token: token.trim() },
      include: {
        claimedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            status: true,
          },
        },
      },
    });

    if (!invitation) {
      return { success: false, error: 'This invitation was not found or the link is invalid.' };
    }

    if (invitation.status === 'REVOKED') {
      return { success: false, error: 'This invitation has been revoked by the atelier owner.' };
    }

    if (invitation.status === 'ACCEPTED') {
      return {
        success: false,
        claimed: true,
        error: 'This invitation has already been claimed and registered.',
      };
    }

    return {
      success: true,
      invitation: {
        id: invitation.id,
        token: invitation.token,
        inviteeName: invitation.inviteeName,
        inviteeEmail: invitation.inviteeEmail,
        note: invitation.note,
        status: invitation.status,
        expiresAt: invitation.expiresAt?.toISOString() || null,
      },
    };
  } catch (error: any) {
    console.error('[getInvitationByTokenAction] Error:', error);
    return { success: false, error: 'Failed to verify invitation link.' };
  }
}

// ── 3. Get All Invitations (For Owner Admin Desk) ──
export async function getAllInvitationsAction(): Promise<InvitationData[]> {
  try {
    const invites = await prisma.invitation.findMany({
      include: {
        claimedByUser: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invites.map((inv) => ({
      id: inv.id,
      token: inv.token,
      inviteeName: inv.inviteeName,
      inviteeEmail: inv.inviteeEmail,
      note: inv.note,
      status: inv.status as any,
      claimedByUserId: inv.claimedByUserId,
      registeredEmail: inv.registeredEmail,
      registeredName: inv.registeredName,
      expiresAt: inv.expiresAt ? inv.expiresAt.toISOString() : null,
      createdAt: inv.createdAt.toISOString(),
      updatedAt: inv.updatedAt.toISOString(),
      claimedByUser: inv.claimedByUser
        ? {
            id: inv.claimedByUser.id,
            fullName: inv.claimedByUser.fullName,
            phone: inv.claimedByUser.phone,
            email: inv.claimedByUser.email,
            status: inv.claimedByUser.status,
            createdAt: inv.claimedByUser.createdAt.toISOString(),
          }
        : null,
    }));
  } catch (error) {
    console.error('[getAllInvitationsAction] Error:', error);
    return [];
  }
}

// ── 4. Revoke Invitation ──
export async function revokeInvitationAction(invitationId: string) {
  try {
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'REVOKED' },
    });

    safeRevalidate('/admin/access');
    return { success: true };
  } catch (error: any) {
    console.error('[revokeInvitationAction] Error:', error);
    return { success: false, error: error?.message || 'Failed to revoke invitation.' };
  }
}

// ── 5. Get Pending Approvals (Users waiting for owner authorization) ──
export async function getPendingApprovalsAction() {
  try {
    const pendingUsers = await prisma.customerUser.findMany({
      where: { status: 'PENDING' },
      include: {
        invitation: true,
        orders: {
          select: {
            id: true,
            orderId: true,
            grandTotal: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return pendingUsers.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      phone: u.phone,
      email: u.email,
      district: u.district,
      address: u.address,
      status: u.status,
      inviteToken: u.inviteToken,
      createdAt: u.createdAt.toISOString(),
      invitation: u.invitation
        ? {
            id: u.invitation.id,
            token: u.invitation.token,
            inviteeName: u.invitation.inviteeName,
            inviteeEmail: u.invitation.inviteeEmail,
            note: u.invitation.note,
            status: u.invitation.status,
            registeredEmail: u.invitation.registeredEmail,
          }
        : null,
      ordersCount: u.orders.length,
    }));
  } catch (error) {
    console.error('[getPendingApprovalsAction] Error:', error);
    return [];
  }
}

// ── 6. Approve User Account (Owner Accepts) ──
export async function approveUserAction(userId: string) {
  try {
    const user = await prisma.customerUser.findUnique({
      where: { id: userId },
      include: { invitation: true },
    });

    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    // Set user to APPROVED
    await prisma.customerUser.update({
      where: { id: userId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });

    // If linked to an invitation that was MODIFIED_PENDING, mark invitation as ACCEPTED
    if (user.invitation && user.invitation.status === 'MODIFIED_PENDING') {
      await prisma.invitation.update({
        where: { id: user.invitation.id },
        data: { status: 'ACCEPTED' },
      });
    }

    safeRevalidate('/admin/access');
    safeRevalidate('/admin/customers');
    safeRevalidate('/account');

    return { success: true };
  } catch (error: any) {
    console.error('[approveUserAction] Error:', error);
    return { success: false, error: error?.message || 'Failed to approve account.' };
  }
}

// ── 7. Reject User Account (Owner Declines) ──
export async function rejectUserAction(userId: string) {
  try {
    await prisma.customerUser.update({
      where: { id: userId },
      data: { status: 'REJECTED' },
    });

    safeRevalidate('/admin/access');
    safeRevalidate('/admin/customers');
    return { success: true };
  } catch (error: any) {
    console.error('[rejectUserAction] Error:', error);
    return { success: false, error: error?.message || 'Failed to reject account.' };
  }
}

// ── 8. Access & Invitations Overview Stats ──
export async function getAccessStatsAction() {
  try {
    const [
      pendingApprovalsCount,
      approvedUsersCount,
      totalInvitesCount,
      activeInvitesCount,
      modifiedPendingCount,
    ] = await Promise.all([
      prisma.customerUser.count({ where: { status: 'PENDING' } }),
      prisma.customerUser.count({ where: { status: 'APPROVED' } }),
      prisma.invitation.count(),
      prisma.invitation.count({ where: { status: 'PENDING' } }),
      prisma.invitation.count({ where: { status: 'MODIFIED_PENDING' } }),
    ]);

    return {
      pendingApprovalsCount,
      approvedUsersCount,
      totalInvitesCount,
      activeInvitesCount,
      modifiedPendingCount,
    };
  } catch (error) {
    console.error('[getAccessStatsAction] Error:', error);
    return {
      pendingApprovalsCount: 0,
      approvedUsersCount: 0,
      totalInvitesCount: 0,
      activeInvitesCount: 0,
      modifiedPendingCount: 0,
    };
  }
}
