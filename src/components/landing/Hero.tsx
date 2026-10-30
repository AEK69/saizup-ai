"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Subtitles,
  Film,
  Scissors,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  Layers,
  Volume2,
} from "lucide-react";

export default function Hero() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("saizup_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const userPlan = currentUser?.plan || "Free";
  const userCredits = currentUser?.credits ?? 15;
  const isFree = userPlan === "Free" || userPlan === "Free Trial" || !currentUser;

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-16 bg-[#0B0C12]">
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#12E8FF]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* LOGGED IN USER ACCOUNT DASHBOARD BAR */}
        {currentUser && (
          <div className="max-w-4xl mx-auto mb-8 p-4 rounded-2xl bg-[#141624] border border-[#12E8FF]/40 shadow-xl shadow-[#12E8FF]/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#12E8FF] to-indigo-600 flex items-center justify-center text-black font-extrabold text-sm shadow-md">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{currentUser.name || currentUser.email}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    🟢 Active
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#12E8FF]/20 text-[#12E8FF] border border-[#12E8FF]/40">
                    {userPlan} Tier
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isFree ? "ໂຄຕ້າຟຣີ: 15 ເຄຣດິດ/ມື້ • ຄລິບສູງສຸດ 30 ວິນາທີ" : "ປົດລັອກຄຸນສົມບັດພຣີມຽມຄົບຊຸດ • ບໍ່ຈຳກັດຄວາມຍາວ"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-extrabold text-yellow-400 font-mono">
                  🪙 {userCredits} ເຄຣດິດ
                </div>
                <p className="text-[10px] text-slate-400">ຍອດຄົງເຫຼືອພ້ອມໃຊ້</p>
              </div>
              <a
                href="#pricing"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20"
              >
                + ເຕີມເຄຣດິດ
              </a>
            </div>
          </div>
        )}

        {/* HERO TITLE & SUBTITLE */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181926] border border-[#2B2D40] mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#12E8FF] animate-pulse" />
            <span className="text-xs text-[#12E8FF] font-semibold tracking-wider uppercase">
              SAIZUP AI VIDEO & SUBTITLE ENGINE
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 tracking-tight">
            <span>ສ້າງວິດີໂອສັ້ນ & ຊັບໄຕເຕິລ AI</span>
            <br />
            <span className="bg-gradient-to-r from-[#12E8FF] via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              ໄວ, ງ່າຍ, ລະບົບມິນິມອລ
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            ເລືອກຮູບແບບການເຮັດວຽກທີ່ເໝາະກັບທ່ານ: ໂໝດສ້າງຊັບໄຕເຕິລໂດຍສະເພາະ ຫຼື ໂໝດຕັດຕໍ່ວິດີໂອຄົບວົງຈອນ.{" "}
            <span className="text-[#12E8FF] font-semibold">ຮອງຮັບພາສາລາວ (Lao), ໄທ (Thai) ແລະ ອັງກິດ (EN) ຢ່າງສົມບູນ.</span>
          </p>
        </div>

        {/* ========================================================================= */}
        {/* TASK SELECTOR: CHOOSE YOUR SPECIFIC WORKFLOW */}
        {/* ========================================================================= */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="text-center mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-slate-700" />
              <span>ເລືອກຮູບແບບການເຮັດວຽກທີ່ຕ້ອງການ (CHOOSE YOUR TASK)</span>
              <span className="h-px w-8 bg-slate-700" />
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* TASK 1: SUBTITLE STUDIO (SUBTITLE ONLY MODE) */}
            <Link
              href="/subtitles"
              className="group relative p-6 rounded-2xl bg-gradient-to-b from-[#151726] to-[#10121C] border border-[#2B2E45] hover:border-[#12E8FF] transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-[#12E8FF]/10 hover:-translate-y-1"
            >
              <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-[#12E8FF]/20 border border-[#12E8FF]/40 text-[#12E8FF] text-[10px] font-bold">
                ແຍກສະເພາະ • ໄວທີ່ສຸດ
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
                  ໂໝດໃສ່ຊັບໄຕເຕິລຢ່າງດຽວ! ຖອດສຽງອັດຕະໂນມັດ, ຄາຣາໂອເກະ ແລະ ດາວໂຫຼດ .SRT / .VTT ໂດຍບໍ່ຕ້ອງຕັດຕໍ່ວິດີໂອ.
                </p>
                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ຊ່ວງເວລາ 30 ວິນາທີ ຫຼື ປະໂຫຍກສັ້ນ</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ເລືອກ AI Version 1, 2, ຫຼື 3</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ສົ່ງອອກໄຟລ໌ SRT / VTT ພາຍໃນ 5 ວິ</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-[#12E8FF]">
                <span>ເຂົ້າສູ່ Subtitle Studio</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* TASK 2: FULL VIDEO STUDIO (STREAMLINED EDITOR) */}
            <Link
              href="/editor"
              className="group relative p-6 rounded-2xl bg-gradient-to-b from-[#151726] to-[#10121C] border border-[#2B2E45] hover:border-yellow-400 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-yellow-400/10 hover:-translate-y-1"
            >
              <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-[10px] font-bold">
                ຕັດຕໍ່ • ມິນິມອລ
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
                  ໂໝດຕັດຕໍ່ວິດີໂອສັ້ນແບບມິນິມອລ! ຕັດຊ່ວງງຽບ (Ctrl+B), ຄີເຟຣມແບບລຽວໄທມ໌ ແລະ ຄັງສຽງ Sound Effects.
                </p>
                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                    <span>ຄັງສຽງ Sound Effects ທີ່ຈຳເປັນຄົບຊຸດ</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                    <span>ຕັດຄລິບ ແລະ ເລື່ອນໄທມ໌ໄລນ໌ CapCut Style</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                    <span>ບັນທຶກງານ Auto-save ໃນ Browser ທັນທີ</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-yellow-400">
                <span>ເປີດ Video Studio</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>

            {/* TASK 3: TOP-UP & SUBSCRIPTION TIERS */}
            <a
              href="#pricing"
              className="group relative p-6 rounded-2xl bg-gradient-to-b from-[#151726] to-[#10121C] border border-[#2B2E45] hover:border-purple-400 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-purple-400/10 hover:-translate-y-1"
            >
              <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-bold">
                Gold • Plus • Pro
              </div>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors flex items-center gap-1.5">
                  <span>ແພັກເກັດ & เครดิต</span>
                  <ArrowRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  ເລືອກແພັກເກັດລາຍເດືອນ ຫຼື ເຕີມເຄຣດິດຜ່ານ BCEL One QR ປົດລັອກຄວາມຍາວຄລິບ, ບໍ່ມີລາຍນ້ຳ ແລະ AI Pro.
                </p>
                <div className="space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Free Tier: 15 ເຄຣດິດ/ມື້ (ສູງສຸດ 30 ວິ)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Gold & Plus: 250 - 800 ເຄຣດິດ/ເດືອນ</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Pro VIP: 2,500 ເຄຣດິດ, ບໍ່ຈຳກັດຄວາມຍາວ</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-purple-400">
                <span>ເບິ່ງແພັກເກັດທັງໝົດ</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </a>
          </div>
        </div>

        {/* DEMO PREVIEW BANNER */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-[#12131D] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#12E8FF]/15 text-[#12E8FF] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">ເລີ່ມຕົ້ນໃຊ້ງານຟຣີໄດ້ທັນທີ</p>
              <p className="text-xs text-slate-400">ຮັບ 15 ເຄຣດິດປະຈຳວັນ ບໍ່ຕ້ອງຜູກບັດເຄຣດິດ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/subtitles"
              className="px-4 py-2 rounded-xl bg-[#12E8FF] hover:bg-[#00d0e6] text-[#090C14] text-xs font-bold transition-all shadow-md shadow-[#12E8FF]/20"
            >
              ລອງສ້າງຊັບຟຣີ
            </Link>
            <Link
              href="/editor"
              className="px-4 py-2 rounded-xl bg-[#1D1E2C] hover:bg-[#25283A] text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            >
              ເປີດ Video Editor
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
