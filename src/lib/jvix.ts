// Jvix Cloud OnePlay Payment Integration
// Base URL: https://jvix.xyz
// Header: Authorization: Bearer <API_KEY>, Content-Type: application/json
// Min amount: 1000 LAK

const JVIX_BASE_URL = process.env.JVIX_BASE_URL || 'https://jvix.xyz';
export const JVIX_API_KEY =
  process.env.JVIX_API_KEY ||
  process.env.BCEL_ONE_KEY ||
  '';

export interface JvixGenerateResult {
  success: boolean;
  transactionId?: string;
  qrUrl?: string;
  payload?: string;
  amount?: number;
  amountBase?: number;
  expiresAt?: number;
  expiresIn?: number;
  error?: string;
}

export interface JvixCheckResult {
  success: boolean;
  transactionId?: string;
  status?: string;
  isPaid: boolean;
  isPending: boolean;
  isExpired: boolean;
  message?: string;
  timeRemaining?: number;
  error?: string;
}

/**
 * Generate a dynamic OnePlay BCEL One QR payment invoice
 * POST https://jvix.xyz/api/v1/oneplay/generate
 */
export async function generateOnePlayInvoice(amountLAK: number): Promise<JvixGenerateResult> {
  const integerAmount = Math.max(1000, Math.round(Number(amountLAK)));

  try {
    const res = await fetch(`${JVIX_BASE_URL}/api/v1/oneplay/generate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JVIX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: integerAmount }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Jvix Generate HTTP Error:', res.status);
      return { success: false, error: 'ບໍ່ສາມາດສ້າງ QR ຊຳລະເງິນໄດ້' };
    }

    const data = await res.json();
    if (data.status === 'success' && data.data) {
      const d = data.data;
      return {
        success: true,
        transactionId: d.transactionId,
        qrUrl: d.qr_url,
        payload: d.payload,
        amount: integerAmount,
        amountBase: parseInt(String(d.amount_base).replace(/[^0-9]/g, ''), 10) || integerAmount,
        expiresAt: d.expires_at,
        expiresIn: d.expires_in || 300,
      };
    }

    return {
      success: false,
      error: data.message || 'ບໍ່ສາມາດສ້າງ QR ຊຳລະເງິນໄດ້',
    };
  } catch (err: any) {
    console.error('Jvix Generate Exception:', err);
    return { success: false, error: 'ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ລະບົບຊຳລະ' };
  }
}

/**
 * Check payment status of a transaction
 * POST https://jvix.xyz/api/v1/oneplay/check
 * status success + paid = ຈ່າຍແລ້ວ | pending = ໂພລຕໍ່
 */
export async function checkOnePlayStatus(transactionId: string): Promise<JvixCheckResult> {
  if (!transactionId) {
    return {
      success: false,
      isPaid: false,
      isPending: false,
      isExpired: false,
      error: 'Missing transactionId',
    };
  }

  try {
    const res = await fetch(`${JVIX_BASE_URL}/api/v1/oneplay/check`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JVIX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transactionId }),
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Jvix Check HTTP Error:', res.status);
      return {
        success: false,
        isPaid: false,
        isPending: true,
        isExpired: false,
        error: 'Network check error',
      };
    }

    const data = await res.json();
    const status = String(data.status || '').toLowerCase();
    const message = String(data.message || '').toLowerCase();

    const isPaid = status === 'paid' || status === 'success' || message === 'paid' || message === 'success';
    const isPending = status === 'pending' || message === 'pending';
    const isExpired = status === 'expired' || message === 'expired' || (data.time_remaining !== undefined && data.time_remaining <= 0);

    return {
      success: true,
      transactionId: data.transactionId || transactionId,
      status: data.status,
      isPaid,
      isPending: !isPaid && !isExpired && isPending,
      isExpired: !isPaid && isExpired,
      message: data.message,
      timeRemaining: data.time_remaining,
    };
  } catch (err: any) {
    console.error('Jvix Check Exception:', err);
    return {
      success: false,
      isPaid: false,
      isPending: true,
      isExpired: false,
      error: 'Network connection error',
    };
  }
}
