import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ (Privacy Policy) - SAIZUP AI",
  description: "ນະໂຍບາຍການປົກປ້ອງຂໍ້ມູນສ່ວນບຸກຄົນ ແລະ ມາດຕະຖານຄວາມປອດໄພ Google OAuth 2.0 ຂອງ SAIZUP AI",
  openGraph: {
    title: "Privacy Policy - SAIZUP AI Studio",
    description: "Privacy Policy compliant with Google API Services User Data Policy",
  },
};

export default function PrivacyPage() {
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
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ (Privacy Policy)
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            ອັບເດດລ່າສຸດ: 1 ພະຈິກ 2026 · ປະຕິບັດຕາມມາດຕະຖານ Google API Services User Data Policy
          </p>
        </div>

        <div className="space-y-8 text-sm text-slate-300 leading-relaxed bg-[#11131E] p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-xl">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">1.</span> ບົດແນະນຳ (Introduction)
            </h2>
            <p>
              SAIZUP AI ໃຫ້ຄວາມສຳຄັນສູງສຸດຕໍ່ການປົກປ້ອງຄວາມເປັນສ່ວນຕົວ ແລະ ຂໍ້ມູນສ່ວນບຸກຄົນຂອງຜູ້ໃຊ້ງານທຸກທ່ານ. 
              ນະໂຍບາຍນີ້ອະທິບາຍເຖິງວິທີການທີ່ພວກເຮົາຈັດເກັບ, ນຳໃຊ້, ແລະ ຮັກສາຄວາມປອດໄພຂອງຂໍ້ມູນເມື່ອທ່ານໃຊ້ງານເວັບໄຊ ແລະ ແອັບພລິເຄຊັນຂອງພວກເຮົາ.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">2.</span> ຂໍ້ມູນທີ່ພວກເຮົາຈັດເກັບ (Information We Collect)
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li><strong>ຂໍ້ມູນບັນຊີ Google (OAuth 2.0):</strong> ພວກເຮົາເຂົ້າເຖິງສະເພາະ ຊື່, ອີເມວ (Email Address), ແລະ ຮູບໂປຣໄຟລ໌ສາທາລະນະ ເພື່ອຢືນຢັນຕົວຕົນ ແລະ ຈັດການເຄຣດິດຂອງທ່ານ. ພວກເຮົາບໍ່ເຄີຍຮ້ອງຂໍ ຫຼື ເກັບລະຫັດຜ່ານ Google ຂອງທ່ານ.</li>
              <li><strong>ໄຟລ໌ສື່ (Video & Audio Data):</strong> ໄຟລ໌ວິດີໂອຂອງທ່ານຖືກປະມວນຜົນ **ໃນບຣາວເຊີຂອງທ່ານ (Client-Side Memory)** ເພື່ອສະກັດສຽງ. ສະເພາະແທຣັກສຽງສັ້ນໆ ທີ່ຈຳເປັນຕໍ່ການຖອດຊັບໄຕເຕິລເທົ່ານັ້ນ ທີ່ຖືກສົ່ງຜ່ານການເຂົ້າລະຫັດ SSL ໄປຍັງ AI Engine ເພື່ອຖອດຂໍ້ຄວາມ ແລະ ຈະຖືກລຶບທັນທີຫຼັງປະມວນຜົນສຳເລັດ.</li>
              <li><strong>ຄຸກກີ້ ແລະ ຂໍ້ມູນການໃຊ້ງານ:</strong> ເກັບສະເພາະ Session Token ທີ່ຈຳເປັນຕໍ່ການເຂົ້າສູ່ລະບົບ ແລະ ການບັນທຶກສະຖານະຂອງໂປຣເຈັກ.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">3.</span> ມາດຕະຖານການນຳໃຊ້ຂໍ້ມູນ Google (Google API Compliance)
            </h2>
            <p>
              ການນຳໃຊ້ ແລະ ການໂອນຍ້າຍຂໍ້ມູນທີ່ໄດ້ຮັບຈາກ Google APIs ຂອງ SAIZUP AI ໄປຍັງແອັບອື່ນ ຈະປະຕິບັດຕາມ{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 underline"
              >
                Google API Services User Data Policy
              </a>
              , ລວມທັງຂໍ້ກຳນົດ Limited Use. ພວກເຮົາບໍ່ນຳເອົາຂໍ້ມູນຜູ້ໃຊ້ Google ໄປຝຶກ AI Models ໃດໆ ໂດຍບໍ່ໄດ້ຮັບອະນຸຍາດຢ່າງຊັດເຈນ.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">4.</span> ບໍ່ມີການຂາຍຂໍ້ມູນ (We Never Sell Your Data)
            </h2>
            <p>
              SAIZUP AI ຢືນຢັນຢ່າງເດັດຂາດວ່າ **ພວກເຮົາບໍ່ເຄີຍ ແລະ ຈະບໍ່ຂາຍ, ໃຫ້ເຊົ່າ, ຫຼື ແລກປ່ຽນຂໍ້ມູນສ່ວນບຸກຄົນ ຫຼື ໄຟລ໌ວິດີໂອຂອງທ່ານ** ກັບພາກສ່ວນທີສາມ ຫຼື ບໍລິສັດໂຄສະນາໃດໆ ຢ່າງເດັດຂາດ.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400">5.</span> ສິດທິຂອງທ່ານ (Your Rights)
            </h2>
            <p>
              ທ່ານມີສິດຮ້ອງຂໍກວດສອບ, ແກ້ໄຂ, ຫຼື ສັ່ງລຶບບັນຊີ ແລະ ປະຫວັດການໃຊ້ງານຂອງທ່ານທັງໝົດອອກຈາກລະບົບຂອງພວກເຮົາໄດ້ທຸກເວລາ ໂດຍຕິດຕໍ່:{" "}
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
