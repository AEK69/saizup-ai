import { NextRequest, NextResponse } from 'next/server';
import { transcribeWithAI, generateSmartFallbackSubtitles, isAiEngineVersion } from '@/lib/gemini';
import { UserStore, AI_COST_CONFIG, calculateDynamicCreditsCost } from '@/lib/userStore';
import { checkRateLimit, validateBase64Audio, sanitizeText } from '@/lib/security';
import {
  segmentWords,
  calculateCPS,
  SupportedLanguage,
} from '@/lib/linguistics/segmenter';

export async function POST(req: NextRequest) {
  // 1. Rate Limiting Protection (Max 40 requests per minute per IP)
  const rateLimit = checkRateLimit(req, 40, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `ຄຳຂໍຫຼາຍເກີນໄປ (Rate limit exceeded). ກະລຸນາລໍຖ້າ ${rateLimit.resetInSec} ວິນາທີ`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.resetInSec),
          'Content-Type': 'application/json',
        },
      }
    );
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const {
      language = 'lo',
      dialect = 'auto',
      audioBase64,
      mimeType = 'audio/wav',
      videoDuration = 15,
      fullVideoDuration,
      offsetSeconds = 0,
      isLastChunk = true,
      videoTitle,
      aiVersion = 'v1',
      intervalMode = 'sentence', // '30s' or 'sentence'
      customVocabulary,
      userEmail,
    } = body;

    // 2. Security Validation of Payload
    if (!validateBase64Audio(audioBase64)) {
      return NextResponse.json(
        { success: false, error: 'ຂະໜາດໄຟລ໌ສຽງໃຫຍ່ເກີນໄປ (ສູງສຸດ 10MB)' },
        { status: 413 }
      );
    }
    if (typeof audioBase64 !== 'string' || audioBase64.length < 100) {
      return NextResponse.json({ success: false, error: 'ບໍ່ພົບຂໍ້ມູນສຽງຈິງ ກະລຸນາລອງອັບໂຫຼດໄຟລ໌ອື່ນ' }, { status: 400 });
    }

    const cleanTitle = sanitizeText(videoTitle || 'Untitled Video');
    const selectedVersion = isAiEngineVersion(aiVersion) ? aiVersion : 'v1';
    const numDuration = Number(videoDuration) || 15;
    const totalDuration = Math.max(numDuration, Number(fullVideoDuration) || numDuration);
    const timeOffset = Math.max(0, Number(offsetSeconds) || 0);

    // 3. Authenticate and enforce the plan before consuming a provider request.
    const cleanEmail = typeof userEmail === 'string' ? userEmail.trim().toLowerCase() : '';
    if (!cleanEmail) {
      return NextResponse.json({ success: false, error: 'ກະລຸນາເຂົ້າລະບົບກ່ອນສ້າງຊັບ' }, { status: 401 });
    }
    const user = UserStore.getByEmail(cleanEmail);
    if (!user) {
      return NextResponse.json({ success: false, error: 'ບໍ່ພົບບັນຊີຜູ້ໃຊ້ ກະລຸນາເຂົ້າລະບົບໃໝ່' }, { status: 401 });
    }
    const limits = UserStore.getLimitsForUser(user);
    if (!limits.allowedAiVersions.includes(selectedVersion)) {
      return NextResponse.json({
        success: false,
        upgradeRequired: true,
        error: `ແພັກເກດ ${user.plan} ບໍ່ຮອງຮັບ ${AI_COST_CONFIG[selectedVersion].name}; ກະລຸນາອັບເກຣດແພັກເກດ`,
      }, { status: 403 });
    }
    if (totalDuration > limits.maxClipDurationSec) {
      return NextResponse.json({
        success: false,
        upgradeRequired: true,
        error: `ແພັກເກດ ${user.plan} ຮອງຮັບວິດີໂອສູງສຸດ ${limits.maxClipDurationSec} ວິນາທີ`,
      }, { status: 403 });
    }
    // Price the complete clip once; chunk requests only deduct after the last
    // chunk has succeeded so long clips are not charged repeatedly.
    const dynamicParams = {
      aiVersion: selectedVersion,
      durationSeconds: totalDuration,
      language: (language as any) || 'lo',
      hasTranslation: false,
    };
    const dynamicCostInfo = calculateDynamicCreditsCost(dynamicParams);
    const cost = dynamicCostInfo.totalCost;
    if (!user.isOwner && user.credits < cost) {
      return NextResponse.json({
        success: false,
        error: `ເຄຣດິດບໍ່ພຽງພໍ (ຕ້ອງການ ${cost} ເຄຣດິດ, ທ່ານມີ ${user.credits} ເຄຣດິດ)`,
        creditsNeeded: cost,
        costBreakdown: dynamicCostInfo.breakdown,
        remainingCredits: user.credits,
      }, { status: 402 });
    }

    // 5. Call SAIZUP AI Intelligence Service (Gemini is kept strictly internal & unbranded)
    let subtitles: any[] = [];
    try {
      subtitles = await transcribeWithAI({
        language: (language as 'lo' | 'th' | 'en' | 'mixed') || 'lo',
        dialect: typeof dialect === 'string' ? (dialect as any) : 'auto',
        audioBase64: audioBase64 || '',
        mimeType,
        videoDuration: numDuration,
        videoTitle: cleanTitle,
        aiVersion: selectedVersion,
        intervalMode: intervalMode === '30s' ? '30s' : 'sentence',
        customVocabulary: typeof customVocabulary === 'string' ? customVocabulary.trim() : undefined,
      });
    } catch (aiErr: any) {
      console.warn('AI transcription notice:', aiErr?.message);
      subtitles = [];
    }

    if (!Array.isArray(subtitles)) {
      subtitles = [];
    }

    if (isLastChunk) {
      const deductResult = UserStore.deductCredits(
        cleanEmail,
        dynamicParams,
        `ຖອດສຽງຊັບໄຕເຕິລ (${selectedVersion.toUpperCase()}, ຄວາມຍາວ ${Math.round(totalDuration)} ວິ, ${dynamicCostInfo.breakdown})`
      );
      if (!deductResult.success) {
        return NextResponse.json({ success: false, error: deductResult.error || `ເຄຣດິດບໍ່ພຽງພໍ (ຕ້ອງການ ${cost} ເຄຣດິດ)`, creditsNeeded: cost, costBreakdown: dynamicCostInfo.breakdown, remainingCredits: deductResult.remainingCredits }, { status: 402 });
      }
    }

    const targetLang = (language === 'th' ? 'th' : language === 'en' ? 'en' : 'lo') as SupportedLanguage;

    // 6. Post-process subtitles with Word Segmentation, Code-Switching & Micro-timestamps
    const validRawSubtitles = subtitles.filter(
      (sub) => sub && typeof sub.text === 'string' && sub.text.trim().length > 0
    );
    const processedSubtitles = validRawSubtitles.map((sub, idx) => {
      // Keep the model's verbatim words. Script conversion can silently change
      // the speaker's language and make the subtitle disagree with the audio.
      const sanitizedText = String(sub.text || '').trim();
      const modelWords = Array.isArray(sub.words) ? sub.words : [];
      const wordTokens = modelWords.length > 0
        ? modelWords.map((word: any) => {
            const token = typeof word === 'string' ? { text: word } : word;
            const startSec = Number(token.startSec);
            const endSec = Number(token.endSec);
            const hasTiming = Number.isFinite(startSec) && Number.isFinite(endSec) && endSec >= startSec;
            return {
              text: String(token.text || ''),
              ...(hasTiming ? {
                startSec: timeOffset + Math.min(numDuration, Math.max(0, startSec)),
                endSec: timeOffset + Math.min(numDuration, Math.max(startSec, endSec)),
              } : {}),
            };
          })
        : segmentWords(sanitizedText, targetLang).map((text) => ({ text }));
      const blockDur = Math.max(0.5, sub.endTime - sub.time);
      const cps = calculateCPS(sanitizedText, blockDur);
      const chunkStart = Math.max(0, Number(sub.time) || 0);
      const chunkEnd = Math.max(chunkStart, Number(sub.endTime) || chunkStart);
      const absoluteStart = Math.min(timeOffset + numDuration, timeOffset + chunkStart);

      return {
        id: String(sub.id || idx + 1),
        time: absoluteStart,
        endTime: Math.min(timeOffset + numDuration, Math.max(absoluteStart, timeOffset + chunkEnd)),
        text: sanitizedText,
        words: wordTokens,
        cps,
        hasCodeSwitching: /[A-Za-z]/.test(sanitizedText),
      };
    });

    const refreshedUser = UserStore.getByEmail(cleanEmail);

    // 7. Return response (Completely unbranded: engine is SAIZUP AI Engine)
    return NextResponse.json(
      {
        success: true,
        subtitles: processedSubtitles,
        language,
        engine: `SAIZUP AI Engine ${selectedVersion.toUpperCase()}`,
        engineName: AI_COST_CONFIG[selectedVersion]?.name || 'SAIZUP AI Engine',
        count: processedSubtitles.length,
        costCredits: isLastChunk ? cost : 0,
        remainingCredits: refreshedUser ? refreshedUser.credits : undefined,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Transcription API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'ຖອດສຽງຈາກວິດີໂອບໍ່ສຳເລັດ',
      },
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
