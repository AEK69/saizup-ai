"use client";

import Link from "next/link";
import {
  Subtitles,
  Scissors,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useLandingLanguage } from "@/components/landing/LanguageContext";

const heroCopy = {
  lo: {
    title: "ສ້າງວິດີໂອສັ້ນ & ຊັບໄຕເຕິລ AI", accent: "ໄວ, ງ່າຍ, ລະບົບມິນິມອລ", description: "ເລືອກຮູບແບບການເຮັດວຽກທີ່ເໝາະກັບທ່ານ: ໂໝດສ້າງຊັບໄຕເຕິລໂດຍສະເພາະ ຫຼື ໂໝດຕັດຕໍ່ວິດີໂອຄົບວົງຈອນ.", support: "ຮອງຮັບພາສາລາວ, ໄທ ແລະ ອັງກິດຢ່າງສົມບູນ.", choose: "ເລືອກຮູບແບບການເຮັດວຽກທີ່ຕ້ອງການ", subtitleTag: "ແຍກສະເພາະ • ໄວທີ່ສຸດ", subtitleDesc: "ໂໝດໃສ່ຊັບໄຕເຕິລຢ່າງດຽວ: ຖອດສຽງອັດຕະໂນມັດ, ຄາຣາໂອເກະ ແລະ ດາວໂຫຼດ SRT / VTT.", subtitleItems: ["ແບ່ງຊັບຕາມເວລາ ຫຼື ປະໂຫຍກ", "ເລືອກ Gemini ຕາມແພັກເກດ", "ສົ່ງອອກໄຟລ໌ SRT / VTT"], subtitleCta: "ເຂົ້າສູ່ Subtitle Studio", videoTag: "ຕັດຕໍ່ • ມິນິມອລ", videoDesc: "ໂໝດຕັດຕໍ່ວິດີໂອສັ້ນ: ຕັດຊ່ວງງຽບ, ຄີເຟຣມແບບລຽວໄທມ໌ ແລະ ຄັງສຽງ.", videoItems: ["ຄັງ Sound Effects ພ້ອມໃຊ້", "ຕັດຄລິບ ແລະ ເລື່ອນ Timeline", "ບັນທຶກງານອັດຕະໂນມັດໃນ Browser"], videoCta: "ເປີດ Video Studio" },
  th: {
    title: "สร้างวิดีโอสั้น & ซับ AI", accent: "เร็ว ง่าย เรียบง่าย", description: "เลือกวิธีทำงานที่เหมาะกับคุณ: สร้างคำบรรยายโดยเฉพาะ หรือตัดต่อวิดีโอครบในที่เดียว", support: "รองรับภาษาลาว ไทย และอังกฤษอย่างครบถ้วน", choose: "เลือกสิ่งที่คุณต้องการทำ", subtitleTag: "ซับโดยเฉพาะ • เร็วที่สุด", subtitleDesc: "สร้างซับอัตโนมัติแบบครบจบ: ถอดเสียง คาราโอเกะ และดาวน์โหลด SRT / VTT โดยไม่ต้องตัดต่อวิดีโอ", subtitleItems: ["แบ่งซับตามเวลา หรือประโยค", "เลือก Gemini ตามแพ็กเกจ", "ส่งออกไฟล์ SRT / VTT"], subtitleCta: "เข้าสู่ Subtitle Studio", videoTag: "ตัดต่อ • มินิมอล", videoDesc: "ตัดต่อวิดีโอสั้นอย่างง่าย: ตัดช่วงเงียบ ใช้คีย์เฟรม และเพิ่มเสียงประกอบ", videoItems: ["คลัง Sound Effects พร้อมใช้", "ตัดคลิปและเลื่อน Timeline", "บันทึกงานอัตโนมัติในเบราว์เซอร์"], videoCta: "เปิด Video Studio" },
  en: {
    title: "Create short videos & AI captions", accent: "Fast, simple, focused", description: "Choose the workflow that fits you: a dedicated subtitle studio or a complete video editor.", support: "Full support for Lao, Thai, and English.", choose: "Choose your workflow", subtitleTag: "Captions only • Fastest", subtitleDesc: "A focused caption workspace with transcription, karaoke effects, and SRT / VTT export.", subtitleItems: ["Split captions by time or sentence", "Choose Gemini for your plan", "Export SRT / VTT files"], subtitleCta: "Open Subtitle Studio", videoTag: "Edit • Minimal", videoDesc: "A focused short-video editor with silence cutting, keyframes, and a sound library.", videoItems: ["Ready-to-use sound effects", "Cut clips and move the timeline", "Automatic browser saving"], videoCta: "Open Video Studio" },
} as const;

export default function Hero() {
  const { language } = useLandingLanguage();
  const copy = heroCopy[language];
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden pt-28 pb-16 bg-[#0B0C12]">
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#12E8FF]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* HERO TITLE & SUBTITLE */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181926] border border-[#2B2D40] mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#12E8FF] animate-pulse" />
            <span className="text-xs text-[#12E8FF] font-semibold tracking-wider uppercase">
              SAIZUP AI VIDEO & SUBTITLE ENGINE
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 tracking-tight">
            <span>{copy.title}</span>
            <br />
            <span className="bg-gradient-to-r from-[#12E8FF] via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              {copy.accent}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {copy.description}{" "}
            <span className="text-[#12E8FF] font-semibold">{copy.support}</span>
          </p>
        </div>

        {/* ========================================================================= */}
        {/* TASK SELECTOR: CHOOSE YOUR SPECIFIC WORKFLOW */}
        {/* ========================================================================= */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-slate-700" />
              <span>{copy.choose}</span>
              <span className="h-px w-8 bg-slate-700" />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* TASK 1: SUBTITLE STUDIO (SUBTITLE ONLY MODE) */}
            <Link
              href="/subtitles"
              className="group relative p-6 rounded-2xl bg-gradient-to-b from-[#151726] to-[#10121C] border border-[#2B2E45] hover:border-[#12E8FF] transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-[#12E8FF]/10 hover:-translate-y-1"
            >
              <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-[#12E8FF]/20 border border-[#12E8FF]/40 text-[#12E8FF] text-[10px] font-bold">
                {copy.subtitleTag}
              </div>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#12E8FF]/15 text-[#12E8FF] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Subtitles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#12E8FF] transition-colors flex items-center gap-1.5">
                  <span>Subtitle Studio</span>
                  <ArrowRight className="w-4 h-4 text-[#12E8FF] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {copy.subtitleDesc}
                </p>
                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{copy.subtitleItems[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{copy.subtitleItems[1]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{copy.subtitleItems[2]}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-[#12E8FF]">
                <span>{copy.subtitleCta}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* TASK 2: FULL VIDEO STUDIO (STREAMLINED EDITOR) */}
            <Link
              href="/editor"
              className="group relative p-6 rounded-2xl bg-gradient-to-b from-[#151726] to-[#10121C] border border-[#2B2E45] hover:border-yellow-400 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-yellow-400/10 hover:-translate-y-1"
            >
              <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-[10px] font-bold">
                {copy.videoTag}
              </div>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-yellow-400/15 text-yellow-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Scissors className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors flex items-center gap-1.5">
                  <span>Video Studio</span>
                  <ArrowRight className="w-4 h-4 text-yellow-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {copy.videoDesc}
                </p>
                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{copy.videoItems[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{copy.videoItems[1]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{copy.videoItems[2]}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-yellow-400">
                <span>{copy.videoCta}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}
