import { NextRequest, NextResponse } from 'next/server';
import { checkOnePlayStatus } from '@/lib/jvix';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'Missing transactionId' },
        { status: 400 }
      );
    }

    const result = await checkOnePlayStatus(transactionId);

    return NextResponse.json({
      success: result.success,
      transactionId: result.transactionId,
      status: result.status,
      isPaid: result.isPaid,
      isPending: result.isPending,
      isExpired: result.isExpired,
      timeRemaining: result.timeRemaining,
      message: result.message,
    });
  } catch (error) {
    console.error('API Payment Check Error:', error);
    return NextResponse.json(
      { success: false, isPaid: false, isPending: true, isExpired: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
