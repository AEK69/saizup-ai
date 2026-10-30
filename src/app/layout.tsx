import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAIZUP AI - CapCut & LaoSub Video Studio",
  description:
    "AI-powered Lao (ພາສາລາວ) & Thai subtitle generator, auto-cut, and styling studio with CapCut design system.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
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
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
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
      </body>
    </html>
  );
}
