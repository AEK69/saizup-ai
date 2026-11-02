"use client";

import { useLandingLanguage } from "@/components/landing/LanguageContext";

const footerCopy = {
  lo: { description: "ແພລດຟອມຕັດຕໍ່ວິດີໂອ AI ສຳລັບຄຣີເອເຕີຄລິບສັ້ນ ທີ່ຮອງຮັບ ລາວ, ໄທ ແລະ ອັງກິດ.", product: "ຜະລິດຕະພັນ", company: "ບໍລິສັດ", legal: "ນະໂຍບາຍ", features: "ຄຸນສົມບັດ", plans: "ແພັກເກັດ", companyLinks: ["ກ່ຽວກັບເຮົາ", "CapCut Integration", "ຕິດຕໍ່ຝ່າຍຊ່ວຍເຫຼືອ", "ຮ່ວມງານ"], legalLinks: ["ນະໂຍບາຍສ່ວນຕົວ", "ເງື່ອນໄຂບໍລິການ", "ນະໂຍບາຍ Cookies", "ຄວາມປອດໄພເນື້ອຫາ"] },
  th: { description: "แพลตฟอร์มตัดต่อวิดีโอ AI สำหรับครีเอเตอร์คลิปสั้น รองรับลาว ไทย และอังกฤษ.", product: "ผลิตภัณฑ์", company: "บริษัท", legal: "กฎหมาย", features: "คุณสมบัติ", plans: "แพ็กเกจ", companyLinks: ["เกี่ยวกับเรา", "CapCut Integration", "ติดต่อฝ่ายช่วยเหลือ", "ร่วมงานกับเรา"], legalLinks: ["นโยบายความเป็นส่วนตัว", "ข้อกำหนดการใช้งาน", "นโยบายคุกกี้", "ความปลอดภัยของเนื้อหา"] },
  en: { description: "An AI video-editing platform for short-form creators, with support for Lao, Thai, and English.", product: "Product", company: "Company", legal: "Legal", features: "Features", plans: "Plans", companyLinks: ["About us", "CapCut integration", "Contact support", "Careers"], legalLinks: ["Privacy policy", "Terms of service", "Cookie policy", "Content safety"] },
} as const;

export default function Footer() {
  const { language } = useLandingLanguage();
  const copy = footerCopy[language];
  return (
    <footer className="border-t border-[#262833] bg-[#0A0B0E] font-sans">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <img src="/brand/saizup-symbol.png" alt="SAIZUP AI" className="h-11 w-11 object-contain" />
              <span className="text-lg font-bold font-inter">
                <span className="text-white">SAIZUP</span>
                <span className="text-[#12E8FF] ml-1">AI</span>
              </span>
            </a>
            <p className="text-sm text-slate-400 leading-relaxed font-normal">
              {copy.description}
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 font-inter">{copy.product}</h4>
            <ul className="space-y-2.5">
              {[
                { label: copy.features, href: "#features" },
                { label: "CapCut Video Studio 9:16", href: "/editor" },
                { label: `${copy.plans} (BCEL One)`, href: "#pricing" },
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
            <h4 className="text-sm font-bold text-white mb-4 font-inter">{copy.company}</h4>
            <ul className="space-y-2.5">
              {copy.companyLinks.map((item) => (
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
            <h4 className="text-sm font-bold text-white mb-4 font-inter">{copy.legal}</h4>
            <ul className="space-y-2.5">
              {copy.legalLinks.map((item) => (
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
              Powered by SAIZUP AI & BCEL One
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
