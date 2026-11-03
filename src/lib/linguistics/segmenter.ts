// SAIZUP Linguistic Engine: Word Segmentation, Code-Switching & Subtitle Optimization
// Supports authentic Lao (ພາສາລາວ), Thai (ภาษาไทย), and English (EN)

export type SupportedLanguage = 'lo' | 'th' | 'en';

export interface WordToken {
  text: string;
  startSec: number;
  endSec: number;
  confidence: number; // 0.0 - 1.0
  isEmphasis?: boolean;
  emoji?: string;
}

export interface SubtitleBlock {
  id: string;
  time: number; // Start in seconds
  endTime: number; // End in seconds
  text: string;
  words: WordToken[];
  confidence: number; // average confidence
  cps: number; // Characters per second
  hasCodeSwitching?: boolean;
}

export interface ASSExportStyle {
  fontName?: string;
  fontSize?: number;
  primaryColor?: string;
  secondaryColor?: string;
  outlineColor?: string;
  backgroundColor?: string;
  backgroundMode?: "none" | "solid" | "translucent";
  backgroundOpacity?: number;
  backgroundPadding?: number;
  outlineWidth?: number;
  shadow?: number;
  marginV?: number;
  animation?: "static" | "karaoke" | "word-by-word" | "bounce" | "typewriter" | "fade" | "highlight";
  glow?: number;
}

function hexToASSColor(hex: string, opacity = 1): string {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((part) => part + part).join("") : value;
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const alpha = Math.round((1 - Math.max(0, Math.min(1, opacity))) * 255);
  return `&H${alpha.toString(16).padStart(2, "0")}${blue.toString(16).padStart(2, "0")}${green.toString(16).padStart(2, "0")}${red.toString(16).padStart(2, "0")}`.toUpperCase();
}

// Contextual Emoji dictionary for auto-emoji suggestions
const CONTEXTUAL_EMOJIS: Record<string, string> = {
  // Lao
  'ໄຟ': '🔥',
  'ຮ້ອນ': '🔥',
  'ເງິນ': '💰',
  'ລວຍ': '💸',
  'ດີ': '✨',
  'ສຸດຍອດ': '🚀',
  'ຮັກ': '❤️',
  'ຫົວ': '😂',
  'ຕົກໃຈ': '😱',
  'ໄວ': '⚡',
  'ດາວ': '⭐',
  'ຍິ້ມ': '😊',
  'ກິນ': '🍜',
  'ຄິດ': '💡',
  'ຊະນະ': '🏆',
  'ຄັກ': '🤩',
  // Thai
  'ไฟ': '🔥',
  'ร้อน': '🔥',
  'เงิน': '💰',
  'รวย': '💸',
  'ดี': '✨',
  'สุดยอด': '🚀',
  'รัก': '❤️',
  'ขำ': '😂',
  'ตกใจ': '😱',
  'เร็ว': '⚡',
  'ดาว': '⭐',
  'ยิ้ม': '😊',
  'กิน': '🍜',
  'คิด': '💡',
  'ชนะ': '🏆',
  'ปัง': '💥',
  // English
  fire: '🔥',
  money: '💰',
  rich: '💸',
  good: '✨',
  love: '❤️',
  cool: '😎',
  fast: '⚡',
  win: '🏆',
  star: '⭐',
  idea: '💡',
  happy: '😊',
  food: '🍜',
  viral: '🚀',
  trend: '📈',
};

/**
 * 1. Code-Switching & Language Sanitation Rule:
 * - If target is 'lo': Enforce Lao + English script. Strictly strip Thai characters (0x0E00-0x0E7F).
 * - If target is 'th': Enforce Thai + English script. Strictly strip Lao characters (0x0E80-0x0EFF).
 */
export function sanitizeCodeSwitching(text: string, targetLanguage: SupportedLanguage): string {
  if (!text) return '';

  if (targetLanguage === 'lo') {
    // Strip Thai characters (0x0E00 - 0x0E7F) if erroneously injected by ASR
    // Map common Thai mis-transcribed consonants/vowels to Lao equivalents where applicable
    let cleaned = text.replace(/[\u0E01-\u0E5B]/g, (thaiChar) => {
      const code = thaiChar.charCodeAt(0);
      // Offset between Thai (0x0E00) and Lao (0x0E80) is 0x80 for many characters
      const laoCode = code + 0x80;
      // Check if mapped character is a valid Lao Unicode point
      if (
        (laoCode >= 0x0E81 && laoCode <= 0x0EAE) ||
        (laoCode >= 0x0EB0 && laoCode <= 0x0EBD) ||
        (laoCode >= 0x0EC0 && laoCode <= 0x0EC6) ||
        (laoCode >= 0x0EC8 && laoCode <= 0x0ECD) ||
        (laoCode >= 0x0ED0 && laoCode <= 0x0ED9)
      ) {
        return String.fromCharCode(laoCode);
      }
      return ''; // Strip Thai characters that have no Lao equivalent
    });
    return cleaned.trim();
  } else if (targetLanguage === 'th') {
    // Strip Lao characters (0x0E80 - 0x0EFF) if erroneously injected in Thai mode
    let cleaned = text.replace(/[\u0E80-\u0EFF]/g, (laoChar) => {
      const code = laoChar.charCodeAt(0);
      const thaiCode = code - 0x80;
      if (thaiCode >= 0x0E01 && thaiCode <= 0x0E5B) {
        return String.fromCharCode(thaiCode);
      }
      return '';
    });
    return cleaned.trim();
  }

  return text.trim();
}

/**
 * 2. High-Accuracy Word Segmentation (Intl.Segmenter + Lao/Thai Morphology)
 * Breaks unspaced Lao or Thai sentences into individual word tokens for karaoke timing
 * - Ensures combining vowels & tone marks are never detached from base consonants
 * - Preserves code-switching English brand words (e.g., BCEL, TikTok, One)
 */
export function segmentWords(text: string, lang: SupportedLanguage): string[] {
  if (!text) return [];

  // Regex pattern for Lao / Thai combining marks (vowels above/below, tone marks, cancellations)
  const combiningMarksRegex = /^[\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECD\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/;

  let rawWords: string[] = [];

  // Use Intl.Segmenter if supported by JS environment (Node.js 16+ & all modern browsers)
  if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
    try {
      const locale = lang === 'lo' ? 'lo-LA' : lang === 'th' ? 'th-TH' : 'en-US';
      const segmenter = new (Intl as any).Segmenter(locale, { granularity: 'word' });
      const segments = Array.from(segmenter.segment(text)) as { segment: string; isWordLike: boolean }[];

      rawWords = segments
        .filter((s) => s.segment.trim().length > 0)
        .map((s) => s.segment.trim());
    } catch {
      // fallback to regex if locale is not supported
    }
  }

  if (rawWords.length === 0) {
    // Fallback: Split by spaces and token boundary regex
    rawWords = text
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);
  }

  // Post-processing: Re-attach detached diacritics / tone marks to previous word
  const mergedWords: string[] = [];
  for (let i = 0; i < rawWords.length; i++) {
    const current = rawWords[i];
    if (mergedWords.length > 0 && combiningMarksRegex.test(current)) {
      // Current token is an orphaned vowel/tone mark; attach to previous token
      mergedWords[mergedWords.length - 1] += current;
    } else {
      mergedWords.push(current);
    }
  }

  return mergedWords;
}

/**
 * 3. Contextual Emoji Matcher
 */
export function getContextualEmoji(word: string): string | undefined {
  const clean = word.toLowerCase().replace(/[^\w\u0E80-\u0EFF\u0E00-\u0E7F]/g, '');
  return CONTEXTUAL_EMOJIS[clean];
}

/**
 * Calculate acoustic syllable & mora weight for accurate phonetic duration
 * Accounts for tone marks (0 weight) vs long vowels (1.6 weight)
 */
export function estimateAcousticSyllableWeight(word: string): number {
  if (!word) return 1;
  let weight = 0;
  for (let i = 0; i < word.length; i++) {
    const code = word.charCodeAt(i);
    // Lao / Thai tone marks: 0 duration (acoustic diacritic)
    if ((code >= 0x0EC8 && code <= 0x0ECB) || (code >= 0x0E48 && code <= 0x0E4B)) {
      continue;
    }
    // Lao / Thai long vowels: 1.6 duration weight
    if (
      code === 0x0EB2 || code === 0x0EB5 || code === 0x0EB7 || code === 0x0EB9 ||
      code === 0x0EC2 || code === 0x0EC1 || code === 0x0EC0 ||
      code === 0x0E32 || code === 0x0E35 || code === 0x0E37 || code === 0x0E39 ||
      code === 0x0E42 || code === 0x0E41 || code === 0x0E40
    ) {
      weight += 1.6;
    } else {
      weight += 1.0;
    }
  }
  return Math.max(1, weight);
}

/**
 * 4. Align Words to Subtitle Duration with Acoustic Micro-Timing
 * Distributes word start and end seconds across a subtitle block proportionally by acoustic weight
 */
export function buildWordLevelTimestamps(
  words: string[],
  blockStart: number,
  blockEnd: number,
  defaultConfidence: number = 0.95
): WordToken[] {
  if (!words || words.length === 0) return [];

  const wordWeights = words.map((w) => estimateAcousticSyllableWeight(w));
  const totalWeight = wordWeights.reduce((sum, wt) => sum + wt, 0);
  const totalDuration = Math.max(0.4, blockEnd - blockStart);

  let currentStart = blockStart;
  const wordTokens: WordToken[] = [];

  words.forEach((wordText, idx) => {
    const ratio = totalWeight > 0 ? wordWeights[idx] / totalWeight : 1 / words.length;
    const wordDur = Math.max(0.12, Number((totalDuration * ratio).toFixed(3)));
    const wordEnd = Number(Math.min(blockEnd, currentStart + wordDur).toFixed(3));

    const isEnglish = /^[A-Za-z0-9]+$/.test(wordText);
    const emoji = getContextualEmoji(wordText);
    const conf = defaultConfidence;

    wordTokens.push({
      text: wordText,
      startSec: Number(currentStart.toFixed(3)),
      endSec: wordEnd,
      confidence: conf,
      isEmphasis: isEnglish || !!emoji || wordText.length >= 6,
      emoji,
    });

    currentStart = wordEnd;
  });

  return wordTokens;
}

/**
 * Nudge all subtitles and word tokens by +/- milliseconds for fine-tuning sync
 */
export function nudgeSubtitlesTiming<T extends { time: number; endTime: number; words?: any[] }>(
  subtitles: T[],
  offsetMs: number
): T[] {
  const deltaSec = offsetMs / 1000;
  return subtitles.map((sub) => {
    const newStart = Math.max(0, Number((sub.time + deltaSec).toFixed(3)));
    const newEnd = Math.max(newStart + 0.2, Number((sub.endTime + deltaSec).toFixed(3)));
    return {
      ...sub,
      time: newStart,
      endTime: newEnd,
      words: Array.isArray(sub.words)
        ? sub.words.map((w) => ({
            ...w,
            startSec: Math.max(0, Number(((w.startSec ?? sub.time) + deltaSec).toFixed(3))),
            endSec: Math.max(0, Number(((w.endSec ?? sub.endTime) + deltaSec).toFixed(3))),
          }))
        : sub.words,
    };
  });
}

/**
 * 5. Calculate Characters Per Second (CPS)
 * Standard guideline: 12-18 CPS is comfortable. > 22 CPS is too fast.
 */
export function calculateCPS(text: string, durationSec: number): number {
  if (durationSec <= 0) return 0;
  return Number((text.replace(/\s+/g, '').length / durationSec).toFixed(1));
}

/**
 * 6. Export to Advanced SubStation Alpha (.ASS) Format
 * Includes karaoke tags {\k<centiseconds>} for Aegisub, CapCut, Premiere, and FFmpeg!
 */
export function exportToASS(subtitles: SubtitleBlock[], title: string = 'SAIZUP Karaoke', style: ASSExportStyle = {}): string {
  const fontName = (style.fontName || "Noto Sans Lao").replace(/[,{}`\\]/g, " ").trim() || "Noto Sans Lao";
  const fontSize = Math.max(12, Math.round(style.fontSize || 54));
  const backgroundMode = style.backgroundMode || "none";
  const backOpacity = backgroundMode === "solid" ? 1 : backgroundMode === "translucent" ? style.backgroundOpacity ?? 0.58 : 0;
  const borderStyle = backgroundMode === "none" ? 1 : 3;
  const outline = backgroundMode === "none" ? Math.max(0, Math.round(style.outlineWidth ?? fontSize * 0.07)) : Math.max(0, Math.round(style.backgroundPadding ?? 10));
  const shadow = Math.max(0, Math.round(style.shadow ?? 2));
  const marginV = Math.max(0, Math.round(style.marginV ?? 240));
  const primaryColor = hexToASSColor(style.primaryColor || "#FFFFFF");
  const secondaryColor = hexToASSColor(style.secondaryColor || "#FFE01B");
  const outlineColor = hexToASSColor(style.outlineColor || "#000000");
  const backColor = hexToASSColor(style.backgroundColor || "#000000", backOpacity);
  const formatTimeASS = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = Math.floor(sec % 60);
    const cs = Math.floor((sec % 1) * 100);
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  let ass = `[Script Info]
Title: ${title}
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: CapCutKaraoke,${fontName},${fontSize},${primaryColor},${secondaryColor},${outlineColor},${backColor},1,0,0,0,100,100,0,0,${borderStyle},${outline},${shadow},2,40,40,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  subtitles.forEach((sub) => {
    const startStr = formatTimeASS(sub.time);
    const endStr = formatTimeASS(sub.endTime);

    // Build Karaoke {\k<centiseconds>} text
    let karaokeText = '';
    if (sub.words && sub.words.length > 0 && ["karaoke", "word-by-word", "highlight", "bounce", "typewriter"].includes(style.animation || "karaoke")) {
      sub.words.forEach((w) => {
        const csDuration = Math.max(10, Math.round((w.endSec - w.startSec) * 100));
        const bounceTags = style.animation === "bounce"
          ? `\\t(0,${Math.max(1, Math.round(csDuration * 0.45))},\\fscx110\\fscy110)\\t(${Math.max(1, Math.round(csDuration * 0.45))},${csDuration},\\fscx100\\fscy100)`
          : "";
        if (style.animation === "word-by-word") {
          const revealMs = Math.max(0, Math.round((w.startSec - sub.time) * 1000));
          karaokeText += `{\\alpha&HFF&\\t(${revealMs},${revealMs + 40},\\alpha&H00&)}${w.text} `;
        } else {
          karaokeText += `{\\k${csDuration}${bounceTags}}${w.text} `;
        }
      });
      karaokeText = karaokeText.trim();
    } else {
      karaokeText = sub.text;
    }

    const fadeTag = style.animation === "fade" ? "{\\fad(250,250)}" : "";
    const glowTag = style.glow ? `{\\blur${Math.max(1, Math.round(style.glow))}}` : "";
    ass += `Dialogue: 0,${startStr},${endStr},CapCutKaraoke,,0,0,0,,${fadeTag}${glowTag}${karaokeText}\n`;
  });

  return ass;
}

/**
 * 7. Export to WebVTT (.VTT) with Word-Level Cues
 */
export function exportToVTT(subtitles: SubtitleBlock[]): string {
  const formatTimeVTT = (sec: number) => {
    const hrs = String(Math.floor(sec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const secs = String(Math.floor(sec % 60)).padStart(2, '0');
    const ms = String(Math.floor((sec % 1) * 1000)).padStart(3, '0');
    return `${hrs}:${mins}:${secs}.${ms}`;
  };

  let vtt = 'WEBVTT\n\n';

  subtitles.forEach((sub, idx) => {
    vtt += `${idx + 1}\n`;
    vtt += `${formatTimeVTT(sub.time)} --> ${formatTimeVTT(sub.endTime)}\n`;

    if (sub.words && sub.words.length > 0) {
      let wordCues = '';
      sub.words.forEach((w) => {
        wordCues += `<${formatTimeVTT(w.startSec)}>${w.text} `;
      });
      vtt += `${wordCues.trim()}\n\n`;
    } else {
      vtt += `${sub.text}\n\n`;
    }
  });

  return vtt;
}

/**
 * 8. Export to SubRip (.SRT)
 */
export function exportToSRT(subtitles: SubtitleBlock[]): string {
  const formatTimeSRT = (sec: number) => {
    const hrs = String(Math.floor(sec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const secs = String(Math.floor(sec % 60)).padStart(2, '0');
    const ms = String(Math.floor((sec % 1) * 1000)).padStart(3, '0');
    return `${hrs}:${mins}:${secs},${ms}`;
  };

  let srt = '';
  subtitles.forEach((sub, idx) => {
    srt += `${idx + 1}\n`;
    srt += `${formatTimeSRT(sub.time)} --> ${formatTimeSRT(sub.endTime)}\n`;
    srt += `${sub.text}\n\n`;
  });

  return srt;
}

/**
 * 9. Export to Adobe Premiere Pro XML Sequence (.XML)
 */
export function exportToPremiereXML(subtitles: SubtitleBlock[], fps = 30): string {
  const timeToFrames = (sec: number) => Math.round(sec * fps);
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="4">
  <sequence>
    <name>SAIZUP_Subtitles_Sequence</name>
    <rate>
      <timebase>${fps}</timebase>
      <ntsc>FALSE</ntsc>
    </rate>
    <media>
      <video>
        <track>
`;

  subtitles.forEach((sub, idx) => {
    const startFrame = timeToFrames(sub.time);
    const endFrame = timeToFrames(sub.endTime);
    const durFrames = Math.max(1, endFrame - startFrame);
    const escapedText = sub.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    xml += `          <generatoritem id="sub-${idx + 1}">
            <name>${escapedText}</name>
            <duration>${durFrames}</duration>
            <rate><timebase>${fps}</timebase><ntsc>FALSE</ntsc></rate>
            <start>${startFrame}</start>
            <end>${endFrame}</end>
            <effect>
              <name>Basic Title</name>
              <effectid>basic_title</effectid>
              <effecttype>generator</effecttype>
              <mediatype>video</mediatype>
              <parameter>
                <parameterid>text</parameterid>
                <name>Text</name>
                <value>${escapedText}</value>
              </parameter>
            </effect>
          </generatoritem>\n`;
  });

  xml += `        </track>
      </video>
    </media>
  </sequence>
</xmeml>`;

  return xml;
}

/**
 * 10. Export to Apple Final Cut Pro XML (.FCPXML)
 */
export function exportToFCPXML(subtitles: SubtitleBlock[], fps = 30): string {
  let fcpxml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
  <resources>
    <format id="r1" name="FFVideoFormat1080p${fps}" frameDuration="1/${fps}s" width="1080" height="1920"/>
    <effect id="r2" name="Basic Title" uid=".../Titles.localized/Bumper:Opener.localized/Basic Title.localized/Basic Title.moti"/>
  </resources>
  <library>
    <event name="SAIZUP AI Captions">
      <project name="SAIZUP Subtitles">
        <sequence format="r1" duration="${Math.ceil((subtitles[subtitles.length - 1]?.endTime || 30) * fps)}/${fps}s">
          <spine>
`;

  subtitles.forEach((sub, idx) => {
    const startSeconds = sub.time;
    const durSeconds = Math.max(0.1, sub.endTime - sub.time);
    const escapedText = sub.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    fcpxml += `            <title ref="r2" name="Caption ${idx + 1}" offset="${startSeconds}s" duration="${durSeconds}s" start="0s">
              <text>
                <text-style ref="ts${idx + 1}">${escapedText}</text-style>
              </text>
              <text-style-def id="ts${idx + 1}">
                <text-style font="Noto Sans Lao" fontSize="64" fontColor="1 1 1 1" alignment="center"/>
              </text-style-def>
            </title>\n`;
  });

  fcpxml += `          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>`;

  return fcpxml;
}
