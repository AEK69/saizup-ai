export default function Footer() {
  return (
    <footer className="border-t border-[#262833] bg-[#0A0B0E] font-sans">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#12E8FF] via-[#5B8FFF] to-[#2E4A66] flex items-center justify-center">
                <svg className="w-4 h-4 text-[#090C14]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-lg font-bold font-inter">
                <span className="text-white">SAIZUP</span>
                <span className="text-[#12E8FF] ml-1">AI</span>
              </span>
            </a>
            <p className="text-sm text-slate-400 leading-relaxed font-normal">
              AI-powered video editing platform for short-form content creators. Built with CapCut design principles for Lao, Thai, and English creators.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 font-inter">Product</h4>
            <ul className="space-y-2.5">
              {[
                { label: "ຄຸນສົມບັດ (Features)", href: "#features" },
                { label: "CapCut Video Studio 9:16", href: "/editor" },
                { label: "ແພັກເກັດລາຄາ (BCEL One)", href: "#pricing" },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-slate-400 hover:text-[#12E8FF] transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 font-inter">Company</h4>
            <ul className="space-y-2.5">
              {["About Us", "CapCut Integration", "Contact Support", "Careers"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-slate-400 hover:text-[#12E8FF] transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 font-inter">Legal</h4>
            <ul className="space-y-2.5">
              {["Privacy Policy", "Terms of Service", "Cookie Policy", "Content Safety"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-slate-400 hover:text-[#12E8FF] transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#262833] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; 2026 SAIZUP AI. Inspired by CapCut Design System. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span>
              Powered by Google Gemini 2.0 & BCEL One
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
