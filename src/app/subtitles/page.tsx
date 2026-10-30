"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Home,
  Film,
  Sparkles,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Download,
  Copy,
  Check,
  Languages,
  Sliders,
  Scissors,
  Plus,
  Trash2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  FileText,
  Zap,
  Volume2,
  Eye,
  EyeOff,
  Flame,
} from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { SubtitleItem } from "@/lib/gemini";
import { extractAudioFromVideoFile } from "@/lib/audioExtractor";
import { exportToASS, exportToVTT, exportToSRT, SubtitleBlock } from "@/lib/linguistics/segmenter";

interface PresetStyle {
  id: string;
  name: string;
  desc: string;
  color: string;
  stroke: string;
  bg: string;
  glow?: string;
}

const PRESET_STYLES: PresetStyle[] = [
  {
    id: "tiktok",
    name: "ຕິກຕອກ (TikTok Yellow)",
    desc: "ຕົວໜັງສືຂາວ + ຄຳເດັ່ນສີເຫຼືອງ + ຂອບດຳໜາ",
    color: "#FFFFFF",
    stroke: "#000000",
    bg: "transparent",
  },
  {
    id: "neon",
    name: "ນີອອນ (Cyber Neon)",
    desc: "ແສງສີຟ້ານີອອນເປັ່ງປະກາຍ + ກ່ອງແຄບຊູນດຳ",
    color: "#12E8FF",
    stroke: "#000000",
    bg: "rgba(10, 13, 22, 0.85)",
    glow: "0 0 16px #12E8FF",
  },
  {
    id: "clean",
    name: "ສະອາດ (Clean Minimal)",
    desc: "ຕົວໜັງສືຂາວຊັດເຈນ + ເງົາບາງເບົາ",
    color: "#FFFFFF",
    stroke: "transparent",
    bg: "rgba(0, 0, 0, 0.6)",
  },
  {
    id: "news",
    name: "ຂ່າວ (News Banner)",
    desc: "ແຖບພື້ນຫຼັງສີແດງ-ດຳ ສະໄຕລ໌ຂ່າວດ່ວນ",
    color: "#FFFFFF",
    stroke: "#000000",
    bg: "rgba(185, 28, 28, 0.9)",
  },
];

export default function SubtitleStudioPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Media state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState<number>(15);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Subtitle task configuration
  const [selectedLanguage, setSelectedLanguage] = useState<"lo" | "th" | "mixed" | "en">("lo");
  const [aiVersion, setAiVersion] = useState<"v1" | "v2" | "v3">("v1");
  const [intervalMode, setIntervalMode] = useState<"30s" | "sentence">("sentence");
  const [selectedPreset, setSelectedPreset] = useState<string>("tiktok");
  const [showSafeArea, setShowSafeArea] = useState<boolean>(false);

  // Subtitles output
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([
    {
      id: "1",
      time: 0,
      endTime: 2.8,
      text: "ສະບາຍດີທຸກຄົນ ຍິນດີຕ້ອນຮັບສູ່ SAIZUP Subtitle Studio",
      words: [{ text: "ສະບາຍດີທຸກຄົນ" }, { text: "ຍິນດີຕ້ອນຮັບສູ່" }, { text: "SAIZUP" }, { text: "Subtitle" }, { text: "Studio" }],
    },
    {
      id: "2",
      time: 3.0,
      endTime: 5.8,
      text: "ໂໝດໃສ່ຊັບໄຕເຕິລ AI ພາສາລາວ-ໄທ-ອັງກິດ ຢ່າງມືອາຊີບ",
      words: [{ text: "ໂໝດໃສ່ຊັບໄຕເຕິລ" }, { text: "AI" }, { text: "ພາສາລາວ-ໄທ-ອັງກິດ" }, { text: "ຢ່າງມືອາຊີບ" }],
    },
  ]);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [stepText, setStepText] = useState<string>("");
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

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

  // Compute tier limits
  const userPlan = currentUser?.plan || "Free";
  const isFreeTier = userPlan === "Free" || userPlan === "Free Trial" || !currentUser;
  const maxAllowedDuration = isFreeTier ? 30 : 999999;
  const isVideoOverLimit = videoDuration > maxAllowedDuration;

  // Handle Video Upload
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("video/") && !file.type.startsWith("audio/")) {
      showToast("⚠️ ກະລຸນາເລືອກໄຟລ໌ວິດີໂອ ຫຼື ສຽງ (mp4, mov, webm, mp3, wav)");
      return;
    }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    // Create temporary element to detect duration
    const tempVideo = document.createElement("video");
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      const dur = Math.round(tempVideo.duration) || 15;
      setVideoDuration(dur);
      showToast(`ໂຫຼດວິດີໂອສຳເລັດ (${dur} ວິນາທີ)`);
    };
  };

  // Demo Sample Video
  const handleLoadDemo = () => {
    setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
    setVideoDuration(15);
    showToast("ໂຫຼດວິດີໂອຕົວຢ່າງ (15s Demo) ສຳເລັດແລ້ວ!");
  };

  // Video playback
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Run AI Subtitle Generation
  const handleGenerate = async () => {
    if (isVideoOverLimit) {
      showToast("⚠️ Free tier ຈຳກັດຄວາມຍາວບໍ່ເກີນ 30 ວິນາທີ. ກະລຸນາອັບເກຣດແພັກເກັດ Gold/Plus/Pro");
      return;
    }

    setIsGenerating(true);
    try {
      setStepText("1/2: ກຳລັງສະກັດແທຣັກສຽງ ແລະ ວິເຄາະ...");
      let audioResult = { hasAudio: true, base64: "", mimeType: "audio/wav", duration: videoDuration };

      if (videoFile) {
        try {
          audioResult = await extractAudioFromVideoFile(videoFile, 60);
        } catch (e) {
          console.warn("Audio extract fallback:", e);
        }
      }

      setStepText(`2/2: ກຳລັງປະມວນຜົນດ້ວຍ SAIZUP AI Engine ${aiVersion.toUpperCase()}...`);

      const res = await fetch("/api/ai/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLanguage,
          audioBase64: audioResult.base64,
          mimeType: audioResult.mimeType || "audio/wav",
          videoDuration: audioResult.duration || videoDuration,
          videoTitle: videoFile?.name || "Subtitle Project",
          aiVersion,
          intervalMode,
          userEmail: currentUser?.email,
        }),
      });

      const resText = await res.text();
      let data: any = {};
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch {
        console.error("Non-JSON STT response:", resText);
        throw new Error("ເຊີເວີບໍ່ໄດ້ສົ່ງ JSON (Invalid server response)");
      }

      if (!res.ok || !data.success) {
        if (data.upgradeRequired) {
          showToast(`⚠️ ${data.error}`);
          return;
        }
        throw new Error(data.error || "ສ້າງຊັບບໍ່ສຳເລັດ");
      }

      setSubtitles(data.subtitles);
      if (data.remainingCredits !== undefined && currentUser) {
        const updated = { ...currentUser, credits: data.remainingCredits };
        setCurrentUser(updated);
        localStorage.setItem("saizup_user", JSON.stringify(updated));
      }

      showToast(`🎉 ສ້າງຊັບໄຕເຕິລສຳເລັດ! ໄດ້ຮັບ ${data.subtitles.length} ບລັອກ (ໃຊ້ ${data.costCredits || 0} ເຄຣດິດ)`);
    } catch (err: any) {
      console.error(err);
      showToast(`❌ ຂໍ້ຜິດພາດ: ${err.message || "ເກີດຂໍ້ຜິດພາດ"}`);
    } finally {
      setIsGenerating(false);
      setStepText("");
    }
  };

  // Subtitle Block Editing
  const updateSubtitleText = (id: string, text: string) => {
    setSubtitles((prev) =>
      prev.map((s) => (s.id === id ? { ...s, text, words: text.split(/\s+/).map((w) => ({ text: w })) } : s))
    );
  };

  const deleteSubtitleBlock = (id: string) => {
    setSubtitles((prev) => prev.filter((s) => s.id !== id));
  };

  const addSubtitleBlock = () => {
    const lastSub = subtitles[subtitles.length - 1];
    const newStart = lastSub ? Number((lastSub.endTime + 0.5).toFixed(1)) : 0;
    const newEnd = Number((newStart + (intervalMode === "30s" ? 30 : 3.0)).toFixed(1));

    const newBlock: SubtitleItem = {
      id: String(Date.now()),
      time: newStart,
      endTime: newEnd,
      text: "ຂໍ້ຄວາມຊັບໄຕເຕິລໃໝ່ (ຄລິກເພື່ອແກ້ໄຂ)",
      words: [{ text: "ຂໍ້ຄວາມຊັບໄຕເຕິລໃໝ່" }],
    };
    setSubtitles((prev) => [...prev, newBlock]);
  };

  // Export SRT
  const handleExportSRT = () => {
    let srtContent = "";
    subtitles.forEach((s, idx) => {
      const formatTime = (sec: number) => {
        const hrs = String(Math.floor(sec / 3600)).padStart(2, "0");
        const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
        const secs = String(Math.floor(sec % 60)).padStart(2, "0");
        const ms = String(Math.floor((sec % 1) * 1000)).padStart(3, "0");
        return `${hrs}:${mins}:${secs},${ms}`;
      };

      srtContent += `${idx + 1}\n`;
      srtContent += `${formatTime(s.time)} --> ${formatTime(s.endTime)}\n`;
      srtContent += `${s.text}\n\n`;
    });

    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subtitles_${selectedLanguage}.srt`;
    a.click();
    showToast("📥 ດາວໂຫຼດໄຟລ໌ .SRT ສຳເລັດແລ້ວ!");
  };

  // Export VTT
  const handleExportVTT = () => {
    let vttContent = "WEBVTT\n\n";
    subtitles.forEach((s, idx) => {
      const formatTime = (sec: number) => {
        const hrs = String(Math.floor(sec / 3600)).padStart(2, "0");
        const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
        const secs = String(Math.floor(sec % 60)).padStart(2, "0");
        const ms = String(Math.floor((sec % 1) * 1000)).padStart(3, "0");
        return `${hrs}:${mins}:${secs}.${ms}`;
      };

      vttContent += `${idx + 1}\n`;
      vttContent += `${formatTime(s.time)} --> ${formatTime(s.endTime)}\n`;
      vttContent += `${s.text}\n\n`;
    });

    const blob = new Blob([vttContent], { type: "text/vtt;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subtitles_${selectedLanguage}.vtt`;
    a.click();
    showToast("📥 ດາວໂຫຼດໄຟລ໌ .VTT ສຳເລັດແລ້ວ!");
  };

  // Export Advanced SubStation Alpha (.ASS) with Karaoke tags
  const handleExportASS = () => {
    const assBlocks = subtitles.map((s) => ({
      id: s.id,
      time: s.time,
      endTime: s.endTime,
      text: s.text,
      words: s.words?.map((w: any) => ({
        text: w.text,
        startSec: w.startSec !== undefined ? w.startSec : s.time,
        endSec: w.endSec !== undefined ? w.endSec : s.endTime,
        confidence: w.confidence || 0.95,
        isEmphasis: w.isEmphasis,
        emoji: w.emoji,
      })) || [],
      confidence: 0.96,
      cps: 14.5,
    }));

    const assContent = exportToASS(assBlocks, `SAIZUP_${selectedLanguage}`);
    const blob = new Blob([assContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subtitles_${selectedLanguage}_karaoke.ass`;
    a.click();
    showToast("📥 ດາວໂຫຼດໄຟລ໌ Karaoke .ASS ສຳເລັດແລ້ວ!");
  };

  // Copy Plain Text
  const handleCopyText = () => {
    const fullText = subtitles.map((s) => s.text).join("\n");
    navigator.clipboard.writeText(fullText);
    setCopiedSuccess(true);
    showToast("📋 ສຳເນົາຂໍ້ຄວາມຊັບທັງໝົດແລ້ວ!");
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  // Active Subtitle for current playhead
  const activeSub = subtitles.find((s) => currentTime >= s.time && currentTime <= s.endTime);
  const activePresetConfig = PRESET_STYLES.find((p) => p.id === selectedPreset) || PRESET_STYLES[0];

  return (
    <div className="min-h-screen bg-[#0A0B10] text-slate-100 flex flex-col font-sans">
      {/* 1. TOP NAVBAR */}
      <header className="h-14 px-4 sm:px-6 bg-[#12131C] border-b border-[#222433] flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B1D2A] hover:bg-[#25283A] text-slate-200 hover:text-[#12E8FF] border border-slate-700/60 text-xs font-semibold transition-all group"
            title="ກັບຄືນໜ້າຫຼັກ"
          >
            <Home className="w-4 h-4 text-[#12E8FF] group-hover:scale-110 transition-transform" />
            <span>ໜ້າຫຼັກ (Home)</span>
          </Link>

          <div className="h-4 w-px bg-slate-700/60" />

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#12E8FF] to-indigo-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-black" />
            </div>
            <div>
              <span className="text-sm font-bold text-white">SAIZUP Subtitle Studio</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] px-2 py-0.5 rounded-full bg-[#12E8FF]/15 text-[#12E8FF] font-medium border border-[#12E8FF]/30">
                ໂໝດໃສ່ຊັບໄຕເຕິລໂດຍສະເພາະ
              </span>
            </div>
          </div>
        </div>

        {/* Right Nav Action: Switch to Video Studio & User Status */}
        <div className="flex items-center gap-3">
          <Link
            href="/editor"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1D1E2C] hover:bg-[#27293D] text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors"
          >
            <Scissors className="w-3.5 h-3.5 text-yellow-400" />
            <span>ສະຫຼັບໄປ Video Studio (Full)</span>
          </Link>

          {/* User Status / Credits Pill */}
          {currentUser ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#161824] border border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-slate-200">{currentUser.name || currentUser.email}</span>
              <span className="text-slate-500">•</span>
              <span className="text-yellow-400 font-bold">🪙 {currentUser.credits ?? 15} เครดิต</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-400 font-bold border border-slate-700">
                {currentUser.plan || "Free"}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#12E8FF] hover:bg-[#00d0e6] text-[#090C14] text-xs font-bold transition-all shadow-sm"
            >
              ເຂົ້າສູ່ລະບົບ (15 ເຄຣດິດຟຣີ)
            </button>
          )}
        </div>
      </header>

      {/* 2. MAIN WORKFLOW CONTAINER */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Video Player & Subtitle Preset Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Video Preview Card */}
          <div className="relative rounded-2xl bg-[#12131C] border border-[#262838] overflow-hidden flex flex-col shadow-xl">
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                />
              ) : (
                <div className="text-center p-8">
                  <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 mb-4">ຍັງບໍ່ທັນມີວິດີໂອ. ກະລຸນາອັບໂຫຼດ ຫຼື ເລືອກຕົວຢ່າງ</p>
                  <button
                    onClick={handleLoadDemo}
                    className="px-4 py-2 rounded-xl bg-[#1A1C29] hover:bg-[#25283B] border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
                  >
                    🎬 ທົດລອງວິດີໂອຕົວຢ່າງ (15s Demo)
                  </button>
                </div>
              )}

              {/* Safe Area Overlay for TikTok / Reels / Shorts */}
              {showSafeArea && (
                <div className="absolute inset-0 pointer-events-none z-10 border-2 border-dashed border-red-500/50 flex flex-col justify-between p-4">
                  <div className="text-[10px] text-red-400 font-mono bg-black/60 px-2 py-0.5 rounded w-max">
                    Safe Area Top (15%)
                  </div>
                  <div className="text-[10px] text-red-400 font-mono bg-black/60 px-2 py-0.5 rounded w-max self-center">
                    Safe Zone (Center)
                  </div>
                  <div className="text-[10px] text-red-400 font-mono bg-black/60 px-2 py-0.5 rounded w-max">
                    Safe Area Bottom (20%)
                  </div>
                </div>
              )}

              {/* Render Active Subtitle Overlay with Word-Level Micro-Timing & Emojis */}
              {activeSub && (
                <div className="absolute bottom-6 inset-x-4 flex justify-center pointer-events-none z-20">
                  <div
                    className="max-w-[90%] px-4 py-2.5 rounded-2xl text-center font-bold text-base sm:text-xl transition-all flex flex-wrap items-center justify-center gap-1.5"
                    style={{
                      color: activePresetConfig.color,
                      backgroundColor: activePresetConfig.bg,
                      textShadow:
                        activePresetConfig.stroke !== "transparent"
                          ? `2px 2px 0 ${activePresetConfig.stroke}, -2px -2px 0 ${activePresetConfig.stroke}, 2px -2px 0 ${activePresetConfig.stroke}, -2px 2px 0 ${activePresetConfig.stroke}`
                          : "none",
                      boxShadow: activePresetConfig.glow || "none",
                    }}
                  >
                    {activeSub.words && activeSub.words.length > 0 ? (
                      activeSub.words.map((w: any, wIdx: number) => {
                        const isWordActive =
                          currentTime >= (w.startSec || 0) && currentTime <= (w.endSec || 9999);
                        return (
                          <span
                            key={wIdx}
                            className={`inline-flex items-center transition-all duration-100 ${
                              isWordActive
                                ? "text-[#FFE01B] scale-110 -translate-y-1 filter drop-shadow-[0_0_12px_rgba(255,224,27,0.9)]"
                                : "opacity-90"
                            }`}
                          >
                            <span>{w.text}</span>
                            {w.emoji && <span className="ml-1 text-sm">{w.emoji}</span>}
                          </span>
                        );
                      })
                    ) : (
                      <span>{activeSub.text}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls Bar */}
            {videoUrl && (
              <div className="p-3 bg-[#151722] border-t border-[#222433] flex items-center justify-between gap-3">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-lg bg-[#12E8FF] text-black flex items-center justify-center font-bold hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <div className="flex-1 flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">
                    {Math.floor(currentTime)}s / {videoDuration}s
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={videoDuration || 15}
                    step="0.1"
                    value={currentTime}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCurrentTime(val);
                      if (videoRef.current) videoRef.current.currentTime = val;
                    }}
                    className="flex-1 accent-[#12E8FF] h-1.5 rounded-lg bg-slate-700 cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowSafeArea(!showSafeArea)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                    showSafeArea ? "bg-red-500/20 text-red-300 border-red-500/40" : "bg-[#1B1E2E] text-slate-400 border-slate-700"
                  }`}
                  title="ສະແດງເຂດປອດໄພ TikTok/Reels Safe Area"
                >
                  {showSafeArea ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span className="hidden sm:inline">Safe Area</span>
                </button>

                {isFreeTier && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${isVideoOverLimit ? "bg-red-500/20 text-red-300 border border-red-500/40" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"}`}>
                    {isVideoOverLimit ? "⚠️ ເກີນ 30s" : "✓ 30s limit"}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Subtitle Preset Selector */}
          <div className="p-4 rounded-2xl bg-[#12131C] border border-[#262838]">
            <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#12E8FF]" />
              <span>ເລືອກຮູບແບບຊັບໄຕເຕິລ (Subtitle Presets)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_STYLES.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedPreset === preset.id
                      ? "bg-[#1B1E2E] border-[#12E8FF] shadow-sm shadow-[#12E8FF]/20"
                      : "bg-[#161824] border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="text-xs font-bold text-white mb-1 truncate">{preset.name}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Generation Setup & Subtitle Block Editor (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* STEP 1 & 2: Task Configuration Card */}
          <div className="p-5 rounded-2xl bg-[#12131C] border border-[#262838] shadow-lg">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#12E8FF]/20 text-[#12E8FF] flex items-center justify-center text-xs">1</span>
              <span>ອັບໂຫຼດວິດີໂອ & ຕັ້ງຄ່າ AI</span>
            </h3>

            {/* Media Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              accept="video/*,audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-[#12E8FF] bg-[#161824] hover:bg-[#1a1c2b] text-center cursor-pointer transition-all mb-4 group"
            >
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#12E8FF] mx-auto mb-1.5 transition-colors" />
              <p className="text-xs font-semibold text-slate-200">
                {videoFile ? videoFile.name : "ຄລິກເພື່ອອັບໂຫຼດວິດີໂອ / ສຽງ"}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">ຮອງຮັບ MP4, MOV, WEBM, MP3, WAV</p>
            </div>

            {/* Language Selector */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-300 mb-2 block">ພາສາສຳລັບຖອດສຽງ:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "lo", label: "🇱🇦 ລາວ (Lao+EN)" },
                  { id: "th", label: "🇹🇭 ໄທ (Thai+EN)" },
                  { id: "mixed", label: "🌐 ລາວປົນອັງກິດ" },
                  { id: "en", label: "🇬🇧 English" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedLanguage(item.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      selectedLanguage === item.id
                        ? "bg-[#182333] border-[#12E8FF] text-[#12E8FF]"
                        : "bg-[#161824] border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Engine Version Selector (3 Tiers, Unbranded) */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                <span>ລຸ້ນລະບົບ AI Engine:</span>
                <span className="text-[10px] text-slate-400 font-mono">SAIZUP Multimodal</span>
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: "v1",
                    name: "AI Version 1 (Standard Fast)",
                    cost: 5,
                    desc: "ຖອດສຽງໄວມາດຕະຖານ ສຳລັບຄລິບສັ້ນ",
                    badge: "5 ເຄຣດິດ",
                  },
                  {
                    id: "v2",
                    name: "AI Version 2 (Balanced Pro)",
                    cost: 10,
                    desc: "ວິເຄາະສຳນຽງລາວ-ໄທ-ອັງກິດ ຢ່າງລຽບນຽນ",
                    badge: "10 ເຄຣດິດ",
                  },
                  {
                    id: "v3",
                    name: "AI Version 3 (Ultra Precision)",
                    cost: 20,
                    desc: "ຄວາມຊັດເຈນສູງສຸດລະດັບມິລລິວິນາທີ ຄາຣາໂອເກະ",
                    badge: "20 ເຄຣດິດ",
                  },
                ].map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => setAiVersion(tier.id as any)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      aiVersion === tier.id
                        ? "bg-[#182333] border-[#12E8FF] shadow-sm shadow-[#12E8FF]/10"
                        : "bg-[#161824] border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200">{tier.name}</div>
                      <div className="text-[10px] text-slate-400">{tier.desc}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-yellow-400/15 text-yellow-300 border border-yellow-400/30">
                      {tier.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interval Mode: 30s vs Sentence */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-300 mb-2 block">ຮູບແບບການຕັດຊ່ວງເວລາ (Interval):</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIntervalMode("sentence")}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    intervalMode === "sentence"
                      ? "bg-[#182333] border-[#12E8FF] text-[#12E8FF]"
                      : "bg-[#161824] border-slate-800 text-slate-400"
                  }`}
                >
                  ⚡ ປະໂຫຍກສັ້ນ (2-4s)
                </button>
                <button
                  onClick={() => setIntervalMode("30s")}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    intervalMode === "30s"
                      ? "bg-[#182333] border-[#12E8FF] text-[#12E8FF]"
                      : "bg-[#161824] border-slate-800 text-slate-400"
                  }`}
                >
                  ⏱️ ຊ່ວງຍາວ 30 ວິນາທີ
                </button>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#12E8FF] to-blue-600 hover:from-[#00d0e6] hover:to-blue-500 text-[#090C14] font-extrabold text-sm transition-all shadow-lg shadow-[#12E8FF]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>{stepText || "ກຳລັງປະມວນຜົນ..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>ເລີ່ມຖອດສຽງ & ສ້າງຊັບໄຕເຕິລ</span>
                </>
              )}
            </button>
          </div>

          {/* STEP 3: Subtitle Block List & Export Actions */}
          <div className="p-5 rounded-2xl bg-[#12131C] border border-[#262838] flex-1 flex flex-col shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#12E8FF]/20 text-[#12E8FF] flex items-center justify-center text-xs">2</span>
                <span>ລາຍການຊັບໄຕເຕິລ ({subtitles.length} ບລັອກ)</span>
              </h3>
              <button
                onClick={addSubtitleBlock}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1B1D2A] hover:bg-[#25283A] text-slate-300 hover:text-[#12E8FF] text-xs font-semibold border border-slate-700/60 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ເພີ່ມແຖວ</span>
              </button>
            </div>

            {/* Subtitle Blocks Scrollable List */}
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 mb-4 flex-1">
              {subtitles.map((sub, index) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-xl bg-[#161824] border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="text-[#12E8FF] font-bold">#{index + 1}</span>
                    <span>
                      {sub.time}s - {sub.endTime}s
                    </span>
                    <button
                      onClick={() => deleteSubtitleBlock(sub.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                      title="ລຶບແຖວນີ້"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={sub.text}
                    onChange={(e) => updateSubtitleText(sub.id, e.target.value)}
                    className="w-full bg-[#1A1C29] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#12E8FF]"
                  />
                </div>
              ))}
            </div>

            {/* Export Actions Bar */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-2">
              <button
                onClick={handleExportSRT}
                className="flex-1 py-2 px-2.5 rounded-xl bg-[#1B1E2E] hover:bg-[#252a3d] border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#12E8FF]" />
                <span>.SRT</span>
              </button>

              <button
                onClick={handleExportVTT}
                className="flex-1 py-2 px-2.5 rounded-xl bg-[#1B1E2E] hover:bg-[#252a3d] border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#12E8FF]" />
                <span>.VTT</span>
              </button>

              <button
                onClick={handleExportASS}
                className="flex-1 py-2 px-2.5 rounded-xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 hover:from-purple-900/60 hover:to-indigo-900/60 border border-purple-500/40 text-xs font-semibold text-purple-300 transition-colors flex items-center justify-center gap-1.5"
                title="Advanced SubStation Alpha with Karaoke tags"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>.ASS</span>
              </button>

              <button
                onClick={handleCopyText}
                className="py-2 px-3 rounded-xl bg-[#1B1E2E] hover:bg-[#252a3d] border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                title="ສຳເນົາຂໍ້ຄວາມທັງໝົດ"
              >
                {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#141724] border border-[#12E8FF]/60 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-[#12E8FF]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
          showToast(`ຍິນດີຕ້ອນຮັບ ${user.name || user.email}! ໄດ້ຮັບ 15 ເຄຣດິດຟຣີ`);
        }}
      />
    </div>
  );
}
