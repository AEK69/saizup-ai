import { NextResponse } from 'next/server';
import { AccentMemory, DIALECT_PROFILES } from '@/lib/linguistics/accentMemory';

export async function GET() {
  try {
    const stats = AccentMemory.getStats();
    return NextResponse.json({
      success: true,
      dialects: Object.values(DIALECT_PROFILES),
      stats,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching dialect profiles' },
      { status: 500 }
    );
  }
}
