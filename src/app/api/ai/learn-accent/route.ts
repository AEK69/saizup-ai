import { NextRequest, NextResponse } from 'next/server';
import { AccentMemory, DialectTag } from '@/lib/linguistics/accentMemory';
import { checkRateLimit } from '@/lib/security';

export async function POST(req: NextRequest) {
  // Rate limiting: max 30 feedback saves per minute per IP
  const rateLimit = checkRateLimit(req, 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: 'ຄຳຂໍຫຼາຍເກີນໄປ ກະລຸນາລໍຖ້າຈັກໜ່ອຍ' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      originalSubtitles,
      editedSubtitles,
      originalHeard,
      correctedText,
      dialect = 'auto',
      language = 'lo',
      userEmail,
    } = body;

    // Mode A: Full session comparison learning
    if (Array.isArray(originalSubtitles) && Array.isArray(editedSubtitles)) {
      const result = AccentMemory.learnFromSessionEdits({
        originalSubtitles,
        editedSubtitles,
        dialect: dialect as DialectTag,
        language: language as 'lo' | 'th' | 'mixed' | 'en',
        userEmail: typeof userEmail === 'string' ? userEmail : undefined,
      });

      const stats = AccentMemory.getStats();
      return NextResponse.json({
        success: true,
        message: `AI ໄດ້ຮຽນຮູ້ສຳນຽງ ແລະ ການແກ້ໄຂແລ້ວ ${result.learnedCount} ລາຍການ`,
        learnedCount: result.learnedCount,
        newlyLearned: result.newlyLearned,
        totalLearnedInSystem: stats.totalLearned,
        stats,
      });
    }

    // Mode B: Single word / phrase correction
    if (originalHeard && correctedText) {
      const result = AccentMemory.recordUserCorrection({
        originalHeard: String(originalHeard),
        correctedText: String(correctedText),
        dialect: dialect as DialectTag,
        language: language as 'lo' | 'th' | 'mixed' | 'en',
        userEmail: typeof userEmail === 'string' ? userEmail : undefined,
      });

      const stats = AccentMemory.getStats();
      return NextResponse.json({
        success: true,
        message: 'ບັນທຶກການຮຽນຮູ້ສຳນຽງສຳເລັດ',
        mapping: result.mapping,
        totalLearnedInSystem: stats.totalLearned,
      });
    }

    return NextResponse.json(
      { success: false, error: 'ກະລຸນາສົ່ງຂໍ້ມູນຄຳສັບ ຫຼື ຊັບໄຕເຕິລທີ່ຕ້ອງການໃຫ້ AI ຮຽນຮູ້' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('[learn-accent API error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'ເກີດຂໍ້ຜິດພາດໃນການຮຽນຮູ້ສຳນຽງ' },
      { status: 500 }
    );
  }
}
