import { NextRequest, NextResponse } from 'next/server';
import { AiEngineVersion, isAiEngineVersion, translateSubtitlesWithAI } from '@/lib/gemini';
import { AI_COST_CONFIG, UserStore } from '@/lib/userStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subtitles, targetLang = 'lo', aiVersion = 'v1', userEmail } = body;

    if (!Array.isArray(subtitles) || subtitles.length === 0) {
      return NextResponse.json({ success: false, error: 'ບໍ່ພົບຂໍ້ຄວາມຊັບທີ່ຈະແປ' }, { status: 400 });
    }
    if (!['lo', 'th', 'en'].includes(targetLang)) {
      return NextResponse.json({ success: false, error: 'ພາສາປາຍທາງບໍ່ຖືກຕ້ອງ' }, { status: 400 });
    }
    const selectedVersion: AiEngineVersion = isAiEngineVersion(aiVersion) ? aiVersion : 'v1';
    const cleanEmail = typeof userEmail === 'string' ? userEmail.trim().toLowerCase() : '';
    if (!cleanEmail) {
      return NextResponse.json({ success: false, error: 'ກະລຸນາເຂົ້າລະບົບກ່ອນແປຊັບ' }, { status: 401 });
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
    const creditCost = AI_COST_CONFIG[selectedVersion].creditsCost;
    if (!user.isOwner && user.credits < creditCost) {
      return NextResponse.json({
        success: false,
        error: `ເຄຣດິດບໍ່ພຽງພໍ (ຕ້ອງການ ${creditCost} ເຄຣດິດ, ທ່ານມີ ${user.credits} ເຄຣດິດ)`,
        remainingCredits: user.credits,
        creditsNeeded: creditCost,
      }, { status: 402 });
    }

    const encoder = new TextEncoder();
    let cancelled = false;
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: Record<string, unknown>) => {
          if (cancelled) return;
          try {
            controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
          } catch {
            cancelled = true;
          }
        };

        try {
          const total = subtitles.length;
          const batchSize = Math.max(1, Math.ceil(total / 6));
          const translatedSubtitles = [];
          send({ type: 'started', completed: 0, total, percent: 0 });

          for (let offset = 0; offset < total; offset += batchSize) {
            const batch = subtitles.slice(offset, offset + batchSize);
            const translatedBatch = await translateSubtitlesWithAI({
              subtitles: batch,
              targetLanguage: targetLang,
              aiVersion: selectedVersion,
            });
            if (cancelled) return;
            translatedSubtitles.push(...translatedBatch);
            const completed = Math.min(total, offset + batch.length);
            const percent = Math.round((completed / total) * 100);
            send({ type: 'progress', completed, total, percent });
          }

          if (cancelled) return;
          const deduction = UserStore.deductCredits(
            cleanEmail,
            selectedVersion,
            `ແປຊັບໄຕເຕິລເປັນ ${targetLang.toUpperCase()} (${subtitles.length} ແຖວ)`,
            'translation'
          );
          if (!deduction.success) {
            send({
              type: 'error',
              error: deduction.error || 'ເຄຣດິດບໍ່ພຽງພໍ',
              remainingCredits: deduction.remainingCredits,
              creditsNeeded: creditCost,
            });
            return;
          }

          send({
            type: 'complete',
            success: true,
            subtitles: translatedSubtitles,
            targetLang,
            remainingCredits: deduction.remainingCredits,
            creditsDeducted: deduction.costDeducted,
          });
        } catch (error: unknown) {
          console.error('Translation API error:', error);
          send({
            type: 'error',
            error: error instanceof Error ? error.message : 'Translation failed',
          });
        } finally {
          try {
            controller.close();
          } catch {
            // The browser may have closed the stream while translation was running.
          }
        }
      },
      cancel() {
        cancelled = true;
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: any) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Translation failed' },
      { status: 500 }
    );
  }
}
