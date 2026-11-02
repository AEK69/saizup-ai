"use client";

import { useState } from "react";
import { Check, Sparkles, Zap, ShieldCheck, CreditCard, Crown, Star, Flame, HelpCircle } from "lucide-react";
import BcelPaymentModal from "@/components/payment/BcelPaymentModal";
import { useLandingLanguage } from "@/components/landing/LanguageContext";

const pricingCopy = {
  lo: {
    heading: "ເລືອກແພັກເກັດ", description: "ແຍກລະດັບການໃຊ້ງານຢ່າງຊັດເຈນ: ທົດລອງຟຣີ, Gold, Plus ແລະ Pro VIP ພ້ອມແພັກເກັດເຕີມເຄຣດິດລາຍເດືອນ.", monthly: "ລາຍເດືອນ", annual: "ລາຍປີ (Yearly VIP)", save: "ປະຢັດ 2 ເດືອນ!", forever: "ຕະຫຼອດໄປ", month: "ເດືອນ", year: "ປີ", startFree: "ເລີ່ມໃຊ້ງານຟຣີ", popular: "ຍອດນິຍົມ", recommended: "ແນະນຳ", best: "ຄຸ້ມຄ່າທີ່ສຸດ", topupTitle: "ແພັກເກັດເຕີມເຄຣດິດ", topupDesc: "ບໍ່ຕ້ອງການສະໝັກລາຍເດືອນ? ສາມາດເຕີມເຄຣດິດໃຊ້ງານຕາມຈິງໄດ້ເລີຍ ເຄຣດິດບໍ່ມີວັນໝົດອາຍຸ.", addCredit: "ເຕີມ", free: ["ທົດລອງຟຣີ", "ເໝາະສຳລັບທົດລອງສ້າງຊັບ ແລະ ຕັດຄລິບສັ້ນ", "15 ເຄຣດິດ/ມື້", "ຈຳກັດຄລິບສູງສຸດ 30 ວິນາທີ", "ຊັບໄຕເຕິລຊ່ວງ 30s ອັດຕະໂນມັດ", "ມີລາຍນ້ຳ SAIZUP ມຸມວິດີໂອ"], gold: ["ສຳລັບຄຣີເອເຕີເລີ່ມຕົ້ນສ້າງຄລິບລົງ TikTok", "250 ເຄຣດິດ/ເດືອນ", "ຄລິບຍາວສູງສຸດ 3 ນາທີ", "ບໍ່ມີລາຍນ້ຳ", "ສະໝັກ Gold"], plus: ["ສຳລັບຄຣີເອເຕີມືອາຊີບ ແລະ ຊ່ອງລີວິວສິນຄ້າ", "800 ເຄຣດິດ/ເດືອນ", "ຄລິບຍາວສູງສຸດ 10 ນາທີ", "ຄັງສຽງເອັບເຟັກ Sound Effects ຄົບຊຸດ", "ສະໝັກ Plus"], pro: ["ສຳລັບສະຕູດິໂອ, ເອເຈນຊີ ແລະ ທີມງານຕັດຕໍ່", "2,500 ເຄຣດິດ/ເດືອນ (3,500 ລາຍປີ)", "ບໍ່ຈຳກັດຄວາມຍາວວິດີໂອ", "ສົ່ງອອກລະດັບ 4K Ultra HD", "ຊ່ວຍເຫຼືອ VIP 24/7", "ສະໝັກ Pro"],
  },
  th: {
    heading: "เลือกแพ็กเกจ", description: "เลือกระดับการใช้งานที่เหมาะกับคุณ: ฟรี, Gold, Plus, Pro VIP และแพ็กเกจเติมเครดิต.", monthly: "รายเดือน", annual: "รายปี (VIP)", save: "ประหยัด 2 เดือน!", forever: "ตลอดไป", month: "เดือน", year: "ปี", startFree: "เริ่มใช้งานฟรี", popular: "ยอดนิยม", recommended: "แนะนำ", best: "คุ้มค่าที่สุด", topupTitle: "แพ็กเกจเติมเครดิต", topupDesc: "ไม่ต้องการรายเดือน? เติมเครดิตตามการใช้งานได้ทันที เครดิตไม่มีวันหมดอายุ.", addCredit: "เติม", free: ["ทดลองใช้ฟรี", "เหมาะสำหรับทดลองสร้างซับและตัดคลิปสั้น", "15 เครดิต/วัน", "จำกัดวิดีโอสูงสุด 30 วินาที", "สร้างซับ 30 วินาทีอัตโนมัติ", "มีลายน้ำ SAIZUP"], gold: ["สำหรับครีเอเตอร์ที่เริ่มทำคลิป TikTok", "250 เครดิต/เดือน", "วิดีโอสูงสุด 3 นาที", "ไม่มีลายน้ำ", "สมัคร Gold"], plus: ["สำหรับครีเอเตอร์มืออาชีพและช่องรีวิว", "800 เครดิต/เดือน", "วิดีโอสูงสุด 10 นาที", "คลัง Sound Effects ครบชุด", "สมัคร Plus"], pro: ["สำหรับสตูดิโอ เอเจนซี และทีมตัดต่อ", "2,500 เครดิต/เดือน (3,500 รายปี)", "วิดีโอไม่จำกัดความยาว", "ส่งออกระดับ 4K Ultra HD", "บริการ VIP 24/7", "สมัคร Pro"],
  },
  en: {
    heading: "Choose your plan", description: "Pick the level that fits your work: Free, Gold, Plus, Pro VIP, or a pay-as-you-go credit pack.", monthly: "Monthly", annual: "Yearly (VIP)", save: "Save 2 months!", forever: "forever", month: "month", year: "year", startFree: "Start free", popular: "Popular", recommended: "Recommended", best: "Best value", topupTitle: "Top-up credit packs", topupDesc: "Prefer not to subscribe? Top up credits when you need them. Credits never expire.", addCredit: "Top up", free: ["Free trial", "Ideal for trying captions and short video editing", "15 credits / day", "Videos up to 30 seconds", "Automatic 30-second captions", "SAIZUP watermark"], gold: ["For creators starting on TikTok", "250 credits / month", "Videos up to 3 minutes", "No watermark", "Choose Gold"], plus: ["For professional creators and review channels", "800 credits / month", "Videos up to 10 minutes", "Full sound-effects library", "Choose Plus"], pro: ["For studios, agencies, and editing teams", "2,500 credits / month (3,500 yearly)", "Unlimited video duration", "4K Ultra HD export", "VIP support 24/7", "Choose Pro"],
  },
} as const;

export default function Pricing() {
  const { language } = useLandingLanguage();
  const copy = pricingCopy[language];
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    amountLAK: number;
    credits: number;
  } | null>(null);

  const handleSelectPlan = (plan: { id: string; name: string; amountLAK: number; credits: number }) => {
    setSelectedPlan(plan);
  };

  return (
    <section id="pricing" className="relative py-20 sm:py-28 bg-[#0C0D14] border-t border-[#1F2233]">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#12E8FF]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181A27] border border-[#2B2E42] text-[#12E8FF] mb-4">
            <span className="text-xs font-semibold tracking-wider uppercase">BCEL ONE & ONEPAY INSTANT QR</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            <span>{copy.heading} </span>
            <span className="bg-gradient-to-r from-[#12E8FF] to-blue-500 bg-clip-text text-transparent">
              SAIZUP Subscription
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            {copy.description}
          </p>

          {/* Subscription Toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-sm font-semibold ${!isAnnual ? "text-white" : "text-slate-400"}`}>
              {copy.monthly}
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isAnnual ? "bg-[#12E8FF]" : "bg-[#29292A]"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full transition-transform ${
                  isAnnual ? "translate-x-8 bg-[#090C14]" : "translate-x-1 bg-white"
                }`}
              />
            </button>
            <span className={`text-sm font-semibold ${isAnnual ? "text-white" : "text-slate-400"}`}>
              {copy.annual}
              <span className="ml-1.5 text-[11px] text-[#090C14] font-extrabold px-2 py-0.5 rounded-full bg-[#12E8FF]">
                {copy.save}
              </span>
            </span>
          </div>
        </div>

        {/* 4 DISTINCT TIERS GRID: Free, Gold, Plus, Pro */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-20">
          {/* TIER 1: FREE TIER */}
          <div className="relative p-6 rounded-2xl bg-[#141624] border border-[#26283B] flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {copy.free[0]}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Free Forever
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">Free Tier</h3>
              <p className="text-xs text-slate-400 mb-5">{copy.free[1]}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">0</span>
                <span className="text-sm font-bold text-[#12E8FF]">₭</span>
                <span className="text-slate-400 text-xs">/ {copy.forever}</span>
              </div>

              <ul className="space-y-3 mb-6 text-xs text-slate-300">
                <li className="flex items-start gap-2 text-yellow-300 font-medium">
                  <span className="text-emerald-400">✓</span>
                  <span><strong>{copy.free[2]}</strong></span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  <span><strong>{copy.free[3]}</strong></span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  <span>{copy.free[4]}</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  <span>Gemini 3.5 Flash-Lite</span>
                </li>
                <li className="flex items-start gap-2 text-slate-400">
                  <span className="text-slate-500">•</span>
                  <span>{copy.free[5]}</span>
                </li>
              </ul>
            </div>

            <a
              href="/subtitles"
              className="w-full py-3 px-4 rounded-xl bg-[#1C1F30] hover:bg-[#25283E] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-700"
            >
              <span>{copy.startFree}</span>
            </a>
          </div>

          {/* TIER 2: GOLD TIER (STARTER CREATOR) */}
          <div className="relative p-6 rounded-2xl bg-[#141624] border border-[#26283B] flex flex-col justify-between hover:border-yellow-500/50 transition-all shadow-sm">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Gold Creator</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-300 border border-yellow-400/30">
                  {copy.popular}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">Gold Tier</h3>
              <p className="text-xs text-slate-400 mb-5">{copy.gold[0]}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {isAnnual ? "89,000" : "99,000"}
                </span>
                <span className="text-sm font-bold text-yellow-400">₭</span>
                <span className="text-slate-400 text-xs">/ {copy.month}</span>
              </div>

              <ul className="space-y-3 mb-6 text-xs text-slate-300">
                <li className="flex items-start gap-2 text-yellow-300 font-medium">
                  <span className="text-emerald-400">✓</span>
                  <span><strong>{copy.gold[1]}</strong></span>
                </li>
                <li className="flex items-start gap-2 text-slate-200">
                  <span className="text-emerald-400">✓</span>
                  <span><strong>{copy.gold[2]}</strong></span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  <span>Gemini 3.8 Flash</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  <span><strong>{copy.gold[3]}</strong></span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <span className="text-emerald-400">✓</span>
                  <span>ສົ່ງອອກ 1080p Full HD</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() =>
                handleSelectPlan({
                  id: "gold",
                  name: "ແພັກເກັດ Gold Tier (Starter Creator)",
                  amountLAK: isAnnual ? 89000 * 12 : 99000,
                  credits: 250,
                })
              }
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-yellow-500/20"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{copy.gold[4]} {isAnnual ? copy.annual : "99,000 ₭"}</span>
            </button>
          </div>

          {/* TIER 3: PLUS TIER (PRO CREATOR - HIGHLIGHTED) */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-b from-[#181B2E] to-[#121422] border-2 border-[#12E8FF] flex flex-col justify-between shadow-2xl shadow-[#12E8FF]/15">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-[#12E8FF] text-[#090C14] text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <Flame className="w-3 h-3 text-[#090C14]" />
                <span>{copy.best}</span>
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3 mt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#12E8FF] flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#12E8FF]" />
                  <span>Plus Creator</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#12E8FF]/20 text-[#12E8FF] border border-[#12E8FF]/40 font-bold">
                  {copy.recommended}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">Plus Tier</h3>
              <p className="text-xs text-slate-300 mb-5">{copy.plus[0]}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {isAnnual ? "166,000" : "199,000"}
                </span>
                <span className="text-sm font-bold text-[#12E8FF]">₭</span>
                <span className="text-slate-400 text-xs">/ {copy.month}</span>
              </div>

              <ul className="space-y-3 mb-6 text-xs text-slate-200">
                <li className="flex items-start gap-2 text-[#12E8FF] font-medium">
                  <span className="text-emerald-400">✓</span>
                  <span><strong>{copy.plus[1]}</strong></span>
                </li>
                <li className="flex items-start gap-2 text-white">
                  <span className="text-emerald-400">✓</span>
                  <span><strong>{copy.plus[2]}</strong></span>
                </li>
                <li className="flex items-start gap-2 text-slate-200">
                  <span className="text-emerald-400">✓</span>
                  <span>Gemini 3.1 Pro</span>
                </li>
                <li className="flex items-start gap-2 text-slate-200">
                  <span className="text-emerald-400">✓</span>
                  <span><strong>{copy.plus[3]}</strong></span>
                </li>
                <li className="flex items-start gap-2 text-slate-200">
                  <span className="text-emerald-400">✓</span>
                  <span>Karaoke Millisecond Word Sync</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() =>
                handleSelectPlan({
                  id: "plus",
                  name: "ແພັກເກັດ Plus Tier (Pro Creator)",
                  amountLAK: isAnnual ? 166000 * 12 : 199000,
                  credits: 800,
                })
              }
              className="w-full py-3 px-4 rounded-xl bg-[#12E8FF] hover:bg-[#00d0e6] text-[#090C14] font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-[#12E8FF]/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{copy.plus[4]} {isAnnual ? copy.annual : "199,000 ₭"}</span>
            </button>
          </div>

          {/* TIER 4: PRO TIER (STUDIO VIP & ANNUAL) */}
          <div className="relative p-6 rounded-2xl bg-[#141624] border border-[#26283B] flex flex-col justify-between hover:border-purple-500/50 transition-all shadow-sm">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Pro VIP Studio</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                  VIP Priority
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">Pro Tier</h3>
              <p className="text-xs text-slate-400 mb-5">{copy.pro[0]}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {isAnnual ? "1,999,000" : "499,000"}
                </span>
                <span className="text-sm font-bold text-purple-400">₭</span>
                <span className="text-slate-400 text-xs">/ {isAnnual ? copy.year : copy.month}</span>
              </div>

              <ul className="space-y-3 mb-6 text-xs text-slate-300">
                <li className="flex items-start gap-2 text-purple-300 font-medium">
                  <span className="text-emerald-400">✓</span>
                  <span><strong>{copy.pro[1]}</strong></span>
                </li>
                <li className="flex items-start gap-2 text-white">
                  <span className="text-emerald-400">✓</span>
                  <span><strong>{copy.pro[2]}</strong></span>
                </li>
                <li className="flex items-start gap-2 text-slate-200">
                  <span className="text-emerald-400">✓</span>
                  <span>Gemini 4 Argon Priority</span>
                </li>
                <li className="flex items-start gap-2 text-slate-200">
                  <span className="text-emerald-400">✓</span>
                  <span>{copy.pro[3]}</span>
                </li>
                <li className="flex items-start gap-2 text-slate-200">
                  <span className="text-emerald-400">✓</span>
                  <span>{copy.pro[4]}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() =>
                handleSelectPlan({
                  id: "pro",
                  name: isAnnual ? "ແພັກເກັດ Pro VIP (ລາຍປີ 12 ເດືອນ)" : "ແພັກເກັດ Pro Tier (ລາຍເດືອນ)",
                  amountLAK: isAnnual ? 1999000 : 499000,
                  credits: isAnnual ? 3500 : 2500,
                })
              }
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20"
            >
              <Crown className="w-3.5 h-3.5 text-yellow-300" />
              <span>{copy.pro[5]} {isAnnual ? `1,999,000 ₭/${copy.year}` : "499,000 ₭"}</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: INSTANT CREDIT TOP-UP PACKS */}
        <div id="credit-packs" className="pt-12 border-t border-[#222538]">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-2">
              {copy.topupTitle} <span className="text-[#12E8FF]">Instant Top-Up</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              {copy.topupDesc}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { id: "credit_100k", name: "100 Credits", lak: 50000, credits: 100, label: "Starter" },
              { id: "credit_300k", name: "300 Credits", lak: 120000, credits: 300, label: "Creator" },
              { id: "credit_1000k", name: "1,000 Credits", lak: 350000, credits: 1000, label: "Pro Pack" },
              { id: "credit_3000k", name: "3,000 Credits", lak: 890000, credits: 3000, label: "Studio VIP" },
            ].map((pack) => (
              <div
                key={pack.id}
                className="p-5 rounded-2xl bg-[#141624] border border-[#26283B] hover:border-[#12E8FF] transition-all flex flex-col justify-between text-center"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {pack.label}
                  </span>
                  <div className="text-xl sm:text-2xl font-extrabold text-yellow-400 my-2">
                    🪙 {pack.credits}
                  </div>
                  <div className="text-lg font-bold text-white mb-4">
                    {pack.lak.toLocaleString()} ₭
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleSelectPlan({
                      id: pack.id,
                      name: `ເຕີມ ${pack.credits} ເຄຣດິດ`,
                      amountLAK: pack.lak,
                      credits: pack.credits,
                    })
                  }
                  className="w-full py-2 px-3 rounded-xl bg-[#1D2033] hover:bg-[#12E8FF] hover:text-black text-slate-200 text-xs font-bold transition-all border border-slate-700"
                >
                  {copy.addCredit} {pack.lak.toLocaleString()} ₭
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BCEL ONE PAYMENT MODAL */}
      {selectedPlan && (
        <BcelPaymentModal
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          amountLAK={selectedPlan.amountLAK}
          credits={selectedPlan.credits}
          onPaymentSuccess={() => {
            setSelectedPlan(null);
            alert("🎉 ຊຳລະເງິນສຳເລັດແລ້ວ! ລະບົບໄດ້ເພີ່ມເຄຣດິດໃຫ້ບັນຊີຂອງທ່ານຮຽບຮ້ອຍ.");
          }}
        />
      )}
    </section>
  );
}
