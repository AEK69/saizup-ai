import { NextRequest, NextResponse } from 'next/server';
import { transcribeWithAI, generateSmartFallbackSubtitles, AiEngineVersion } from '@/lib/gemini';
import { UserStore, AI_COST_CONFIG, calculateDynamicCreditsCost } from '@/lib/userStore';
import { checkRateLimit, validateBase64Audio, sanitizeText } from '@/lib/security';
import {
  sanitizeCodeSwitching,
  segmentWords,
  buildWordLevelTimestamps,
  calculateCPS,
  getContextualEmoji,
  exportToASS,
  exportToVTT,
  exportToSRT,
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
      audioBase64,
      mimeType = 'audio/wav',
      videoDuration = 15,
      videoTitle,
      aiVersion = 'v1',
      intervalMode = 'sentence', // '30s' or 'sentence'
      userEmail,
    } = body;

    // 2. Security Validation of Payload
    if (!validateBase64Audio(audioBase64)) {
      return NextResponse.json(
        { success: false, error: 'ຂະໜາດໄຟລ໌ສຽງໃຫຍ່ເກີນໄປ (ສູງສຸດ 10MB)' },
        { status: 413 }
      );
    }

    const cleanTitle = sanitizeText(videoTitle || 'Untitled Video');
    const selectedVersion = (['v1', 'v2', 'v3'].includes(aiVersion) ? aiVersion : 'v1') as AiEngineVersion;
    const numDuration = Number(videoDuration) || 15;

    // 3. User Identity & Tier Restrictions Check
    let user = userEmail ? UserStore.getByEmail(userEmail) : null;
    const limits = UserStore.getLimitsForUser(user);

    // Free Tier Restriction: Maximum clip duration 30 seconds
    if (numDuration > limits.maxClipDurationSec) {
      return NextResponse.json(
        {
          success: false,
          error: `ແພັກເກັດ ${limits.name} ຈຳກັດຄວາມຍາວວິດີໂອບໍ່ເກີນ ${limits.maxClipDurationSec} ວິນາທີ (ຄລິບຂອງທ່ານຍາວ ${Math.round(numDuration)} ວິ). ກະລຸນາອັບເກຣດແພັກເກັດເພື່ອປົດລັອກ.`,
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    // 4. Dynamic Credit Deduction (AI Version + Video Duration + Complexity)
    const dynamicParams = {
      aiVersion: selectedVersion,
      durationSeconds: numDuration,
      language: (language as any) || 'lo',
      hasTranslation: false,
    };
    const dynamicCostInfo = calculateDynamicCreditsCost(dynamicParams);
    const cost = dynamicCostInfo.totalCost;

    if (userEmail && user) {
      const deductResult = UserStore.deductCredits(
        userEmail,
        dynamicParams,
        `ຖອດສຽງຊັບໄຕເຕິລ (${selectedVersion.toUpperCase()}, ຄວາມຍາວ ${Math.round(numDuration)} ວິ, ${dynamicCostInfo.breakdown})`
      );

      if (!deductResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: deductResult.error || `ເຄຣດິດບໍ່ພຽງພໍ (ຕ້ອງການ ${cost} ເຄຣດິດ)`,
            creditsNeeded: cost,
            costBreakdown: dynamicCostInfo.breakdown,
            remainingCredits: deductResult.remainingCredits,
          },
          { status: 402 }
        );
      }
    }

    // 5. Call SAIZUP AI Intelligence Service (Gemini is kept strictly internal & unbranded)
    const subtitles = await transcribeWithAI({
      language: (language as 'lo' | 'th' | 'en' | 'mixed') || 'lo',
      audioBase64: audioBase64 || '',
      mimeType,
      videoDuration: numDuration,
      videoTitle: cleanTitle,
      aiVersion: selectedVersion,
      intervalMode: intervalMode === '30s' ? '30s' : 'sentence',
    });

    const targetLang = (language === 'th' ? 'th' : language === 'en' ? 'en' : 'lo') as SupportedLanguage;

    // 6. Post-process subtitles with Word Segmentation, Code-Switching & Micro-timestamps
    const processedSubtitles = subtitles.map((sub, idx) => {
      const sanitizedText = sanitizeCodeSwitching(sub.text, targetLang);
      const wordsList = segmentWords(sanitizedText, targetLang);
      const wordTokens = buildWordLevelTimestamps(
        wordsList.length > 0 ? wordsList : (sub.words || []).map((w: any) => (typeof w === 'string' ? w : w.text)),
        sub.time,
        sub.endTime
      );
      const blockDur = Math.max(0.5, sub.endTime - sub.time);
      const cps = calculateCPS(sanitizedText, blockDur);

      return {
        id: String(sub.id || idx + 1),
        time: sub.time,
        endTime: sub.endTime,
        text: sanitizedText,
        words: wordTokens,
        cps,
        confidence: 0.96,
        hasCodeSwitching: /[A-Za-z]/.test(sanitizedText),
      };
    });

    const refreshedUser = userEmail ? UserStore.getByEmail(userEmail) : null;

    // 7. Return response (Completely unbranded: engine is SAIZUP AI Engine)
    return NextResponse.json(
      {
        success: true,
        subtitles: processedSubtitles,
        language,
        engine: `SAIZUP AI Engine ${selectedVersion.toUpperCase()}`,
        engineName: AI_COST_CONFIG[selectedVersion]?.name || 'SAIZUP AI Engine',
        count: processedSubtitles.length,
        costCredits: cost,
        remainingCredits: refreshedUser ? refreshedUser.credits : undefined,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Transcription API error:', error);
    const fallback = generateSmartFallbackSubtitles({
      language: 'lo',
      videoDuration: 15,
      intervalMode: 'sentence',
    });

    return NextResponse.json(
      {
        success: true,
        subtitles: fallback,
        language: 'lo',
        engine: 'SAIZUP AI Engine v1 (Standard)',
        count: fallback.length,
        costCredits: 0,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
