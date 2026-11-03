export type DialectTag =
  | 'auto'
  | 'lo-vte'     // Lao Vientiane (ມາດຕະຖານ)
  | 'lo-lpq'     // Lao Luang Prabang (ພາກເໜືອ)
  | 'lo-cps'     // Lao Champasak (ພາກໃຕ້)
  | 'lo-xkh'     // Lao Xieng Khouang (ຊຽງຂວາງ/ພວນ)
  | 'th-c'       // Central Thai (ກາງ)
  | 'th-ne'      // Isan / Lao-Thai (ອີສານ)
  | 'th-n'       // Northern Kham Mueang (ຄຳເມືອງ)
  | 'th-s'       // Southern Thai (ປັກໃຕ້)
  | 'en-loan';   // English tech/brand loanwords

export interface DialectProfile {
  tag: DialectTag;
  label: string;
  flag: string;
  region: string;
  description: string;
  phoneticRules: string[];
  commonKeywords: string[];
}

export const DIALECT_PROFILES: Record<DialectTag, DialectProfile> = {
  auto: {
    tag: 'auto',
    label: 'ກວດຈັບອັດຕະໂນມັດ (Auto Detect)',
    flag: '🌐',
    region: 'ທຸກພາກພື້ນ',
    description: 'AI ຈະວິເຄາະໂທນສຽງ ແລະ ສຳນຽງຂອງຜູ້ເວົ້າໃນຄລິບແບບອັດຕະໂນມັດ',
    phoneticRules: [
      'ກວດຈັບສຽງວັນນະຍຸດ ແລະ ສຽງສະຫຼະຕາມສຳນຽງທ້ອງຖິ່ນຂອງຜູ້ເວົ້າແທ້',
      'ຮອງຮັບການເວົ້າປົນກັນລະຫວ່າງ ລາວ, ໄທ, ອີສານ ແລະ ອັງກິດ',
    ],
    commonKeywords: ['TikTok', 'Reels', 'BCEL', 'Saizup'],
  },
  'lo-vte': {
    tag: 'lo-vte',
    label: 'ສຳນຽງວຽງຈັນ (Vientiane Standard)',
    flag: '🇱🇦',
    region: 'ນະຄອນຫຼວງວຽງຈັນ ແລະ ພາກກາງ',
    description: 'ສຳນຽງລາວມາດຕະຖານ ອອກສຽງຊັດເຈນ ໂທນສຽງກາງ',
    phoneticRules: [
      'ສຽງ ຣ ມັກອອກສຽງເປັນ ລ ຫຼື ຮ (ເຊັ່ນ: ຮຽນ, ລົດ)',
      'ສຽງສະຫຼະ ເອັຍ, ອົວ, ເອຶອ ຊັດເຈນ ບໍ່ຮວບສຽງ',
      'ຄຳລົງທ້າຍສຸພາບ: ໂດຍ, ເຈົ້າ, ເດີ, ນໍ',
    ],
    commonKeywords: [
      'ສະບາຍດີ', 'ໂດຍ', 'ເຈົ້າ', 'ແທ້ຫວາ', 'ແມ່ນແລ້ວ', 'ບໍ່ເປັນຫຍັງ',
      'ກິນເຂົ້າແລ້ວບໍ່', 'ໄປໃສມາ', 'ໂທລະສັບ', 'ເງິນກີບ', 'ຂອບໃຈຫຼາຍໆ',
    ],
  },
  'lo-lpq': {
    tag: 'lo-lpq',
    label: 'ສຳນຽງຫຼວງພະບາງ (Luang Prabang)',
    flag: '🇱🇦',
    region: 'ພາກເໜືອ (ຫຼວງພະບາງ, ໄຊຍະບູລີ, ອຸດົມໄຊ)',
    description: 'ສຳນຽງອ່ອນຫວານ ສຽງວັນນະຍຸດສູງ-ໂຄ້ງ ເອກະລັກສຽງ ນ/ລ/ຣ',
    phoneticRules: [
      'ສຽງວັນນະຍຸດຕີ-ຈັດຕະວາ ມັກລາກສຽງສູງຂຶ້ນທ້າຍຄຳ (Rising-high pitch)',
      'ສຽງ ເພິ່ນ/ເຮົາ ມັກອອກສຽງອ່ອນໂຍນ ໃຊ້ຄຳວ່າ "ເຫີ" (ໃຫ້)',
      'ຄຳລົງທ້າຍ: ເດີ້, ຫັ້ນເນີ, ຂ້ານ້ອຍ, ເຈົ້າ',
    ],
    commonKeywords: [
      'ຂ້ານ້ອຍ', 'ເພິ່ນ', 'ເຫີ', 'ຫັ້ນເນີ', 'ປານໃດ', 'ງາມແທ້', 'ເຈົ້າຂ້ານ້ອຍ',
      'ກິນເຂົ້າແລ້ວບໍ້', 'ໄປຮອດໃສ', 'ເມືອງມໍລະດົກໂລກ',
    ],
  },
  'lo-cps': {
    tag: 'lo-cps',
    label: 'ສຳນຽງຈຳປາສັກ (Champasak / ໃຕ້)',
    flag: '🇱🇦',
    region: 'ພາກໃຕ້ (ຈຳປາສັກ, ສາລະວັນ, ເຊກອງ, ອັດຕະປື)',
    description: 'ສຳນຽງໜັກແໜ້ນ ສຽງວັນນະຍຸດຕ່ຳ-ກົດ ໃຊ້ສັບພື້ນຖິ່ນໃຕ້',
    phoneticRules: [
      'ສຽງວັນນະຍຸດມັກກົດຕ່ຳລົງ (Falling-low pitch cadence)',
      'ສຽງ ຢ ມັກອອກສຽງໜັກ (ເຊັ່ນ: ຢາກ, ຢູ່)',
      'ຄຳລົງທ້າຍ: ເດີ້, ພຸ້ນນ່າ, ແນ່ແມ້',
    ],
    commonKeywords: [
      'ກະຈັ່ງຊັ້ນ', 'ໄປໃສແດ່', 'ເປັນຕາຮັກ', 'ຊິໄປໃສ', 'ເວົ້າແນວໃດ',
      'ກິນເຂົ້າແລ້ວຕິ', 'ພຸ້ນນ່າ', 'ຄັກແທ້', 'ຄອນພະເພັງ',
    ],
  },
  'lo-xkh': {
    tag: 'lo-xkh',
    label: 'ສຳນຽງຊຽງຂວາງ (Xieng Khouang / ພວນ)',
    flag: '🇱🇦',
    region: 'ພາກຕາເວັນອອກສ່ຽງເໜືອ (ຊຽງຂວາງ, ຫົວພັນ)',
    description: 'ສຳນຽງພວນ-ຊຽງຂວາງ ສຽງສູງໄວ ຄຳສັບບູຮານ',
    phoneticRules: [
      'ສຽງສະຫຼະສັ້ນມັກເນັ້ນໜັກ (Staccato accent)',
      'ສັບສະເພາະ: ຕູ່ (ເຮົາ), ສູ (ເຈົ້າ), ເມື່ອບ້ານ',
    ],
    commonKeywords: ['ຕູ່', 'ສູ', 'ໄຫຫີນ', 'ໜາວຫຼາຍ', 'ກິນເຂົ້າປ່າ', 'ໄປມົ້ວ'],
  },
  'th-ne': {
    tag: 'th-ne',
    label: 'ສຳນຽງອີສານ (Isan Dialect)',
    flag: '🇹🇭',
    region: 'ພາກອີສານ (ຂອນແກ່ນ, ອຸດອນ, ອຸບົນ, ໂຄລາດ)',
    description: 'ສຳນຽງອີສານ-ໄທບ້ານ ໃກ້ຄຽງກັບພາສາລາວ',
    phoneticRules: [
      'ສຽງ ຊ ມັກອອກເປັນ ສ / ຊ (ເຊັ່ນ: ຊິໄປ -> ສິໄປ)',
      'ສຽງ ຣ/ລ ອອກເປັນ ຮ (ເຊັ່ນ: ຮັກ, ຮຽນ)',
      'ຄຳເຊື່ອມ ແລະ ລົງທ້າຍ: ເດີ, ນໍ, ດອກ, ຕວົະ, ແມ້',
    ],
    commonKeywords: [
      'แม่นแล้ว', 'เป็นตาฮัก', 'บ่ฮู้', 'จั่งซี่', 'อีหลี', 'แซ่บหลาย',
      'ไปไส', 'เฮ็ดหยัง', 'บักหำ', 'สิไปไส', 'เด้อครับ', 'ผู้สาวขาเลาะ',
    ],
  },
  'th-c': {
    tag: 'th-c',
    label: 'สำเนียงไทยกลาง (Central Thai)',
    flag: '🇹🇭',
    region: 'กรุงเทพฯ และภาคกลาง',
    description: 'ภาษาไทยมาตรฐาน วรรณยุกต์ 5 เสียงครบถ้วน',
    phoneticRules: [
      'ออกเสียง ร / ล แยกชัดเจน หรือ ร รวบเสียงในภาษาพูด',
      'คำลงท้าย: ครับ, ค่ะ, นะครับ, นะคะ, จ้า, นะ',
    ],
    commonKeywords: [
      'สวัสดีครับ', 'ขอบคุณค่ะ', 'จริงดิ', 'ปังมาก', 'เก่งมาก', 'สุดยอดเลย',
      'ไปไหนมา', 'ทำอะไรอยู่', 'น่ารักมาก', 'โอเคเลย', 'เข้าใจแล้ว',
    ],
  },
  'th-n': {
    tag: 'th-n',
    label: 'สำเนียงคำเมือง (Northern Thai)',
    flag: '🇹🇭',
    region: 'ภาคเหนือ (เชียงใหม่, ลำพูน, ลำปาง, เชียงราย)',
    description: 'อู้คำเมือง เนิบนาบ นุ่มนวล ลากเสียงท้าย',
    phoneticRules: [
      'เสียงวรรณยุกต์ลากยาว นุ่มนวล ไม่กระโชกโฮกฮาก',
      'คำลงท้าย: เจ้า, กั๊บ, เน้อ, ก่อ, หนา',
    ],
    commonKeywords: [
      'อู้คำเมือง', 'เจ้า', 'กั๊บ', 'ลำขนาด', 'จะไปไหน', 'ฮักตั๋วเน้อ',
      'กิ๋นข้าวแล้วกา', 'เปิ้น', 'ตั๋ว', 'ปิ๊กบ้าน',
    ],
  },
  'th-s': {
    tag: 'th-s',
    label: 'สำเนียงปักษ์ใต้ (Southern Thai)',
    flag: '🇹🇭',
    region: 'ภาคใต้ (สงขลา, นครศรีฯ, สุราษฎร์ฯ, ภูเก็ต)',
    description: 'แหลงใต้ พูดเร็ว ห้วนสั้น ตัดพยางค์หน้าทิ้ง',
    phoneticRules: [
      'พูดเร็ว รวบตัดคำพยางค์หน้า (เช่น ตลาด -> ลาด, สะพาน -> พาน)',
      'คำลงท้าย: นิ, หลาว, มั่ง, ตะ, โด้',
    ],
    commonKeywords: [
      'แหลงใต้', 'หรอยจังฮู้', 'ไซร', 'นุ้ย', 'บายดีหม้าย', 'กินข้าวแล้วหม้าย',
      'หรอยแรง', 'ไปไหนนิ', 'ทำไหรอยู่', 'ไม่พรือ',
    ],
  },
  'en-loan': {
    tag: 'en-loan',
    label: 'ຄຳທັບສັບເຕັກໂນໂລຊີ & ແບຣນ (Tech/Brand Loanwords)',
    flag: '📱',
    region: 'ສາກົນ ແລະ ໂຊຊຽວມີເດຍ',
    description: 'ການອອກສຽງຊື່ສະເພາະ ແບຣນສິນຄ້າ ແລະ ສັບໄອທີໃນສຳນຽງລາວ/ໄທ',
    phoneticRules: [
      'ສຽງທ້າຍພາສາອັງກິດ (Final consonants: -ck, -ft, -ts) ມັກອອກເປັນສຽງແມ່ກົບ/ກົກ/ກົດ ຕາມສຳນຽງທ້ອງຖິ່ນ',
      'ສະກົດຊື່ແບຣນ ແລະ ຄຳສັບເຕັກໂນໂລຊີດ້ວຍຕົວອັກສອນທີ່ຖືກຕ້ອງ',
    ],
    commonKeywords: [
      'TikTok', 'Facebook', 'YouTube', 'Reels', 'Shorts', 'CapCut',
      'AI', 'Saizup', 'BCEL One', 'iPhone', 'Crypto', 'Creator',
      'Follower', 'Content', 'Vlog', 'Live', 'Online', 'Subscribe',
    ],
  },
};

export interface LearnedMapping {
  id: string;
  originalHeard: string;
  correctedText: string;
  dialect: DialectTag;
  language: 'lo' | 'th' | 'mixed' | 'en';
  frequency: number;
  confidence: number;
  contributedBy?: string;
  lastSeenAt: string;
}

export interface AccentMemoryDatabase {
  version: string;
  updatedAt: string;
  totalCorrectionsLearned: number;
  learnedMappings: LearnedMapping[];
}
