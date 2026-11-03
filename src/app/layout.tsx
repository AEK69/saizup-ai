import type { Metadata } from "next";
import "./globals.css";
import CookieBanner from "@/components/landing/CookieBanner";

export const metadata: Metadata = {
  title: "SAIZUP AI - AI Subtitles & Video Studio (ພາສາລາວ & ໄທ)",
  description:
    "ເວັບໄຊຕັດຕໍ່ວິດີໂອສັ້ນ ແລະ ສ້າງຊັບໄຕເຕິລ AI ພາສາລາວ ແລະ ໄທ ອັດຕະໂນມັດ ລະດັບມືອາຊີບ ດ້ວຍລະບົບ CapCut Studio Design System",
  keywords: [
    "SAIZUP AI",
    "ສ້າງຊັບໄຕເຕິລລາວ",
    "ຊັບໄຕເຕິລພາສາລາວ",
    "ຕັດຕໍ່ວິດີໂອ",
    "AI Subtitles Lao",
    "Lao Speech to Text",
    "CapCut Lao Subtitles",
    "TikTok Video Editor Laos",
    "สร้างซับไตเติลลาวไทย",
  ],
  authors: [{ name: "SAIZUP AI Team" }],
  creator: "SAIZUP AI",
  publisher: "SAIZUP AI Studio",
  metadataBase: new URL("https://saizup.ai"),
  openGraph: {
    title: "SAIZUP AI - AI Subtitles & CapCut Video Studio",
    description: "ສ້າງຊັບໄຕເຕິລພາສາລາວ ແລະ ຕັດຕໍ່ວິດີໂອສັ້ນລະດັບມືອາຊີບດ້ວຍ AI",
    url: "https://saizup.ai",
    siteName: "SAIZUP AI Studio",
    images: [
      {
        url: "/brand/saizup-symbol.png",
        width: 1200,
        height: 630,
        alt: "SAIZUP AI Studio",
      },
    ],
    locale: "lo_LA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SAIZUP AI - AI Subtitles & CapCut Video Studio",
    description: "ສ້າງຊັບໄຕເຕິລພາສາລາວ ແລະ ຕັດຕໍ່ວິດີໂອສັ້ນລະດັບມືອາຊີບດ້ວຍ AI",
    images: ["/brand/saizup-symbol.png"],
  },
  icons: {
    icon: "/brand/saizup-favicon.png",
    shortcut: "/brand/saizup-favicon.png",
    apple: "/brand/saizup-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lo" className="dark">
      <head>
        <link rel="icon" href="/brand/saizup-favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/brand/saizup-favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans:wght@300;400;500;600;700;800;900&family=Noto+Sans+Lao:wght@300;400;500;600;700;800;900&family=Noto+Sans+Lao+Looped:wght@400;600;700;900&family=Noto+Serif+Lao:wght@400;700;900&family=Noto+Sans+Thai:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Permanently purge Next.js dev tools floating badge & indicator menu */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function purgeNextDevBadge() {
                  try {
                    var selectors = [
                      'nextjs-portal',
                      '[data-nextjs-dev-indicator]',
                      '#__next-build-watcher',
                      '#nextjs-dev-tools',
                      '[data-next-badge]',
                      'div[class*="nextjs-toast"]'
                    ];
                    selectors.forEach(function(sel) {
                      var els = document.querySelectorAll(sel);
                      els.forEach(function(el) { el.remove(); });
                    });
                  } catch (e) {}
                }
                if (typeof window !== 'undefined') {
                  window.addEventListener('DOMContentLoaded', purgeNextDevBadge);
                  setInterval(purgeNextDevBadge, 300);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-[#0F0F10] text-[#F6F6F6] font-sans selection:bg-[#12E8FF] selection:text-[#090C14]">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
