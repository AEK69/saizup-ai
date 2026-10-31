import { NextRequest, NextResponse } from 'next/server';
import { translateSubtitlesWithAI } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subtitles, targetLang = 'lo', aiVersion = 'v2' } = body;

    if (!Array.isArray(subtitles)) {
      return NextResponse.json({ error: 'Subtitles must be an array' }, { status: 400 });
    }

    const translatedSubtitles = await translateSubtitlesWithAI({
      subtitles,
      targetLanguage: targetLang,
      aiVersion,
    });

    return NextResponse.json({
      success: true,
      subtitles: translatedSubtitles,
      targetLang,
    });
  } catch (error: any) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Translation failed' },
      { status: 500 }
    );
  }
}
