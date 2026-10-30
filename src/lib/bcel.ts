// BCEL One / Jvixcloud Payment Gateway Service
// Integrated with key: jvixcloud_live_e50047095b0a768aa2df96822d529a865457428738949921

import { PaymentTransaction, PlanType } from '@/types';
import { generateLaoQrPayload } from './laoqr';

export const BCEL_ONE_KEY =
  process.env.BCEL_ONE_KEY ||
  process.env.NEXT_PUBLIC_BCEL_ONE_KEY ||
  'jvixcloud_live_e50047095b0a768aa2df96822d529a865457428738949921';

export interface CreateBcelInvoiceParams {
  planId: PlanType;
  planName: string;
  amountLAK: number;
  credits: number;
  customerName?: string;
  customerPhone?: string;
  accountNumber?: string;
  merchantName?: string;
}

/**
 * Creates a real, scannable BCEL One / Lao QR payment invoice
 */
export async function createBcelInvoice(params: CreateBcelInvoiceParams): Promise<PaymentTransaction> {
  const timestamp = Date.now();
  const orderId = `SZ-${timestamp.toString().slice(-6)}`;
  const transactionId = `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  // Generate authentic EMVCo standard Lao QR payload recognized by BCEL One scanner
  const qrPayload = generateLaoQrPayload({
    amount: params.amountLAK,
    orderId,
    accountNumber: params.accountNumber || '010120000889977001',
    merchantName: params.merchantName || 'SAIZUP AI STUDIO',
  });

  const transaction: PaymentTransaction = {
    id: transactionId,
    orderId,
    customerName: params.customerName || 'ລູກຄ້າ SAIZUP AI',
    customerPhone: params.customerPhone || '020-XXXX-XXXX',
    planId: params.planId,
    planName: params.planName,
    amountLAK: params.amountLAK,
    creditsGiven: params.credits,
    status: 'pending',
    paymentMethod: 'BCEL_ONE',
    bcelKey: BCEL_ONE_KEY,
    qrPayload,
    createdAt: new Date().toISOString(),
  };

  return transaction;
}

/**
 * Generate high-definition visual QR image URL for BCEL One / Lao banking app scanning
 */
export function getBcelQrImageUrl(qrPayload: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    qrPayload
  )}&margin=12&color=002060`;
}
