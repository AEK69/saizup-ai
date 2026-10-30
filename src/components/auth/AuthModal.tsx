"use client";

import { useState } from "react";
import { X, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Handle Google OAuth 2.0 Login
  const handleGoogleLogin = () => {
    setLoading(true);
    setErrorMsg("");
    const returnTo = typeof window !== "undefined" ? window.location.pathname : "/editor";
    window.location.href = `/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in font-sans">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#0f111a] border border-slate-800 shadow-2xl p-6 sm:p-8 overflow-hidden text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="ປິດ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#12E8FF] via-[#5B8FFF] to-blue-600 flex items-center justify-center shadow-lg shadow-[#12E8FF]/20">
            <svg className="w-7 h-7 text-[#090C14]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold font-['Noto_Sans']">
            ເຂົ້າສູ່ລະບົບ SAIZUP AI
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            ເຂົ້າໃຊ້ງານ Studio ຕັດຕໍ່ວິດີໂອສັ້ນລະດັບມືອາຊີບ
          </p>
        </div>

        {/* GOOGLE SIGN IN BUTTON (Official OAuth 2.0 with User Client ID) */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-cyan-500/20 border border-slate-200 group active:scale-[0.99]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-slate-700" />
              <span>ກຳລັງເຊື່ອມຕໍ່ Google...</span>
            </div>
          ) : (
            <>
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>ເຂົ້າສູ່ລະບົບດ້ວຍ Google</span>
            </>
          )}
        </button>

        {errorMsg && <p className="text-xs text-red-400 mt-3 text-center">{errorMsg}</p>}

        {/* Benefits & Security Note */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
            <span>ຮັບຟຣີ 15 ເຄຣດິດທຸກວັນ ເມື່ອເຂົ້າສູ່ລະບົບ</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
            <span>ປອດໄພດ້ວຍມາດຕະຖານ Google OAuth 2.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
