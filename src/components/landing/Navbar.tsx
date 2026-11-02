"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, LogOut } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { landingLanguages, useLandingLanguage } from "@/components/landing/LanguageContext";

interface NavLinkItem {
  href: string;
  label: string;
  badge?: string;
  isSpecial?: boolean;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { language, setLanguage } = useLandingLanguage();
  const currentLang = landingLanguages.find((item) => item.code === language) ?? landingLanguages[0];
  const navLinks: NavLinkItem[] = [
    { href: "#pricing", label: language === "th" ? "แพ็กเกจ & เติมเครดิต" : language === "en" ? "Plans & credits" : "ແພັກເກັດ & ເຕີມເຄຣດິດ" },
    { href: "#features", label: language === "th" ? "คุณสมบัติ" : language === "en" ? "Features" : "ຄຸນສົມບັດ" },
  ];
  const labels = language === "th"
    ? { login: "เข้าสู่ระบบด้วย Google", logout: "ออกจากระบบ", addCredits: "เติมเครดิต", admin: "หลังบ้าน (Admin)", credits: "เครดิต", bcel: "เติม BCEL One" }
    : language === "en"
      ? { login: "Sign in with Google", logout: "Sign out", addCredits: "Add credits", admin: "Admin", credits: "credits", bcel: "Top up with BCEL One" }
      : { login: "ເຂົ້າສູ່ລະບົບດ້ວຍ Google", logout: "ອອກຈາກລະບົບ", addCredits: "ເຕີມ", admin: "ຫຼັງບ້ານ (Admin)", credits: "ເຄຣດິດ", bcel: "ເຕີມ BCEL One" };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync user from localStorage
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

  const handleLogout = () => {
    localStorage.removeItem("saizup_user");
    setCurrentUser(null);
  };

  // STRICT ACCESS: Only kobx2.2005@gmail.com is authorized to view or access the backoffice
  const isStoreOwner = currentUser?.email?.toLowerCase().trim() === "kobx2.2005@gmail.com";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 font-sans ${
          isScrolled
            ? "bg-[#0F0F10]/95 backdrop-blur-xl border-b border-[#353536] shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 group">
              <img src="/brand/saizup-symbol.png" alt="SAIZUP AI" className="h-10 w-10 object-contain drop-shadow-md transition-transform group-hover:scale-105" />
              <span className="text-lg font-bold tracking-tight">
                <span className="text-white">SAIZUP</span>
                <span className="text-[#12E8FF] ml-1">AI</span>
              </span>
            </a>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`transition-colors text-sm font-medium flex items-center gap-1.5 ${
                    link.isSpecial
                      ? "text-[#12E8FF] hover:text-white px-2.5 py-1 rounded-md bg-[#12E8FF]/10 border border-[#12E8FF]/30"
                      : "text-slate-300 hover:text-[#12E8FF]"
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#12E8FF] text-[#090C14]">
                      {link.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors text-xs px-2.5 py-2 rounded-md bg-[#1D1D1E] border border-[#353536]"
                >
                  <span>{currentLang.flag}</span>
                  <span>{currentLang.name}</span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${isLangOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isLangOpen && (
                  <div className="absolute right-0 mt-2 w-36 rounded-xl bg-[#1D1D1E] border border-[#353536] shadow-xl p-1 z-50">
                    {landingLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-[#29292A] transition-colors ${
                          currentLang.code === lang.code ? "text-[#12E8FF] bg-[#12E8FF]/10 font-bold" : "text-slate-300"
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Login / User Profile Button */}
              {currentUser ? (
                <div className="flex items-center gap-2.5 bg-[#171824] border border-[#12E8FF]/40 rounded-xl px-3 py-1.5 shadow-sm">
                  {currentUser.avatar || currentUser.picture ? (
                    <img
                      src={currentUser.avatar || currentUser.picture}
                      alt={currentUser.name || "Avatar"}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-[#12E8FF]/60 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#12E8FF] flex items-center justify-center text-xs font-bold text-[#090C14]">
                      {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="flex items-center gap-1.5 leading-tight">
                      <span className="text-xs text-white font-bold max-w-[110px] truncate">
                        {currentUser.name || currentUser.email.split('@')[0]}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-[#12E8FF]/20 text-[#12E8FF] border border-[#12E8FF]/40">
                        {currentUser.plan || "Free"}
                      </span>
                    </div>
                    <p className="text-[10px] text-yellow-400 font-bold leading-tight mt-0.5">
                      🪙 {currentUser.credits ?? 15} {labels.credits}
                    </p>
                  </div>
                  <a
                    href="#pricing"
                    title={labels.addCredits}
                    className="p-1 rounded-md text-[#12E8FF] hover:bg-[#12E8FF]/15 text-[11px] font-bold transition-colors ml-0.5"
                  >
                    +{labels.addCredits}
                  </a>
                  <button
                    onClick={handleLogout}
                    title={labels.logout}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors ml-0.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="text-xs text-white hover:text-cyan-300 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 flex items-center gap-1.5 transition-colors font-medium shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
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
                  <span>{labels.login}</span>
                </button>
              )}

              {/* Backoffice Button - ONLY VISIBLE TO kobx2.2005@gmail.com */}
              {isStoreOwner && (
                <a
                  href="/admin"
                  className="text-xs text-[#12E8FF] hover:text-white px-3 py-2 rounded-md bg-[#12E8FF]/10 hover:bg-[#12E8FF]/20 border border-[#12E8FF]/40 flex items-center gap-1.5 font-bold transition-all shadow-sm"
                  title="ລະບົບຫຼັງບ້ານ (ສະເພາະເຈົ້າຂອງຮ້ານ)"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#12E8FF]" />
                  <span>{labels.admin}</span>
                </a>
              )}

            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-slate-300 hover:text-white p-2"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden pb-6 border-t border-slate-800/50 mt-2 pt-4 space-y-2">
              {/* User row on mobile */}
              {currentUser ? (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900 border border-purple-500/30 mb-2">
                  <div className="flex items-center gap-2">
                    {currentUser.avatar || currentUser.picture ? (
                      <img
                        src={currentUser.avatar || currentUser.picture}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-cyan-400"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#12E8FF] flex items-center justify-center text-xs font-bold text-[#090C14]">
                        {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-white font-medium">{currentUser.email}</p>
                      <p className="text-[10px] text-cyan-400 font-semibold">{currentUser.credits || 50} {labels.credits}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1 rounded bg-red-500/10"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>{labels.logout}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuthOpen(true);
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold flex items-center gap-2.5 mb-2 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
                  <span>{labels.login}</span>
                </button>
              )}

              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-slate-300 hover:text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-slate-800/50"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 border-t border-slate-800 flex gap-2">
                {isStoreOwner && (
                  <a
                    href="/admin"
                    className="flex-1 py-2.5 text-center text-xs font-semibold rounded-xl bg-[#12E8FF]/15 text-[#12E8FF] border border-[#12E8FF]/30"
                  >
                    {labels.admin}
                  </a>
                )}
                <a
                  href="#pricing"
                  className="flex-1 py-2.5 text-center text-xs font-semibold rounded-xl gradient-btn text-white"
                >
                  {labels.bcel}
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal (Google OAuth 2.0 Only) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    </>
  );
}
