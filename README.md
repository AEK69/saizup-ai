# 🎬 SAIZUP AI Studio

> **ເວັບໄຊຕັດຕໍ່ວິດີໂອສັ້ນ ແລະ ສ້າງຊັບໄຕເຕິລ AI ພາສາລາວ & ໄທ ລະດັບມືອາຊີບ**  
> *Professional AI Subtitles & CapCut-Style Video Editor for Lao & Thai Creators*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini Multimodal](https://img.shields.io/badge/Gemini-Multimodal%20Audio-orange?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)

---

## 🌟 ພາບລວມຂອງລະບົບ (Overview)

**SAIZUP AI Studio** ເປັນເວັບແອັບພລິເຄຊັນສຳລັບຄຣີເອເຕີ (Content Creators) ຍຸກໃໝ່ ທີ່ຊ່ວຍສ້າງຊັບໄຕເຕິລ (Subtitles/Captions) ແລະ ຕັດຕໍ່ວິດີໂອສັ້ນສຳລັບ **TikTok, Reels, Shorts** ແບບອັດຕະໂນມັດ ໂດຍອອກແບບມາເພື່ອຮອງຮັບ **ພາສາລາວ (Lao)** ແລະ **ພາສາໄທ (Thai)** ຢ່າງສົມບູນແບບ 100%.

ມາພ້ອມລະບົບ **CapCut Studio Design System** ທີ່ຄຸ້ນເຄີຍ, ໃຊ້ງານງ່າຍ, ສະດວກ, ວ່ອງໄວ ແລະ ຖືກຕ້ອງຕາມຫຼັກພາສາສາດ.

---

## ✨ ຄຸນສົມບັດຫຼັກ (Core Features)

### 1. 🧠 AI Continuous Accent & Dialect Learning (ລະບົບຮຽນຮູ້ສຳນຽງອັດຕະໂນມັດ)
- **10 ຮູບແບບສຳນຽງພາກພື້ນ (Regional Dialects)**:
  - 🇱🇦 **ສຳນຽງວຽງຈັນ (Vientiane Standard - `lo-vte`)**: ສຽງມາດຕະຖານ, ວັນນະຍຸດ 6 ສຽງ.
  - 🇱🇦 **ສຳນຽງຫຼວງພະບາງ / ເໜືອ (`lo-lpq`)**: ສຽງ ໃ- ເປັນ ເ-ີ, ສຽງ ນ-ລ, ຄຳລົງທ້າຍ "ຫັ້ນເນີ / ເດີ້ເນີ".
  - 🇱🇦 **ສຳນຽງຈຳປາສັກ / ໃຕ້ (`lo-cps`)**: ສຽງກົດໜັກ, ຄຳລົງທ້າຍ "ແດ່ / ພຸ້ນນ່າ / ກະຈັ່ງຊັ້ນ".
  - 🇱🇦 **ສຳນຽງຊຽງຂວາງ / ໄທພວນ (`lo-xkh`)**: ສຳນຽງສຽງສູງສະເພາະຕົວ.
  - 🇹🇭 **ສຳນຽງໄທ-ອີສານ (`th-ne`)**: ຮອງຮັບພາສາອີສານ (ແມ່ນແລ້ວ, ເປັນຕາຮັກ, ເຮັດຫຍັງ).
  - 🇹🇭 **ສຳນຽງໄທກາງ (`th-c`)**, **ຄຳເມືອງ (`th-n`)**, **ປັກໃຕ້ (`th-s`)**.
  - 📱 **ຄຳທັບສັບເຕັກໂນໂລຊີ & ແບຣນ (`en-loan`)**: ຮອງຮັບຊື່ສະເພາະເຊັ່ນ *BCEL, TikTok, CapCut, SAIZUP, Facebook*.
- **Silent Automated Learning**: ລະບົບຈະຮຽນຮູ້ການແກ້ໄຂຄຳສັບຂອງຜູ້ໃຊ້ໃນພື້ນຫຼັງໂດຍອັດຕະໂນມັດ ໂດຍບໍ່ຕ້ອງກົດປຸ່ມໃດໆ.
- **In-Context Few-Shot Prompting**: ດຶງຮູບແບບສຽງທີ່ຮຽນຮູ້ແລ້ວເຂົ້າໄປສອນ AI ແບບ Real-time ເພື່ອໃຫ້ຄລິບຕໍ່ໄປຖອດສຽງໄດ້ແມ່ນຍຳຂຶ້ນເລື້ອຍໆ.

### 2. 🎙️ ລະບົບຖອດສຽງຄຸນນະພາບສູງ (High-Precision Multimodal STT)
- **16kHz Studio Audio Extraction**: ສກັດສຽງຄົມຊັດ 16,000 Hz Mono ຕາມມາດຕະຖານສາກົນ Speech-to-Text.
- **Overlap & Silence Filtering**: ຕັດສຽງລົບກວນ, ກັ່ນກອງຊ່ວງດົນຕີ/ຄວາມງຽບ, ແລະ ເຊື່ອມຕໍ່ຮອຍຕໍ່ສຽງ (Stitching) ບໍ່ໃຫ້ຄຳສັບຕົກຫຼົ່ນ.
- **Karaoke Word Segmentation**: ຕັດຄຳພາສາລາວ ແລະ ໄທ ແບບລະອຽດລະດັບຄຳ ພ້ອມອະນິເມຊັນໄຮໄລທ໌ຕາມສຽງເວົ້າ.

### 3. ✂️ CapCut Video Editor Studio (`/editor`)
- **Multi-Track Timeline**: ແຖບຕັດຕໍ່ຫຼາຍແທຣັກ (ວິດີໂອ, ຊັບໄຕເຕິລ, ສຽງເອັບເຟັກ SFX).
- **Interactive Editing**: ຕັດແບ່ງຄລິບ (Split), ຫຍໍ້-ຍືດຫົວທ້າຍ (Trim), Snap ເສັ້ນເວລາ.
- **Safe-Area Overlay**: ສະແດງຂອບປອດໄພ TikTok, Reels, Shorts ເພື່ອປ້ອງກັນບໍ່ໃຫ້ປຸ່ມ Like/Comment ບັງຊັບ.
- **Audio Waveform**: ແຖບຄື້ນສຽງທີ່ສາມາດລາກມາກແທຣັກຊັບໃຫ້ກົງກັບຈຸດເວົ້າໄດ້ຢ່າງງ່າຍດາຍ.

### 4. 📝 Subtitle Studio (`/subtitles`)
- **Loop Sentence on Click**: ກົດໃສ່ກ່ອງຊັບເພື່ອຫຼິ້ນວິດີໂອສະເພາະປະໂຫຍກນັ້ນວົນຊ້ຳ ເພື່ອກວດສອບຄວາມຖືກຕ້ອງ.
- **Global Offset Adjust**: ປຸ່ມເລື່ອນເວລາຊັບທັງໝົດ (+/- 0.1s, +/- 0.5s) ແກ້ບັນຫາສຽງຕົ້ນສະບັບດີເລ.
- **Multi-Format Export**:
  - 📄 `.srt` (SubRip Subtitle)
  - 🌐 `.vtt` (WebVTT)
  - 🎨 `.ass` (Advanced SubStation Alpha ພ້ອມ Font & Color Style)
  - 🎬 Premiere Pro XML
  - 🍎 Final Cut Pro XML (`.fcpxml`)
  - 🎥 Export ວິດີໂອ MP4 ພ້ອມຝັງຊັບໄຕເຕິລ

---

## 🚀 ການຕິດຕັ້ງ ແລະ ເປີດໃຊ້ງານ (Getting Started)

### ຄວາມຕ້ອງການຂອງລະບົບ (Prerequisites)
- **Node.js**: v18.18+ ຫຼື v20+
- **npm** / **yarn** / **pnpm** / **bun**

### 1. Clone Repository
```bash
git clone https://github.com/AEK69/saizup-ai.git
cd saizup-ai
```

### 2. ຕິດຕັ້ງ Dependencies
```bash
npm install
```

### 3. ຕັ້ງຄ່າ Environment Variables
ສ້າງໄຟລ໌ `.env.local` ຈາກ `.env.example`:
```bash
cp .env.example .env.local
```

ກຳນົດຄ່າ API Keys:
```env
# Gemini API Key (ສຳລັບລະບົບ STT ແລະ ຮຽນຮູ້ສຳນຽງ)
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret (ສຳລັບລະບົບ Login)
JWT_SECRET=your_jwt_secret_key_here
```

### 4. ເປີດ Run Development Server
```bash
npm run dev
```

ເປີດ Browser ໄປທີ່: [http://localhost:3000](http://localhost:3000)

---

## 📁 ໂຄງສ້າງໂຟນເດີ (Project Architecture)

```
saizup-ai/
├── data/
│   ├── accent_memory.json        # ຖານຂໍ້ມູນ Active Learning ຮຽນຮູ້ສຳນຽງ
│   └── users.json                # ຖານຂໍ້ມູນບັນຊີຜູ້ໃຊ້ & Credits
├── public/
│   ├── brand/                    # ໂລໂກ້ ແລະ ໄອຄອນ SAIZUP AI
│   └── fonts/                    # ຟອນພາສາລາວ & ໄທ ມາດຕະຖານ
├── src/
│   ├── app/
│   │   ├── api/                  # Backend API Routes
│   │   │   ├── ai/accents/       # API ສະຖິຕິສຳນຽງທີ່ຮຽນຮູ້ແລ້ວ
│   │   │   ├── ai/learn-accent/  # API Active Learning Sync
│   │   │   └── ai/transcribe/    # API ຖອດສຽງ Multimodal
│   │   ├── editor/page.tsx       # CapCut-Style Video Editor Studio
│   │   ├── subtitles/page.tsx    # Subtitle Studio & Waveform Sync
│   │   ├── layout.tsx            # Root Layout ພ້ອມ Dark Mode
│   │   └── page.tsx              # Landing Page ພາສາລາວ-ໄທ
│   ├── components/               # React UI Components
│   └── lib/
│       ├── audioExtractor.ts     # 16kHz Audio & VAD Pre-processing
│       ├── gemini.ts             # Gemini Multimodal Audio STT Engine
│       └── linguistics/
│           ├── accentMemory.ts   # Server-side Dialect Learning Engine
│           └── accentTypes.ts    # 10 Dialect Profiles & Phonetic Rules
└── tailwind.config.js
```

---

## 🛠️ Scripts

| ຄຳສັ່ງ | ໜ້າທີ່ |
| --- | --- |
| `npm run dev` | ເປີດ Development server ທີ່ `localhost:3000` |
| `npm run build` | Build ໂຄງການສຳລັບ Production |
| `npm run start` | Start Production server |
| `npm run lint` | ກວດສອບ Linting ດ້ວຍ ESLint |

---

## 📄 License

ລິຂະສິດຖືກຕ້ອງ © 2026 **SAIZUP AI Studio**. All rights reserved.
