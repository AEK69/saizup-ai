import { NextRequest, NextResponse } from 'next/server';
import { generateOnePlayInvoice } from '@/lib/jvix';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, planName, amountLAK, credits } = body;

    const amount = Number(amountLAK) || 1000;
    const result = await generateOnePlayInvoice(amount);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      qrImageUrl: result.qrUrl,
      qrPayload: result.payload,
      amount: result.amount,
      amountBase: result.amountBase,
      expiresIn: result.expiresIn,
      planId,
      planName,
      credits: Number(credits) || 0,
    });
  } catch (error) {
    console.error('BCEL Route Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
