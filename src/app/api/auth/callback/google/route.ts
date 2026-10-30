import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';
import { UserStore } from '@/lib/userStore';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin || 'http://localhost:3000';
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');
  const state = req.nextUrl.searchParams.get('state');
  const returnTo = state ? decodeURIComponent(state) : '/editor';

  if (error || !code) {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Login Error</title>
          <meta charset="utf-8">
        </head>
        <body style="background:#0f111a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;padding:24px;border:1px solid #334155;border-radius:16px;background:#1e293b;">
            <h2 style="color:#f87171;">ເຂົ້າສູ່ລະບົບດ້ວຍ Google ບໍ່ສຳເລັດ</h2>
            <p style="color:#94a3b8;">${error || 'ບໍ່ພົບລະຫັດຢືນຢັນຈາກ Google'}</p>
            <a href="${returnTo}" style="display:inline-block;margin-top:16px;padding:8px 20px;background:#12e8ff;color:#090c14;font-weight:bold;border-radius:8px;text-decoration:none;">ກັບຄືນໜ້າຫຼັກ</a>
          </div>
        </body>
      </html>
    `;
    return new NextResponse(errorHtml, {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const pathname = req.nextUrl.pathname;
  const redirectUri = `${origin}${pathname}`;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { success: false, error: 'Google OAuth credentials missing on server' },
      { status: 500 }
    );
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Google token exchange error:', tokenData);
      throw new Error(tokenData.error_description || 'Token exchange failed');
    }

    // 2. Fetch user profile from Google UserInfo endpoint
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      throw new Error('Failed to fetch user profile from Google');
    }

    const googleUser = await userRes.json();
    const cleanEmail = String(googleUser.email || '').trim().toLowerCase();
    const isOwnerAccount = cleanEmail === 'kobx2.2005@gmail.com';

    // 3. Record user login in persistent Store & construct session object
    const userRecord = UserStore.recordLogin({
      email: cleanEmail,
      name: googleUser.name,
      avatar: googleUser.picture,
      picture: googleUser.picture,
      provider: 'google',
    });

    const appUser = {
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

    // Trigger Welcome Email (in Lao & English) asynchronously
    sendWelcomeEmail({
      to: cleanEmail,
      name: appUser.name,
      credits: appUser.credits,
      plan: appUser.plan,
    }).catch((err) => console.error('Failed to trigger welcome email:', err));

    const userJson = JSON.stringify(appUser).replace(/</g, '\\u003c');

    // 4. Return client-side script that populates localStorage and redirects
    const successHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Login Success</title>
          <meta charset="utf-8">
        </head>
        <body style="background:#090C14;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;">
            <div style="width:48px;height:48px;border:3px solid #12E8FF;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px;"></div>
            <h2 style="font-size:18px;margin-bottom:8px;color:#12E8FF;">ເຂົ້າສູ່ລະບົບດ້ວຍ Google ສຳເລັດແລ້ວ!</h2>
            <p style="color:#94a3b8;font-size:14px;">ກຳລັງພາທ່ານໄປທີ່ Studio...</p>
          </div>
          <style>
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
          <script>
            try {
              const user = ${userJson};
              localStorage.setItem('saizup_user', JSON.stringify(user));
              localStorage.setItem('saizup_credits', String(user.credits || 100));
              // Also store in cookie for SSR if needed
              document.cookie = 'saizup_user=' + encodeURIComponent(JSON.stringify(user)) + '; path=/; max-age=2592000; SameSite=Lax';
            } catch (e) {
              console.error(e);
            }
            setTimeout(() => {
              window.location.href = ${JSON.stringify(returnTo)};
            }, 500);
          </script>
        </body>
      </html>
    `;

    return new NextResponse(successHtml, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err: any) {
    console.error('OAuth callback error:', err);
    const failHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Login Failed</title>
          <meta charset="utf-8">
        </head>
        <body style="background:#0f111a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;padding:24px;border:1px solid #334155;border-radius:16px;background:#1e293b;max-width:400px;">
            <h2 style="color:#f87171;">ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ</h2>
            <p style="color:#94a3b8;font-size:13px;">${err?.message || 'ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ Google'}</p>
            <a href="${returnTo}" style="display:inline-block;margin-top:16px;padding:8px 20px;background:#12e8ff;color:#090c14;font-weight:bold;border-radius:8px;text-decoration:none;">ກັບຄືນໜ້າຫຼັກ</a>
          </div>
        </body>
      </html>
    `;
    return new NextResponse(failHtml, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}
