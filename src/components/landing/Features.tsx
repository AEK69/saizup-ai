"use client";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
    title: "AI Subtitles (LaoSub Mode)",
    description: "Auto-generate word-by-word animated subtitles in Lao (ພາສາລາວ), Thai, and English with 5 live motion effects.",
    gradient: "from-[#12E8FF] to-[#5B8FFF]",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.121 14.121A3 3 0 109.88 9.88m4.242 4.243L9.88 9.879m4.242 4.243a3 3 0 01-4.243 0M9.88 9.879a3 3 0 014.243 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Smart Silence Removal",
    description: "Automatically detect and trim dead-air pauses to keep short-form audiences hooked from first second.",
    gradient: "from-[#5B8FFF] to-[#2E4A66]",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: "AI Auto-Cutter & Reference Match",
    description: "Match the pacing, tempo, and cuts of viral reference videos automatically using CapCut AI logic.",
    gradient: "from-[#12E8FF] to-[#38BDF8]",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    ),
    title: "Dynamic CapCut Presets",
    description: "Choose from trendy presets (TikTok, Neon, Clean, News, Karaoke) with high-contrast outlines that never clip vowels.",
    gradient: "from-[#5B8FFF] to-[#12E8FF]",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Interactive Subtitle Drag Handle (⇕)",
    description: "Drag and position subtitles directly on the video player screen with real-time guideline snapping and TikTok safe zones.",
    gradient: "from-[#12E8FF] to-[#2E4A66]",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    title: "Bilingual AI Translation",
    description: "Instant translation between Lao, Thai, and English with synchronized dual-line subtitles.",
    gradient: "from-[#5B8FFF] to-[#BDD1DB]",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28 bg-[#0F0F10] border-t border-[#1D1D1E]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1D1D1E] border border-[#353536] mb-4">
            <span className="font-caption-xs text-[#12E8FF] font-semibold tracking-[2.29px]">CAPCUT SPEED & EFFICIENCY</span>
          </div>
          <h2 className="font-display-md text-white font-bold mb-4 font-inter">
            <span>Everything You Need to </span>
            <span className="capcut-gradient-text">Go Viral</span>
          </h2>
          <p className="text-base text-slate-400 font-normal">
            State-of-the-art AI video editing capabilities tailored for modern creators across Southeast Asia.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl bg-[#14151E] border border-[#262833] hover:border-[#12E8FF]/40 transition-all duration-300 hover:bg-[#181924] shadow-sm"
            >
              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-[#090C14] mb-4 shadow-md group-hover:scale-105 transition-transform duration-300 font-bold`}>
                  {feature.icon}
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-white mb-2 font-inter">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed font-normal">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
