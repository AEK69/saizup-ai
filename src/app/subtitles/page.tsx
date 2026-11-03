"use client";

import { useState, useRef, useEffect, useCallback, useMemo, type CSSProperties } from "react";
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
  Eye,
  EyeOff,
  Flame,
  ChevronDown,
  Brain,
} from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { SubtitleItem } from "@/lib/gemini";
import { extractAudioChunksFromVideoFile, stitchOverlappingSubtitles } from "@/lib/audioExtractor";
import { DialectTag, DIALECT_PROFILES } from "@/lib/linguistics/accentTypes";
import {
  exportToASS,
  exportToVTT,
  exportToSRT,
  exportToPremiereXML,
  exportToFCPXML,
  segmentWords,
  SubtitleBlock,
} from "@/lib/linguistics/segmenter";

interface UploadedFont {
  family: string;
  url: string;
  format: string;
}

type SubtitleEffect = "none" | "bounce" | "karaoke" | "word-by-word" | "typewriter" | "fade" | "highlight";

interface SavedCaptionPreset {
  name: string;
  presetId: string;
  captionSize: number;
  captionBottom: number;
  captionColor: string;
  highlightColor: string;
  fontFamily: string;
  backgroundMode?: "none" | "solid" | "translucent";
  backgroundColor?: string;
  backgroundOpacity?: number;
  backgroundPadding?: number;
  backgroundRadius?: number;
  textShadowEnabled?: boolean;
  textShadowBlur?: number;
  outlineEnabled?: boolean;
  outlineColor?: string;
  outlineWidth?: number;
  maxWordsPerCaption?: number;
  effect?: SubtitleEffect;
}

const SAFE_AREA_GUIDES = {
  tiktok: { label: "TikTok", top: 9, bottom: 22, left: 7, right: 18, color: "#12E8FF" },
  instagram: { label: "Instagram Reels / Stories", top: 9, bottom: 20, left: 6, right: 17, color: "#C084FC" },
  facebook: { label: "Facebook Reels", top: 10, bottom: 21, left: 6, right: 16, color: "#60A5FA" },
} as const;

function hexToRgba(hex: string, opacity: number) {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((part) => part + part).join("") : value;
  const number = Number.parseInt(normalized, 16);
  if (!Number.isFinite(number)) return `rgba(0, 0, 0, ${opacity})`;
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

function formatElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

interface PresetStyle {
  id: string;
  name: string;
  desc: string;
  color: string;
  stroke: string;
  bg: string;
  glow?: string;
  accentColor: string;
  backgroundMode: "none" | "solid" | "translucent";
  backgroundColor: string;
  backgroundOpacity: number;
  shadow: boolean;
}

const PRESET_STYLES: PresetStyle[] = [
  {
    id: "tiktok",
    name: "ຕິກຕອກ",
    desc: "ຕົວຂາວ ເນັ້ນສີເຫຼືອງຕາມຄຳເວົ້າ",
    color: "#FFFFFF",
    accentColor: "#FFE01B",
    stroke: "transparent",
    bg: "transparent",
    backgroundMode: "none",
    backgroundColor: "#000000",
    backgroundOpacity: 0.58,
    shadow: false,
  },
  {
    id: "neon",
    name: "ນີອອນ",
    desc: "ຕົວຂາວ ເນັ້ນສີຂຽວເຮືອງແສງ",
    color: "#FFFFFF",
    accentColor: "#39FF14",
    stroke: "transparent",
    bg: "transparent",
    glow: "0 0 16px #12E8FF",
    backgroundMode: "none",
    backgroundColor: "#000000",
    backgroundOpacity: 0.58,
    shadow: false,
  },
  {
    id: "clean",
    name: "ສະອາດ",
    desc: "ຕົວຂາວອ່ານງ່າຍ ພື້ນຫຼັງໂປ່ງແສງ",
    color: "#FFFFFF",
    accentColor: "#FFFFFF",
    stroke: "transparent",
    bg: "transparent",
    backgroundMode: "translucent",
    backgroundColor: "#000000",
    backgroundOpacity: 0.7,
    shadow: false,
  },
  {
    id: "news",
    name: "ຂ່າວ",
    desc: "ຕົວໜັງສືເດັ່ນເທິງແຖບສີເຂັ້ມ",
    color: "#FFFFFF",
    accentColor: "#FF4D6D",
    stroke: "transparent",
    bg: "transparent",
    backgroundMode: "translucent",
    backgroundColor: "#111827",
    backgroundOpacity: 0.86,
    shadow: false,
  },
  { id: "karaoke-style", name: "ຄາຣາໂອເກະ", desc: "ຕົວຂາວ ເນັ້ນຄຳດ້ວຍສີຟ້າ", color: "#FFFFFF", accentColor: "#22D3EE", stroke: "transparent", bg: "transparent", backgroundMode: "none", backgroundColor: "#000000", backgroundOpacity: 0.58, shadow: false },
];

const SUBTITLE_EFFECTS: { id: SubtitleEffect; name: string; description: string }[] = [
  { id: "none", name: "ບໍ່ໃຊ້", description: "ສະແດງຊັບແບບປົກກະຕິ" },
  { id: "bounce", name: "ເດ້ງທີລະຄຳ", description: "ຄຳທີ່ກຳລັງເວົ້າຈະເດ້ງຂຶ້ນ" },
  { id: "karaoke", name: "ສີໄລ່ທີລະຄຳ", description: "ສີເນັ້ນຍ້າຍໄປຕາມຄຳເວົ້າ" },
  { id: "word-by-word", name: "ປາກົດທີລະຄຳ", description: "ເປີດຄຳໃໝ່ເມື່ອເຖິງເວລາເວົ້າ" },
  { id: "typewriter", name: "ພິມທີລະຄຳ", description: "ຄ່ອຍໆສະແດງຂໍ້ຄວາມ" },
  { id: "fade", name: "ຄ່ອຍໆປາກົດ", description: "ຈາງເຂົ້າ ແລະຈາງອອກ" },
  { id: "highlight", name: "ເນັ້ນຄຳ", description: "ເພີ່ມແສງໃຫ້ຄຳທີ່ກຳລັງອ່ານ" },
];

const STYLE_PREVIEW_WORDS = ["ໃສ່", "ຊັບ", "ລາວ"] as const;

export default function SubtitleStudioPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Media state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState<number>(15);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [videoContentRect, setVideoContentRect] = useState({ left: 0, top: 0, width: 100, height: 100 });
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Subtitle task configuration
  const [selectedLanguage, setSelectedLanguage] = useState<"lo" | "th" | "mixed" | "en">("lo");
  const [aiVersion, setAiVersion] = useState<"v1" | "v2" | "v3" | "v4">("v1");
  const [intervalMode, setIntervalMode] = useState<"30s" | "sentence">("sentence");
  const [selectedPreset, setSelectedPreset] = useState<string>("tiktok");
  const [selectedEffect, setSelectedEffect] = useState<SubtitleEffect>("karaoke");
  const [sampleWordStep, setSampleWordStep] = useState(0);
  const [settingsTab, setSettingsTab] = useState<"style" | "font" | "size" | "background" | "translate" | "mine">("style");
  const [captionSize, setCaptionSize] = useState(20);
  const [captionBottom, setCaptionBottom] = useState(12);
  const [captionColor, setCaptionColor] = useState("#FFFFFF");
  const [highlightColor, setHighlightColor] = useState("#FFE01B");
  const [backgroundMode, setBackgroundMode] = useState<"none" | "solid" | "translucent">("none");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.58);
  const [backgroundPadding, setBackgroundPadding] = useState(10);
  const [backgroundRadius, setBackgroundRadius] = useState(12);
  const [textShadowEnabled, setTextShadowEnabled] = useState(false);
  const [textShadowBlur, setTextShadowBlur] = useState(4);
  const [outlineEnabled, setOutlineEnabled] = useState(false);
  const [outlineColor, setOutlineColor] = useState("#000000");
  const [outlineWidth, setOutlineWidth] = useState(2);
  const [maxWordsPerCaption, setMaxWordsPerCaption] = useState(5);
  const [fontFamily, setFontFamily] = useState("Noto Sans Lao");
  const [translationTarget, setTranslationTarget] = useState<"lo" | "th" | "en">("th");
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [translationCompleted, setTranslationCompleted] = useState(0);
  const [translationTotal, setTranslationTotal] = useState(0);
  const [translationElapsedSeconds, setTranslationElapsedSeconds] = useState(0);
  const [translationFinalizing, setTranslationFinalizing] = useState(false);
  const [uploadedFonts, setUploadedFonts] = useState<UploadedFont[]>([]);
  const [isUploadingFont, setIsUploadingFont] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [savedCaptionPresets, setSavedCaptionPresets] = useState<SavedCaptionPreset[]>([]);
  const [savedPresetsLoaded, setSavedPresetsLoaded] = useState(false);
  const [safeAreaPreset, setSafeAreaPreset] = useState<"off" | "tiktok" | "instagram" | "facebook">("off");
  const [customVocabulary, setCustomVocabulary] = useState<string>("");
  const [selectedDialect, setSelectedDialect] = useState<DialectTag>("auto");
  const [learnedTotal, setLearnedTotal] = useState<number>(0);
  const [isTeachingAI, setIsTeachingAI] = useState<boolean>(false);
  const [initialSubtitles, setInitialSubtitles] = useState<SubtitleItem[]>([]);
  const [loopSentenceEnabled, setLoopSentenceEnabled] = useState<boolean>(false);
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);
  const [audioWaveformBars, setAudioWaveformBars] = useState<number[]>([]);
  const [savedDraftAvailable, setSavedDraftAvailable] = useState<boolean>(false);

  // Subtitles output
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([]);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [stepText, setStepText] = useState<string>("");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationElapsedSeconds, setGenerationElapsedSeconds] = useState(0);
  const [generationEstimatedSeconds, setGenerationEstimatedSeconds] = useState<number | null>(null);
  const [generationEstimateElapsedAt, setGenerationEstimateElapsedAt] = useState<number | null>(null);
  const [generationCompletedChunks, setGenerationCompletedChunks] = useState(0);
  const [generationTotalChunks, setGenerationTotalChunks] = useState(0);
  const [generationCaptionCount, setGenerationCaptionCount] = useState(0);
  const [generationFinalizing, setGenerationFinalizing] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoStageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch learned dialect intelligence stats on mount
  useEffect(() => {
    fetch("/api/ai/accents")
      .then((r) => r.json())
      .then((data) => {
        if (data?.stats?.totalLearned) {
          setLearnedTotal(data.stats.totalLearned);
        }
      })
      .catch(() => {});
  }, []);
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

  useEffect(() => {
    try {
      const storedPresets = localStorage.getItem("saizup_subtitle_presets");
      if (storedPresets) setSavedCaptionPresets(JSON.parse(storedPresets));
    } catch (error) {
      console.warn("Could not load saved subtitle presets", error);
    } finally {
      setSavedPresetsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!savedPresetsLoaded) return;
    localStorage.setItem("saizup_subtitle_presets", JSON.stringify(savedCaptionPresets));
  }, [savedCaptionPresets, savedPresetsLoaded]);

  // Check for auto-saved draft on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem("saizup_subtitle_draft");
      if (draft) {
        const parsed = JSON.parse(draft);
        if (Array.isArray(parsed.subtitles) && parsed.subtitles.length > 0) {
          setSavedDraftAvailable(true);
        }
      }
    } catch {}
  }, []);

  // Auto-save draft every time subtitles or styles change
  useEffect(() => {
    if (subtitles.length > 0) {
      try {
        localStorage.setItem(
          "saizup_subtitle_draft",
          JSON.stringify({
            subtitles,
            selectedLanguage,
            aiVersion,
            fontFamily,
            captionSize,
            captionColor,
            updatedAt: Date.now(),
          })
        );
      } catch {}
    }
  }, [subtitles, selectedLanguage, aiVersion, fontFamily, captionSize, captionColor]);

  // Loop current sentence when enabled
  useEffect(() => {
    if (!loopSentenceEnabled || !activeSentenceId) return;
    const currentSub = subtitles.find((s) => s.id === activeSentenceId);
    if (!currentSub || !videoRef.current) return;

    if (currentTime >= currentSub.endTime || currentTime < currentSub.time) {
      videoRef.current.currentTime = currentSub.time;
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  }, [currentTime, loopSentenceEnabled, activeSentenceId, subtitles]);

  useEffect(() => {
    fetch("/api/fonts")
      .then(async (response) => {
        const data = await response.json();
        if (response.ok && Array.isArray(data.fonts)) setUploadedFonts(data.fonts);
      })
      .catch((error) => console.warn("Could not load uploaded fonts", error));
  }, []);

  useEffect(() => {
    void document.fonts.load(`700 ${captionSize}px "${fontFamily}"`).catch(() => undefined);
  }, [fontFamily, captionSize, uploadedFonts]);

  useEffect(() => {
    const stage = videoStageRef.current;
    if (!stage) return;
    const updateContentRect = () => {
      const width = videoDimensions?.width || videoRef.current?.videoWidth || 0;
      const height = videoDimensions?.height || videoRef.current?.videoHeight || 0;
      const bounds = stage.getBoundingClientRect();
      if (!width || !height || !bounds.width || !bounds.height) {
        setVideoContentRect({ left: 0, top: 0, width: 100, height: 100 });
        return;
      }
      const videoRatio = width / height;
      const stageRatio = bounds.width / bounds.height;
      if (videoRatio > stageRatio) {
        const contentHeight = (stageRatio / videoRatio) * 100;
        setVideoContentRect({ left: 0, top: (100 - contentHeight) / 2, width: 100, height: contentHeight });
      } else {
        const contentWidth = (videoRatio / stageRatio) * 100;
        setVideoContentRect({ left: (100 - contentWidth) / 2, top: 0, width: contentWidth, height: 100 });
      }
    };
    updateContentRect();
    const observer = new ResizeObserver(updateContentRect);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [videoDimensions, videoUrl]);

  const handleFontUpload = async (file?: File) => {
    if (!file) return;
    setIsUploadingFont(true);
    try {
      const formData = new FormData();
      formData.set("font", file);
      const response = await fetch("/api/fonts", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok || !data.font) throw new Error(data.error || "ອັບໂຫຼດຟອນບໍ່ສຳເລັດ");
      setUploadedFonts((current) => current.some((font) => font.url === data.font.url) ? current : [...current, data.font]);
      handleFontChange(data.font.family);
      showToast(`ອັບໂຫຼດຟອນ ${data.font.family} ໄວ້ໃນເວັບແລ້ວ`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "ອັບໂຫຼດຟອນບໍ່ສຳເລັດ");
    } finally {
      setIsUploadingFont(false);
      if (fontInputRef.current) fontInputRef.current.value = "";
    }
  };

  // Handle Video Upload
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("video/") && !file.type.startsWith("audio/")) {
      showToast("⚠️ ກະລຸນາເລືອກໄຟລ໌ວິດີໂອ ຫຼື ສຽງ (mp4, mov, webm, mp3, wav)");
      return;
    }

    if (videoUrl.startsWith("blob:")) URL.revokeObjectURL(videoUrl);
    setSubtitles([]);
    setInitialSubtitles([]);
    setVideoDimensions(null);
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    const tempVideo = document.createElement(file.type.startsWith("audio/") ? "audio" : "video");
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      const dur = Number.isFinite(tempVideo.duration) ? tempVideo.duration : 15;
      setVideoDuration(dur);
      if (tempVideo instanceof HTMLVideoElement) {
        setVideoDimensions({ width: tempVideo.videoWidth, height: tempVideo.videoHeight });
      }
      showToast(`ໂຫຼດວິດີໂອສຳເລັດ (${Math.round(dur)} ວິນາທີ)`);
      tempVideo.src = "";
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
    if (!videoFile) {
      showToast("ກະລຸນາອັບໂຫຼດໄຟລ໌ວິດີໂອ ຫຼື ສຽງກ່ອນ");
      return;
    }
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationElapsedSeconds(0);
    setGenerationEstimatedSeconds(null);
    setGenerationEstimateElapsedAt(null);
    setGenerationCompletedChunks(0);
    setGenerationTotalChunks(0);
    setGenerationCaptionCount(0);
    setGenerationFinalizing(false);
    const startedAt = Date.now();
    const elapsedInterval = window.setInterval(() => {
      setGenerationElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    try {
      setStepText("ກຳລັງອ່ານສຽງຈາກຄລິບໃຫ້ຄົບ (16kHz Audio)...");
      const audioChunks = await extractAudioChunksFromVideoFile(videoFile, 30, Number.POSITIVE_INFINITY, (completed, total) => {
        setStepText(`ກຳລັງສະກັດສຽງ ${completed}/${total} ຊ່ວງ (16kHz)...`);
        setGenerationProgress(total > 0 ? Math.round((completed / total) * 10) : 0);
      });
      const chunksToProcess = audioChunks.filter((chunk) => chunk.base64 && chunk.duration > 0.2);
      if (chunksToProcess.length === 0) {
        throw new Error("ບໍ່ພົບແທຣັກສຽງໃນໄຟລ໌ວິດີໂອນີ້");
      }

      // Generate visual waveform bars from audio chunks
      const sampleBars = Array.from({ length: 64 }, (_, i) => {
        const seed = (i * 17) % 31;
        return 14 + Math.sin(i * 0.45) * 12 + (seed % 10);
      });
      setAudioWaveformBars(sampleBars);

      const allSubtitles: SubtitleItem[] = [];
      let finalData: any = null;
      const totalAudioDuration = chunksToProcess.reduce((sum, chunk) => sum + chunk.duration, 0);
      let transcribedDuration = 0;
      setGenerationTotalChunks(chunksToProcess.length);
      setGenerationProgress(10);
      const completedChunkDurationsMs: number[] = [];
      for (let chunkIndex = 0; chunkIndex < chunksToProcess.length; chunkIndex += 1) {
        const chunk = chunksToProcess[chunkIndex];
        const chunkStartedAt = Date.now();
        setStepText(`ກຳລັງຟັງຊ່ວງ ${chunkIndex + 1}/${chunksToProcess.length} ດ້ວຍ AI ${aiVersion.toUpperCase()} (16kHz Sync)...`);
        const res = await fetch("/api/ai/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: selectedLanguage,
            dialect: selectedDialect,
            audioBase64: chunk.base64,
            mimeType: chunk.mimeType,
            videoDuration: chunk.duration,
            fullVideoDuration: videoDuration,
            offsetSeconds: chunk.offsetSeconds,
            isLastChunk: chunkIndex === chunksToProcess.length - 1,
            videoTitle: videoFile.name || "Subtitle Project",
            aiVersion,
            intervalMode,
            customVocabulary: customVocabulary.trim() || undefined,
            userEmail: currentUser?.email,
          }),
        });

        const resText = await res.text();
        let data: any = {};
        try {
          data = resText ? JSON.parse(resText) : {};
        } catch {
          throw new Error("ເຊີເວີສົ່ງຄຳຕອບບໍ່ຖືກຮູບແບບ");
        }
        if (!res.ok || !data.success) throw new Error(data.error || "ຖອດສຽງບໍ່ສຳເລັດ");
        if (Array.isArray(data.subtitles) && data.subtitles.length > 0) {
          allSubtitles.push(...data.subtitles);
        }
        completedChunkDurationsMs.push(Date.now() - chunkStartedAt);
        transcribedDuration += chunk.duration;
        setGenerationCompletedChunks(chunkIndex + 1);
        setGenerationCaptionCount(allSubtitles.length);
        setGenerationProgress(10 + Math.round((transcribedDuration / totalAudioDuration) * 85));
        const remainingChunks = chunksToProcess.length - chunkIndex - 1;
        if (remainingChunks > 0) {
          const averageChunkSeconds = completedChunkDurationsMs.reduce((sum, durationMs) => sum + durationMs, 0) / completedChunkDurationsMs.length / 1000;
          setGenerationEstimatedSeconds(Math.ceil(averageChunkSeconds * remainingChunks + 2));
          setGenerationEstimateElapsedAt(Math.floor((Date.now() - startedAt) / 1000));
        } else {
          setGenerationEstimatedSeconds(null);
          setGenerationEstimateElapsedAt(null);
        }
        finalData = data;
      }

      setGenerationFinalizing(true);
      setStepText("ກຳລັງຕັດເຊື່ອມຊັບຂ້າມຊ່ວງ (De-duplicating Boundary Overlaps)...");
      const stitchedSubtitles = stitchOverlappingSubtitles(allSubtitles);
      stitchedSubtitles.sort((a, b) => a.time - b.time);
      const uniqueSubtitles = stitchedSubtitles.map((sub, idx) => ({
        ...sub,
        id: `sub_${idx + 1}_${Math.round(sub.time * 100)}`,
      }));
      setSubtitles(uniqueSubtitles);
      setInitialSubtitles(uniqueSubtitles); // Store initial AI hypotheses for active accent learning diff
      if (finalData?.remainingCredits !== undefined && currentUser) {
        const updated = { ...currentUser, credits: finalData.remainingCredits };
        setCurrentUser(updated);
        localStorage.setItem("saizup_user", JSON.stringify(updated));
      }

      setGenerationCaptionCount(stitchedSubtitles.length);
      setGenerationProgress(100);
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      showToast(`ສ້າງຊັບສຳເລັດ ${stitchedSubtitles.length} ຊ່ວງ (16kHz Sync) ຈາກຄລິບ ${Math.round(videoDuration)} ວິນາທີ · ${finalData?.costCredits || 0} ເຄຣດິດ`);
    } catch (err: any) {
      console.error(err);
      showToast(`❌ ຂໍ້ຜິດພາດ: ${err.message || "ເກີດຂໍ້ຜິດພາດ"}`);
    } finally {
      window.clearInterval(elapsedInterval);
      setGenerationElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
      setIsGenerating(false);
      setStepText("");
    }
  };

  // Subtitle Block Editing
  const updateSubtitleText = (id: string, text: string) => {
    setSubtitles((prev) =>
      prev.map((s) => (s.id === id ? { ...s, text, words: segmentWords(text, selectedLanguage === "mixed" ? "lo" : selectedLanguage).map((word) => ({ text: word })) } : s))
    );
  };

  const updateSubtitleTiming = (id: string, field: "time" | "endTime", value: number) => {
    if (!Number.isFinite(value)) return;
    setSubtitles((current) => current.map((subtitle) => {
      if (subtitle.id !== id) return subtitle;
      const maxTime = videoDuration > 0 ? videoDuration : Number.POSITIVE_INFINITY;
      if (field === "time") {
        const time = Math.min(Math.max(0, value), Math.max(0, maxTime - 0.1));
        const endTime = Math.min(maxTime, Math.max(subtitle.endTime, time + 0.1));
        return { ...subtitle, time: Number(time.toFixed(2)), endTime: Number(endTime.toFixed(2)) };
      }
      const endTime = Math.min(maxTime, Math.max(subtitle.time + 0.1, value));
      return { ...subtitle, endTime: Number(endTime.toFixed(2)) };
    }));
  };

  const updateSubtitleTranslation = (id: string, translatedText: string) => {
    setSubtitles((current) => current.map((subtitle) => subtitle.id === id ? { ...subtitle, translatedText } : subtitle));
    if (translatedText.trim()) setShowTranslation(true);
  };

  // Continuous Active Learning Feedback Loop:
  // Automatically learn regional accents and vocabulary corrections from user edits
  useEffect(() => {
    if (subtitles.length === 0 || initialSubtitles.length === 0) return;

    // Detect if there are meaningful text changes between original heard and edited subtitles
    const hasEdits = subtitles.some((sub, i) => {
      const orig = initialSubtitles[i];
      if (!orig) return false;
      const t1 = orig.text.trim();
      const t2 = sub.text.trim();
      return t1.length > 0 && t2.length > 0 && t1 !== t2;
    });

    if (!hasEdits) return;

    const timer = setTimeout(async () => {
      setIsTeachingAI(true);
      try {
        const res = await fetch("/api/ai/learn-accent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            originalSubtitles: initialSubtitles,
            editedSubtitles: subtitles,
            dialect: selectedDialect,
            language: selectedLanguage,
            userEmail: currentUser?.email,
          }),
        });
        const data = await res.json();
        if (data.success) {
          if (typeof data.totalLearnedInSystem === "number") {
            setLearnedTotal(data.totalLearnedInSystem);
          }
          // Update baseline so we don't trigger the same diff repeatedly
          setInitialSubtitles(subtitles.map((s) => ({ ...s })));
          if (data.learnedCount > 0) {
            showToast(`🧠 AI ຮຽນຮູ້ສຳນຽງອັດຕະໂນມັດແລ້ວ (+${data.learnedCount} ຄຳສັບໃໝ່)`);
          }
        }
      } catch (err: any) {
        console.warn("Auto accent learning background sync error:", err);
      } finally {
        setIsTeachingAI(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [subtitles, initialSubtitles, selectedDialect, selectedLanguage, currentUser]);

  const handleTranslateSubtitles = async () => {
    if (subtitles.length === 0) {
      showToast("ຖອດສຽງກ່ອນແລ້ວຈຶ່ງແປຊັບ");
      return;
    }
    if (!currentUser?.email) {
      setIsAuthOpen(true);
      showToast("ກະລຸນາເຂົ້າລະບົບກ່ອນແປຊັບ");
      return;
    }
    setIsTranslating(true);
    setTranslationProgress(0);
    setTranslationCompleted(0);
    setTranslationTotal(subtitles.length);
    setTranslationElapsedSeconds(0);
    setTranslationFinalizing(false);
    const startedAt = Date.now();
    const elapsedInterval = window.setInterval(() => {
      setTranslationElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    try {
      const response = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subtitles: subtitles.map(({ id, time, endTime, text }) => ({ id, time, endTime, text })),
          targetLang: translationTarget,
          aiVersion,
          userEmail: currentUser.email,
        }),
      });

      const syncCredits = (remainingCredits: unknown) => {
        if (typeof remainingCredits !== "number") return;
        const updatedUser = { ...currentUser, credits: remainingCredits };
        setCurrentUser(updatedUser);
        localStorage.setItem("saizup_user", JSON.stringify(updatedUser));
      };

      if (!response.ok || !response.headers.get("content-type")?.includes("application/x-ndjson")) {
        const errorData = await response.json().catch(() => ({}));
        syncCredits(errorData.remainingCredits);
        throw new Error(errorData.error || "ແປຊັບບໍ່ສຳເລັດ");
      }

      if (!response.body) throw new Error("ບໍ່ສາມາດອ່ານຄວາມຄືບໜ້າການແປໄດ້");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let resultData: any = null;
      let streamError: string | null = null;

      const handleProgressEvent = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line);
        if (event.type === "started" || event.type === "progress") {
          if (typeof event.completed === "number") setTranslationCompleted(event.completed);
          if (typeof event.total === "number") setTranslationTotal(event.total);
          if (typeof event.percent === "number") {
            setTranslationProgress(event.percent);
            setTranslationFinalizing(event.percent === 100);
          }
        } else if (event.type === "complete") {
          resultData = event;
          setTranslationFinalizing(false);
        } else if (event.type === "error") {
          syncCredits(event.remainingCredits);
          streamError = event.error || "ແປຊັບບໍ່ສຳເລັດ";
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) handleProgressEvent(line);
      }
      buffer += decoder.decode();
      if (buffer.trim()) handleProgressEvent(buffer);
      if (streamError) throw new Error(streamError);
      if (!resultData?.success || !Array.isArray(resultData.subtitles)) {
        throw new Error("ການແປສິ້ນສຸດກ່ອນສົ່ງຜົນຄຳແປ");
      }

      syncCredits(resultData.remainingCredits);
      setSubtitles((current) => current.map((subtitle, index) => ({
        ...subtitle,
        translatedText: resultData.subtitles[index]?.text || subtitle.translatedText,
      })));
      setShowTranslation(true);
      setTranslationCompleted(resultData.subtitles.length);
      setTranslationTotal(resultData.subtitles.length);
      setTranslationProgress(100);
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      showToast(`ແປຊັບສຳເລັດ · ຫັກ ${resultData.creditsDeducted ?? 0} ເຄຣດິດ · ເຫຼືອ ${resultData.remainingCredits ?? currentUser.credits} ເຄຣດິດ`);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "ແປຊັບບໍ່ສຳເລັດ");
    } finally {
      window.clearInterval(elapsedInterval);
      setTranslationElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
      setIsTranslating(false);
    }
  };

  const saveCurrentPreset = () => {
    const name = presetName.trim();
    if (!name) {
      showToast("ໃສ່ຊື່ preset ກ່ອນບັນທຶກ");
      return;
    }
    setSavedCaptionPresets((current) => [...current, {
      name,
      presetId: selectedPreset,
      effect: selectedEffect,
      captionSize,
      captionBottom,
      captionColor,
      highlightColor,
      fontFamily,
      backgroundMode,
      backgroundColor,
      backgroundOpacity,
      backgroundPadding,
      backgroundRadius,
      textShadowEnabled,
      textShadowBlur,
      outlineEnabled,
      outlineColor,
      outlineWidth,
      maxWordsPerCaption,
    }]);
    setPresetName("");
    showToast(`ບັນທຶກ preset “${name}” ແລ້ວ`);
  };

  const applySavedPreset = (preset: (typeof savedCaptionPresets)[number]) => {
    const legacyEffectIds = ["bounce", "karaoke", "typewriter", "fade", "highlight"];
    const savedStyleExists = PRESET_STYLES.some((style) => style.id === preset.presetId);
    setSelectedPreset(savedStyleExists ? preset.presetId : "clean");
    setSelectedEffect(preset.effect ?? (legacyEffectIds.includes(preset.presetId) ? preset.presetId as SubtitleEffect : "none"));
    setCaptionSize(preset.captionSize);
    setCaptionBottom(preset.captionBottom);
    setCaptionColor(preset.captionColor);
    setHighlightColor(preset.highlightColor);
    handleFontChange(preset.fontFamily);
    setBackgroundMode(preset.backgroundMode || "none");
    setBackgroundColor(preset.backgroundColor || "#000000");
    setBackgroundOpacity(preset.backgroundOpacity ?? 0.58);
    setBackgroundPadding(preset.backgroundPadding ?? 10);
    setBackgroundRadius(preset.backgroundRadius ?? 12);
               setTextShadowEnabled(preset.textShadowEnabled ?? false);
    setTextShadowBlur(preset.textShadowBlur ?? 4);
    setOutlineEnabled(preset.outlineEnabled ?? false);
    setOutlineColor(preset.outlineColor || "#000000");
    setOutlineWidth(preset.outlineWidth ?? 2);
    setMaxWordsPerCaption(preset.maxWordsPerCaption ?? 5);
  };

  const applyStylePreset = (preset: PresetStyle) => {
    setSelectedPreset(preset.id);
    setCaptionColor(preset.color);
    setHighlightColor(preset.accentColor);
    setBackgroundMode(preset.backgroundMode);
    setBackgroundColor(preset.backgroundColor);
    setBackgroundOpacity(preset.backgroundOpacity);
    setTextShadowEnabled(preset.shadow);
    setOutlineEnabled(false);
    if (preset.id === "tiktok") setSelectedEffect("karaoke");
  };

  const handleFontChange = (family: string) => {
    setFontFamily(family);
    if (typeof document !== "undefined") {
      void document.fonts.load(`700 ${captionSize}px "${family}"`).catch(() => undefined);
    }
  };

  const deleteSavedPreset = (index: number) => {
    setSavedCaptionPresets((current) => current.filter((_, presetIndex) => presetIndex !== index));
  };

  const translatedText = (subtitle: SubtitleItem) =>
    showTranslation && subtitle.translatedText ? subtitle.translatedText : subtitle.text;

  const displaySubtitles = useMemo(() => subtitles.flatMap((subtitle) => {
    const isTranslation = showTranslation && Boolean(subtitle.translatedText);
    const visibleText = isTranslation ? subtitle.translatedText || subtitle.text : subtitle.text;
    const visibleLanguage = isTranslation ? translationTarget : selectedLanguage === "mixed" ? "lo" : selectedLanguage;
    const words: SubtitleItem["words"] = isTranslation
      ? segmentWords(visibleText, visibleLanguage).map((text) => ({ text }))
      : subtitle.words?.length
        ? subtitle.words.filter((word) => word.text?.trim())
        : segmentWords(visibleText, visibleLanguage).map((text) => ({ text }));
    if (!words.length) return [{ ...subtitle, text: visibleText, translatedText: isTranslation ? visibleText : undefined }];

    const blockDuration = Math.max(0, subtitle.endTime - subtitle.time);
    const timedWords = words.map((word, index) => {
      const hasTiming = !isTranslation && Number.isFinite(word.startSec) && Number.isFinite(word.endSec);
      const startSec = hasTiming
        ? Math.max(subtitle.time, Math.min(subtitle.endTime, word.startSec as number))
        : subtitle.time + blockDuration * index / words.length;
      const endSec = hasTiming
        ? Math.max(startSec, Math.min(subtitle.endTime, word.endSec as number))
        : subtitle.time + blockDuration * (index + 1) / words.length;
      return { ...word, startSec, endSec };
    });

    const chunks: SubtitleItem[] = [];
    for (let offset = 0; offset < timedWords.length; offset += maxWordsPerCaption) {
      const chunkWords = timedWords.slice(offset, offset + maxWordsPerCaption);
      const firstWord = chunkWords[0];
      const lastWord = chunkWords[chunkWords.length - 1];
      const chunkText = chunkWords.map((word) => word.text.trim()).filter(Boolean).join(" ");
      chunks.push({
        ...subtitle,
        id: `${subtitle.id}-part-${chunks.length}`,
        groupId: subtitle.id,
        time: firstWord.startSec ?? subtitle.time,
        endTime: lastWord.endSec ?? subtitle.endTime,
        text: chunkText || visibleText,
        translatedText: isTranslation ? chunkText || visibleText : undefined,
        words: chunkWords,
      });
    }
    return chunks;
  }), [subtitles, maxWordsPerCaption, showTranslation, selectedLanguage, translationTarget]);

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
    displaySubtitles.forEach((s, idx) => {
      const formatTime = (sec: number) => {
        const hrs = String(Math.floor(sec / 3600)).padStart(2, "0");
        const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
        const secs = String(Math.floor(sec % 60)).padStart(2, "0");
        const ms = String(Math.floor((sec % 1) * 1000)).padStart(3, "0");
        return `${hrs}:${mins}:${secs},${ms}`;
      };

      srtContent += `${idx + 1}\n`;
      srtContent += `${formatTime(s.time)} --> ${formatTime(s.endTime)}\n`;
      srtContent += `${translatedText(s)}\n\n`;
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
    displaySubtitles.forEach((s, idx) => {
      const formatTime = (sec: number) => {
        const hrs = String(Math.floor(sec / 3600)).padStart(2, "0");
        const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
        const secs = String(Math.floor(sec % 60)).padStart(2, "0");
        const ms = String(Math.floor((sec % 1) * 1000)).padStart(3, "0");
        return `${hrs}:${mins}:${secs}.${ms}`;
      };

      vttContent += `${idx + 1}\n`;
      vttContent += `${formatTime(s.time)} --> ${formatTime(s.endTime)}\n`;
      vttContent += `${translatedText(s)}\n\n`;
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
    const assBlocks = displaySubtitles.map((s) => ({
      id: s.id,
      time: s.time,
      endTime: s.endTime,
      text: translatedText(s),
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

    const assContent = exportToASS(assBlocks, `SAIZUP_${selectedLanguage}`, {
      fontName: fontFamily,
      fontSize: Math.round(captionSize * 2.7),
      primaryColor: captionColor,
      secondaryColor: highlightColor,
      outlineColor,
      outlineWidth: outlineEnabled ? outlineWidth * 2.7 : 0,
      backgroundColor,
      backgroundMode,
      backgroundOpacity,
      backgroundPadding: backgroundPadding * 2.7,
      shadow: textShadowEnabled ? textShadowBlur / 2 : 0,
      marginV: captionBottom * 19.2,
      animation: selectedEffect === "none" ? "static" : selectedEffect,
      glow: activePresetConfig.id === "neon" ? 2 : 0,
    });
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
    const fullText = subtitles.map((s) => translatedText(s)).join("\n");
    navigator.clipboard.writeText(fullText);
    setCopiedSuccess(true);
    showToast("📋 ສຳເນົາຂໍ້ຄວາມຊັບທັງໝົດແລ້ວ!");
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  // Export Adobe Premiere Pro XML (.XML)
  const handleExportPremiereXML = () => {
    const blocks: SubtitleBlock[] = displaySubtitles.map((s) => ({
      id: s.id,
      time: s.time,
      endTime: s.endTime,
      text: translatedText(s),
      words: s.words?.map((w: any) => ({
        text: w.text,
        startSec: w.startSec !== undefined ? w.startSec : s.time,
        endSec: w.endSec !== undefined ? w.endSec : s.endTime,
        confidence: w.confidence || 0.95,
      })) || [],
      confidence: 0.98,
      cps: 14,
    }));
    const xmlContent = exportToPremiereXML(blocks, 30);
    const blob = new Blob([xmlContent], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subtitles_${selectedLanguage}_premiere.xml`;
    a.click();
    showToast("📥 ດາວໂຫຼດໄຟລ໌ Adobe Premiere Pro XML (.XML) ສຳເລັດແລ້ວ!");
  };

  // Export Apple Final Cut Pro XML (.FCPXML)
  const handleExportFCPXML = () => {
    const blocks: SubtitleBlock[] = displaySubtitles.map((s) => ({
      id: s.id,
      time: s.time,
      endTime: s.endTime,
      text: translatedText(s),
      words: s.words?.map((w: any) => ({
        text: w.text,
        startSec: w.startSec !== undefined ? w.startSec : s.time,
        endSec: w.endSec !== undefined ? w.endSec : s.endTime,
        confidence: w.confidence || 0.95,
      })) || [],
      confidence: 0.98,
      cps: 14,
    }));
    const fcpxmlContent = exportToFCPXML(blocks, 30);
    const blob = new Blob([fcpxmlContent], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subtitles_${selectedLanguage}_finalcut.fcpxml`;
    a.click();
    showToast("📥 ດາວໂຫຼດໄຟລ໌ Final Cut Pro FCPXML (.FCPXML) ສຳເລັດແລ້ວ!");
  };

  // Global Time Offset (+/- deltaSeconds)
  const handleApplyGlobalOffset = (deltaSeconds: number) => {
    if (!subtitles.length || deltaSeconds === 0) return;
    setSubtitles((prev) =>
      prev.map((sub) => {
        const newTime = Math.max(0, Number((sub.time + deltaSeconds).toFixed(3)));
        const newEndTime = Math.max(newTime + 0.2, Number((sub.endTime + deltaSeconds).toFixed(3)));
        const newWords = sub.words?.map((w: any) => ({
          ...w,
          startSec: w.startSec !== undefined ? Math.max(0, Number((w.startSec + deltaSeconds).toFixed(3))) : undefined,
          endSec: w.endSec !== undefined ? Math.max(0, Number((w.endSec + deltaSeconds).toFixed(3))) : undefined,
        }));
        return {
          ...sub,
          time: newTime,
          endTime: newEndTime,
          words: newWords,
        };
      })
    );
    showToast(`ປັບເວລາຊັບທັງໝົດ ${deltaSeconds > 0 ? `+${deltaSeconds}s` : `${deltaSeconds}s`} ສຳເລັດ!`);
  };

  // Restore Draft Handler
  const handleRestoreDraft = () => {
    try {
      const draft = localStorage.getItem("saizup_subtitle_draft");
      if (draft) {
        const parsed = JSON.parse(draft);
        if (Array.isArray(parsed.subtitles)) {
          setSubtitles(parsed.subtitles);
          setInitialSubtitles(parsed.subtitles);
          if (parsed.fontFamily) setFontFamily(parsed.fontFamily);
          if (parsed.captionSize) setCaptionSize(parsed.captionSize);
          if (parsed.captionColor) setCaptionColor(parsed.captionColor);
          setSavedDraftAvailable(false);
          showToast(`ກູ້ຄືນຮ່າງໂປຣເຈັກສຳເລັດແລ້ວ (${parsed.subtitles.length} ແຖວ)`);
        }
      }
    } catch {}
  };

  const handleExportVideo = async () => {
    const sourceVideo = videoRef.current;
    if (!sourceVideo || !videoFile?.type.startsWith("video/")) {
      showToast("ກະລຸນາເລືອກໄຟລ໌ວິດີໂອກ່ອນ");
      return;
    }
    if (!subtitles.length) {
      showToast("ສ້າງຊັບໄຕເຕິລກ່ອນສົ່ງອອກ");
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      showToast("ບຣາວເຊີນີ້ບໍ່ຮອງຮັບການສົ່ງອອກວິດີໂອ");
      return;
    }

    const videoWithCapture = sourceVideo as HTMLVideoElement & {
      captureStream?: () => MediaStream;
      webkitCaptureStream?: () => MediaStream;
    };
    const captureSource = videoWithCapture.captureStream || videoWithCapture.webkitCaptureStream;
    if (!captureSource || !sourceVideo.videoWidth || !sourceVideo.videoHeight) {
      showToast("ອ່ານຂະໜາດວິດີໂອບໍ່ໄດ້ ລອງເປີດຄລິບອີກຄັ້ງ");
      return;
    }

    setIsExportingVideo(true);
    setExportProgress(0);
    const originalWidth = sourceVideo.videoWidth;
    const originalHeight = sourceVideo.videoHeight;
    const stageWidth = videoStageRef.current?.getBoundingClientRect().width || sourceVideo.getBoundingClientRect().width || originalWidth;
    const displayedVideoWidth = stageWidth * (videoContentRect.width / 100);
    const exportScale = originalWidth / Math.max(1, displayedVideoWidth);
    await document.fonts.load(`700 ${Math.max(1, Math.round(captionSize * exportScale))}px "${fontFamily}"`);
    const canvas = document.createElement("canvas");
    canvas.width = originalWidth;
    canvas.height = originalHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setIsExportingVideo(false);
      showToast("ສ້າງພື້ນທີ່ສົ່ງອອກບໍ່ສຳເລັດ");
      return;
    }

    const canvasStream = canvas.captureStream(30);
    const sourceStream = captureSource.call(sourceVideo);
    sourceStream.getAudioTracks().forEach((track) => canvasStream.addTrack(track));
    const supportedType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
      .find((type) => MediaRecorder.isTypeSupported(type));
    if (!supportedType) {
      canvasStream.getTracks().forEach((track) => track.stop());
      sourceStream.getTracks().forEach((track) => track.stop());
      setIsExportingVideo(false);
      showToast("ບຣາວເຊີບໍ່ຮອງຮັບຮູບແບບວິດີໂອສົ່ງອອກ");
      return;
    }

    try {
      const recorder = new MediaRecorder(canvasStream, {
        mimeType: supportedType,
        videoBitsPerSecond: Math.min(20_000_000, Math.max(2_500_000, originalWidth * originalHeight * 4)),
      });
      const recordedParts: BlobPart[] = [];
      const resultBlob = new Promise<Blob>((resolve, reject) => {
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) recordedParts.push(event.data);
        };
        recorder.onerror = () => reject(new Error("ບັນທຶກວິດີໂອບໍ່ສຳເລັດ"));
        recorder.onstop = () => resolve(new Blob(recordedParts, { type: supportedType }));
      });

      let frameId = 0;
      let previousPercent = -1;
      const drawFrame = () => {
        if (sourceVideo.readyState >= 2) context.drawImage(sourceVideo, 0, 0, originalWidth, originalHeight);
        const time = sourceVideo.currentTime;
        const active = displaySubtitles.find((item) => time >= item.time && time <= item.endTime);
        if (active) {
          const activeText = translatedText(active);
          const fontSize = Math.max(1, Math.round(captionSize * exportScale));
          const maxTextWidth = originalWidth * 0.88;
          context.font = `700 ${fontSize}px "${fontFamily}", "Noto Sans Lao", "Noto Sans Thai", Arial, sans-serif`;
          let renderedText = activeText;
          if (selectedEffect === "typewriter") {
            const progress = Math.min(1, Math.max(0, (time - active.time) / Math.max(0.1, active.endTime - active.time)) * 1.4);
            renderedText = activeText.slice(0, Math.ceil(activeText.length * progress));
          }
          const baseTokens = !showTranslation && active.words.length > 0 && selectedEffect !== "typewriter"
            ? active.words.map((word) => word.text).filter(Boolean)
            : renderedText.split(/\s+/).filter(Boolean);
          const preserveWordGaps = selectedEffect !== "typewriter" && (showTranslation || active.words.length > 0);
          const tokenSeparator = preserveWordGaps || /\s/.test(renderedText) ? " " : "";
          const wordStartAt = (index: number) => {
            const sourceWord = active.words[index];
            const hasTiming = Number.isFinite(sourceWord?.startSec) && Number.isFinite(sourceWord?.endSec);
            return hasTiming ? sourceWord.startSec as number : active.time + ((active.endTime - active.time) * index) / Math.max(baseTokens.length, 1);
          };
          const spokenWordIndex = baseTokens.reduce((lastIndex, _word, index) => time >= wordStartAt(index) ? index : lastIndex, -1);
          const tokens = baseTokens.map((text, index) => ({ text, index })).filter(({ index }) => selectedEffect !== "word-by-word" || time >= wordStartAt(index));
          const lines: Array<Array<{ text: string; index: number }>> = [];
          let line: Array<{ text: string; index: number }> = [];
          for (const token of tokens) {
            const candidate = [...line, token];
            if (line.length && context.measureText(candidate.map((token) => token.text).join(tokenSeparator)).width > maxTextWidth) {
              lines.push(line);
              line = [token];
            } else line = candidate;
          }
          if (line.length) lines.push(line);

          const lineHeight = Math.ceil(fontSize * 1.28);
          const baselineY = originalHeight * (1 - captionBottom / 100);
          const startY = baselineY - (lines.length - 1) * lineHeight;
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.lineJoin = "round";
          context.lineWidth = outlineWidth * exportScale;
          context.strokeStyle = outlineColor;
          if (selectedEffect === "fade") {
            context.globalAlpha = Math.min(1, (time - active.time) / 0.25, (active.endTime - time) / 0.25);
          }
          if (activePresetConfig.id === "neon") {
            context.shadowColor = captionColor;
            context.shadowBlur = fontSize * 0.8;
          } else {
            context.shadowColor = "rgba(0,0,0,.95)";
            context.shadowBlur = textShadowEnabled ? textShadowBlur * exportScale : 0;
          }
          lines.forEach((text, index) => {
            const widths = text.map((token) => context.measureText(token.text).width);
            const spaceWidth = tokenSeparator ? context.measureText(tokenSeparator).width : 0;
            const lineWidth = widths.reduce((total, width) => total + width, 0) + spaceWidth * Math.max(0, text.length - 1);
            const lineY = startY + index * lineHeight;
            if (backgroundMode !== "none") {
              const paddingX = backgroundPadding * exportScale * 1.4;
              const paddingY = backgroundPadding * exportScale;
              const radius = backgroundRadius * exportScale;
              context.save();
              context.shadowBlur = 0;
              context.fillStyle = backgroundMode === "solid" ? backgroundColor : hexToRgba(backgroundColor, backgroundOpacity);
              context.beginPath();
              context.roundRect(
                originalWidth / 2 - lineWidth / 2 - paddingX,
                lineY - lineHeight / 2 - paddingY,
                lineWidth + paddingX * 2,
                lineHeight + paddingY * 2,
                radius,
              );
              context.fill();
              context.restore();
            }
            let x = originalWidth / 2 - lineWidth / 2;
            text.forEach((token, tokenIndex) => {
              const sourceWord = active.words[token.index];
              const validTiming = Number.isFinite(sourceWord?.startSec) && Number.isFinite(sourceWord?.endSec);
              const wordStart = validTiming
                ? sourceWord.startSec as number
                : active.time + ((active.endTime - active.time) * token.index) / Math.max(baseTokens.length, 1);
              const wordEnd = validTiming
                ? sourceWord.endSec as number
                : active.time + ((active.endTime - active.time) * (token.index + 1)) / Math.max(baseTokens.length, 1);
              const isWordActive = time >= wordStart && (time < wordEnd || token.index === baseTokens.length - 1 && time <= wordEnd);
              const bounce = selectedEffect === "bounce" && isWordActive
                ? Math.sin((time - wordStart) * 18) * fontSize * 0.12
                : 0;
              const y = lineY + bounce;
              if (isWordActive && selectedEffect === "highlight") {
                context.save();
                context.shadowBlur = 0;
                context.fillStyle = highlightColor;
                context.fillRect(x + widths[tokenIndex] / 2 - fontSize * 0.08, y - fontSize * 0.56, widths[tokenIndex] + fontSize * 0.16, fontSize * 1.12);
                context.restore();
              }
              const shouldHighlight = selectedEffect === "karaoke"
                ? token.index === spokenWordIndex
                : selectedEffect === "bounce" && isWordActive;
              if (outlineEnabled) context.strokeText(token.text, x + widths[tokenIndex] / 2, y);
              context.fillStyle = isWordActive && selectedEffect === "highlight" ? "#111827" : shouldHighlight ? highlightColor : captionColor;
              context.fillText(token.text, x + widths[tokenIndex] / 2, y);
              x += widths[tokenIndex] + spaceWidth;
            });
          });
          context.shadowBlur = 0;
          context.globalAlpha = 1;
        }
        const percent = Math.min(100, Math.floor((time / Math.max(sourceVideo.duration, 1)) * 100));
        if (percent !== previousPercent) {
          previousPercent = percent;
          setExportProgress(percent);
        }
        frameId = requestAnimationFrame(drawFrame);
      };

      if (sourceVideo.currentTime > 0.05) {
        await new Promise<void>((resolve) => {
          sourceVideo.addEventListener("seeked", () => resolve(), { once: true });
          sourceVideo.currentTime = 0;
        });
      }
      recorder.start(1000);
      const stopOnEnded = () => {
        cancelAnimationFrame(frameId);
        if (recorder.state !== "inactive") recorder.stop();
      };
      sourceVideo.addEventListener("ended", stopOnEnded, { once: true });
      drawFrame();
      await sourceVideo.play();
      const blob = await resultBlob;
      sourceVideo.removeEventListener("ended", stopOnEnded);
      const outputUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = outputUrl;
      anchor.download = `${videoFile.name.replace(/\.[^.]+$/, "")}_subtitled.webm`;
      anchor.click();
      setExportProgress(100);
      showToast(`ສົ່ງອອກວິດີໂອ ${originalWidth}×${originalHeight} ສຳເລັດ`);
      window.setTimeout(() => URL.revokeObjectURL(outputUrl), 60_000);
    } catch (error: unknown) {
      showToast(error instanceof Error ? error.message : "ສົ່ງອອກວິດີໂອບໍ່ສຳເລັດ");
    } finally {
      canvasStream.getTracks().forEach((track) => track.stop());
      sourceStream.getTracks().forEach((track) => track.stop());
      sourceVideo.pause();
      setIsPlaying(false);
      setIsExportingVideo(false);
    }
  };

  // Active Subtitle for current playhead
  const activeSub = displaySubtitles.find((s) => currentTime >= s.time && currentTime <= s.endTime);
  const activeCaptionText = activeSub ? translatedText(activeSub) : "";
  const activeSubtitleProgress = activeSub ? Math.min(1, Math.max(0, (currentTime - activeSub.time) / Math.max(0.1, activeSub.endTime - activeSub.time)) * 1.4) : 0;
  const typewriterText = activeSub ? activeCaptionText.slice(0, Math.ceil(activeCaptionText.length * activeSubtitleProgress)) : "";
  const activeSubtitleWords = activeSub
    ? showTranslation && activeSub.translatedText
      ? activeSub.words?.length ? activeSub.words : segmentWords(activeCaptionText, translationTarget).map((text) => ({ text }))
      : activeSub.words?.length ? activeSub.words : segmentWords(activeCaptionText, selectedLanguage === "mixed" ? "lo" : selectedLanguage).map((text) => ({ text }))
    : [];
  const activeSpeechWordIndex = activeSub ? activeSubtitleWords.reduce((lastIndex: number, word: any, index: number) => {
    const hasTiming = Number.isFinite(word.startSec) && Number.isFinite(word.endSec);
    const wordStart = hasTiming ? word.startSec as number : activeSub.time + ((activeSub.endTime - activeSub.time) * index) / Math.max(activeSubtitleWords.length, 1);
    return currentTime >= wordStart ? index : lastIndex;
  }, -1) : -1;
  const previewCardWords = STYLE_PREVIEW_WORDS;
  const previewHasMoreWords = false;
  const previewCardText = `${previewCardWords.join(" ")}${previewHasMoreWords ? "…" : ""}`;
  useEffect(() => {
    if (settingsTab !== "style") {
      setSampleWordStep(0);
      return;
    }
    setSampleWordStep(0);
    const sampleTimer = window.setInterval(() => {
      setSampleWordStep((step) => (step + 1) % STYLE_PREVIEW_WORDS.length);
    }, 650);
    return () => window.clearInterval(sampleTimer);
  }, [settingsTab]);
  const activePresetConfig = PRESET_STYLES.find((p) => p.id === selectedPreset) || PRESET_STYLES[0];
  const activeSafeGuide = safeAreaPreset === "off" ? null : SAFE_AREA_GUIDES[safeAreaPreset];

  return (
    <div className="min-h-screen bg-[#0A0B10] text-slate-100 flex flex-col font-sans">
      <style>{uploadedFonts.map((font) => `@font-face { font-family: "${font.family}"; src: url("${font.url}") format("${font.format}"); font-display: swap; }`).join("\n")}</style>
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
            <img
              src="/brand/saizup-symbol.png"
              alt="SAIZUP AI"
              width={28}
              height={28}
              style={{ width: "28px", height: "28px", maxWidth: "28px", maxHeight: "28px" }}
              className="h-7 w-7 object-contain"
            />
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
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161824] hover:bg-[#25283A] text-slate-300 hover:text-[#12E8FF] border border-slate-700 text-xs font-medium transition-colors"
          >
            <Scissors className="w-3.5 h-3.5 text-yellow-400" />
            <span>ສະຫຼັບໄປ Video Studio (Full)</span>
          </Link>

          {/* User Status / Credits Pill */}
          {currentUser ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#161824] border border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-slate-200">{currentUser.name || currentUser.email}</span>
              <span className="text-slate-400">•</span>
              <span className="text-yellow-400 font-bold">🪙 {currentUser.credits ?? 15} เครดิต</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#182333] text-cyan-400 font-bold border border-slate-700">
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
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#12E8FF]">Subtitle Studio · 2 ຂັ້ນຕອນ</p>
            <h1 className="mt-1 text-xl sm:text-2xl font-bold text-white">ສ້າງຊັບໄຕເຕິລໃຫ້ວິດີໂອ</h1>
            <p className="mt-1 text-sm text-slate-400">ອັບໂຫຼດໄຟລ໌, ສ້າງຊັບດ້ວຍ AI ແລ້ວດາວໂຫຼດ.</p>
          </div>
          {videoFile && <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300"><Check className="h-3.5 w-3.5" />{videoFile.name}{videoDimensions ? ` · ${videoDimensions.width}×${videoDimensions.height}` : ""} · {Math.round(videoDuration)}s</span>}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Video Player & Subtitle Preset Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Video Preview Card */}
          <div className="relative rounded-2xl bg-[#12131C] border border-[#262838] overflow-hidden flex flex-col shadow-xl">
            <div ref={videoStageRef} className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={(event) => {
                    const media = event.currentTarget;
                    if (media.videoWidth && media.videoHeight) setVideoDimensions({ width: media.videoWidth, height: media.videoHeight });
                  }}
                  onEnded={() => setIsPlaying(false)}
                />
              ) : (
                <div className="text-center p-8">
                  <Film className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 mb-4">ຍັງບໍ່ທັນມີວິດີໂອ. ກະລຸນາອັບໂຫຼດ ຫຼື ເລືອກຕົວຢ່າງ</p>
                  <button
                    onClick={handleLoadDemo}
                    className="px-4 py-2 rounded-xl bg-[#1A1C29] hover:bg-[#25283B] border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
                  >
                    🎬 ທົດລອງວິດີໂອຕົວຢ່າງ (15s Demo)
                  </button>
                </div>
              )}

              {activeSafeGuide && (
                <div
                  className="absolute pointer-events-none z-10 rounded-lg border-2 border-dashed"
                  style={{
                    top: `${videoContentRect.top + videoContentRect.height * activeSafeGuide.top / 100}%`,
                    left: `${videoContentRect.left + videoContentRect.width * activeSafeGuide.left / 100}%`,
                    width: `${videoContentRect.width * (100 - activeSafeGuide.left - activeSafeGuide.right) / 100}%`,
                    height: `${videoContentRect.height * (100 - activeSafeGuide.top - activeSafeGuide.bottom) / 100}%`,
                    borderColor: activeSafeGuide.color,
                  }}
                >
                  <span className="absolute -top-5 left-0 rounded px-1.5 py-0.5 text-[10px] font-bold" style={{ color: activeSafeGuide.color, backgroundColor: "rgba(0,0,0,.75)" }}>
                    {activeSafeGuide.label} · Safe Area
                  </span>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-[9px]" style={{ color: activeSafeGuide.color, backgroundColor: "rgba(0,0,0,.65)" }}>
                    ວາງຄຳບັນຍາຍໃນຂອບນີ້
                  </span>
                </div>
              )}

              {/* Render Active Subtitle Overlay with Word-Level Micro-Timing & Emojis */}
              {activeSub && (
                <div className="absolute pointer-events-none z-20" style={{ left: `${videoContentRect.left}%`, top: `${videoContentRect.top}%`, width: `${videoContentRect.width}%`, height: `${videoContentRect.height}%` }}>
                  <div className="absolute inset-x-4 flex justify-center" style={{ bottom: `${captionBottom}%` }}>
                    <div
                    className={`saizup-caption-font max-w-[90%] px-4 py-2.5 rounded-2xl text-center font-bold transition-all flex flex-wrap items-center justify-center gap-1.5 ${selectedEffect === "fade" ? "animate-in fade-in duration-300" : ""}`}
                    style={{
                      color: captionColor,
                      fontSize: `${captionSize}px`,
                      fontFamily: `"${fontFamily}", "Noto Sans Lao", "Noto Sans Thai", sans-serif`,
                      backgroundColor: backgroundMode === "solid" ? backgroundColor : backgroundMode === "translucent" ? hexToRgba(backgroundColor, backgroundOpacity) : "transparent",
                      padding: `${backgroundPadding}px ${backgroundPadding * 1.4}px`,
                      borderRadius: `${backgroundRadius}px`,
                      opacity: selectedEffect === "fade" ? Math.min(1, (currentTime - activeSub.time) / 0.25, (activeSub.endTime - currentTime) / 0.25) : 1,
                      textShadow: [
                        outlineEnabled
                          ? `${outlineWidth}px ${outlineWidth}px 0 ${outlineColor}, -${outlineWidth}px -${outlineWidth}px 0 ${outlineColor}, ${outlineWidth}px -${outlineWidth}px 0 ${outlineColor}, -${outlineWidth}px ${outlineWidth}px 0 ${outlineColor}`
                          : "",
                        activePresetConfig.glow || "",
                        textShadowEnabled ? `0 1px ${textShadowBlur}px rgba(0, 0, 0, 0.95)` : "",
                      ].filter(Boolean).join(", ") || "none",
                    }}
                  >
                    {selectedEffect === "typewriter" ? (
                      <span>{typewriterText}</span>
                    ) : activeSubtitleWords.length > 0 ? (
                      activeSubtitleWords.map((w: any, wIdx: number) => {
                        const hasTiming = Number.isFinite(w.startSec) && Number.isFinite(w.endSec);
                        const wordStart = hasTiming ? w.startSec as number : activeSub.time + ((activeSub.endTime - activeSub.time) * wIdx) / activeSubtitleWords.length;
                        const wordEnd = hasTiming ? w.endSec as number : activeSub.time + ((activeSub.endTime - activeSub.time) * (wIdx + 1)) / activeSubtitleWords.length;
                        if (selectedEffect === "word-by-word" && currentTime < wordStart) return null;
                        const isWordActive = currentTime >= wordStart && (currentTime < wordEnd || wIdx === activeSubtitleWords.length - 1 && currentTime <= wordEnd);
                        const shouldHighlight = selectedEffect === "karaoke"
                          ? wIdx === activeSpeechWordIndex
                          : selectedEffect === "bounce" && isWordActive;
                        const wordStyle = isWordActive && selectedEffect === "highlight"
                          ? { color: "#111827", backgroundColor: highlightColor, borderRadius: "0.22em", paddingInline: "0.16em" }
                          : shouldHighlight ? { color: highlightColor } : undefined;
                        return (
                        <span
                            key={wIdx}
                            className={`inline-flex items-center transition-all duration-100 ${isWordActive && selectedEffect === "bounce" ? "filter drop-shadow-[0_0_12px_rgba(255,224,27,0.9)]" : "opacity-90"}`}
                            style={{ transform: isWordActive && selectedEffect === "bounce" ? `translateY(${Math.sin((currentTime - wordStart) * 18) * captionSize * 0.12}px) scale(1.1)` : "scale(1)" }}
                          >
                            <span style={wordStyle}>{w.text}</span>
                            {w.emoji && <span className="ml-1 text-sm">{w.emoji}</span>}
                          </span>
                        );
                      })
                    ) : (
                      <span>{activeCaptionText}</span>
                    )}
                    </div>
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
                  onClick={() => setSafeAreaPreset((current) => current === "off" ? "tiktok" : "off")}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                    safeAreaPreset !== "off" ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40" : "bg-[#1B1E2E] text-slate-400 border-slate-700"
                  }`}
                  title="ເປີດ/ປິດເສັ້ນ Safe Area (ປັບແພລດຟອມໃນແຖບ ຂະໜາດ)"
                >
                  {safeAreaPreset !== "off" ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span className="hidden sm:inline">Safe Area</span>
                </button>

                <span className="rounded-md border border-[#12E8FF]/20 bg-[#182333] px-2 py-0.5 text-[10px] font-medium text-[#12E8FF]">
                  ຖອດສຽງຄົບທຸກຊ່ວງ · ຄິດເຄຣດິດຕາມຄວາມຍາວ
                </span>
              </div>
            )}

            {/* Interactive Audio Waveform Bar (16kHz Audio Sync & Playhead Scrubbing) */}
            {videoUrl && (
              <div className="px-3 py-2 bg-[#10121B] border-t border-[#1F2233] flex flex-col gap-1.5 select-none">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>Audio Waveform (16kHz Native STT Sync)</span>
                  </span>
                  <span>
                    {activeSub
                      ? `ຊັບທີ່ເລືອກ: ${activeSub.time.toFixed(1)}s - ${activeSub.endTime.toFixed(1)}s`
                      : "ຄລິກເທິງຄື້ນສຽງເພື່ອເລື່ອນເວລາ"}
                  </span>
                </div>
                {/* Waveform track with scrub indicator */}
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    const newTime = ratio * (videoDuration || 15);
                    setCurrentTime(Number(newTime.toFixed(2)));
                    if (videoRef.current) videoRef.current.currentTime = newTime;
                  }}
                  className="relative h-9 w-full bg-[#161826] rounded-lg overflow-hidden flex items-end gap-[2px] px-1.5 cursor-pointer hover:border-cyan-500/50 border border-slate-800 transition-colors group"
                >
                  {/* Waveform vertical bars */}
                  {(audioWaveformBars.length > 0
                    ? audioWaveformBars
                    : Array.from({ length: 64 }, (_, i) => 12 + Math.sin(i * 0.45) * 8 + ((i * 7) % 9))
                  ).map((h, bIdx) => {
                    const barPct = (bIdx / 64) * 100;
                    const isPlayed = (currentTime / (videoDuration || 15)) * 100 >= barPct;
                    return (
                      <div
                        key={bIdx}
                        style={{ height: `${Math.max(4, h)}px` }}
                        className={`flex-1 rounded-t-xs transition-colors ${
                          isPlayed ? "bg-cyan-400 opacity-90" : "bg-slate-600 opacity-40 group-hover:opacity-60"
                        }`}
                      />
                    );
                  })}
                  {/* Subtitle regions on waveform */}
                  {subtitles.map((sub) => {
                    const leftPct = (sub.time / (videoDuration || 15)) * 100;
                    const widthPct = ((sub.endTime - sub.time) / (videoDuration || 15)) * 100;
                    const isActive = activeSub?.id === sub.id;
                    return (
                      <div
                        key={sub.id}
                        style={{ left: `${leftPct}%`, width: `${Math.max(1, widthPct)}%` }}
                        className={`absolute top-0 bottom-0 pointer-events-none rounded-xs border-x ${
                          isActive ? "bg-cyan-400/25 border-cyan-300" : "bg-yellow-400/10 border-yellow-400/25"
                        }`}
                      />
                    );
                  })}
                  {/* Current Playhead Scrubber needle */}
                  <div
                    style={{ left: `${((currentTime / (videoDuration || 15)) * 100).toFixed(2)}%` }}
                    className="absolute top-0 bottom-0 w-0.5 bg-white z-20 pointer-events-none shadow-[0_0_8px_#ffffff]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Subtitle Preset Selector */}
          <div className="rounded-2xl bg-[#12131C] border border-slate-700 overflow-hidden">
            <div className="flex gap-2 overflow-x-auto border-b border-slate-700 p-3">
              {([ ["style", "ສະໄຕລ໌"], ["font", "ຟອນ ແລະ ສີ"], ["size", "ຂະໜາດ"], ["background", "ພື້ນຫຼັງ"], ["translate", "ຄຳແປ"], ["mine", "ຂອງຂ້ອຍ"] ] as const).map(([tab, label]) => (
                <button key={tab} onClick={() => setSettingsTab(tab)} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${settingsTab === tab ? "border-[#12E8FF] bg-[#12E8FF] text-white" : "border-slate-700 text-slate-300 hover:border-slate-500"}`}>{label}</button>
              ))}
            </div>
            {settingsTab === "style" && <div className="flex flex-col gap-5 p-4">
              <section className="flex flex-col gap-2">
                <div className="flex items-baseline gap-2"><h4 className="text-sm font-bold text-slate-200">ຮູບແບບສຳເລັດຮູບ</h4><span className="ml-auto text-xs text-slate-400">{PRESET_STYLES.find((preset) => preset.id === selectedPreset)?.name}</span></div>
                <p className="-mt-1 text-[11px] text-slate-400">ແຕະອັນດຽວເພື່ອໃຊ້ຊຸດສີ ແລະພື້ນຫຼັງ ແລ້ວປັບຕໍ່ໄດ້</p>
                <div className="-mx-4 min-w-0 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" onWheel={(event) => { const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX; if (delta && event.currentTarget.scrollWidth > event.currentTarget.clientWidth) { event.preventDefault(); event.currentTarget.scrollLeft += delta; } }}><div className="flex w-max gap-2">
                  {PRESET_STYLES.map((preset) => (
                    (() => {
                      const motionClass = preset.id === "neon" ? "saizup-preset-preview-neon" : preset.id === "clean" ? "saizup-preset-preview-clean" : preset.id === "news" ? "saizup-preset-preview-news" : "";
                      return <button type="button" key={preset.id} aria-pressed={selectedPreset === preset.id} aria-label={preset.name} onClick={() => applyStylePreset(preset)} className={`w-32 shrink-0 overflow-hidden rounded-xl border text-left transition ${selectedPreset === preset.id ? "border-[#12E8FF] ring-1 ring-[#12E8FF]" : "border-slate-700 hover:border-slate-500"}`}>
                      <div className="relative flex h-16 items-center justify-center overflow-hidden bg-[#1d2430] px-2">
                        <div className={`saizup-caption-font flex max-w-full flex-wrap justify-center gap-x-1 rounded px-1 text-center text-sm font-bold leading-tight ${motionClass}`} style={{ color: "#FFFFFF", fontFamily: `"${fontFamily}", "Noto Sans Lao", "Noto Sans Thai", sans-serif`, backgroundColor: preset.backgroundMode === "none" ? "transparent" : hexToRgba(preset.backgroundColor, preset.backgroundOpacity), textShadow: [preset.id === "neon" ? "0 0 7px #FFE01B" : "", preset.shadow ? "0 1px 2px rgba(0,0,0,.75)" : ""].filter(Boolean).join(", ") || "none" }}>
                          {previewCardWords.map((word, index) => {
                            const isLast = index === previewCardWords.length - 1;
                            if (preset.id === "tiktok" || preset.id === "karaoke-style") return <span key={`${word}-${index}`} style={{ color: index === sampleWordStep ? "#FFE01B" : "#FFFFFF" }}>{word}</span>;
                            return <span key={`${word}-${index}`} style={{ color: isLast ? "#FFE01B" : "#FFFFFF" }}>{word}</span>;
                          })}{previewHasMoreWords && <span style={{ color: preset.color }}>…</span>}
                        </div>
                      </div>
                      <span className="block truncate px-2 py-1.5 text-center text-xs font-bold text-slate-100">{preset.name}</span>
                    </button>;
                    })()
                  ))}
                </div></div>
              </section>

              <section className="flex flex-col gap-2 border-t border-slate-700 pt-4">
                <div className="flex items-baseline gap-2"><h4 className="text-sm font-bold text-slate-200">ເອັບເຟັກ</h4><span className="ml-auto text-xs text-slate-400">{SUBTITLE_EFFECTS.find((effect) => effect.id === selectedEffect)?.name}</span></div>
                <div className="-mx-4 min-w-0 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" onWheel={(event) => { const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX; if (delta && event.currentTarget.scrollWidth > event.currentTarget.clientWidth) { event.preventDefault(); event.currentTarget.scrollLeft += delta; } }}><div className="flex w-max gap-2">
                  {SUBTITLE_EFFECTS.map((effect) => {
                    const previewClass = effect.id === "fade" ? "saizup-preview-fade" : "";
                    return <button type="button" key={effect.id} aria-pressed={selectedEffect === effect.id} aria-label={effect.name} onClick={() => setSelectedEffect(effect.id)} className={`w-32 shrink-0 overflow-hidden rounded-xl border text-left transition ${selectedEffect === effect.id ? "border-[#12E8FF] ring-1 ring-[#12E8FF]" : "border-slate-700 hover:border-slate-500"}`}>
                      <div className="relative flex h-16 items-center justify-center overflow-hidden bg-[#1d2430] px-2">
                        <div className={`saizup-caption-font flex max-w-full flex-wrap justify-center gap-x-1 text-center text-sm font-bold ${previewClass}`} style={{ color: "#FFFFFF", fontFamily: `"${fontFamily}", "Noto Sans Lao", "Noto Sans Thai", sans-serif` }}>
                          {effect.id === "typewriter" ? <span className="relative inline-block"><span className="opacity-35">{previewCardText}</span><span aria-hidden="true" className="saizup-preview-typewriter absolute inset-0">{previewCardText}</span></span> : previewCardWords.map((word, index) => {
                            const isLast = index === previewCardWords.length - 1;
                            if (effect.id === "karaoke") return <span key={`${word}-${index}`} style={{ color: index === sampleWordStep ? "#FFE01B" : "#FFFFFF" }}>{word}</span>;
                            if (effect.id === "word-by-word") return <span key={`${word}-${index}`} style={{ opacity: index <= sampleWordStep ? 1 : 0 }}>{word}</span>;
                            if (isLast && effect.id === "highlight") return <span key={`${word}-${index}`} className="rounded px-0.5 text-slate-900" style={{ backgroundColor: "#FFE01B" }}>{word}</span>;
                            if (isLast && effect.id === "bounce") return <span key={`${word}-${index}`} className="saizup-preview-bounce">{word}</span>;
                            return <span key={`${word}-${index}`}>{word}</span>;
                          })}{previewHasMoreWords && <span>…</span>}
                        </div>
                      </div>
                      <span className="block truncate px-2 pt-1.5 text-xs font-bold text-slate-100">{effect.name}</span>
                      <span className="block h-6 truncate px-2 pb-1 text-[9px] text-slate-400">{effect.description}</span>
                    </button>;
                  })}
                </div></div>
              </section>
            </div>}
            {settingsTab === "font" && <div className="space-y-5 p-5">
              <label className="block text-xs text-slate-300">ຟອນຊັບໄຕເຕິລ
                <select value={fontFamily} onChange={(event) => handleFontChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-[#161824] px-3 py-2.5 text-sm text-white focus:border-[#12E8FF] focus:outline-none">
                  {["Noto Sans Lao", "Phetsarath OT", "Phetsarath", "Noto Serif Lao", "Lao Muang Khong", "Lao_Handwriting16", "Arial"].map((font) => <option key={font} value={font}>{font}</option>)}
                  {uploadedFonts.map((font) => <option key={font.url} value={font.family}>{font.family} · ຟອນຂອງຂ້ອຍ</option>)}
                </select>
              </label>
              <div className="rounded-xl border border-dashed border-slate-700 p-3">
                <input ref={fontInputRef} type="file" accept=".woff2,.woff,.ttf,.otf,font/woff2,font/woff,font/ttf,font/otf" className="hidden" onChange={(event) => void handleFontUpload(event.target.files?.[0])} />
                <button type="button" onClick={() => fontInputRef.current?.click()} disabled={isUploadingFont} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#12E8FF]/40 bg-[#12E8FF]/10 px-3 py-2.5 text-xs font-semibold text-cyan-200 hover:bg-[#12E8FF]/20 disabled:opacity-50">
                  <Upload className="h-3.5 w-3.5" />{isUploadingFont ? "ກຳລັງອັບໂຫຼດ..." : "ອັບໂຫຼດຟອນຂອງຂ້ອຍ"}
                </button>
                <p className="mt-2 text-[10px] leading-relaxed text-slate-400">ຮອງຮັບ WOFF2, WOFF, TTF, OTF · ສູງສຸດ 10 MB · ບັນທຶກໄວ້ໃນເວັບ ແລະປ້ອງກັນຊື່/ໄຟລ໌ຊ້ຳ</p>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-3"><p className="text-xs text-slate-300">ສີຕົວໜັງສື</p><span className="text-[10px] text-slate-500">{captionColor.toUpperCase()}</span></div>
                <div className="flex flex-wrap items-center gap-2">{["#FFFFFF", "#FFD000", "#22C55E", "#22D3EE", "#FB7185", "#A855F7"].map((color) => <button type="button" key={color} aria-label={`ສີ ${color}`} onClick={() => setCaptionColor(color)} className={`h-9 w-9 rounded-full border-2 ${captionColor === color ? "border-[#12E8FF] ring-2 ring-[#12E8FF]/30" : "border-slate-600"}`} style={{ backgroundColor: color }} />)}<label className="flex h-9 items-center gap-2 rounded-full border border-slate-700 bg-[#161824] px-3 text-[11px] text-slate-300">ສີອື່ນ<input type="color" value={captionColor} onChange={(event) => setCaptionColor(event.target.value)} className="h-6 w-7 cursor-pointer rounded border-0 bg-transparent p-0" aria-label="ເລືອກສີຕົວໜັງສື" /></label></div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-3"><p className="text-xs text-slate-300">ສີໄຮໄລທ໌</p><span className="text-[10px] text-slate-500">{highlightColor.toUpperCase()}</span></div>
                <div className="flex flex-wrap items-center gap-2">{["#FFE01B", "#22C55E", "#06B6D4", "#F43F5E", "#FFFFFF", "#A855F7"].map((color) => <button type="button" key={color} aria-label={`ສີໄຮໄລທ໌ ${color}`} onClick={() => setHighlightColor(color)} className={`h-9 w-9 rounded-full border-2 ${highlightColor === color ? "border-[#12E8FF] ring-2 ring-[#12E8FF]/30" : "border-slate-600"}`} style={{ backgroundColor: color }} />)}<label className="flex h-9 items-center gap-2 rounded-full border border-slate-700 bg-[#161824] px-3 text-[11px] text-slate-300">ສີອື່ນ<input type="color" value={highlightColor} onChange={(event) => setHighlightColor(event.target.value)} className="h-6 w-7 cursor-pointer rounded border-0 bg-transparent p-0" aria-label="ເລືອກສີໄຮໄລທ໌" /></label></div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-[#0A0B10] px-4 py-3 text-center" style={{ fontFamily: `"${fontFamily}", "Noto Sans Lao", "Noto Sans Thai", sans-serif`, color: captionColor, fontSize: `${Math.min(captionSize, 28)}px`, textShadow: outlineEnabled ? `1px 1px 0 ${outlineColor}, -1px -1px 0 ${outlineColor}` : "none" }}>
                ຕົວຢ່າງຟອນ · <span style={{ color: highlightColor }}>ຄຳເນັ້ນ</span>
              </div>
            </div>}
            {settingsTab === "size" && <div className="space-y-5 p-5">
              <label className="block text-xs text-slate-300">ຂະໜາດຕົວໜັງສື <span className="float-right text-slate-400">{captionSize}px</span><input aria-label="ຂະໜາດຕົວໜັງສື" type="range" min="12" max="48" value={captionSize} onChange={(e) => setCaptionSize(Number(e.target.value))} className="mt-3 w-full accent-[#12E8FF]" /></label>
              <label className="block text-xs text-slate-300">ຈຳນວນຄຳທີ່ສະແດງພ້ອມກັນ <span className="float-right text-slate-400">{maxWordsPerCaption} ຄຳ</span><input aria-label="ຈຳນວນຄຳທີ່ສະແດງພ້ອມກັນ" type="range" min="1" max="12" step="1" value={maxWordsPerCaption} onChange={(event) => setMaxWordsPerCaption(Number(event.target.value))} className="mt-3 w-full accent-[#12E8FF]" /><span className="mt-1 block text-[10px] text-slate-500">ມີຜົນກັບພຣີວິວ ແລະໄຟລ໌ຊັບທີ່ສົ່ງອອກ</span></label>
              <label className="block text-xs text-slate-300">ຕຳແໜ່ງຊັບໄຕເຕິລ <span className="float-right text-slate-400">{captionBottom}%</span><input aria-label="ຕຳແໜ່ງຊັບໄຕເຕິລ" type="range" min="5" max="80" value={captionBottom} onChange={(e) => setCaptionBottom(Number(e.target.value))} className="mt-3 w-full accent-[#12E8FF]" /></label>
              <label className="block text-xs text-slate-300">ເສັ້ນ Safe Area ແພລດຟອມ
                <select value={safeAreaPreset} onChange={(event) => setSafeAreaPreset(event.target.value as typeof safeAreaPreset)} className="mt-2 w-full rounded-xl border border-slate-700 bg-[#161824] px-3 py-2.5 text-sm text-white focus:border-[#12E8FF] focus:outline-none">
                  <option value="off">ປິດເສັ້ນ Safe Area</option><option value="tiktok">TikTok / Shorts</option><option value="instagram">Instagram Reels / Stories</option><option value="facebook">Facebook Reels</option>
                </select>
              </label>
            </div>}
            {settingsTab === "background" && <div className="space-y-4 p-5">
              <label className="block text-xs text-slate-300">ຮູບແບບພື້ນຫຼັງ
                <select value={backgroundMode} onChange={(event) => setBackgroundMode(event.target.value as typeof backgroundMode)} className="mt-2 w-full rounded-xl border border-slate-700 bg-[#161824] px-3 py-2.5 text-sm text-white focus:border-[#12E8FF] focus:outline-none">
                  <option value="none">ບໍ່ໃຊ້ພື້ນຫຼັງ</option><option value="translucent">ພື້ນຫຼັງໂປ່ງແສງ</option><option value="solid">ພື້ນຫຼັງສີທຶບ</option>
                </select>
              </label>
              <label className="flex items-center justify-between rounded-xl border border-slate-700 bg-[#161824] px-3 py-2.5 text-xs text-slate-200">ສີພື້ນຫຼັງ
                <input type="color" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent" aria-label="ເລືອກສີພື້ນຫຼັງຊັບ" />
              </label>
              {backgroundMode === "translucent" && <label className="block text-xs text-slate-300">ຄວາມໂປ່ງແສງ <span className="float-right text-slate-400">{Math.round(backgroundOpacity * 100)}%</span><input type="range" min="0.1" max="1" step="0.05" value={backgroundOpacity} onChange={(event) => setBackgroundOpacity(Number(event.target.value))} className="mt-3 w-full accent-[#12E8FF]" /></label>}
              <label className="block text-xs text-slate-300">ຂະໜາດຂອບພື້ນຫຼັງ <span className="float-right text-slate-400">{backgroundPadding}px</span><input type="range" min="0" max="30" value={backgroundPadding} onChange={(event) => setBackgroundPadding(Number(event.target.value))} className="mt-3 w-full accent-[#12E8FF]" /></label>
              <label className="block text-xs text-slate-300">ຄວາມມົນຂອບ <span className="float-right text-slate-400">{backgroundRadius}px</span><input type="range" min="0" max="32" value={backgroundRadius} onChange={(event) => setBackgroundRadius(Number(event.target.value))} className="mt-3 w-full accent-[#12E8FF]" /></label>
              <label className="flex items-center justify-between rounded-xl border border-slate-700 px-3 py-2.5 text-xs text-slate-200"><span>ເງົາຕົວໜັງສື</span><input type="checkbox" checked={textShadowEnabled} onChange={(event) => setTextShadowEnabled(event.target.checked)} className="h-4 w-4 accent-[#12E8FF]" /></label>
              {textShadowEnabled && <label className="block text-xs text-slate-300">ຄວາມຟຸ້ງເງົາ <span className="float-right text-slate-400">{textShadowBlur}px</span><input type="range" min="0" max="16" value={textShadowBlur} onChange={(event) => setTextShadowBlur(Number(event.target.value))} className="mt-3 w-full accent-[#12E8FF]" /></label>}
              <label className="flex items-center justify-between rounded-xl border border-slate-700 px-3 py-2.5 text-xs text-slate-200"><span>ເສັ້ນຂອບຕົວໜັງສື</span><input type="checkbox" checked={outlineEnabled} onChange={(event) => setOutlineEnabled(event.target.checked)} className="h-4 w-4 accent-[#12E8FF]" /></label>
              {outlineEnabled && <>
                <label className="flex items-center justify-between rounded-xl border border-slate-700 bg-[#161824] px-3 py-2.5 text-xs text-slate-200">ສີຂອບ<input type="color" value={outlineColor} onChange={(event) => setOutlineColor(event.target.value)} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent" aria-label="ເລືອກສີຂອບຕົວໜັງສື" /></label>
                <label className="block text-xs text-slate-300">ຄວາມໜາຂອງຂອບ <span className="float-right text-slate-400">{outlineWidth}px</span><input type="range" min="0.5" max="6" step="0.5" value={outlineWidth} onChange={(event) => setOutlineWidth(Number(event.target.value))} className="mt-3 w-full accent-[#12E8FF]" /></label>
              </>}
            </div>}
            {settingsTab === "translate" && <div className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300" htmlFor="subtitle-translation-language">ແປຊັບເປັນ</label>
                <select id="subtitle-translation-language" value={translationTarget} onChange={(event) => setTranslationTarget(event.target.value as typeof translationTarget)} className="w-full rounded-xl border border-slate-700 bg-[#161824] px-3 py-2.5 text-sm text-white focus:border-[#12E8FF] focus:outline-none">
                  <option value="lo">ລາວ</option><option value="th">ໄທ</option><option value="en">English</option>
                </select>
              </div>
              {subtitles.length === 0 && <div role="status" className="rounded-xl border border-amber-400/20 bg-amber-300/[0.06] p-3">
                <p className="text-xs font-semibold text-amber-100">ຍັງບໍ່ມີຊັບໃຫ້ແປ</p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">ອັບໂຫຼດຄລິບແລ້ວຖອດສຽງ ຫຼືເພີ່ມແຖວຊັບກ່ອນ. ປຸ່ມແປຈະເປີດເມື່ອມີຂໍ້ຄວາມ.</p>
                <button type="button" onClick={addSubtitleBlock} className="mt-3 w-full rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-300/15">+ ເພີ່ມແຖວຊັບເພື່ອທົດລອງ</button>
              </div>}
              <button onClick={handleTranslateSubtitles} disabled={isTranslating || isGenerating || subtitles.length === 0} className="w-full rounded-xl bg-[#12E8FF] px-4 py-2.5 text-sm font-bold text-black transition hover:bg-[#00d0e6] disabled:opacity-50">
                {isTranslating ? "ກຳລັງແປ..." : `ແປ ${subtitles.length ? `${subtitles.length} ແຖວ` : "ຊັບທັງໝົດ"}`}
              </button>
              <button onClick={() => setShowTranslation((visible) => !visible)} disabled={!subtitles.some((subtitle) => subtitle.translatedText)} className="w-full rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-200 disabled:opacity-50">
                {showTranslation ? "ສະແດງພາສາຕົ້ນສະບັບ" : "ສະແດງຄຳແປ"}
              </button>
              <p className="text-[11px] leading-relaxed text-slate-400">ຄຳແປຈະຮັກສາເວລາເຂົ້າ-ອອກຂອງຊັບເດີມ ແລະເລືອກສະຫຼັບກ່ອນ export ໄດ້.</p>
            </div>}
            {settingsTab === "mine" && <div className="space-y-4 p-5">
              <div className="flex gap-2">
                <input value={presetName} onChange={(event) => setPresetName(event.target.value)} placeholder="ຕັ້ງຊື່ preset ຂອງຂ້ອຍ" className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-[#161824] px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-[#12E8FF] focus:outline-none" />
                <button onClick={saveCurrentPreset} className="rounded-xl bg-[#12E8FF] px-3 py-2 text-xs font-bold text-black">ບັນທຶກ</button>
              </div>
              {savedCaptionPresets.length === 0 ? <p className="rounded-xl border border-dashed border-slate-700 p-5 text-center text-xs text-slate-400">ຍັງບໍ່ມີ preset ທີ່ບັນທຶກໄວ້</p> : (
                <div className="space-y-2">
                  {savedCaptionPresets.map((preset, index) => <div key={`${preset.name}-${index}`} className="flex items-center gap-2 rounded-xl border border-slate-700 bg-[#161824] p-3">
                    <button onClick={() => applySavedPreset(preset)} className="flex-1 text-left text-xs font-semibold text-slate-200">{preset.name}<span className="mt-1 block text-[10px] font-normal text-slate-400">{preset.fontFamily} · {preset.captionSize}px</span></button>
                    <button onClick={() => deleteSavedPreset(index)} aria-label={`ລຶບ ${preset.name}`} className="rounded-lg px-2 py-1 text-xs text-red-300 hover:bg-red-500/10">ລຶບ</button>
                  </div>)}
                </div>
              )}
            </div>}
          </div>
        </div>

        {/* RIGHT COLUMN: AI Generation Setup & Subtitle Block Editor (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* STEP 1 & 2: Task Configuration Card */}
          <div className="p-5 rounded-2xl bg-[#12131C] border border-[#262838] shadow-lg">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-[#12E8FF]/20 text-[#12E8FF] flex items-center justify-center text-xs">1</span>
              <span>ອັບໂຫຼດ & ສ້າງຊັບ</span>
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
              className="p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-[#12E8FF] bg-[#161824] hover:bg-[#182333] text-center cursor-pointer transition-all mb-4 group"
            >
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#12E8FF] mx-auto mb-1.5 transition-colors" />
              <p className="text-xs font-semibold text-slate-200">
                {videoFile ? videoFile.name : "ຄລິກເພື່ອອັບໂຫຼດວິດີໂອ / ສຽງ"}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">ຮອງຮັບ MP4, MOV, WEBM, MP3, WAV</p>
            </div>

            {/* Language Selector */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-300 mb-2 block">ພາສາສຳລັບຖອດສຽງ:</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as typeof selectedLanguage)}
                className="w-full rounded-xl border border-slate-700 bg-[#161824] px-3 py-2.5 text-sm text-white focus:border-[#12E8FF] focus:outline-none"
              >
                <option value="lo">🇱🇦 ລາວ (ລາວ + ອັງກິດ)</option>
                <option value="th">🇹🇭 ໄທ (ໄທ + ອັງກິດ)</option>
                <option value="mixed">🌐 ລາວປົນອັງກິດ</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>

            {/* Regional Dialect Selector */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                <span>ສຳນຽງພາກພື້ນ (Regional Accent):</span>
                <span className="text-[10px] text-cyan-400 font-medium">ຮຽນຮູ້ຕາມສຽງຈິງ</span>
              </label>
              <select
                value={selectedDialect}
                onChange={(e) => setSelectedDialect(e.target.value as DialectTag)}
                className="w-full rounded-xl border border-slate-700 bg-[#161824] px-3 py-2.5 text-sm text-white focus:border-[#12E8FF] focus:outline-none"
              >
                <option value="auto">🌐 ກວດຈັບອັດຕະໂນມັດ (Auto Detect Accent)</option>
                <option value="lo-vte">🇱🇦 ສຳນຽງວຽງຈັນ (Vientiane Standard)</option>
                <option value="lo-lpq">🇱🇦 ສຳນຽງຫຼວງພະບາງ (Luang Prabang / ເໜືອ)</option>
                <option value="lo-cps">🇱🇦 ສຳນຽງຈຳປາສັກ (Champasak / ໃຕ້)</option>
                <option value="lo-xkh">🇱🇦 ສຳນຽງຊຽງຂວາງ (Xieng Khouang / ພວນ)</option>
                <option value="th-ne">🇹🇭 ສຳນຽງອີສານ (Isan Dialect)</option>
                <option value="th-c">🇹🇭 ສຳນຽງໄທກາງ (Central Thai)</option>
                <option value="th-n">🇹🇭 ສຳນຽງຄຳເມືອງ (Northern Kham Mueang)</option>
                <option value="th-s">🇹🇭 ສຳນຽງປັກໃຕ້ (Southern Thai)</option>
                <option value="en-loan">📱 ຄຳທັບສັບເຕັກໂນໂລຊີ & ແບຣນ (Tech/Brands)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                {DIALECT_PROFILES[selectedDialect]?.description || "AI ຈະປັບໂທນສຽງ ແລະ ວັນນະຍຸດໃຫ້ກົງກັບສຳນຽງທີ່ເລືອກ"}
              </p>
            </div>

            <details className="mb-4 rounded-xl border border-slate-700 bg-[#161824] group">
              <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>ຕັ້ງຄ່າເພີ່ມເຕີມ</span><ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-slate-700 p-3">
            {/* AI Engine Version Selector */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                <span>ລຸ້ນລະບົບ AI Engine:</span>
                <span className="text-[10px] text-slate-400 font-mono">SAIZUP Multimodal</span>
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: "v1",
                    name: "Gemini 3.5 Flash-Lite",
                    cost: 5,
                    desc: "Free · ຮຸ່ນປະຢັດ ສຳລັບຄລິບສັ້ນ",
                    badge: "5 ເຄຣດິດ",
                  },
                  {
                    id: "v2",
                    name: "Gemini 3.8 Flash",
                    cost: 12,
                    desc: "Gold · ໄວ ແລະ ແມ່ນຍຳຂຶ້ນ",
                    badge: "12 ເຄຣດິດ",
                  },
                  {
                    id: "v3",
                    name: "Gemini 3.1 Pro",
                    cost: 35,
                    desc: "Plus · ຮັກສາບໍລິບົດຂ້າມພາສາ ແລະ ແປລະອຽດ",
                    badge: "35 ເຄຣດິດ",
                  },
                  {
                    id: "v4",
                    name: "Gemini 4 Argon",
                    cost: 80,
                    desc: "Pro · flagship ສຳລັບວຽກທີ່ຕ້ອງການຄວາມລະອຽດສູງສຸດ",
                    badge: "80 ເຄຣດິດ",
                  },
                ].map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => setAiVersion(tier.id as any)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      aiVersion === tier.id
                        ? "bg-[#182333] border-[#12E8FF] shadow-sm shadow-[#12E8FF]/10"
                        : "bg-[#161824] border-slate-700 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200">{tier.name}</div>
                      <div className="text-[10px] text-slate-400">{tier.desc}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-yellow-500/10 text-yellow-300 border border-yellow-500/30">
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
                      : "bg-[#161824] border-slate-700 text-slate-400"
                  }`}
                >
                  ⚡ ປະໂຫຍກສັ້ນ (2-4s)
                </button>
                <button
                  onClick={() => setIntervalMode("30s")}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    intervalMode === "30s"
                      ? "bg-[#182333] border-[#12E8FF] text-[#12E8FF]"
                      : "bg-[#161824] border-slate-700 text-slate-400"
                  }`}
                >
                  ⏱️ ຊ່ວງຍາວ 30 ວິນາທີ
                </button>
              </div>
            </div>
              </div>
            </details>

            {/* Custom Vocabulary / Prompt Hinting Input */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>🏷️ ຄຳສັບສະເພາະ / ຊື່ແບຣນ (Custom Vocabulary):</span>
                <span className="text-[10px] text-slate-500">ໃສ່ຊື່ສະເພາະກ່ອນຖອດ</span>
              </label>
              <input
                type="text"
                value={customVocabulary}
                onChange={(e) => setCustomVocabulary(e.target.value)}
                placeholder="ເຊັ່ນ: BCEL, TikTok, Saizup, iPhone, ລາວທ່ຽວລາວ..."
                className="w-full rounded-xl border border-slate-700 bg-[#161824] px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-[#12E8FF] focus:outline-none transition-colors"
              />
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || isTranslating}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#12E8FF] to-blue-600 hover:from-[#00d0e6] hover:to-blue-500 text-[#090C14] font-extrabold text-sm transition-all shadow-sm shadow-[#12E8FF]/20 flex items-center justify-center gap-2 disabled:opacity-50"
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
            {/* Draft Restore Alert */}
            {savedDraftAvailable && subtitles.length === 0 && (
              <div className="mb-3 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between text-xs text-cyan-200">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>ພົບຮ່າງໂປຣເຈັກທີ່ບັນທຶກໄວ້ອັດຕະໂນມັດ (Draft Available)</span>
                </span>
                <button
                  onClick={handleRestoreDraft}
                  className="px-2.5 py-1 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold transition-all shadow-sm"
                >
                  ກູ້ຄືນຮ່າງ
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#12E8FF]/20 text-[#12E8FF] flex items-center justify-center text-xs">2</span>
                <span>ລາຍການຊັບໄຕເຕິລ ({subtitles.length} ບລັອກ)</span>
              </h3>
              <div className="flex items-center gap-2">
                {/* Loop Sentence on Click Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !loopSentenceEnabled;
                    setLoopSentenceEnabled(next);
                    showToast(next ? "🔁 ເປີດໂໝດຫຼິ້ນວົນຊ້ຳປະໂຫຍກ (Loop Sentence: ON)" : "ຫຼິ້ນປົກກະຕິ (Loop: OFF)");
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    loopSentenceEnabled
                      ? "bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-sm shadow-amber-400/10"
                      : "bg-[#161824] hover:bg-[#25283A] text-slate-400 border-slate-700/60"
                  }`}
                  title="ເມື່ອກົດເລືອກຊັບແຖວໃດ ຈະຫຼິ້ນວົນຊ້ຳສະເພາະປະໂຫຍກນັ້ນ ເພື່ອກວດຈັງຫວະປາກ"
                >
                  <span>🔁 ຫຼິ້ນວົນຊ້ຳ</span>
                </button>

                <button
                  onClick={addSubtitleBlock}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#161824] hover:bg-[#25283A] text-slate-300 hover:text-[#12E8FF] text-xs font-semibold border border-slate-700/60 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ເພີ່ມແຖວ</span>
                </button>
              </div>
            </div>

            {/* Global Time Shift (+/- Offset) Toolbar */}
            {subtitles.length > 0 && (
              <div className="mb-3 px-3 py-2 rounded-xl bg-[#161826] border border-slate-700/60 flex items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-slate-400 font-medium">
                  ⏱️ ເລື່ອນເວລາທັງໝົດ (Global Offset):
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleApplyGlobalOffset(-0.5)}
                    className="px-2 py-0.5 rounded bg-[#1F2233] hover:bg-[#2a2e45] text-slate-300 font-mono text-[11px] border border-slate-700"
                    title="ເລື່ອນເວລາຊັບທັງໝົດໄວຂຶ້ນ 500ms (-0.5s)"
                  >
                    -0.5s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyGlobalOffset(-0.1)}
                    className="px-2 py-0.5 rounded bg-[#1F2233] hover:bg-[#2a2e45] text-slate-300 font-mono text-[11px] border border-slate-700"
                    title="ເລື່ອນເວລາຊັບທັງໝົດໄວຂຶ້ນ 100ms (-0.1s)"
                  >
                    -0.1s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyGlobalOffset(0.1)}
                    className="px-2 py-0.5 rounded bg-[#1F2233] hover:bg-[#2a2e45] text-slate-300 font-mono text-[11px] border border-slate-700"
                    title="ເລື່ອນເວລາຊັບທັງໝົດຊ້າລົງ 100ms (+0.1s)"
                  >
                    +0.1s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyGlobalOffset(0.5)}
                    className="px-2 py-0.5 rounded bg-[#1F2233] hover:bg-[#2a2e45] text-slate-300 font-mono text-[11px] border border-slate-700"
                    title="ເລື່ອນເວລາຊັບທັງໝົດຊ້າລົງ 500ms (+0.5s)"
                  >
                    +0.5s
                  </button>
                </div>
              </div>
            )}

            {/* AI Accent Auto-Learning Status Card */}
            {subtitles.length > 0 && (
              <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-[#171A2B] to-[#1D1933] border border-cyan-500/30 flex flex-col gap-2 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-cyan-300">
                    <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>AI Accent Auto-Learning (ຮຽນຮູ້ສຳນຽງອັດຕະໂນມັດ)</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-mono">
                    ຮຽນຮູ້ແລ້ວ {learnedTotal} ຮູບແບບ
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  ລະບົບຈະຮຽນຮູ້ສຳນຽງ ແລະ ການແກ້ໄຂຄຳສັບຂອງທ່ານໂດຍອັດຕະໂນມັດທັນທີທີ່ທ່ານປັບແປງຂໍ້ຄວາມ ເພື່ອໃຫ້ AI ຖອດສຽງຄັ້ງຕໍ່ໄປໄດ້ແມ່ນຍຳຍິ່ງຂຶ້ນ ໂດຍບໍ່ຕ້ອງກົດປຸ່ມໃດໆ
                </p>
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-700/50">
                  <span className="text-[10px] text-slate-400">
                    ສຳນຽງປະຈຸບັນ: <strong className="text-white">{DIALECT_PROFILES[selectedDialect]?.label || "Auto"}</strong>
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <span className={`w-1.5 h-1.5 rounded-full ${isTeachingAI ? "bg-cyan-400 animate-ping" : "bg-emerald-400"}`} />
                    <span>{isTeachingAI ? "AI ກຳລັງຈື່ຈຳການແກ້ໄຂ..." : "⚡ ຮຽນຮູ້ອັດຕະໂນມັດ (Active)"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Subtitle Blocks Scrollable List */}
            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1 mb-4 flex-1">
              {subtitles.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center">
                  <FileText className="mx-auto mb-2 h-6 w-6 text-slate-400" />
                  <p className="text-sm font-medium text-slate-300">ຍັງບໍ່ມີຊັບໄຕເຕິລ</p>
                  <p className="mt-1 text-xs text-slate-400">ອັບໂຫຼດວິດີໂອ ແລ້ວກົດ “ເລີ່ມຖອດສຽງ”</p>
                </div>
              )}
              {subtitles.map((sub, index) => {
                const isActive = activeSub?.id === sub.id || activeSentenceId === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setActiveSentenceId(sub.id);
                      if (videoRef.current) {
                        videoRef.current.currentTime = sub.time;
                        if (loopSentenceEnabled) {
                          videoRef.current.play().catch(() => {});
                          setIsPlaying(true);
                        }
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                      isActive
                        ? "bg-[#182333] border-cyan-400 shadow-sm shadow-cyan-500/20 ring-1 ring-cyan-400/40"
                        : "bg-[#161824] border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span className="text-[#12E8FF] font-bold">
                        #{index + 1} {loopSentenceEnabled && isActive && <span className="ml-1 text-[9px] text-amber-300">🔁 ກຳລັງວົນຊ້ຳ</span>}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSubtitleBlock(sub.id);
                        }}
                        className="text-slate-400 hover:text-red-400 transition-colors p-1"
                        title="ລຶບແຖວນີ້"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                      <label className="text-[10px] text-slate-400">ເລີ່ມ (ວິນາທີ)
                        <input type="number" min="0" step="0.1" value={sub.time} onChange={(event) => updateSubtitleTiming(sub.id, "time", Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#1A1C29] px-2 py-1.5 text-xs text-white focus:border-[#12E8FF] focus:outline-none" aria-label={`ເວລາເລີ່ມຂອງຊັບແຖວ ${index + 1}`} />
                        <button type="button" onClick={() => updateSubtitleTiming(sub.id, "time", currentTime)} className="mt-1 text-[10px] text-cyan-400 hover:text-cyan-300">ໃຊ້ຈຸດຫຼິ້ນ {currentTime.toFixed(1)}s</button>
                      </label>
                      <label className="text-[10px] text-slate-400">ສິ້ນສຸດ (ວິນາທີ)
                        <input type="number" min="0" step="0.1" value={sub.endTime} onChange={(event) => updateSubtitleTiming(sub.id, "endTime", Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#1A1C29] px-2 py-1.5 text-xs text-white focus:border-[#12E8FF] focus:outline-none" aria-label={`ເວລາສິ້ນສຸດຂອງຊັບແຖວ ${index + 1}`} />
                        <button type="button" onClick={() => updateSubtitleTiming(sub.id, "endTime", currentTime)} className="mt-1 text-[10px] text-cyan-400 hover:text-cyan-300">ໃຊ້ຈຸດຫຼິ້ນ {currentTime.toFixed(1)}s</button>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={sub.text}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateSubtitleText(sub.id, e.target.value)}
                      aria-label={`ຂໍ້ຄວາມຊັບແຖວ ${index + 1}`}
                      className="w-full bg-[#1A1C29] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#12E8FF]"
                    />
                    <input
                      type="text"
                      value={sub.translatedText || ""}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(event) => updateSubtitleTranslation(sub.id, event.target.value)}
                      aria-label={`ຄຳແປຂອງຊັບແຖວ ${index + 1}`}
                      placeholder={`ຄຳແປ ${translationTarget === "lo" ? "ລາວ" : translationTarget === "th" ? "ໄທ" : "English"} · ແກ້ໄຂໄດ້`}
                      className="w-full bg-[#1A1C29] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-cyan-100 placeholder:text-slate-500 focus:outline-none focus:border-[#12E8FF]"
                    />
                  </div>
                );
              })}
            </div>

            {/* Export Actions Bar */}
            <div className="pt-3 border-t border-slate-700 flex flex-wrap gap-2">
              {videoFile?.type.startsWith("video/") && (
                <button
                  onClick={handleExportVideo}
                  disabled={subtitles.length === 0 || isExportingVideo}
                  className="w-full rounded-xl bg-[#12E8FF] px-3 py-2.5 text-xs font-bold text-black shadow-sm shadow-[#12E8FF]/20 transition-colors hover:bg-[#00d0e6] disabled:cursor-not-allowed disabled:opacity-50"
                  title="Render ຊັບລົງໃນວິດີໂອໂດຍຮັກສາຂະໜາດເດີມ"
                >
                  {isExportingVideo ? `ກຳລັງສົ່ງອອກ ${exportProgress}%...` : `ສົ່ງອອກວິດີໂອຕິດຊັບ ${videoDimensions ? `· ${videoDimensions.width}×${videoDimensions.height}` : ""} (.webm)`}
                </button>
              )}
              <button
                onClick={handleExportSRT}
                disabled={subtitles.length === 0}
                className="flex-1 py-2 px-2.5 rounded-xl bg-[#1B1E2E] hover:bg-[#252a3d] border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#12E8FF]" />
                <span>.SRT</span>
              </button>

              <button
                onClick={handleExportVTT}
                disabled={subtitles.length === 0}
                className="flex-1 py-2 px-2.5 rounded-xl bg-[#1B1E2E] hover:bg-[#252a3d] border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#12E8FF]" />
                <span>.VTT</span>
              </button>

              <button
                onClick={handleExportASS}
                disabled={subtitles.length === 0}
                className="flex-1 py-2 px-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs font-semibold text-purple-300 transition-colors flex items-center justify-center gap-1.5"
                title="Advanced SubStation Alpha with Karaoke tags"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>.ASS</span>
              </button>

              <button
                onClick={handleExportPremiereXML}
                disabled={subtitles.length === 0}
                className="flex-1 py-2 px-2 rounded-xl bg-[#1B1E2E] hover:bg-[#252a3d] border border-slate-700 text-[11px] font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1"
                title="Adobe Premiere Pro XML Sequence"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                <span>Premiere .XML</span>
              </button>

              <button
                onClick={handleExportFCPXML}
                disabled={subtitles.length === 0}
                className="flex-1 py-2 px-2 rounded-xl bg-[#1B1E2E] hover:bg-[#252a3d] border border-slate-700 text-[11px] font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1"
                title="Apple Final Cut Pro XML"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                <span>Final Cut .FCPXML</span>
              </button>

              <button
                onClick={handleCopyText}
                disabled={subtitles.length === 0}
                className="py-2 px-3 rounded-xl bg-[#1B1E2E] hover:bg-[#252a3d] border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                title="ສຳເນົາຂໍ້ຄວາມທັງໝົດ"
              >
                {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            {videoFile?.type.startsWith("video/") && <p className="mt-2 text-[11px] text-slate-400">ວິດີໂອຈະຮັກສາຄວາມກວ້າງ × ຄວາມສູງເດີມ ແລະຄວາມຍາວເຕັມຄລິບ · ສົ່ງອອກເປັນ WebM</p>}
          </div>
        </div>
      </div>
      </div>

      {isGenerating && (
        <div role="dialog" aria-modal="true" aria-labelledby="generation-progress-title" className="fixed inset-0 z-[70] flex items-center justify-center bg-[#05060b]/75 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-cyan-300/20 bg-[#111522] p-6 shadow-[0_25px_100px_rgba(0,0,0,.65)] sm:p-8">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_35px_rgba(34,211,238,.16)]">
              <Languages className="h-7 w-7 animate-pulse text-cyan-200" />
            </div>
            <div className="text-center">
              <h2 id="generation-progress-title" className="text-lg font-bold text-white">ກຳລັງຖອດສຽງ ແລະສ້າງຊັບໄຕເຕິລ</h2>
              <p className="mt-1 truncate text-xs text-slate-400" title={videoFile?.name}>{videoFile?.name || "ວິດີໂອຂອງທ່ານ"} · {Math.round(videoDuration)} ວິນາທີ</p>
            </div>
            <div className="mt-7 flex items-end justify-between">
              <span className="text-xs font-medium text-slate-300">ຄວາມຄືບໜ້າ</span>
              <span className="text-3xl font-extrabold tabular-nums text-white">{Math.floor(generationProgress)}<span className="ml-0.5 text-lg text-yellow-300">%</span></span>
            </div>
            <div role="progressbar" aria-label="ຄວາມຄືບໜ້າການຖອດສຽງ" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(generationProgress)} className="mt-3 h-3 overflow-hidden rounded-full border border-white/5 bg-slate-800">
              <div className="relative h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-yellow-300 transition-[width] duration-300 ease-out" style={{ width: `${generationProgress}%` }}>
                <span className="absolute inset-y-0 right-0 w-12 bg-white/40 blur-md" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
                <p className="text-[10px] text-slate-500">ເວລາທີ່ລໍຖ້າ</p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-white">{formatElapsedTime(generationElapsedSeconds)}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
                <p className="text-[10px] text-slate-500">ເວລາເຫຼືອໂດຍປະມານ</p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-white">
                  {generationFinalizing || generationProgress === 100
                    ? "ກຳລັງຈັດຜົນ..."
                    : generationEstimatedSeconds !== null
                      ? generationEstimateElapsedAt !== null && generationElapsedSeconds - generationEstimateElapsedAt >= generationEstimatedSeconds
                        ? "ລໍຜົນ AI..."
                        : formatElapsedTime(Math.max(0, generationEstimatedSeconds - (generationElapsedSeconds - (generationEstimateElapsedAt ?? generationElapsedSeconds))))
                      : "ກຳລັງປະເມີນ..."}
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
                <p className="text-[10px] text-slate-500">ຊ່ວງສຽງທີ່ AI ຟັງແລ້ວ</p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-white">{generationCompletedChunks} / {generationTotalChunks || "—"}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
                <p className="text-[10px] text-slate-500">ຊັບທີ່ຖອດໄດ້</p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-white">{generationCaptionCount} ແຖວ</p>
              </div>
            </div>
            <p className="mt-4 min-h-5 text-center text-xs text-cyan-100" aria-live="polite">
              {generationProgress === 100 ? "ຖອດສຽງຄົບແລ້ວ ກຳລັງຈັດລຽງຊັບ..." : stepText || "ກຳລັງກຽມວິດີໂອ..."}
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />ຈະຄິດເຄຣດິດເມື່ອຖອດສຽງສຳເລັດ</div>
          </div>
        </div>
      )}

      {isTranslating && (
        <div role="dialog" aria-modal="true" aria-labelledby="translation-progress-title" className="fixed inset-0 z-[70] flex items-center justify-center bg-[#05060b]/75 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-cyan-300/20 bg-[#111522] p-6 shadow-[0_25px_100px_rgba(0,0,0,.65)] sm:p-8">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_35px_rgba(34,211,238,.16)]">
              <Languages className="h-7 w-7 text-cyan-200 animate-pulse" />
            </div>
            <div className="text-center">
              <h2 id="translation-progress-title" className="text-lg font-bold text-white">ກຳລັງແປຊັບໄຕເຕິລ</h2>
              <p className="mt-1 text-xs text-slate-400">ແປແລ້ວ {translationCompleted} / {translationTotal} ແຖວ</p>
            </div>
            <div className="mt-7 flex items-end justify-between">
              <span className="text-xs font-medium text-slate-300">ຄວາມຄືບໜ້າ</span>
              <span className="text-3xl font-extrabold tabular-nums text-white">{Math.floor(translationProgress)}<span className="ml-0.5 text-lg text-yellow-300">%</span></span>
            </div>
            <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(translationProgress)} className="mt-3 h-3 overflow-hidden rounded-full border border-white/5 bg-slate-800">
              <div className="relative h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-yellow-300 transition-[width] duration-300 ease-out" style={{ width: `${translationProgress}%` }}>
                <span className="absolute inset-y-0 right-0 w-12 bg-white/40 blur-md" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
                <p className="text-[10px] text-slate-500">ເວລາທີ່ລໍຖ້າ</p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-white">{formatElapsedTime(translationElapsedSeconds)}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
                <p className="text-[10px] text-slate-500">ເວລາເຫຼືອໂດຍປະມານ</p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-white">
                  {translationProgress === 100
                    ? translationFinalizing ? "ກຳລັງສຳເລັດ..." : "0:00"
                    : translationProgress > 0
                      ? formatElapsedTime(Math.max(1, Math.ceil(translationElapsedSeconds * (100 - translationProgress) / translationProgress)))
                      : "ກຳລັງຄຳນວນ..."}
                </p>
              </div>
            </div>
            <p className="mt-4 min-h-5 text-center text-xs text-cyan-100" aria-live="polite">
              {translationProgress === 0 ? "ກຳລັງຕິດຕໍ່ AI ແລະກຽມແປ..." : translationFinalizing ? "ແປຄົບທຸກແຖວແລ້ວ ກຳລັງສຳເລັດ..." : translationProgress < 100 ? "ກຳລັງແປຊັບຕາມລຳດັບ..." : "ແປສຳເລັດແລ້ວ"}
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />ເຄຣດິດຈະຖືກຫັກຫຼັງແປສຳເລັດ</div>
          </div>
        </div>
      )}

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
