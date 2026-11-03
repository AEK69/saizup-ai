import fs from 'fs';
import path from 'path';
import {
  DialectTag,
  DIALECT_PROFILES,
  LearnedMapping,
  AccentMemoryDatabase,
} from './accentTypes';

export * from './accentTypes';

const MEMORY_FILE_PATH = path.join(process.cwd(), 'data', 'accent_memory.json');

/**
 * Seed mappings for robust initial intelligence across all Lao and Thai dialects
 */
const INITIAL_SEED_MAPPINGS: LearnedMapping[] = [
  // Lao Luang Prabang accent adaptations
  { id: 'seed_lo_lpq_1', originalHeard: 'ໃຫ້', correctedText: 'ເຫີ', dialect: 'lo-lpq', language: 'lo', frequency: 15, confidence: 0.95, lastSeenAt: '2026-11-01T00:00:00Z' },
  { id: 'seed_lo_lpq_2', originalHeard: 'ຂ້ອຍ', correctedText: 'ຂ້ານ້ອຍ', dialect: 'lo-lpq', language: 'lo', frequency: 22, confidence: 0.98, lastSeenAt: '2026-11-01T00:00:00Z' },
  { id: 'seed_lo_lpq_3', originalHeard: 'ຫັ້ນເດີ', correctedText: 'ຫັ້ນເນີ', dialect: 'lo-lpq', language: 'lo', frequency: 12, confidence: 0.92, lastSeenAt: '2026-11-01T00:00:00Z' },
  
  // Lao Champasak / Southern accent adaptations
  { id: 'seed_lo_cps_1', originalHeard: 'ເປັນຈັ່ງຊັ້ນ', correctedText: 'ກະຈັ່ງຊັ້ນ', dialect: 'lo-cps', language: 'lo', frequency: 28, confidence: 0.96, lastSeenAt: '2026-11-01T00:00:00Z' },
  { id: 'seed_lo_cps_2', originalHeard: 'ໄປໃສແນ່', correctedText: 'ໄປໃສແດ່', dialect: 'lo-cps', language: 'lo', frequency: 31, confidence: 0.99, lastSeenAt: '2026-11-01T00:00:00Z' },
  { id: 'seed_lo_cps_3', originalHeard: 'ພຸ້ນນະ', correctedText: 'ພຸ້ນນ່າ', dialect: 'lo-cps', language: 'lo', frequency: 19, confidence: 0.94, lastSeenAt: '2026-11-01T00:00:00Z' },

  // Isan / Thai-Lao adaptations
  { id: 'seed_th_ne_1', originalHeard: 'ใช่แล้ว', correctedText: 'แม่นแล้ว', dialect: 'th-ne', language: 'th', frequency: 35, confidence: 0.99, lastSeenAt: '2026-11-01T00:00:00Z' },
  { id: 'seed_th_ne_2', originalHeard: 'น่ารักมาก', correctedText: 'เป็นตาฮัก', dialect: 'th-ne', language: 'th', frequency: 26, confidence: 0.97, lastSeenAt: '2026-11-01T00:00:00Z' },
  { id: 'seed_th_ne_3', originalHeard: 'ทำไม', correctedText: 'เป็นหยัง', dialect: 'th-ne', language: 'th', frequency: 30, confidence: 0.98, lastSeenAt: '2026-11-01T00:00:00Z' },
  { id: 'seed_th_ne_4', originalHeard: 'จะไปไหน', correctedText: 'สิไปไส', dialect: 'th-ne', language: 'th', frequency: 40, confidence: 0.99, lastSeenAt: '2026-11-01T00:00:00Z' },

  // Thai Northern Kham Mueang adaptations
  { id: 'seed_th_n_1', originalHeard: 'อร่อยมาก', correctedText: 'ลำขนาด', dialect: 'th-n', language: 'th', frequency: 24, confidence: 0.96, lastSeenAt: '2026-11-01T00:00:00Z' },
  { id: 'seed_th_n_2', originalHeard: 'กินข้าวหรือยัง', correctedText: 'กิ๋นข้าวแล้วกา', dialect: 'th-n', language: 'th', frequency: 18, confidence: 0.95, lastSeenAt: '2026-11-01T00:00:00Z' },

  // Thai Southern adaptations
  { id: 'seed_th_s_1', originalHeard: 'อร่อยมาก', correctedText: 'หรอยจังฮู้', dialect: 'th-s', language: 'th', frequency: 27, confidence: 0.97, lastSeenAt: '2026-11-01T00:00:00Z' },
  { id: 'seed_th_s_2', originalHeard: 'ทำไมเหรอ', correctedText: 'ไซรนิ', dialect: 'th-s', language: 'th', frequency: 21, confidence: 0.94, lastSeenAt: '2026-11-01T00:00:00Z' },
  { id: 'seed_th_s_3', originalHeard: 'สบายดีไหม', correctedText: 'บายดีหม้าย', dialect: 'th-s', language: 'th', frequency: 25, confidence: 0.96, lastSeenAt: '2026-11-01T00:00:00Z' },

  // Modern Social Media & Brand English Loanwords
  { id: 'seed_en_1', originalHeard: 'ຕິກຕອກ', correctedText: 'TikTok', dialect: 'en-loan', language: 'mixed', frequency: 85, confidence: 0.99, lastSeenAt: '2026-11-02T00:00:00Z' },
  { id: 'seed_en_2', originalHeard: 'ຕິກຕ໊ອກ', correctedText: 'TikTok', dialect: 'en-loan', language: 'mixed', frequency: 72, confidence: 0.99, lastSeenAt: '2026-11-02T00:00:00Z' },
  { id: 'seed_en_3', originalHeard: 'ຕັດຕໍ່', correctedText: 'CapCut', dialect: 'en-loan', language: 'mixed', frequency: 65, confidence: 0.98, lastSeenAt: '2026-11-02T00:00:00Z' },
  { id: 'seed_en_4', originalHeard: 'ບີຊີແອວ', correctedText: 'BCEL One', dialect: 'en-loan', language: 'mixed', frequency: 90, confidence: 0.99, lastSeenAt: '2026-11-02T00:00:00Z' },
  { id: 'seed_en_5', originalHeard: 'ໄຊຊັບ', correctedText: 'SAIZUP', dialect: 'en-loan', language: 'mixed', frequency: 95, confidence: 0.99, lastSeenAt: '2026-11-02T00:00:00Z' },
  { id: 'seed_en_6', originalHeard: 'ຊາຍຊັບ', correctedText: 'SAIZUP', dialect: 'en-loan', language: 'mixed', frequency: 88, confidence: 0.99, lastSeenAt: '2026-11-02T00:00:00Z' },
];

export const AccentMemory = {
  /**
   * Load the active learned database from disk, automatically initializing if missing
   */
  getDatabase(): AccentMemoryDatabase {
    try {
      if (fs.existsSync(MEMORY_FILE_PATH)) {
        const raw = fs.readFileSync(MEMORY_FILE_PATH, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.learnedMappings)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[accentMemory] Failed to read database, initializing fresh:', err);
    }

    const initialDb: AccentMemoryDatabase = {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      totalCorrectionsLearned: INITIAL_SEED_MAPPINGS.length,
      learnedMappings: INITIAL_SEED_MAPPINGS,
    };
    this.saveDatabase(initialDb);
    return initialDb;
  },

  /**
   * Persist database to disk
   */
  saveDatabase(db: AccentMemoryDatabase): void {
    try {
      const dir = path.dirname(MEMORY_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      db.updatedAt = new Date().toISOString();
      db.totalCorrectionsLearned = db.learnedMappings.length;
      fs.writeFileSync(MEMORY_FILE_PATH, JSON.stringify(db, null, 2), 'utf8');
    } catch (err) {
      console.error('[accentMemory] Error saving database:', err);
    }
  },

  /**
   * Learn from a user correction diff (Human-in-the-Loop Active Learning)
   * When users manually correct subtitles in Subtitle Studio or Video Editor,
   * this registers the correction pair, builds frequency, and updates dialect intelligence.
   */
  recordUserCorrection(params: {
    originalHeard: string;
    correctedText: string;
    dialect?: DialectTag;
    language?: 'lo' | 'th' | 'mixed' | 'en';
    userEmail?: string;
  }): { success: boolean; mapping: LearnedMapping } {
    const orig = (params.originalHeard || '').trim();
    const corr = (params.correctedText || '').trim();

    if (!orig || !corr || orig === corr) {
      throw new Error('ຄຳສັບເດີມ ແລະ ຄຳສັບທີ່ແກ້ໄຂຕ້ອງແຕກຕ່າງກັນ');
    }

    const db = this.getDatabase();
    const cleanOrig = orig.toLowerCase();
    const cleanCorr = corr.toLowerCase();

    // Look for existing mapping
    const existingIndex = db.learnedMappings.findIndex(
      (m) =>
        m.originalHeard.toLowerCase() === cleanOrig &&
        m.correctedText.toLowerCase() === cleanCorr
    );

    const dialectTag = params.dialect && DIALECT_PROFILES[params.dialect] ? params.dialect : 'auto';
    const lang = params.language || 'mixed';

    let resultItem: LearnedMapping;

    if (existingIndex !== -1) {
      // Reinforce existing learned item
      const item = db.learnedMappings[existingIndex];
      item.frequency += 1;
      item.confidence = Math.min(0.99, Number((item.confidence + 0.05).toFixed(2)));
      item.lastSeenAt = new Date().toISOString();
      if (params.userEmail) item.contributedBy = params.userEmail;
      if (dialectTag !== 'auto') item.dialect = dialectTag;
      resultItem = item;
    } else {
      // Create new learned mapping
      resultItem = {
        id: `learned_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        originalHeard: orig,
        correctedText: corr,
        dialect: dialectTag,
        language: lang,
        frequency: 1,
        confidence: 0.85,
        contributedBy: params.userEmail,
        lastSeenAt: new Date().toISOString(),
      };
      db.learnedMappings.unshift(resultItem);
    }

    this.saveDatabase(db);
    return { success: true, mapping: resultItem };
  },

  /**
   * Bulk learn from a full subtitles edit session
   * Diffs the original AI hypotheses against the user's finalized subtitles.
   */
  learnFromSessionEdits(params: {
    originalSubtitles: Array<{ text: string }>;
    editedSubtitles: Array<{ text: string }>;
    dialect?: DialectTag;
    language?: 'lo' | 'th' | 'mixed' | 'en';
    userEmail?: string;
  }): { learnedCount: number; newlyLearned: string[] } {
    const { originalSubtitles, editedSubtitles, dialect, language, userEmail } = params;
    let learnedCount = 0;
    const newlyLearned: string[] = [];

    const minLen = Math.min(originalSubtitles.length, editedSubtitles.length);
    for (let i = 0; i < minLen; i++) {
      const origText = (originalSubtitles[i]?.text || '').trim();
      const editText = (editedSubtitles[i]?.text || '').trim();

      if (origText && editText && origText !== editText) {
        // Compare words or short phrases
        const origWords = origText.split(/\s+/).filter(Boolean);
        const editWords = editText.split(/\s+/).filter(Boolean);

        if (origWords.length === editWords.length && origWords.length <= 8) {
          for (let w = 0; w < origWords.length; w++) {
            if (origWords[w] !== editWords[w]) {
              try {
                this.recordUserCorrection({
                  originalHeard: origWords[w],
                  correctedText: editWords[w],
                  dialect,
                  language,
                  userEmail,
                });
                learnedCount++;
                newlyLearned.push(`${origWords[w]} ➔ ${editWords[w]}`);
              } catch {}
            }
          }
        } else if (origText.length < 50 && editText.length < 50) {
          try {
            this.recordUserCorrection({
              originalHeard: origText,
              correctedText: editText,
              dialect,
              language,
              userEmail,
            });
            learnedCount++;
            newlyLearned.push(`${origText} ➔ ${editText}`);
          } catch {}
        }
      }
    }

    return { learnedCount, newlyLearned };
  },

  /**
   * Generates dynamic In-Context prompt augmentations with learned dialect exemplars
   * to inject directly into the multimodal Gemini STT model prompt.
   */
  getDynamicPromptAdditions(params: {
    language: 'lo' | 'th' | 'mixed' | 'en';
    dialect?: DialectTag;
    customVocabulary?: string;
  }): string {
    const { language, dialect = 'auto', customVocabulary } = params;
    const db = this.getDatabase();

    // 1. Filter relevant learned mappings
    const relevantMappings = db.learnedMappings
      .filter((m) => {
        if (dialect !== 'auto' && m.dialect === dialect) return true;
        if (m.dialect === 'en-loan') return true;
        if (language === 'mixed') return true;
        return m.language === language || m.language === 'mixed';
      })
      .sort((a, b) => b.frequency * b.confidence - a.frequency * a.confidence)
      .slice(0, 18);

    // 2. Dialect Specific Phonetic Profile
    const profile = DIALECT_PROFILES[dialect] || DIALECT_PROFILES.auto;

    let section = `\n🧠 DYNAMIC ACCENT & REGIONAL DIALECT INTELLIGENCE (Continuous Learning System):\n`;
    section += `Target Dialect Profile: ${profile.flag} ${profile.label} (${profile.region})\n`;
    section += `Regional Phonetic Nuances:\n`;
    for (const rule of profile.phoneticRules) {
      section += `- ${rule}\n`;
    }

    if (profile.commonKeywords.length > 0) {
      section += `Characteristic Dialect Vocabulary: ${profile.commonKeywords.join(', ')}\n`;
    }

    if (relevantMappings.length > 0) {
      section += `\nLearned Pronunciation & Spelling Mappings (Learned from user feedback):\n`;
      for (const m of relevantMappings) {
        section += `- Spoken sounds like "${m.originalHeard}" ➔ Transcribe correctly as: "${m.correctedText}" (Dialect: ${m.dialect}, Conf: ${(m.confidence * 100).toFixed(0)}%)\n`;
      }
    }

    if (customVocabulary?.trim()) {
      section += `User Priority Keywords: ${customVocabulary.trim()}\n`;
    }

    section += `MANDATORY: Always apply these learned dialect tone shifts and regional vocabulary rules to achieve maximum transcription accuracy for this speaker.\n`;

    return section;
  },

  /**
   * Get stats for UI display (badge, learning indicator, admin modal)
   */
  getStats() {
    const db = this.getDatabase();
    const dialectCounts: Record<string, number> = {};

    for (const item of db.learnedMappings) {
      dialectCounts[item.dialect] = (dialectCounts[item.dialect] || 0) + 1;
    }

    return {
      totalLearned: db.learnedMappings.length,
      updatedAt: db.updatedAt,
      dialectBreakdown: dialectCounts,
      topLearnedSamples: db.learnedMappings.slice(0, 8),
    };
  },
};
