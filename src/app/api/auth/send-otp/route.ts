import { NextRequest, NextResponse } from 'next/server';

// In-memory OTP storage for demo & verification
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email.toLowerCase(), { code, expiresAt });

    console.log(`[AUTH] Verification Code sent to ${email}: ${code}`);

    return NextResponse.json({
      success: true,
      message: `ລະຫັດຢືນຢັນຖືກສົ່ງໄປທີ່ ${email} ແລ້ວ`,
      email,
      code, // returned so the user can easily test and see it in demo mode
      expiresInSeconds: 600,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
