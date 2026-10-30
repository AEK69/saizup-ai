import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';
import { UserStore } from '@/lib/userStore';

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json(
        { success: false, error: 'ບໍ່ພົບ Google credential token' },
        { status: 400 }
      );
    }

    // Verify token with Google's public tokeninfo endpoint
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );

    if (!verifyRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Google Token ບໍ່ຖືກຕ້ອງ ຫຼື ໝົດອາຍຸ' },
        { status: 401 }
      );
    }

    const payload = await verifyRes.json();
    const cleanEmail = String(payload.email || '').trim().toLowerCase();
    const isOwnerAccount = cleanEmail === 'kobx2.2005@gmail.com';

    const userRecord = UserStore.recordLogin({
      email: cleanEmail,
      name: payload.name,
      avatar: payload.picture,
      picture: payload.picture,
      provider: 'google',
    });

    const user = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      avatar: userRecord.avatar || '',
      picture: userRecord.picture || '',
      trialDaysRemaining: userRecord.trialDaysRemaining,
      credits: userRecord.credits,
      plan: userRecord.plan,
      isOwner: userRecord.isOwner || isOwnerAccount,
      provider: 'google',
      createdAt: userRecord.createdAt,
    };

    // Trigger Welcome Email (in Lao & English)
    sendWelcomeEmail({
      to: cleanEmail,
      name: user.name,
      credits: user.credits,
      plan: user.plan,
    }).catch((err) => console.error('Failed to trigger welcome email:', err));

    return NextResponse.json({
      success: true,
      message: 'ເຂົ້າສູ່ລະບົບດ້ວຍ Google ສຳເລັດແລ້ວ',
      user,
    });
  } catch (err: any) {
    console.error('Google token verification error:', err);
    return NextResponse.json(
      { success: false, error: 'ເກີດຂໍ້ຜິດພາດໃນການຢືນຢັນ Google Token' },
      { status: 500 }
    );
  }
}
