"use client";

import { useState } from "react";
import { useLandingLanguage } from "@/components/landing/LanguageContext";

const faqCopy = {
  lo: {
    heading: "ຄຳຖາມທີ່", accent: "ພົບເລື້ອຍ", description: "ຄຳຕອບສຳລັບຄຳຖາມກ່ຽວກັບ SAIZUP AI, BCEL One ແລະ Video Studio.", items: [
  {
    question: "SAIZUP AI ຮອງຮັບພາສາຫຍັງແດ່? (Languages Supported)",
    answer:
      "SAIZUP AI ຊ່ຽວຊານສະເພາະໃນການຮອງຮັບ ພາສາລາວ (Lao), ພາສາໄທ (Thai), ແລະ ພາສາອັງກິດ (English) ທັງການສ້າງຊັບໄຕເຕິ້ນ AI ຄາຣາໂອເກະ ແລະ ການແປພາສາວິດີໂອດ້ວຍ Gemini Intelligence.",
  },
  {
    question: "ການຊຳລະເງິນຜ່ານ BCEL One / OnePay ເຮັດວຽກແນວໃດ?",
    answer:
      "ທ່ານສາມາດເລືອກແພັກເກັດລາຍເດືອນ 199,000 ₭, ລາຍປີ 1,999,000 ₭ ຫຼື ແພັກເກັດເຕີມເຄຣດິດ ຈາກນັ້ນລະບົບຈະສ້າງ OnePay QR Code ຂຶ້ນມາ ໃຫ້ທ່ານເປີດແອັບ BCEL One ສະແກນຊຳລະເງິນກີບໄດ້ທັນທີ ລະບົບຈະຕັດຍອດອັດຕະໂນມັດ 100% ໂດຍບໍ່ຕ້ອງແນບສະລິບ.",
  },
  {
    question: "ການຕັດຄລິບ ແລະ ສ້າງຊັບດ້ວຍ Gemini AI ໃຊ້ງານແນວໃດ?",
    answer:
      "ພຽງແຕ່ອັບໂຫຼດຄລິບວິດີໂອຂອງທ່ານເຂົ້າໄປໃນ Video Studio ລະບົບ Gemini AI ຈະຖອດສຽງເວົ້າ ແລະ ສ້າງຊັບໄຕເຕິ້ນໄຮໄລທ໌ຄາຣາໂອເກະຕາມສຽງເວົ້າໃຫ້ອັດຕະໂນມັດ ພ້ອມທັງສົ່ງອອກໄຟລ໌ .SRT ຫຼື ວິດີໂອ MP4 ໄດ້ທັນທີ.",
  },
  {
    question: "ຂໍ້ມູນວິດີໂອຂອງຂ້ອຍປອດໄພ ຫຼື ບໍ່?",
    answer:
      "ປອດໄພ 100%! ວິດີໂອຂອງທ່ານຖືກປະມວນຜົນໃນບຣາວເຊີຂອງທ່ານໂດຍກົງ ບໍ່ມີການອັບໂຫຼດໄຟລ໌ວິດີໂອເຕັມໄປເກັບໄວ້ໃນເຊີເວີ ຈຶ່ງໝັ້ນໃຈໄດ້ໃນຄວາມເປັນສ່ວນຕົວ.",
  },
  {
    question: "ສາມາດ Export ວິດີໂອແບບບໍ່ມີລາຍນ້ຳ (No Watermark) ໄດ້ບໍ?",
    answer:
      "ສະມາຊິກແພັກເກັດລາຍເດືອນ (199,000 ₭) ແລະ ລາຍປີ (1,999,000 ₭) ສາມາດ Export ວິດີໂອຄວາມລະອຽດ 1080p ແລະ 4K ໄດ້ແບບບໍ່ມີລາຍນ້ຳເລີຍ.",
  },
    ],
  },
  th: {
    heading: "คำถาม", accent: "ที่พบบ่อย", description: "คำตอบสำหรับคำถามเกี่ยวกับ SAIZUP AI, BCEL One และ Video Studio.", items: [
      { question: "SAIZUP AI รองรับภาษาใดบ้าง?", answer: "รองรับภาษาลาว ไทย และอังกฤษ สำหรับการสร้างคำบรรยายแบบ AI และการแปลวิดีโอ." },
      { question: "การชำระเงินผ่าน BCEL One / OnePay ทำงานอย่างไร?", answer: "เลือกแพ็กเกจ แล้วระบบสร้าง QR Code สำหรับสแกนชำระด้วย BCEL One หรือ OnePay." },
      { question: "ใช้ Gemini AI สร้างซับและตัดคลิปอย่างไร?", answer: "อัปโหลดวิดีโอใน Video Studio แล้วให้ AI ถอดเสียง สร้างซับ และส่งออก SRT หรือ MP4." },
      { question: "วิดีโอของฉันปลอดภัยหรือไม่?", answer: "ไฟล์จะประมวลผลในเบราว์เซอร์และใช้เฉพาะเพื่อสร้างผลลัพธ์ที่คุณสั่ง." },
      { question: "Export วิดีโอแบบไม่มีลายน้ำได้หรือไม่?", answer: "สมาชิกตามแพ็กเกจที่รองรับสามารถ Export วิดีโอความละเอียดสูงโดยไม่มีลายน้ำ." },
    ],
  },
  en: {
    heading: "Frequently", accent: "asked questions", description: "Answers about SAIZUP AI, BCEL One, and Video Studio.", items: [
      { question: "Which languages does SAIZUP AI support?", answer: "Lao, Thai, and English for AI captions and video translation." },
      { question: "How does BCEL One / OnePay payment work?", answer: "Choose a plan and the system creates a QR code to pay with BCEL One or OnePay." },
      { question: "How do I create captions and edit clips with Gemini AI?", answer: "Upload a video in Video Studio, then let AI transcribe, caption, and export SRT or MP4." },
      { question: "Is my video safe?", answer: "Your file is processed in the browser and used only to generate the result you request." },
      { question: "Can I export a video without a watermark?", answer: "Eligible plans can export high-resolution videos without a watermark." },
    ],
  },
} as const;

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { language } = useLandingLanguage();
  const copy = faqCopy[language];

  return (
    <section id="faq" className="relative py-20 sm:py-28 bg-[#0F0F10] border-t border-[#1D1D1E] font-sans">
      <div className="max-w-3xl mx-auto px-5 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1D1D1E] border border-[#353536] mb-4">
            <span className="font-caption-xs text-[#12E8FF] font-semibold tracking-[2.29px]">HELP & SUPPORT</span>
          </div>
          <h2 className="font-display-md text-white font-bold mb-3 font-inter">
            <span>{copy.heading} </span>
            <span className="capcut-gradient-text">{copy.accent}</span>
          </h2>
          <p className="text-slate-400 text-sm font-normal">
            {copy.description}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {copy.items.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl border border-[#262833] bg-[#14151E] overflow-hidden transition-colors hover:border-[#12E8FF]/30"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left transition-colors"
              >
                <span className="text-sm sm:text-base font-semibold text-white font-inter">
                  {faq.question}
                </span>
                <span className="ml-4 flex-shrink-0 text-[#12E8FF]">
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-[#262833] pt-3 font-normal">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
