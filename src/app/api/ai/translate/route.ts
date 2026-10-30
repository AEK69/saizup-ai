import { NextRequest, NextResponse } from 'next/server';
import { translateSubtitleWithGemini } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subtitles, sourceLang = 'th', targetLang = 'lo' } = body;

    if (!Array.isArray(subtitles)) {
      return NextResponse.json({ error: 'Subtitles must be an array' }, { status: 400 });
    }

    const translatedSubtitles = await Promise.all(
      subtitles.map(async (sub: any) => {
        const translatedText = await translateSubtitleWithGemini({
          text: sub.text,
          sourceLang,
          targetLang,
        });

        // Split words naturally
        const wordsArr = translatedText.split(' ').map((w: string) => ({ text: w }));

        return {
          ...sub,
          text: translatedText,
          words: wordsArr.length > 0 ? wordsArr : [{ text: translatedText }],
        };
      })
    );

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
