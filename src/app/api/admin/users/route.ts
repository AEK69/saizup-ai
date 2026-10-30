import { NextRequest, NextResponse } from 'next/server';
import { UserStore } from '@/lib/userStore';

const OWNER_EMAIL = 'kobx2.2005@gmail.com';

function checkAdminAuth(req: NextRequest): boolean {
  const queryEmail = req.nextUrl.searchParams.get('adminEmail')?.toLowerCase().trim();
  const headerEmail = req.headers.get('x-admin-email')?.toLowerCase().trim();
  const cookieUser = req.cookies.get('saizup_user')?.value;

  let cookieEmail = '';
  if (cookieUser) {
    try {
      const parsed = JSON.parse(decodeURIComponent(cookieUser));
      cookieEmail = parsed.email?.toLowerCase().trim();
    } catch (e) {
      // ignore
    }
  }

  return (
    queryEmail === OWNER_EMAIL ||
    headerEmail === OWNER_EMAIL ||
    cookieEmail === OWNER_EMAIL
  );
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: ສະຫງວນສິດສະເພາະເຈົ້າຂອງຮ້ານ (kobx2.2005@gmail.com) ເທົ່ານັ້ນ' },
      { status: 403 }
    );
  }

  const users = UserStore.getAll();
  return NextResponse.json({
    success: true,
    users,
    totalUsers: users.length,
    activeSubscribers: users.filter((u) => u.plan === 'Monthly Pro' || u.plan === 'Yearly VIP').length,
    totalCreditsIssued: users.reduce((acc, u) => acc + (u.credits || 0), 0),
  });
}

export async function PUT(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: ສະຫງວນສິດສະເພາະເຈົ້າຂອງຮ້ານ' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { id, updates, adminNote } = body;

    if (!id || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing user ID or updates data' },
        { status: 400 }
      );
    }

    const updated = UserStore.updateUser(id, updates, adminNote);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ "${updated.name}" ສຳເລັດແລ້ວ`,
      user: updated,
    });
  } catch (err: any) {
    console.error('Admin update user error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 403 }
    );
  }

  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
  }

  const deleted = UserStore.deleteUser(id);
  return NextResponse.json({ success: deleted });
}
