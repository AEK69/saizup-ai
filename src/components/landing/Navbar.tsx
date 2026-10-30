"use client";

import { useState, useEffect } from "react";
import { Sparkles, LayoutDashboard, Film, CreditCard, User, LogOut, Mail, CheckCircle2 } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";

const languages = [
  { code: "lo", name: "ລາວ", flag: "🇱🇦" },
  { code: "th", name: "ไทย", flag: "🇹🇭" },
  { code: "en", name: "English", flag: "🇺🇸" },
];

interface NavLinkItem {
  href: string;
  label: string;
  badge?: string;
  isSpecial?: boolean;
}

const navLinks: NavLinkItem[] = [
  { href: "/subtitles", label: "Subtitle Studio", badge: "ໃໝ່" },
  { href: "/editor", label: "Video Studio" },
  { href: "#pricing", label: "ແພັກເກັດ & ເຕີມເຄຣດິດ" },
  { href: "#features", label: "ຄຸນສົມບັດ" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(languages[0]);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#12E8FF] via-[#5B8FFF] to-[#2E4A66] flex items-center justify-center shadow-md shadow-[#12E8FF]/20 group-hover:shadow-[#12E8FF]/40 transition-all">
                <svg className="w-4 h-4 text-[#090C14]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
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
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setCurrentLang(lang);
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
                      🪙 {currentUser.credits ?? 15} เครดิต
                    </p>
                  </div>
                  <a
                    href="#pricing"
                    title="ເຕີມເຄຣດິດ"
                    className="p-1 rounded-md text-[#12E8FF] hover:bg-[#12E8FF]/15 text-[11px] font-bold transition-colors ml-0.5"
                  >
                    +ເຕີມ
                  </a>
                  <button
                    onClick={handleLogout}
                    title="ອອກຈາກລະບົບ"
                    className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors ml-0.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="text-xs text-slate-200 hover:text-white px-3 py-2 rounded-md bg-[#1D1D1E] hover:bg-[#29292A] border border-[#353536] flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#12E8FF]" />
                  <span>ເຂົ້າສູ່ລະບົບ (OTP)</span>
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
                  <span>ຫຼັງບ້ານ (Admin)</span>
                </a>
              )}

              {/* CTA Button */}
              <a
                href="/editor"
                className="capcut-btn-cyan text-[#090C14] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Film className="w-3.5 h-3.5 text-[#090C14]" />
                <span>Video Studio</span>
              </a>
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
                      <p className="text-[10px] text-cyan-400 font-semibold">{currentUser.credits || 50} Credits</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1 rounded bg-red-500/10"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>ອອກ</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuthOpen(true);
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-medium flex items-center gap-2 mb-2"
                >
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span>ເຂົ້າສູ່ລະບົບດ້ວຍອີເມວ (Email OTP)</span>
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
                    ລະບົບຫຼັງບ້ານ (Admin)
                  </a>
                )}
                <a
                  href="#pricing"
                  className="flex-1 py-2.5 text-center text-xs font-semibold rounded-xl gradient-btn text-white"
                >
                  ເຕີມ BCEL One
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal with Email OTP code sending */}
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
