import { NextRequest, NextResponse } from 'next/server';
import { UserStore } from '@/lib/userStore';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'ກະລຸນາໃສ່ອີເມວ ແລະ ລະຫັດຜ່ານ' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // Verify user (including user's provided credentials)
    const isOwnerAccount =
      cleanEmail === 'kobx2.2005@gmail.com' && cleanPassword === '9cEHewyueAn9n8E';

    const userRecord = UserStore.recordLogin({
      email: cleanEmail,
      name: cleanEmail.split('@')[0],
      provider: 'password',
    });

    const user = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      trialDaysRemaining: userRecord.trialDaysRemaining,
      credits: userRecord.credits,
      plan: userRecord.plan,
      isOwner: isOwnerAccount || userRecord.isOwner,
      createdAt: userRecord.createdAt,
    };

    return NextResponse.json({
      success: true,
      message: 'ເຂົ້າສູ່ລະບົບສຳເລັດແລ້ວ',
      user,
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: 'ເກີດຂໍ້ຜິດພາດໃນການເຂົ້າສູ່ລະບົບ' },
      { status: 500 }
    );
  }
}
