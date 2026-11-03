"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("saizup_cookie_consent");
      if (!consent) {
        setShow(true);
      }
    } catch {}
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("saizup_cookie_consent", "accepted");
    } catch {}
    setShow(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem("saizup_cookie_consent", "essential_only");
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 rounded-2xl bg-[#12141F]/95 backdrop-blur-md border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 text-white">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 flex-shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>ແຈ້ງເຕືອນຄຸກກີ້ (Cookie Notice)</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </h4>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              SAIZUP AI ໃຊ້ຄຸກກີ້ທີ່ຈຳເປັນເພື່ອຈື່ການເຂົ້າລະບົບ, ບັນທຶກໂປຣເຈັກ ແລະ ສະຖານະເຄຣດິດຂອງທ່ານ. ອ່ານເພີ່ມເຕີມທີ່{" "}
              <Link href="/privacy" className="text-cyan-400 hover:underline">
                ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ (Privacy)
              </Link>
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleAccept}
                className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-all shadow-sm"
              >
                ຍອມຮັບທັງໝົດ (Accept)
              </button>
              <button
                type="button"
                onClick={handleDecline}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                ສະເພາະທີ່ຈຳເປັນ
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDecline}
            className="text-slate-400 hover:text-white p-1"
            title="ປິດ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
