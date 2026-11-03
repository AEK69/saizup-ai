import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "ເງື່ອນໄຂການໃຊ້ງານ (Terms of Service) - SAIZUP AI",
  description: "ເງື່ອນໄຂ ແລະ ຂໍ້ກຳນົດການໃຊ້ງານເວັບໄຊ SAIZUP AI Studio ສຳລັບການຕັດຕໍ່ວິດີໂອ ແລະ ສ້າງຊັບໄຕເຕິລພາສາລາວ",
  openGraph: {
    title: "Terms of Service - SAIZUP AI Studio",
    description: "Terms and conditions for SAIZUP AI Video Subtitle Studio",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0B10] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Header */}
      <header className="h-16 px-4 sm:px-8 border-b border-slate-800 bg-[#12131C] flex items-center justify-between sticky top-0 z-30">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ກັບຄືນໜ້າຫຼັກ (Home)</span>
        </Link>
        <div className="flex items-center gap-2">
          <img src="/brand/saizup-symbol.png" alt="SAIZUP AI" className="h-6 w-6 object-contain" />
          <span className="text-sm font-bold text-white">SAIZUP AI</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-12">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            ເງື່ອນໄຂການໃຊ້ງານ (Terms of Service)
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            ອັບເດດລ່າສຸດ: 1 ພະຈິກ 2026 · ມີຜົນບັງຄັບໃຊ້ກັບຜູ້ໃຊ້ງານທຸກທ່ານ
          </p>
        </div>

        <div className="space-y-8 text-sm text-slate-300 leading-relaxed bg-[#11131E] p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-xl">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400">1.</span> ການຍອມຮັບເງື່ອນໄຂ (Acceptance of Terms)
            </h2>
            <p>
              ຍິນດີຕ້ອນຮັບສູ່ **SAIZUP AI** (ເວັບໄຊ ແລະ ບໍລິການທີ່ດຳເນີນງານພາຍໃຕ້ SAIZUP AI Studio). 
              ໂດຍການເຂົ້າເຖິງ, ລົງທະບຽນ, ຫຼື ນຳໃຊ້ບໍລິການຕັດຕໍ່ວິດີໂອ ແລະ ລະບົບສ້າງຊັບໄຕເຕິລ AI ຂອງພວກເຮົາ, 
              ທ່ານຕົກລົງທີ່ຈະຜູກພັນກັບເງື່ອນໄຂການໃຊ້ງານເຫຼົ່ານີ້ ພ້ອມທັງນະໂຍບາຍຄວາມເປັນສ່ວນຕົວຂອງພວກເຮົາ.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400">2.</span> ສິດຄວາມເປັນເຈົ້າຂອງເນື້ອຫາ (Content Ownership)
            </h2>
            <p>
              ທ່ານເປັນເຈົ້າຂອງ **100%** ຂອງວິດີໂອ, ສຽງ, ຂໍ້ຄວາມ, ແລະ ສື່ຕ່າງໆ ທີ່ທ່ານອັບໂຫຼດຂຶ້ນມາຕັດຕໍ່ເທິງເວັບໄຊ. 
              SAIZUP AI ຈະບໍ່ອ້າງສິດຄວາມເປັນເຈົ້າຂອງໃດໆ ເທິງຜົນງານຂອງທ່ານ ແລະ ຈະບໍ່ນຳເອົາຄລິບວິດີໂອຂອງທ່ານໄປເຜີຍແຜ່ຕໍ່ສາທາລະນະໂດຍບໍ່ໄດ້ຮັບອະນຸຍາດ.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400">3.</span> ລະບົບເຄຣດິດ ແລະ ການຊຳລະເງິນ (Credits & Billing)
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>ຜູ້ໃຊ້ງານໃໝ່ຈະໄດ້ຮັບ **15 ເຄຣດິດຟຣີ** ເມື່ອເຂົ້າສູ່ລະບົບດ້ວຍ Google Account.</li>
              <li>ການຊຳລະເງິນຜ່ານ **BCEL One / Lao QR / Jvix** ຈະປ່ຽນເປັນເຄຣດິດເຂົ້າບັນຊີທັນທີຫຼັງຈາກການຢືນຢັນສຳເລັດ.</li>
              <li><strong>ນະໂຍບາຍການຄືນເຄຣດິດ (Refund Policy):</strong> ຫາກລະບົບ AI ຫຼື ເຊີເວີເກີດຂໍ້ຜິດພາດຂັດຂ້ອງລະຫວ່າງການຖອດສຽງ, ລະບົບຈະຄືນເຄຣດິດທີ່ຫັກໄປເຂົ້າສູ່ບັນຊີຂອງທ່ານໂດຍອັດຕະໂນມັດ.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400">4.</span> ການນຳໃຊ້ທີ່ຖືກຕ້ອງຕາມກົດໝາຍ (Acceptable Use)
            </h2>
            <p>
              ຜູ້ໃຊ້ງານຕ້ອງບໍ່ນຳໃຊ້ SAIZUP AI ໃນການສ້າງເນື້ອຫາທີ່ຜິດຕໍ່ກົດໝາຍ, ການຫຼອກລວງ (Deepfake fraud), 
              ການລະເມີດລິຂະສິດຂອງບຸກຄົນອື່ນ, ຫຼື ເນື້ອຫາທີ່ກໍ່ໃຫ້ເກີດຄວາມຮຸນແຮງ ແລະ ຄວາມເສຍຫາຍຕໍ່ສັງຄົມ.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-cyan-400">5.</span> ການຕິດຕໍ່ (Contact Us)
            </h2>
            <p>
              ຫາກທ່ານມີຂໍ້ສົງໄສກ່ຽວກັບເງື່ອນໄຂການໃຊ້ງານ ສາມາດຕິດຕໍ່ທີມງານໄດ້ທີ່ອີເມວ:{" "}
              <a href="mailto:kobx2.2005@gmail.com" className="text-cyan-400 hover:underline">
                kobx2.2005@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800 text-center text-xs text-slate-500">
        © 2026 SAIZUP AI Studio. All rights reserved.
      </footer>
    </div>
  );
}
