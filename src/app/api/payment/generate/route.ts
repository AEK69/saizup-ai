import { NextRequest, NextResponse } from 'next/server';
import { generateOnePlayInvoice } from '@/lib/jvix';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amountLAK, planId, planName, credits } = body;

    if (!amountLAK || Number(amountLAK) < 1000) {
      return NextResponse.json(
        { success: false, error: 'ຍອດເງິນຂັ້ນຕ່ຳ 1,000 ກີບ (Minimum 1,000 LAK)' },
        { status: 400 }
      );
    }

    const result = await generateOnePlayInvoice(Number(amountLAK));

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'ບໍ່ສາມາດສ້າງ QR ຊຳລະເງິນໄດ້' },
        { status: 500 }
      );
    }

    // Never expose API key or sensitive backend data to customer
    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      qrUrl: result.qrUrl,
      payload: result.payload,
      amount: result.amount,
      amountBase: result.amountBase,
      expiresAt: result.expiresAt,
      expiresIn: result.expiresIn || 300,
      planId,
      planName,
      credits: credits || 0,
    });
  } catch (error) {
    console.error('API Payment Generate Error:', error);
    return NextResponse.json(
      { success: false, error: 'ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ລະບົບ' },
      { status: 500 }
    );
  }
}
