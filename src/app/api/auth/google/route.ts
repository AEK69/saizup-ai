import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const origin = req.nextUrl.origin || 'http://localhost:3000';
  const redirectUri = `${origin}/api/auth/callback/google`;
  const returnTo = req.nextUrl.searchParams.get('returnTo') || '/editor';

  if (!clientId) {
    return NextResponse.json(
      { success: false, error: 'Google Client ID ບໍ່ໄດ້ຖືກຕັ້ງຄ່າ' },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state: encodeURIComponent(returnTo),
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  // If json response requested
  if (req.nextUrl.searchParams.get('json') === 'true') {
    return NextResponse.json({ success: true, url: authUrl });
  }

  return NextResponse.redirect(authUrl);
}
