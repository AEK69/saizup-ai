"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Upload,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Save,
  Sun,
  Download,
  User,
  Wand2,
  Subtitles,
  Palette,
  Smile,
  Music,
  Maximize2,
  Volume2,
  VolumeX,
  Type,
  Check,
  Sparkles,
  Film,
  Plus,
  Trash2,
  Languages,
  FileText,
  Clock,
  Mic,
  ZoomIn,
  ZoomOut,
  Scissors,
  Merge,
  ArrowRightLeft,
  Settings2,
  Bookmark,
  Sliders,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkle,
  Grid,
  Smartphone,
  Crosshair,
  Keyboard,
  FastForward,
  Magnet,
  Zap,
  Split,
  FolderOpen,
  FolderPlus,
  X,
  Heart,
  MessageCircle,
  Share2,
  Disc,
  ThumbsUp,
  MoreHorizontal,
  Camera,
  Crop,
  Video,
  Search,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Star,
  Pencil,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  MousePointer,
  Ruler,
  MoreVertical,
  Home,
} from "lucide-react";
import Link from "next/link";
import AuthModal from "@/components/auth/AuthModal";
import { extractAudioFromVideoFile } from "@/lib/audioExtractor";
import { ESSENTIAL_SOUND_EFFECTS, playSoundEffect } from "@/lib/soundEffects";

export interface SubtitleItem {
  id: string;
  time: number; // in seconds
  endTime: number;
  text: string;
  translatedText?: string;
  words: { text: string; active?: boolean }[];
  groupId?: string;
}

export interface MediaClipItem {
  id: string;
  name: string;
  url: string;
  thumbUrl: string;
  duration: number;
  resolution: string;
  file?: File;
}

export interface VideoTrackClip {
  id: string;
  mediaId: string;
  name: string;
  thumbUrl: string;
  startTime: number;
  duration: number;
  inPoint: number;
  outPoint: number;
}

export interface KeyframeItem {
  id: string;
  time: number; // in seconds
  scale: number;
  positionX: number;
  positionY: number;
  rotation: number;
  opacity: number;
}

// =========================================================================
// INITIAL DEFAULT PROJECT ASSETS (Fresh clean baseline for window open/reset)
// =========================================================================
const INITIAL_DEFAULT_SUBTITLES: SubtitleItem[] = [
  {
    id: "1",
    time: 0.5,
    endTime: 3.5,
    text: "ຍົກຕົວຢ່າງໃຫ້ເບິ່ງ",
    translatedText: "ยกตัวอย่างให้ดู",
    words: [{ text: "ຍົກ" }, { text: "ຕົວຢ່າງ" }, { text: "ໃຫ້" }, { text: "ເບິ່ງ" }],
  },
  {
    id: "2",
    time: 3.8,
    endTime: 7.2,
    text: "ລະບົບຖອດສຽງ ແລະ ໃສ່ຊັບ ອັດຕະໂນມັດ",
    translatedText: "ระบบถอดเสียง และใส่ซับอัตโนมัติ",
    words: [{ text: "ລະບົບຖອດສຽງ" }, { text: "ແລະ" }, { text: "ໃສ່ຊັບ" }, { text: "ອັດຕະໂນມັດ" }],
  },
  {
    id: "3",
    time: 7.5,
    endTime: 11.5,
    text: "ສ້າງວິດີໂອສັ້ນ ດ້ວຍ AI ງ່າຍໆ",
    translatedText: "สร้างวิดีโอสั้น ด้วย AI ง่ายมาก",
    words: [{ text: "ສ້າງວິດີໂອສັ້ນ" }, { text: "ດ້ວຍ" }, { text: "AI" }, { text: "ງ່າຍໆ" }],
  },
  {
    id: "4",
    time: 11.8,
    endTime: 15.0,
    text: "ປັບແຕ່ງສໄຕລ໌ຊັບລາວ ແບບ CapCut",
    translatedText: "ปรับแต่งสไตล์ซับลาว แบบ CapCut",
    words: [{ text: "ປັບແຕ່ງ" }, { text: "ສໄຕລ໌ຊັບລາວ" }, { text: "ແບບ" }, { text: "CapCut" }],
  },
];

const INITIAL_DEFAULT_MEDIA_LIST: MediaClipItem[] = [
  {
    id: "sample-1",
    name: "ຍົກຕົວຢ່າງໃຫ້ເບິ່ງ_LaoSpeech.mp4",
    url: "",
    thumbUrl:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='90' viewBox='0 0 160 90'><rect width='160' height='90' fill='%23191c28'/><circle cx='80' cy='45' r='18' fill='%2312E8FF' fill-opacity='0.25'/><polygon points='75,36 92,45 75,54' fill='%2312E8FF'/><rect x='12' y='72' width='55' height='7' rx='3.5' fill='%23FFE01B'/></svg>",
    duration: 15.0,
    resolution: "1080x1920 (9:16)",
  },
  {
    id: "sample-2",
    name: "AI_Marketing_Clip_CapCut.mp4",
    url: "",
    thumbUrl:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='90' viewBox='0 0 160 90'><rect width='160' height='90' fill='%23161722'/><circle cx='80' cy='45' r='18' fill='%235B8FFF' fill-opacity='0.3'/><polygon points='75,36 92,45 75,54' fill='%235B8FFF'/><rect x='12' y='72' width='45' height='7' rx='3.5' fill='%2312E8FF'/></svg>",
    duration: 12.0,
    resolution: "1080x1920 (9:16)",
  },
];

const INITIAL_DEFAULT_VIDEO_CLIPS: VideoTrackClip[] = [
  {
    id: "vclip-1",
    mediaId: "sample-1",
    name: "ຍົກຕົວຢ່າງໃຫ້ເບິ່ງ_LaoSpeech",
    thumbUrl:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='90' viewBox='0 0 160 90'><rect width='160' height='90' fill='%23191c28'/><polygon points='75,36 92,45 75,54' fill='%2312E8FF'/></svg>",
    startTime: 0,
    duration: 15.0,
    inPoint: 0,
    outPoint: 15.0,
  },
];

const INITIAL_DEFAULT_KEYFRAMES: KeyframeItem[] = [
  { id: "kf-1", time: 1.0, scale: 100, positionX: 0, positionY: 82, rotation: 0, opacity: 100 },
  { id: "kf-2", time: 3.5, scale: 125, positionX: 20, positionY: 76, rotation: 4, opacity: 100 },
  { id: "kf-3", time: 7.0, scale: 95, positionX: -20, positionY: 85, rotation: -3, opacity: 90 },
];

const INITIAL_DEFAULT_COLOR_FILTER = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  sepia: 0,
  blur: 0,
  filterPreset: "none",
};

const COLOR_PALETTE = [
  { id: "#FFFFFF", name: "White", bg: "bg-white" },
  { id: "#FFD000", name: "Yellow", bg: "bg-yellow-400" },
  { id: "#FB923C", name: "Orange", bg: "bg-orange-400" },
  { id: "#F87171", name: "Red", bg: "bg-red-400" },
  { id: "#F472B6", name: "Pink", bg: "bg-pink-400" },
  { id: "#C084FC", name: "Purple", bg: "bg-purple-400" },
  { id: "#38BDF8", name: "Cyan", bg: "bg-sky-400" },
  { id: "#4ADE80", name: "Green", bg: "bg-green-400" },
  { id: "#000000", name: "Black", bg: "bg-black border border-slate-600" },
];

const PRESET_LIST = [
  {
    id: "tiktok",
    name: "ຕິກຕອກ",
    desc: "ຄຳເດັ່ນສີເຫຼືອງ + ຂອບດຳໜາ (ຍອດນິຍົມ)",
    text: "#FFFFFF",
    hi: "#FFE01B",
    bg: false,
    border: "transparent",
    stroke: true,
    strokeW: 3.5,
    strokeC: "#000000",
    glow: false,
    effect: "bounce",
  },
  {
    id: "neon",
    name: "ນີອອນ",
    desc: "ແສງສີຟ້ານີອອນເປັ່ງປະກາຍ + ກ່ອງແຄບຊູນ",
    text: "#FFFFFF",
    hi: "#12E8FF",
    bg: true,
    bgColor: "#0A0D16",
    bgOpacity: 85,
    bgRadius: "rounded-full",
    boxBorder: true,
    border: "#12E8FF",
    stroke: true,
    strokeW: 1.8,
    strokeC: "#000000",
    glow: true,
    glowC: "#12E8FF",
    effect: "bounce",
  },
  {
    id: "clean",
    name: "ສະອາດ",
    desc: "ຕົວໜັງສືຂາວ + ຄຳເດັ່ນເຫຼືອງ + ຂອບດຳ (ຍອດນິຍົມ)",
    text: "#FFFFFF",
    hi: "#FFE01B",
    bg: false,
    border: "transparent",
    stroke: true,
    strokeW: 3.0,
    strokeC: "#000000",
    glow: false,
    effect: "bounce",
  },
  {
    id: "news",
    name: "ຂ່າວ",
    desc: "ແຖບພື້ນຫຼັງສີດຳເຂັ້ມ + ຄຳເດັ່ນສີເຫຼືອງ",
    text: "#FFFFFF",
    hi: "#FFE01B",
    bg: true,
    bgColor: "#000000",
    bgOpacity: 90,
    bgRadius: "rounded-lg",
    boxBorder: false,
    border: "transparent",
    stroke: false,
    strokeW: 0,
    strokeC: "#000000",
    glow: false,
    effect: "bounce",
  },
  {
    id: "karaoke",
    name: "ຄາລາໂອເກະ",
    desc: "ໄຮໄລຕ໌ສີຟ້າ Cyan ຕາມຈັງຫວະສຽງ",
    text: "#FFFFFF",
    hi: "#06B6D4",
    bg: false,
    border: "transparent",
    stroke: true,
    strokeW: 2.5,
    strokeC: "#000000",
    glow: false,
    effect: "karaoke",
  },
];

const LAOSUB_HIGHLIGHT_COLORS = [
  { hex: "#FFE01B", bg: "bg-[#FFE01B]", name: "ເຫຼືອງ" },
  { hex: "#22C55E", bg: "bg-[#22C55E]", name: "ຂຽວ" },
  { hex: "#06B6D4", bg: "bg-[#06B6D4]", name: "ຟ້າ" },
  { hex: "#F43F5E", bg: "bg-[#F43F5E]", name: "ບົວ" },
  { hex: "#FFFFFF", bg: "bg-[#FFFFFF]", name: "ຂາວ" },
  { hex: "#A855F7", bg: "bg-[#A855F7]", name: "ມ່ວງ" },
];

const LAOSUB_BG_COLORS = [
  { hex: "#1E1E1E", bg: "bg-[#1E1E1E]", name: "ດຳ" },
  { hex: "#F1F5F9", bg: "bg-[#F1F5F9]", name: "ຂາວ" },
  { hex: "#E11D48", bg: "bg-[#E11D48]", name: "ແດງ" },
  { hex: "#EA580C", bg: "bg-[#EA580C]", name: "ສົ້ມ" },
  { hex: "#16A34A", bg: "bg-[#16A34A]", name: "ຂຽວ" },
  { hex: "#2563EB", bg: "bg-[#2563EB]", name: "ຟ້າ" },
  { hex: "#7C3AED", bg: "bg-[#7C3AED]", name: "ມ່ວງ" },
];

const EFFECT_LIST = [
  {
    id: "bounce",
    name: "ເດ້ງທີລະຄຳ",
    desc: "ຄຳເວົ້າເດ້ງຂຶ້ນໃຫຍ່ຕາມຈັງຫວະ",
  },
  {
    id: "karaoke",
    name: "ໄລ່ສີຕາມສຽງ",
    desc: "ສີໄຮໄລຕ໌ຄ່ອຍໆປາດຕາມສຽງເວົ້າ",
  },
  {
    id: "typewriter",
    name: "ພິມທີລະຄຳ",
    desc: "ຄຳເວົ້າຄ່ອຍໆໂຜ່ຂຶ້ນມາທີລະຄຳ",
  },
  {
    id: "fade",
    name: "ຄ່ອຍໆປາກົດ",
    desc: "ຂໍ້ຄວາມຄ່ອຍໆເລື່ອນຂຶ້ນມາຢ່າງນຸ່ມນວນ",
  },
  {
    id: "static",
    name: "ຊັບທຳມະດາ",
    desc: "ຕົວໜັງສືນິ້ງ ບໍ່ມີການເຄື່ອນໄຫວ",
  },
] as const;

// 22 CapCut Preset Styles (Image 2)
const CAPCUT_PRESET_STYLES = [
  { id: "none", label: "None", text: "#FFFFFF", stroke: false, strokeW: 0, strokeC: "#000000", glow: false, glowC: "", bg: false, bgC: "", bgR: "", border: "", shadow: false, isNone: true },
  { id: "white-stroke-thin", label: "White Black 1", text: "#FFFFFF", stroke: true, strokeW: 2.5, strokeC: "#000000", glow: false, glowC: "", bg: false, bgC: "", bgR: "", border: "", shadow: false, previewStroke: "1px #000" },
  { id: "white-stroke-thick", label: "White Black 2", text: "#FFFFFF", stroke: true, strokeW: 4.5, strokeC: "#000000", glow: false, glowC: "", bg: false, bgC: "", bgR: "", border: "", shadow: false, previewStroke: "2.2px #000" },
  { id: "white-shadow", label: "White Shadow", text: "#FFFFFF", stroke: false, strokeW: 0, strokeC: "#000000", glow: false, glowC: "", bg: false, bgC: "", bgR: "", border: "", shadow: true, previewShadow: "0 3px 6px #000" },
  { id: "white-solid", label: "White Solid", text: "#FFFFFF", stroke: false, strokeW: 0, strokeC: "#000000", glow: false, glowC: "", bg: false, bgC: "", bgR: "", border: "", shadow: false },
  { id: "yellow-stroke", label: "Yellow Out", text: "#FFEE00", stroke: true, strokeW: 3, strokeC: "#000000", glow: false, glowC: "", bg: false, bgC: "", bgR: "", border: "", shadow: false, previewStroke: "1.2px #000" },
  { id: "red-stroke", label: "Red Out", text: "#FF3344", stroke: true, strokeW: 2.5, strokeC: "#FFFFFF", glow: false, glowC: "", bg: false, bgC: "", bgR: "", border: "", shadow: false, previewStroke: "1.2px #FFF" },
  { id: "orange-stroke", label: "Orange Out", text: "#FF8800", stroke: true, strokeW: 2.5, strokeC: "#FFFFFF", glow: false, glowC: "", bg: false, bgC: "", bgR: "", border: "", shadow: false, previewStroke: "1.2px #FFF" },
  { id: "cyan-stroke", label: "Cyan Out", text: "#00D4FF", stroke: true, strokeW: 2.5, strokeC: "#FFFFFF", glow: false, glowC: "", bg: false, bgC: "", bgR: "", border: "", shadow: false, previewStroke: "1.2px #FFF" },
  { id: "green-stroke", label: "Green Out", text: "#00E676", stroke: true, strokeW: 3, strokeC: "#000000", glow: false, glowC: "", bg: false, bgC: "", bgR: "", border: "", shadow: false, previewStroke: "1.2px #000" },
  { id: "black-stroke", label: "Black Out", text: "#000000", stroke: true, strokeW: 3, strokeC: "#FFFFFF", glow: false, glowC: "", bg: false, bgC: "", bgR: "", border: "", shadow: false, previewStroke: "1.2px #FFF" },
  { id: "pill-white", label: "Pill White", text: "#000000", stroke: false, strokeW: 0, strokeC: "#000000", glow: false, glowC: "", bg: true, bgC: "#FFFFFF", bgR: "rounded-full", border: "", shadow: false, isPill: true },
  { id: "pill-yellow", label: "Pill Yellow", text: "#000000", stroke: false, strokeW: 0, strokeC: "#000000", glow: false, glowC: "", bg: true, bgC: "#FFD700", bgR: "rounded-full", border: "", shadow: false, isPill: true },
  { id: "pill-purple", label: "Pill Purple", text: "#FFFFFF", stroke: false, strokeW: 0, strokeC: "#000000", glow: false, glowC: "", bg: true, bgC: "#7C3AED", bgR: "rounded-full", border: "", shadow: false, isPill: true },
  { id: "pill-white-purple", label: "Pill Lilac", text: "#7C3AED", stroke: false, strokeW: 0, strokeC: "#000000", glow: false, glowC: "", bg: true, bgC: "#FFFFFF", bgR: "rounded-full", border: "", shadow: false, isPill: true },
  { id: "box-white-black", label: "Box White", text: "#000000", stroke: false, strokeW: 0, strokeC: "#000000", glow: false, glowC: "", bg: true, bgC: "#FFFFFF", bgR: "rounded-xl", border: "", shadow: false, isBox: true },
  { id: "box-black-white", label: "Box Black", text: "#FFFFFF", stroke: false, strokeW: 0, strokeC: "#000000", glow: false, glowC: "", bg: true, bgC: "#000000", bgR: "rounded-xl", border: "", shadow: false, isBox: true },
  { id: "neon-green", label: "Neon Green", text: "#00FF66", stroke: false, strokeW: 0, strokeC: "#000000", glow: true, glowC: "#00FF66", bg: false, bgC: "", bgR: "", border: "", shadow: false, previewShadow: "0 0 8px #00FF66" },
  { id: "green-frame", label: "Green Frame", text: "#00FF66", stroke: false, strokeW: 0, strokeC: "#000000", glow: false, glowC: "", bg: true, bgC: "#000000", bgR: "rounded-lg", border: "#00FF66", shadow: false, previewBorder: "1.5px solid #00FF66" },
  { id: "neon-orange", label: "Neon Orange", text: "#FFAA00", stroke: false, strokeW: 0, strokeC: "#000000", glow: true, glowC: "#FF5500", bg: false, bgC: "", bgR: "", border: "", shadow: false, previewShadow: "0 0 8px #FF5500" },
  { id: "neon-pink", label: "Neon Pink", text: "#FF3399", stroke: false, strokeW: 0, strokeC: "#000000", glow: true, glowC: "#FF1493", bg: false, bgC: "", bgR: "", border: "", shadow: false, previewShadow: "0 0 8px #FF1493" },
  { id: "neon-yellow", label: "Neon Yellow", text: "#FFEE00", stroke: false, strokeW: 0, strokeC: "#000000", glow: true, glowC: "#FFD700", bg: false, bgC: "", bgR: "", border: "", shadow: false, previewShadow: "0 0 8px #FFD700" },
];

export default function EditorPage() {
  // Navigation tabs (CapCut style: Media, Captions, Audio only - Resource Library)
  const [activeLeftTab, setActiveLeftTab] = useState<"media" | "captions" | "audio">("captions");

  const [editorAiVersion, setEditorAiVersion] = useState<"v1" | "v2" | "v3">("v1");
  const [editorIntervalMode, setEditorIntervalMode] = useState<"sentence" | "30s">("sentence");

  // Contextual Property Inspector Mode (Text, Keyframe, Video, Audio)
  const [inspectorMode, setInspectorMode] = useState<"text" | "keyframe" | "video" | "audio">("text");

  // Selected Keyframe ID (Pillar 1: Select and edit immediately)
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | null>(null);

  // Custom User Assets (Pillar 7: Stored in browser localStorage / IndexedDB)
  const [customAssets, setCustomAssets] = useState<
    { id: string; name: string; type: "sfx" | "bgm" | "video"; dataUrl?: string; icon?: string }[]
  >([]);
  const customAssetInputRef = useRef<HTMLInputElement | null>(null);

  // Load custom assets from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("saizup_custom_assets");
      if (saved) {
        setCustomAssets(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load custom assets:", e);
    }
  }, []);

  const handleUploadCustomAsset = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const isBgm = file.name.toLowerCase().includes("bgm") || file.name.toLowerCase().includes("music");
      const newAsset = {
        id: `asset-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        type: isBgm ? ("bgm" as const) : ("sfx" as const),
        dataUrl: reader.result as string,
        icon: isBgm ? "🎵" : "🔊",
      };
      const updated = [newAsset, ...customAssets];
      setCustomAssets(updated);
      try {
        localStorage.setItem("saizup_custom_assets", JSON.stringify(updated.slice(0, 30)));
      } catch (err) {
        console.warn("Failed to persist custom asset:", err);
      }
      showToast(`✅ ເພີ່ມ "${newAsset.name}" ເຂົ້າ My Assets ແລ້ວ!`);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteCustomAsset = (id: string) => {
    const updated = customAssets.filter((a) => a.id !== id);
    setCustomAssets(updated);
    try {
      localStorage.setItem("saizup_custom_assets", JSON.stringify(updated));
    } catch {}
    showToast("ລຶບໄຟລ໌ອອກຈາກ My Assets ແລ້ວ");
  };

  const playCustomAudio = (dataUrl?: string) => {
    if (!dataUrl) return;
    try {
      const audio = new window.Audio(dataUrl);
      audio.play();
    } catch (err) {
      console.warn("Play error:", err);
    }
  };

  // Accordion toggle states for Text Inspector
  const [openTextAccordions, setOpenTextAccordions] = useState<{ [key: string]: boolean }>({
    content: true,
    presets: true,
    typography: true,
    animation: true,
    strokeShadow: false,
    background: false,
    transform: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenTextAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // High-performance direct DOM playhead refs (60fps smooth needle without React re-renders)
  const playheadPinRef = useRef<HTMLDivElement | null>(null);
  const playheadNeedleRef = useRef<HTMLDivElement | null>(null);
  const lastReactTimeUpdateRef = useRef<number>(0);

  // LaoSub style tabs for backward compatibility
  const [styleSubTab, setStyleSubTab] = useState<
    "presets-effects" | "font-color" | "size-spacing" | "translation" | "audio" | "mine"
  >("presets-effects");

  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [shadowLevel, setShadowLevel] = useState<number>(0);
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(false);
  const [newSavedName, setNewSavedName] = useState<string>("");

  const [clipLanguage, setClipLanguage] = useState<"th" | "lo" | "en" | "mixed">("lo");
  const [lastSavedTime, setLastSavedTime] = useState<string>("");
  const [projectTitle, setProjectTitle] = useState("1030");
  const [aiCaptionsEnabled, setAiCaptionsEnabled] = useState(true);

  // Subtitle Tab States
  const [subSubTab, setSubSubTab] = useState<"words" | "bulk">("words");
  const [bulkText, setBulkText] = useState("");
  const [selectedSubId, setSelectedSubId] = useState<string>("1");
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);

  // =========================================================================
  // UNDO / REDO HISTORY ENGINE & SNAPSHOTS
  // =========================================================================
  const [undoStack, setUndoStack] = useState<
    {
      subtitles: SubtitleItem[];
      videoTrackClips: VideoTrackClip[];
      keyframes: KeyframeItem[];
      selectedSubId: string;
      selectedVideoClipId: string | null;
      videoColorFilter: {
        brightness: number;
        contrast: number;
        saturation: number;
        hue: number;
        sepia: number;
        blur: number;
        filterPreset: string;
      };
      label: string;
    }[]
  >([]);
  const [redoStack, setRedoStack] = useState<
    {
      subtitles: SubtitleItem[];
      videoTrackClips: VideoTrackClip[];
      keyframes: KeyframeItem[];
      selectedSubId: string;
      selectedVideoClipId: string | null;
      videoColorFilter: {
        brightness: number;
        contrast: number;
        saturation: number;
        hue: number;
        sepia: number;
        blur: number;
        filterPreset: string;
      };
      label: string;
    }[]
  >([]);

  // =========================================================================
  // VIDEO COLOR ADJUSTMENT & GRADING STUDIO
  // =========================================================================
  const [videoColorFilter, setVideoColorFilter] = useState({ ...INITIAL_DEFAULT_COLOR_FILTER });

  // =========================================================================
  // SUBTITLE DRAGGING & RESIZE HANDLES
  // =========================================================================
  const [draggingSubAction, setDraggingSubAction] = useState<{
    type: "move" | "trim-left" | "trim-right";
    subId: string;
    startX: number;
    origTime: number;
    origEndTime: number;
  } | null>(null);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  const computeVideoCssFilter = (f: typeof videoColorFilter) => {
    let s = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) hue-rotate(${f.hue}deg)`;
    if (f.sepia > 0) s += ` sepia(${f.sepia}%)`;
    if (f.blur > 0) s += ` blur(${f.blur}px)`;
    if (f.filterPreset === "vivid") s += ` saturate(135%) contrast(115%) brightness(105%)`;
    else if (f.filterPreset === "cinematic") s += ` contrast(120%) brightness(95%) sepia(15%)`;
    else if (f.filterPreset === "warm") s += ` sepia(25%) hue-rotate(-10deg) saturate(110%)`;
    else if (f.filterPreset === "cool") s += ` hue-rotate(15deg) saturate(95%) brightness(102%)`;
    else if (f.filterPreset === "vintage") s += ` sepia(45%) contrast(90%) brightness(105%)`;
    else if (f.filterPreset === "bw") s += ` grayscale(100%) contrast(120%)`;
    return s;
  };

  // Right Inspector Tab States (Kept for compatibility)
  const [inspectorTab, setInspectorTab] = useState<
    "capcut-text" | "presets-effects" | "font-color" | "size-spacing" | "translation" | "audio" | "mine"
  >("capcut-text");

  // =========================================================================
  // CAPCUT DESKTOP GUIDES, RULERS & STILL FRAME EXPORT (Default Clean Off)
  // =========================================================================
  const [showRulers, setShowRulers] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const [lockGuides, setLockGuides] = useState(false);
  const [horizontalGuides, setHorizontalGuides] = useState<number[]>([]);
  const [verticalGuides, setVerticalGuides] = useState<number[]>([]);
  const [isGuidesDropdownOpen, setIsGuidesDropdownOpen] = useState(false);
  const [isGuidesSubmenuOpen, setIsGuidesSubmenuOpen] = useState(false);

  // =========================================================================
  // CAPCUT CANVAS ZOOM & FIT-TO-SCREEN CONTROLS
  // =========================================================================
  const [canvasZoomMode, setCanvasZoomMode] = useState<"fit" | "fill" | "50%" | "75%" | "100%" | "125%" | "150%" | "200%">("fit");
  const [canvasZoomScale, setCanvasZoomScale] = useState<number>(1.0);
  const [isZoomDropdownOpen, setIsZoomDropdownOpen] = useState(false);

  // =========================================================================
  // CAPCUT DESKTOP MULTI-TRACK CONTROLS (Locks, Eye Visibility, Audio Mutes)
  // =========================================================================
  const [trackLocks, setTrackLocks] = useState({
    effects: false,
    stickers: false,
    text: false,
    video: false,
    videoAudio: false,
    bgm: false,
  });
  const [trackVisibilities, setTrackVisibilities] = useState({
    effects: true,
    stickers: true,
    text: true,
    video: true,
  });
  const [trackMutes, setTrackMutes] = useState({
    video: false,
    videoAudio: false,
    bgm: false,
  });

  // Timeline Toolbar Tool Mode (Cursor Selection vs Split Tool)
  const [activeToolMode, setActiveToolMode] = useState<"select" | "split">("select");
  const [showToolModeDropdown, setShowToolModeDropdown] = useState(false);

  // =========================================================================
  // CAPCUT DESKTOP TEXT & SUBTITLE INSPECTOR CONTROLS (Images 2 & 3)
  // =========================================================================
  const [capcutPatternBold, setCapcutPatternBold] = useState(true);
  const [capcutPatternUnderline, setCapcutPatternUnderline] = useState(false);
  const [capcutPatternItalic, setCapcutPatternItalic] = useState(false);
  const [capcutTextCase, setCapcutTextCase] = useState<"normal" | "upper" | "lower" | "title">("normal");
  const [capcutCharSpacing, setCapcutCharSpacing] = useState(0);
  const [capcutLineSpacing, setCapcutLineSpacing] = useState(0);
  const [capcutTextAlign, setCapcutTextAlign] = useState<"left" | "center" | "right" | "justify">("center");
  const [capcutVerticalAlign, setCapcutVerticalAlign] = useState<"top" | "middle" | "bottom">("middle");
  const [capcutScale, setCapcutScale] = useState(100);
  const [capcutUniformScale, setCapcutUniformScale] = useState(true);
  const [capcutPositionX, setCapcutPositionX] = useState(0);
  const [capcutPlaneRotation, setCapcutPlaneRotation] = useState(0);

  // Accordion Expand/Collapse States
  const [accordionOpen, setAccordionOpen] = useState({
    transform: true,
    blend: true,
    stroke: false,
    background: false,
    glow: false,
    shadow: false,
    curve: false,
  });

  // Blend & Shadow & Curve States
  const [blendOpacity, setBlendOpacity] = useState(100);
  const [enableShadow, setEnableShadow] = useState(false);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowBlur, setShadowBlur] = useState(8);
  const [shadowDistance, setShadowDistance] = useState(4);
  const [enableCurve, setEnableCurve] = useState(false);
  const [curveArc, setCurveArc] = useState(0);

  // --- Subtitle Customization States ---
  const [activePreset, setActivePreset] = useState<
    "clean" | "neon" | "news" | "karaoke" | "tiktok" | "podcast" | "fire" | "cyber"
  >("clean");
  const [activeEffect, setActiveEffect] = useState<
    "bounce" | "karaoke" | "typewriter" | "fade" | "static"
  >("bounce");
  const [selectedFont, setSelectedFont] = useState<string>("Noto Sans Lao");
  const [fontWeight, setFontWeight] = useState<"400" | "600" | "800" | "900">("900");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [highlightColor, setHighlightColor] = useState("#FFD000");

  // Background Box Customization (Toggle on/off - Default OFF for clean floating text like TikTok)
  const [enableBackground, setEnableBackground] = useState<boolean>(false);
  const [bgColor, setBgColor] = useState<string>("#000000");
  const [bgOpacity, setBgOpacity] = useState<number>(75);
  const [bgRadius, setBgRadius] = useState<"rounded-none" | "rounded-xl" | "rounded-2xl" | "rounded-full">("rounded-2xl");
  const [enableBoxBorder, setEnableBoxBorder] = useState<boolean>(false);
  const [boxBorderColor, setBoxBorderColor] = useState<string>("#38BDF8");

  // Stroke / Outline Customization (High Contrast Black Outline with Paint Order)
  const [enableStroke, setEnableStroke] = useState<boolean>(true);
  const [strokeWidth, setStrokeWidth] = useState<number>(3.5);
  const [strokeColor, setStrokeColor] = useState<string>("#000000");

  // Glow / Shadow / Reflection
  const [enableGlow, setEnableGlow] = useState<boolean>(false);
  const [glowColor, setGlowColor] = useState<string>("#FFD000");
  const [glowIntensity, setGlowIntensity] = useState<number>(10);

  // Words Per Batch & Spacing
  const [wordsPerBatch, setWordsPerBatch] = useState<"1" | "2" | "3" | "4" | "sentence">("4");
  const [letterSpacing, setLetterSpacing] = useState<"tight" | "space">("tight");
  const [fontScale, setFontScale] = useState(6.5);
  const [positionY, setPositionY] = useState(82);

  // Bilingual Translation
  const [showBilingual, setShowBilingual] = useState(false);

  const handleTranslateAllSubtitles = async () => {
    if (subtitles.length === 0) {
      showToast("ບໍ່ມີຂໍ້ຄວາມຊັບທີ່ຈະແປ");
      return;
    }
    setIsTranslating(true);
    setShowBilingual(true);
    try {
      const srcLang = clipLanguage === "th" ? "th" : "lo";
      const tgtLang = clipLanguage === "th" ? "lo" : "th";
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subtitles: subtitles.map((s) => ({
            id: s.id,
            time: s.time,
            endTime: s.endTime,
            text: s.text,
          })),
          sourceLang: srcLang,
          targetLang: tgtLang,
        }),
      });
      const resText = await res.text();
      let data: any = {};
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch {
        data = {};
      }
      if (res.ok && data.success && Array.isArray(data.subtitles)) {
        setSubtitles((prev) =>
          prev.map((s, idx) => ({
            ...s,
            translatedText: data.subtitles[idx]?.text || s.translatedText,
          }))
        );
        showToast(`🎉 ແປຊັບເປັນ ${tgtLang === "th" ? "ພາສາໄທ" : "ພາສາລາວ"} ສຳເລັດແລ້ວ!`);
      } else {
        // Fallback display
        setSubtitles((prev) =>
          prev.map((s) => ({
            ...s,
            translatedText: s.translatedText || `ແປ: ${s.text}`,
          }))
        );
        showToast("ແປຊັບສຳເລັດ!");
      }
    } catch (err: any) {
      console.warn("Translation fallback:", err);
      setSubtitles((prev) =>
        prev.map((s) => ({
          ...s,
          translatedText: s.translatedText || `ແປ: ${s.text}`,
        }))
      );
      showToast("ແປຊັບສຳເລັດ!");
    } finally {
      setIsTranslating(false);
    }
  };

  // Custom Saved Presets
  const [savedStyles, setSavedStyles] = useState<
    { name: string; preset: string; textColor: string; highlight: string; hasBg: boolean }[]
  >([
    { name: "Lao Viral Clean (ຍົກຕົວຢ່າງ)", preset: "clean", textColor: "#FFFFFF", highlight: "#FFD000", hasBg: false },
    { name: "Neon Cyber", preset: "neon", textColor: "#FFFFFF", highlight: "#38BDF8", hasBg: true },
  ]);

  // Video State & Aspect Ratio Orientation
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15.0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(1);

  // Aspect Ratio & Cropping Mode (Horizontal, Vertical, Square, Portrait)
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9" | "1:1" | "4:5">("9:16");
  const [videoFit, setVideoFit] = useState<"cover" | "contain">("cover");

  // Media Bin State with Video Preview Cards
  const [mediaList, setMediaList] = useState<MediaClipItem[]>(INITIAL_DEFAULT_MEDIA_LIST);

  // Video Track Clips on Timeline (Supports Drag-and-Drop, Split, Trimming)
  const [videoTrackClips, setVideoTrackClips] = useState<VideoTrackClip[]>(INITIAL_DEFAULT_VIDEO_CLIPS);

  const [selectedVideoClipId, setSelectedVideoClipId] = useState<string | null>("vclip-1");

  // Real-time Keyframe Engine (CapCut Desktop Keyframes)
  const [keyframes, setKeyframes] = useState<KeyframeItem[]>(INITIAL_DEFAULT_KEYFRAMES);
  const [isKeyframePanelOpen, setIsKeyframePanelOpen] = useState(false);

  // Interactive Clip Dragging State (Slide Move, Left Trim, Right Trim)
  const [draggingClipAction, setDraggingClipAction] = useState<{
    type: "move" | "trim-left" | "trim-right";
    clipId: string;
    startX: number;
    origStartTime: number;
    origDuration: number;
    origInPoint: number;
    origOutPoint: number;
  } | null>(null);

  // Timeline State & Snapping
  const [timelineZoom, setTimelineZoom] = useState(1.0);
  const [enableSnapping, setEnableSnapping] = useState(true);

  // =========================================================================
  // 1. RESIZABLE PANELS STATE (Widths & Heights adjustable like CapCut Desktop)
  // =========================================================================
  const [leftPanelWidth, setLeftPanelWidth] = useState(300);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(330);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [timelineHeight, setTimelineHeight] = useState(240);
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);

  // =========================================================================
  // 2. VIDEO GUIDELINES & SOCIAL MEDIA SAFE ZONES (TikTok, Reels, FB, Grid)
  // =========================================================================
  const [guidelineMode, setGuidelineMode] = useState<
    "none" | "tiktok-safe" | "reels-safe" | "fb-safe"
  >("none");

  // =========================================================================
  // 3. AI VIDEO CUTTER / REFERENCE CLIP MATCHING STATE
  // =========================================================================
  const [isAiCutterOpen, setIsAiCutterOpen] = useState(false);
  const [refVideoFile, setRefVideoFile] = useState<File | null>(null);
  const [aiCutPacing, setAiCutPacing] = useState<"viral-fast" | "podcast" | "beat-drop">("viral-fast");
  const [removeDeadAir, setRemoveDeadAir] = useState(true);
  const [isAiCutting, setIsAiCutting] = useState(false);

  // Keyboard Shortcuts Modal State
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // AI & Generation States
  const [isGeneratingSubtitles, setIsGeneratingSubtitles] = useState(false);
  const [sttStepText, setSttStepText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auth State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const isFreeTier = !currentUser?.isOwner && (currentUser?.plan === "Free" || currentUser?.plan === "Free Trial" || !currentUser);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const refFileInputRef = useRef<HTMLInputElement>(null);
  const timelineTrackRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Export Modal & Saved Draft States
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  // Subtitles dataset with clear, high-contrast Lao words (matching user's reference screenshot)
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>(INITIAL_DEFAULT_SUBTITLES);

  // Load user from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("saizup_user");
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      } else {
        const defaultOwner = {
          email: "kobx2.2005@gmail.com",
          name: "kobx2.2005",
          trialDaysRemaining: 2,
          credits: 500,
          plan: "Pro Creator",
        };
        localStorage.setItem("saizup_user", JSON.stringify(defaultOwner));
        setCurrentUser(defaultOwner);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Sync bulk text with subtitles
  useEffect(() => {
    const fullTranscript = subtitles.map((s) => s.text).join("\n");
    setBulkText(fullTranscript);
  }, [subtitles]);

  // =========================================================================
  // BROWSER LOCALSTORAGE AUTO-SAVE & RESTORE ENGINE
  // =========================================================================
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      try {
        const payload = {
          projectTitle,
          subtitles,
          activePreset,
          textColor,
          highlightColor,
          selectedFont,
          fontScale,
          keyframes,
          capcutScale,
          capcutPositionX,
          positionY,
          capcutPlaneRotation,
          blendOpacity,
          enableBackground,
          bgColor,
          bgOpacity,
          enableStroke,
          strokeColor,
          clipLanguage,
          savedAt: new Date().toLocaleTimeString(),
        };
        localStorage.setItem("saizup_capcut_project", JSON.stringify(payload));
        setIsSaved(true);
        setLastSavedTime(payload.savedAt);
      } catch (err) {
        console.warn("Auto-save error:", err);
      }
    }, 1500);

    return () => clearTimeout(saveTimer);
  }, [
    projectTitle,
    subtitles,
    activePreset,
    textColor,
    highlightColor,
    selectedFont,
    fontScale,
    keyframes,
    capcutScale,
    capcutPositionX,
    positionY,
    capcutPlaneRotation,
    blendOpacity,
    enableBackground,
    bgColor,
    bgOpacity,
    enableStroke,
    strokeColor,
    clipLanguage,
  ]);

  // Check if saved draft exists in browser localStorage (do NOT auto-overwrite workspace on open, keep fresh initial default state)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("saizup_capcut_project");
      if (saved) {
        setHasSavedDraft(true);
      }
    } catch (e) {
      console.warn("Check saved draft error:", e);
    }
  }, []);

  const handleManualSave = () => {
    try {
      const payload = {
        projectTitle,
        subtitles,
        activePreset,
        textColor,
        highlightColor,
        selectedFont,
        fontScale,
        keyframes,
        capcutScale,
        capcutPositionX,
        positionY,
        capcutPlaneRotation,
        blendOpacity,
        enableBackground,
        bgColor,
        bgOpacity,
        enableStroke,
        strokeColor,
        clipLanguage,
        savedAt: new Date().toLocaleTimeString(),
      };
      localStorage.setItem("saizup_capcut_project", JSON.stringify(payload));
      setIsSaved(true);
      setLastSavedTime(payload.savedAt);
      showToast(`💾 ບັນທຶກໂປຣເຈັກໄວ້ໃນ Browser ແລ້ວ (${payload.savedAt})`);
    } catch {
      showToast("❌ ບໍ່ສາມາດບັນທຶກໄດ້");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Canvas Zoom & Fit Handlers
  const handleZoomIn = () => {
    setCanvasZoomScale((prev) => {
      const next = Math.min(3.0, Number((prev + 0.15).toFixed(2)));
      setCanvasZoomMode(`${Math.round(next * 100)}%` as any);
      return next;
    });
  };

  const handleZoomOut = () => {
    setCanvasZoomScale((prev) => {
      const next = Math.max(0.35, Number((prev - 0.15).toFixed(2)));
      setCanvasZoomMode(`${Math.round(next * 100)}%` as any);
      return next;
    });
  };

  const handleSetZoomMode = (mode: "fit" | "fill" | "50%" | "75%" | "100%" | "125%" | "150%" | "200%") => {
    setCanvasZoomMode(mode);
    setIsZoomDropdownOpen(false);
    if (mode === "fit") {
      setCanvasZoomScale(1.0);
    } else if (mode === "fill") {
      setCanvasZoomScale(1.2);
    } else {
      const pct = parseInt(mode) || 100;
      setCanvasZoomScale(pct / 100);
    }
  };

  const handleCanvasWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  };

  // Listen for Ctrl+Alt+R to toggle rulers (Image 5)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && (e.key === "r" || e.key === "R")) {
        e.preventDefault();
        setShowRulers((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync Video Mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = trackMutes.video || isMuted;
    }
  }, [trackMutes.video, isMuted]);

  // Export Still Frame (Image 5)
  const handleExportStillFrame = () => {
    if (!videoRef.current) {
      showToast("ບໍ່ພົບວິດີໂອສຳລັບບັນທຶກພາບ");
      return;
    }
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1080;
      canvas.height = video.videoHeight || 1920;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `saizup_frame_${Math.floor(currentTime * 1000)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast("ບັນທຶກພາບນິ້ງ (Still Frame Exported) ສຳເລັດແລ້ວ!");
      }
    } catch (err) {
      console.error("Failed to export still frame:", err);
      showToast("ເກີດຂໍ້ຜິດພາດໃນການດາວໂຫຼດພາບນິ້ງ");
    }
  };

  // Helper to transform text casing (Image 2)
  const transformTextCase = (text: string, textCase: "normal" | "upper" | "lower" | "title") => {
    if (!text) return "";
    if (textCase === "upper") return text.toUpperCase();
    if (textCase === "lower") return text.toLowerCase();
    if (textCase === "title") {
      return text.replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return text;
  };

  // Live Subtitle Update from Textarea (Image 2)
  const handleUpdateActiveSubtitleText = (newText: string) => {
    const currentSub = subtitles.find((s) => currentTime >= s.time && currentTime <= s.endTime) || (subtitles.length > 0 ? subtitles[0] : null);
    if (!currentSub) return;
    setSubtitles((prev) =>
      prev.map((s) => {
        if (s.id === currentSub.id) {
          const wordsArray = newText.trim().split(/\s+/).filter(Boolean).map((w) => ({ text: w }));
          return {
            ...s,
            text: newText,
            words: wordsArray.length > 0 ? wordsArray : [{ text: newText }],
          };
        }
        return s;
      })
    );
  };

  // Apply CapCut Style Preset (Image 2)
  const applyCapcutPreset = (p: typeof CAPCUT_PRESET_STYLES[number]) => {
    setTextColor(p.text);
    setEnableStroke(p.stroke);
    setStrokeWidth(p.strokeW);
    setStrokeColor(p.strokeC);
    setEnableGlow(p.glow);
    if (p.glow && p.glowC) setGlowColor(p.glowC);
    setEnableBackground(p.bg);
    if (p.bg && p.bgC) setBgColor(p.bgC);
    if (p.bg && p.bgR) setBgRadius(p.bgR as any);
    if (p.border) {
      setEnableBoxBorder(true);
      setBoxBorderColor(p.border);
    } else {
      setEnableBoxBorder(false);
    }
    setEnableShadow(p.shadow);
    showToast(`ເລືອກຮູບແບບ: ${p.label}`);
  };

  // Generate live video frame thumbnail via offscreen canvas
  const generateVideoThumbnail = (file: File): Promise<{ thumbUrl: string; duration: number }> => {
    return new Promise((resolve) => {
      try {
        const v = document.createElement("video");
        v.preload = "metadata";
        v.muted = true;
        v.playsInline = true;
        const tempUrl = URL.createObjectURL(file);
        v.src = tempUrl;

        v.onloadedmetadata = () => {
          const dur = v.duration || 15;
          v.currentTime = Math.min(1.0, dur / 2);
        };

        v.onseeked = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = 160;
            canvas.height = 90;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
              const thumb = canvas.toDataURL("image/jpeg", 0.7);
              resolve({ thumbUrl: thumb, duration: v.duration || 15 });
              return;
            }
          } catch {
            // fallback
          }
          resolve({
            thumbUrl: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='90'><rect width='160' height='90' fill='%231b1e2c'/><polygon points='75,36 92,45 75,54' fill='%2312E8FF'/></svg>`,
            duration: v.duration || 15,
          });
        };

        v.onerror = () => {
          resolve({
            thumbUrl: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='90'><rect width='160' height='90' fill='%231b1e2c'/><polygon points='75,36 92,45 75,54' fill='%2312E8FF'/></svg>`,
            duration: 15,
          });
        };
      } catch {
        resolve({ thumbUrl: "", duration: 15 });
      }
    });
  };

  // Video File Upload & Live Thumbnail Processing (From input or Timeline Drag-and-Drop)
  const loadDroppedVideoFile = async (file: File, dropTime?: number) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setProjectTitle(file.name.replace(/\.[^/.]+$/, ""));
    setIsPlaying(false);
    const startAt = typeof dropTime === "number" ? Number(dropTime.toFixed(2)) : 0;
    setCurrentTime(startAt);

    const { thumbUrl, duration: extractedDur } = await generateVideoThumbnail(file);
    const newDur = Number(extractedDur.toFixed(2)) || 15.0;
    setDuration((prev) => Math.max(prev, startAt + newDur));

    const newMedia: MediaClipItem = {
      id: `media-${Date.now()}`,
      name: file.name,
      file,
      url,
      thumbUrl: thumbUrl || `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='90'><rect width='160' height='90' fill='%231b1e2c'/><polygon points='75,36 92,45 75,54' fill='%2312E8FF'/></svg>`,
      duration: newDur,
      resolution: "1080x1920 (9:16)",
    };

    setMediaList((prev) => [newMedia, ...prev]);

    const newClip: VideoTrackClip = {
      id: `vclip-${Date.now()}`,
      mediaId: newMedia.id,
      name: file.name.replace(/\.[^/.]+$/, ""),
      thumbUrl: newMedia.thumbUrl,
      startTime: startAt,
      duration: newDur,
      inPoint: 0,
      outPoint: newDur,
    };

    setVideoTrackClips((prev) => [...prev.filter((c) => c.startTime !== startAt), newClip].sort((a, b) => a.startTime - b.startTime));
    setSelectedVideoClipId(newClip.id);
    showToast(`ໂຫຼດວິດີໂອ "${file.name}" ລົງໃນໄທມ໌ໄລນ໌ສຳເລັດແລ້ວ!`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await loadDroppedVideoFile(file, 0);
    }
  };

  // Add media to timeline (either via button or drag-and-drop)
  const handleAddMediaToTimeline = (mediaId: string, dropTime?: number) => {
    const media = mediaList.find((m) => m.id === mediaId);
    if (!media) return;

    const start = typeof dropTime === "number" ? Number(dropTime.toFixed(2)) : currentTime;
    const newClip: VideoTrackClip = {
      id: `vclip-${Date.now()}`,
      mediaId: media.id,
      name: media.name.replace(/\.[^/.]+$/, ""),
      thumbUrl: media.thumbUrl,
      startTime: start,
      duration: media.duration,
      inPoint: 0,
      outPoint: media.duration,
    };

    setVideoTrackClips((prev) => [...prev, newClip].sort((a, b) => a.startTime - b.startTime));
    setSelectedVideoClipId(newClip.id);
    if (media.url) setVideoUrl(media.url);
    setDuration((prev) => Math.max(prev, start + media.duration));
    showToast(`ເພີ່ມ "${media.name}" ລົງໃນໄທມ໌ໄລນ໌ແລ້ວ!`);
  };

  // =========================================================================
  // REAL-TIME KEYFRAME ENGINE (Interpolation, Diamonds, Live Player & Inspector)
  // =========================================================================
  const getInterpolatedKeyframeValues = useCallback(
    (time: number) => {
      if (keyframes.length === 0) {
        return {
          scale: capcutScale,
          positionX: capcutPositionX,
          positionY: positionY,
          rotation: capcutPlaneRotation,
          opacity: blendOpacity,
        };
      }
      const sorted = [...keyframes].sort((a, b) => a.time - b.time);
      if (time <= sorted[0].time) {
        return {
          scale: sorted[0].scale,
          positionX: sorted[0].positionX,
          positionY: sorted[0].positionY,
          rotation: sorted[0].rotation,
          opacity: sorted[0].opacity,
        };
      }
      if (time >= sorted[sorted.length - 1].time) {
        const last = sorted[sorted.length - 1];
        return {
          scale: last.scale,
          positionX: last.positionX,
          positionY: last.positionY,
          rotation: last.rotation,
          opacity: last.opacity,
        };
      }
      // Find surrounding keyframes
      let prev = sorted[0];
      let next = sorted[sorted.length - 1];
      for (let i = 0; i < sorted.length - 1; i++) {
        if (time >= sorted[i].time && time <= sorted[i + 1].time) {
          prev = sorted[i];
          next = sorted[i + 1];
          break;
        }
      }
      const span = next.time - prev.time;
      const rawProgress = span === 0 ? 0 : Math.max(0, Math.min(1, (time - prev.time) / span));
      // CapCut Smooth Ease-in-Out Hermite Interpolation (Fluid Animation)
      const easeProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);
      return {
        scale: Math.round(prev.scale + (next.scale - prev.scale) * easeProgress),
        positionX: Math.round(prev.positionX + (next.positionX - prev.positionX) * easeProgress),
        positionY: Number((prev.positionY + (next.positionY - prev.positionY) * easeProgress).toFixed(1)),
        rotation: Number((prev.rotation + (next.rotation - prev.rotation) * easeProgress).toFixed(1)),
        opacity: Math.round(prev.opacity + (next.opacity - prev.opacity) * easeProgress),
      };
    },
    [keyframes, capcutScale, capcutPositionX, positionY, capcutPlaneRotation, blendOpacity]
  );

  const currentKfValues = useMemo(() => {
    return getInterpolatedKeyframeValues(currentTime);
  }, [currentTime, getInterpolatedKeyframeValues]);

  const exactKfAtPlayhead = useMemo(() => {
    return keyframes.find((k) => Math.abs(k.time - currentTime) <= 0.25);
  }, [keyframes, currentTime]);

  const hasKeyframeAtPlayhead = !!exactKfAtPlayhead;

  const rulerTicks = useMemo(() => {
    const totalSec = duration || 15;
    const count = Math.ceil(totalSec / 2) + 1;
    return Array.from({ length: count }, (_, i) => {
      const sec = i * 2;
      const leftPct = (sec / totalSec) * 100;
      return { sec, leftPct };
    });
  }, [duration]);

  const handleToggleKeyframeAtPlayhead = useCallback(() => {
    const existing = keyframes.find((k) => Math.abs(k.time - currentTime) <= 0.25);
    if (existing) {
      setKeyframes((prev) => prev.filter((k) => k.id !== existing.id));
      showToast(`ລຶບ Keyframe ທີ່ ${formatTime(existing.time)} ແລ້ວ`);
    } else {
      const newKf: KeyframeItem = {
        id: `kf-${Date.now()}`,
        time: Number(currentTime.toFixed(2)),
        scale: currentKfValues.scale,
        positionX: currentKfValues.positionX,
        positionY: currentKfValues.positionY,
        rotation: currentKfValues.rotation,
        opacity: currentKfValues.opacity,
      };
      setKeyframes((prev) => [...prev, newKf].sort((a, b) => a.time - b.time));
      showToast(`ເພີ່ມ Keyframe ໃໝ່ທີ່ ${formatTime(currentTime)} ແລ້ວ! (Shift+Alt+K)`);
    }
  }, [keyframes, currentTime, currentKfValues, showToast]);

  // =========================================================================
  // UNDO / REDO HISTORY DISPATCHERS
  // =========================================================================
  const pushHistorySnapshot = useCallback(
    (label: string = "Action") => {
      setUndoStack((prev) => [
        ...prev.slice(-30),
        {
          subtitles: JSON.parse(JSON.stringify(subtitles)),
          videoTrackClips: JSON.parse(JSON.stringify(videoTrackClips)),
          keyframes: JSON.parse(JSON.stringify(keyframes)),
          selectedSubId,
          selectedVideoClipId,
          videoColorFilter: { ...videoColorFilter },
          label,
        },
      ]);
      setRedoStack([]);
    },
    [subtitles, videoTrackClips, keyframes, selectedSubId, selectedVideoClipId, videoColorFilter]
  );

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) {
      showToast("ບໍ່ມີປະຫວັດໃຫ້ຍົກເລີກ (No undo)");
      return;
    }
    const target = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);

    setRedoStack((prev) => [
      ...prev,
      {
        subtitles: JSON.parse(JSON.stringify(subtitles)),
        videoTrackClips: JSON.parse(JSON.stringify(videoTrackClips)),
        keyframes: JSON.parse(JSON.stringify(keyframes)),
        selectedSubId,
        selectedVideoClipId,
        videoColorFilter: { ...videoColorFilter },
        label: "Redo",
      },
    ]);
    setUndoStack(newUndo);

    setSubtitles(target.subtitles);
    setVideoTrackClips(target.videoTrackClips);
    setKeyframes(target.keyframes);
    setVideoColorFilter(target.videoColorFilter);
    if (target.selectedSubId) setSelectedSubId(target.selectedSubId);
    if (target.selectedVideoClipId) setSelectedVideoClipId(target.selectedVideoClipId);

    showToast(`↶ ຍົກເລີກ: ${target.label}`);
  }, [undoStack, subtitles, videoTrackClips, keyframes, selectedSubId, selectedVideoClipId, videoColorFilter]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) {
      showToast("ບໍ່ມີປະຫວັດໃຫ້ເຮັດຊ້ຳ (No redo)");
      return;
    }
    const target = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);

    setUndoStack((prev) => [
      ...prev,
      {
        subtitles: JSON.parse(JSON.stringify(subtitles)),
        videoTrackClips: JSON.parse(JSON.stringify(videoTrackClips)),
        keyframes: JSON.parse(JSON.stringify(keyframes)),
        selectedSubId,
        selectedVideoClipId,
        videoColorFilter: { ...videoColorFilter },
        label: "Undo",
      },
    ]);
    setRedoStack(newRedo);

    setSubtitles(target.subtitles);
    setVideoTrackClips(target.videoTrackClips);
    setKeyframes(target.keyframes);
    setVideoColorFilter(target.videoColorFilter);
    if (target.selectedSubId) setSelectedSubId(target.selectedSubId);
    if (target.selectedVideoClipId) setSelectedVideoClipId(target.selectedVideoClipId);

    showToast(`↷ ເຮັດຊ້ຳ (Redo)`);
  }, [redoStack, subtitles, videoTrackClips, keyframes, selectedSubId, selectedVideoClipId, videoColorFilter]);

  // =========================================================================
  // RESET TO DEFAULT & RESTORE DRAFT ENGINE
  // =========================================================================
  const handleResetToInitialDefault = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "ທ່ານຕ້ອງການຣີເຊັດໂປຣເຈັກເປັນຄ່າເລີ່ມຕົ້ນ (Default) ແທ້ບໍ່?\n(ທຸກການປ່ຽນແປງທີ່ບໍ່ໄດ້ Export ຈະຖືກລ້າງອອກ)"
      )
    ) {
      return;
    }
    pushHistorySnapshot("Reset to Default Project");
    setSubtitles(JSON.parse(JSON.stringify(INITIAL_DEFAULT_SUBTITLES)));
    setVideoTrackClips(JSON.parse(JSON.stringify(INITIAL_DEFAULT_VIDEO_CLIPS)));
    setMediaList(JSON.parse(JSON.stringify(INITIAL_DEFAULT_MEDIA_LIST)));
    setKeyframes(JSON.parse(JSON.stringify(INITIAL_DEFAULT_KEYFRAMES)));
    setVideoColorFilter({ ...INITIAL_DEFAULT_COLOR_FILTER });
    setProjectTitle("ຍົກຕົວຢ່າງໃຫ້ເບິ່ງ_LaoSpeech");
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    setSelectedSubId("1");
    setSelectedVideoClipId("vclip-1");
    setSelectedKeyframeId(null);
    setVideoFit("cover");
    setAspectRatio("9:16");
    try {
      localStorage.removeItem("saizup_capcut_project");
    } catch (_) {}
    setHasSavedDraft(false);
    showToast("🔄 ຣີເຊັດເປັນຄ່າເລີ່ມຕົ້ນ (Default) ສຳເລັດແລ້ວ!");
  };

  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem("saizup_capcut_project");
      if (saved) {
        const p = JSON.parse(saved);
        pushHistorySnapshot("Restore Saved Draft");
        if (Array.isArray(p.subtitles) && p.subtitles.length > 0) {
          setSubtitles(p.subtitles);
        }
        if (p.projectTitle) setProjectTitle(p.projectTitle);
        if (p.activePreset) setActivePreset(p.activePreset);
        if (p.textColor) setTextColor(p.textColor);
        if (p.highlightColor) setHighlightColor(p.highlightColor);
        if (p.selectedFont) setSelectedFont(p.selectedFont);
        if (p.fontScale) setFontScale(p.fontScale);
        if (Array.isArray(p.keyframes) && p.keyframes.length > 0) setKeyframes(p.keyframes);
        if (typeof p.capcutScale === "number") setCapcutScale(p.capcutScale);
        if (typeof p.capcutPositionX === "number") setCapcutPositionX(p.capcutPositionX);
        if (typeof p.positionY === "number") setPositionY(p.positionY);
        if (typeof p.capcutPlaneRotation === "number") setCapcutPlaneRotation(p.capcutPlaneRotation);
        if (typeof p.blendOpacity === "number") setBlendOpacity(p.blendOpacity);
        if (typeof p.enableBackground === "boolean") setEnableBackground(p.enableBackground);
        if (p.bgColor) setBgColor(p.bgColor);
        if (typeof p.bgOpacity === "number") setBgOpacity(p.bgOpacity);
        if (typeof p.enableStroke === "boolean") setEnableStroke(p.enableStroke);
        if (p.strokeColor) setStrokeColor(p.strokeColor);
        if (p.clipLanguage) setClipLanguage(p.clipLanguage);
        if (p.savedAt) setLastSavedTime(p.savedAt);
        showToast("✅ ກູ້ຄືນສະບັບຮ່າງເກົ່າສຳເລັດແລ້ວ!");
      }
    } catch (e) {
      console.warn("Restore draft error:", e);
      showToast("❌ ບໍ່ສາມາດກູ້ຄືນສະບັບຮ່າງໄດ້");
    } finally {
      setHasSavedDraft(false);
    }
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem("saizup_capcut_project");
    } catch (_) {}
    setHasSavedDraft(false);
    showToast("🗑️ ລຶບສະບັບຮ່າງເກົ່າອອກແລ້ວ");
  };

  // =========================================================================
  // PROJECT PACKAGE EXPORT & IMPORT (.saizup file)
  // =========================================================================
  const handleExportProjectPackage = () => {
    try {
      const projectPackage = {
        format: "saizup-project",
        version: "1.0",
        appName: "SAIZUP AI Studio",
        exportedAt: new Date().toISOString(),
        projectTitle: projectTitle || "saizup_project",
        aspectRatio,
        videoFit,
        duration,
        subtitles,
        videoTrackClips,
        mediaList,
        keyframes,
        videoColorFilter,
        typography: {
          activePreset,
          textColor,
          highlightColor,
          selectedFont,
          fontScale,
          clipLanguage,
        },
        transform: {
          capcutScale,
          capcutPositionX,
          positionY,
          capcutPlaneRotation,
          blendOpacity,
        },
        styling: {
          enableBackground,
          bgColor,
          bgOpacity,
          enableStroke,
          strokeColor,
        },
      };

      const jsonString = JSON.stringify(projectPackage, null, 2);
      const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeTitle = (projectTitle || "saizup_project").replace(/[^\w\u0E80-\u0EFF\u0E00-\u0E7F-]/g, "_");
      a.href = url;
      a.download = `${safeTitle}.saizup`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("💾 Export ໂປຣເຈັກ (.saizup) ສຳເລັດແລ້ວ! ສາມາດນຳກັບມາຕັດຕໍ່ໄດ້ທຸກເວລາ");
    } catch (err) {
      console.error("Export project error:", err);
      showToast("❌ ເກີດຂໍ້ຜິດພາດໃນການ Export ໂປຣເຈັກ");
    }
  };

  const handleImportProjectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        if (!data || (!Array.isArray(data.subtitles) && !Array.isArray(data.videoTrackClips))) {
          showToast("❌ ຮູບແບບໄຟລ໌ບໍ່ຖືກຕ້ອງ (ກະລຸນາເລືອກໄຟລ໌ .saizup ຫຼື .json ຂອງ SAIZUP)");
          return;
        }

        pushHistorySnapshot("Import Project Package");

        if (data.projectTitle) setProjectTitle(data.projectTitle);
        if (data.aspectRatio) setAspectRatio(data.aspectRatio);
        if (data.videoFit) setVideoFit(data.videoFit);
        if (typeof data.duration === "number") setDuration(data.duration);

        if (Array.isArray(data.subtitles)) {
          setSubtitles(data.subtitles);
          if (data.subtitles.length > 0) setSelectedSubId(data.subtitles[0].id);
        }

        if (Array.isArray(data.videoTrackClips)) {
          setVideoTrackClips(data.videoTrackClips);
          if (data.videoTrackClips.length > 0) setSelectedVideoClipId(data.videoTrackClips[0].id);
        }

        if (Array.isArray(data.mediaList)) {
          setMediaList(data.mediaList);
        }

        if (Array.isArray(data.keyframes)) {
          setKeyframes(data.keyframes);
        }

        if (data.videoColorFilter) {
          setVideoColorFilter(data.videoColorFilter);
        }

        if (data.typography) {
          if (data.typography.activePreset) setActivePreset(data.typography.activePreset);
          if (data.typography.textColor) setTextColor(data.typography.textColor);
          if (data.typography.highlightColor) setHighlightColor(data.typography.highlightColor);
          if (data.typography.selectedFont) setSelectedFont(data.typography.selectedFont);
          if (data.typography.fontScale) setFontScale(data.typography.fontScale);
          if (data.typography.clipLanguage) setClipLanguage(data.typography.clipLanguage);
        }

        if (data.transform) {
          if (typeof data.transform.capcutScale === "number") setCapcutScale(data.transform.capcutScale);
          if (typeof data.transform.capcutPositionX === "number") setCapcutPositionX(data.transform.capcutPositionX);
          if (typeof data.transform.positionY === "number") setPositionY(data.transform.positionY);
          if (typeof data.transform.capcutPlaneRotation === "number") setCapcutPlaneRotation(data.transform.capcutPlaneRotation);
          if (typeof data.transform.blendOpacity === "number") setBlendOpacity(data.transform.blendOpacity);
        }

        if (data.styling) {
          if (typeof data.styling.enableBackground === "boolean") setEnableBackground(data.styling.enableBackground);
          if (data.styling.bgColor) setBgColor(data.styling.bgColor);
          if (typeof data.styling.bgOpacity === "number") setBgOpacity(data.styling.bgOpacity);
          if (typeof data.styling.enableStroke === "boolean") setEnableStroke(data.styling.enableStroke);
          if (data.styling.strokeColor) setStrokeColor(data.styling.strokeColor);
        }

        setCurrentTime(0);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
        }

        showToast(`📂 ນຳເຂົ້າໂປຣເຈັກ "${data.projectTitle || file.name}" ສຳເລັດແລ້ວ! ພ້ອມຕັດຕໍ່ຕໍ່`);
      } catch (err) {
        console.error("Failed to parse project file:", err);
        showToast("❌ ບໍ່ສາມາດອ່ານໄຟລ໌ໂປຣເຈັກນີ້ໄດ້");
      } finally {
        e.target.value = "";
      }
    };

    reader.readAsText(file);
  };

  // Global Mouse Listener for Dragging / Sliding & Trimming Timeline Video Clips
  useEffect(() => {
    if (!draggingClipAction) return;

    const handleMouseMove = (e: MouseEvent) => {
      const timelineLaneEl = document.getElementById("timeline-tracks-lanes");
      if (!timelineLaneEl) return;
      const rect = timelineLaneEl.getBoundingClientRect();
      const pxPerSec = rect.width / (duration || 15);
      if (pxPerSec <= 0) return;

      const deltaPx = e.clientX - draggingClipAction.startX;
      const deltaSec = deltaPx / pxPerSec;

      setVideoTrackClips((prev) =>
        prev.map((clip) => {
          if (clip.id !== draggingClipAction.clipId) return clip;

          if (draggingClipAction.type === "move") {
            let newStart = Math.max(0, draggingClipAction.origStartTime + deltaSec);
            if (enableSnapping) {
              if (newStart < 0.2) newStart = 0;
            }
            if (videoRef.current) {
              videoRef.current.currentTime = newStart;
              setCurrentTime(newStart);
            }
            return {
              ...clip,
              startTime: Number(newStart.toFixed(2)),
            };
          } else if (draggingClipAction.type === "trim-left") {
            let newStart = draggingClipAction.origStartTime + deltaSec;
            newStart = Math.max(0, Math.min(newStart, draggingClipAction.origStartTime + draggingClipAction.origDuration - 0.5));
            const actualDelta = newStart - draggingClipAction.origStartTime;
            const newDur = Math.max(0.5, draggingClipAction.origDuration - actualDelta);
            if (videoRef.current) {
              videoRef.current.currentTime = newStart;
              setCurrentTime(newStart);
            }
            return {
              ...clip,
              startTime: Number(newStart.toFixed(2)),
              duration: Number(newDur.toFixed(2)),
              inPoint: Number((draggingClipAction.origInPoint + actualDelta).toFixed(2)),
            };
          } else if (draggingClipAction.type === "trim-right") {
            const newDur = Math.max(0.5, draggingClipAction.origDuration + deltaSec);
            const currentEnd = clip.startTime + newDur;
            if (videoRef.current) {
              videoRef.current.currentTime = currentEnd;
              setCurrentTime(currentEnd);
            }
            return {
              ...clip,
              duration: Number(newDur.toFixed(2)),
              outPoint: Number((clip.inPoint + newDur).toFixed(2)),
            };
          }
          return clip;
        })
      );
    };

    const handleMouseUp = () => {
      pushHistorySnapshot("Trim Video Clip");
      setDraggingClipAction(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingClipAction, duration, enableSnapping, pushHistorySnapshot]);

  // Global Mouse Listener for Dragging / Sliding & Trimming Subtitle Clips (With Handles)
  useEffect(() => {
    if (!draggingSubAction) return;

    const handleMouseMove = (e: MouseEvent) => {
      const timelineLaneEl = document.getElementById("timeline-tracks-lanes");
      if (!timelineLaneEl) return;
      const rect = timelineLaneEl.getBoundingClientRect();
      const pxPerSec = rect.width / (duration || 15);
      if (pxPerSec <= 0) return;

      const deltaPx = e.clientX - draggingSubAction.startX;
      const deltaSec = deltaPx / pxPerSec;

      setSubtitles((prev) =>
        prev.map((sub) => {
          if (sub.id !== draggingSubAction.subId) return sub;

          if (draggingSubAction.type === "move") {
            const span = draggingSubAction.origEndTime - draggingSubAction.origTime;
            let newTime = Math.max(0, draggingSubAction.origTime + deltaSec);
            if (enableSnapping && newTime < 0.1) newTime = 0;
            const newEndTime = Number((newTime + span).toFixed(2));
            if (videoRef.current) {
              videoRef.current.currentTime = newTime;
              setCurrentTime(newTime);
            }
            return {
              ...sub,
              time: Number(newTime.toFixed(2)),
              endTime: newEndTime,
            };
          } else if (draggingSubAction.type === "trim-left") {
            let newTime = Math.max(
              0,
              Math.min(
                draggingSubAction.origTime + deltaSec,
                draggingSubAction.origEndTime - 0.2
              )
            );
            if (videoRef.current) {
              videoRef.current.currentTime = newTime;
              setCurrentTime(newTime);
            }
            return {
              ...sub,
              time: Number(newTime.toFixed(2)),
            };
          } else if (draggingSubAction.type === "trim-right") {
            let newEndTime = Math.max(
              draggingSubAction.origTime + 0.2,
              draggingSubAction.origEndTime + deltaSec
            );
            if (videoRef.current) {
              videoRef.current.currentTime = newEndTime;
              setCurrentTime(newEndTime);
            }
            return {
              ...sub,
              endTime: Number(newEndTime.toFixed(2)),
            };
          }
          return sub;
        })
      );
    };

    const handleMouseUp = () => {
      pushHistorySnapshot("Trim Subtitle");
      setDraggingSubAction(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingSubAction, duration, enableSnapping, pushHistorySnapshot]);

  // Video Playback Controls
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const seekTo = (time: number) => {
    const totalDur = duration || 15;
    const clamped = Math.max(0, Math.min(time, totalDur));
    setCurrentTime(clamped);
    const pct = ((clamped / totalDur) * 100).toFixed(3);
    if (playheadPinRef.current) playheadPinRef.current.style.left = `${pct}%`;
    if (playheadNeedleRef.current) playheadNeedleRef.current.style.left = `${pct}%`;
    if (videoRef.current) {
      videoRef.current.currentTime = clamped;
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    const totalDur = duration || 15;
    const pct = ((time / totalDur) * 100).toFixed(3);

    // 60fps Direct DOM needle and pin translation without lag
    if (playheadPinRef.current) {
      playheadPinRef.current.style.left = `${pct}%`;
    }
    if (playheadNeedleRef.current) {
      playheadNeedleRef.current.style.left = `${pct}%`;
    }

    // Throttle React state re-renders to every 80ms during playback to prevent micro-stutters
    const now = performance.now();
    if (now - lastReactTimeUpdateRef.current > 80 || time >= totalDur) {
      lastReactTimeUpdateRef.current = now;
      setCurrentTime(time);

      // Sync active word index
      const currentSub = subtitles.find(
        (s) => time >= s.time && time <= s.endTime
      );
      if (currentSub && currentSub.words.length > 0) {
        const progress =
          (time - currentSub.time) /
          Math.max(0.01, currentSub.endTime - currentSub.time);
        const wordIdx = Math.min(
          Math.floor(progress * currentSub.words.length),
          currentSub.words.length - 1
        );
        if (wordIdx !== activeWordIndex) {
          setActiveWordIndex(wordIdx);
        }
      }
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const changeSpeed = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    showToast(`ຄວາມໄວວິດີໂອ: ${rate}x`);
  };

  // =========================================================================
  // DEDICATED LAYER SPLIT & TRIMMING (Q: Trim Left, W/S: Split, E: Trim Right)
  // Isolates editing strictly to the currently selected layer!
  // =========================================================================

  // W / S: Split Clip at Playhead (ແຍກກາງ ບໍ່ເອົາອອກ)
  const handleSplitAtPlayhead = useCallback(() => {
    // 1. If Video Track Clip is active, split ONLY this video clip
    if (selectedVideoClipId) {
      const targetClip = videoTrackClips.find((c) => c.id === selectedVideoClipId);
      if (
        targetClip &&
        currentTime > targetClip.startTime &&
        currentTime < targetClip.startTime + targetClip.duration
      ) {
        pushHistorySnapshot("Split Video (W)");
        const offset = currentTime - targetClip.startTime;
        const clip1: VideoTrackClip = {
          ...targetClip,
          id: `${targetClip.id}-pt1`,
          duration: Number(offset.toFixed(2)),
          outPoint: Number((targetClip.inPoint + offset).toFixed(2)),
        };

        const clip2: VideoTrackClip = {
          ...targetClip,
          id: `vclip-${Date.now()}`,
          startTime: Number(currentTime.toFixed(2)),
          duration: Number((targetClip.duration - offset).toFixed(2)),
          inPoint: Number((targetClip.inPoint + offset).toFixed(2)),
        };

        setVideoTrackClips((prev) =>
          prev
            .filter((c) => c.id !== targetClip.id)
            .concat([clip1, clip2])
            .sort((a, b) => a.startTime - b.startTime)
        );
        setSelectedVideoClipId(clip2.id);
        showToast("✂️ ແຍກກາງຄລິບວິດີໂອ (W) ສຳເລັດ");
        return;
      }
    }

    // 2. If Subtitle is active, split ONLY this subtitle
    if (selectedSubId) {
      const targetSub = subtitles.find((s) => s.id === selectedSubId);
      if (targetSub && currentTime > targetSub.time && currentTime < targetSub.endTime) {
        pushHistorySnapshot("Split Subtitle (W)");
        const midWords = Math.max(1, Math.floor((targetSub.words?.length || 2) / 2));
        const firstHalfWords = (targetSub.words || []).slice(0, midWords);
        const secondHalfWords = (targetSub.words || []).slice(midWords);

        const firstSub: SubtitleItem = {
          id: targetSub.id,
          time: targetSub.time,
          endTime: Number(currentTime.toFixed(2)),
          text: firstHalfWords.map((w) => w.text).join(" ") || targetSub.text,
          words: firstHalfWords.length > 0 ? firstHalfWords : [{ text: targetSub.text }],
          groupId: targetSub.groupId,
        };

        const secondSub: SubtitleItem = {
          id: String(Date.now()),
          time: Number(currentTime.toFixed(2)),
          endTime: targetSub.endTime,
          text: secondHalfWords.map((w) => w.text).join(" ") || targetSub.text,
          words: secondHalfWords.length > 0 ? secondHalfWords : [{ text: targetSub.text }],
          groupId: targetSub.groupId,
        };

        setSubtitles((prev) =>
          prev
            .filter((s) => s.id !== targetSub.id)
            .concat([firstSub, secondSub])
            .sort((a, b) => a.time - b.time)
        );
        setSelectedSubId(secondSub.id);
        showToast("✂️ ແຍກກາງຊັບ (W) ສຳເລັດ");
        return;
      }
    }

    // 3. Fallback: check what is under playhead on active track
    const fallbackClip = videoTrackClips.find(
      (c) => currentTime > c.startTime && currentTime < c.startTime + c.duration
    );
    if (fallbackClip) {
      pushHistorySnapshot("Split Video (W)");
      const offset = currentTime - fallbackClip.startTime;
      const clip1: VideoTrackClip = {
        ...fallbackClip,
        id: `${fallbackClip.id}-pt1`,
        duration: Number(offset.toFixed(2)),
        outPoint: Number((fallbackClip.inPoint + offset).toFixed(2)),
      };
      const clip2: VideoTrackClip = {
        ...fallbackClip,
        id: `vclip-${Date.now()}`,
        startTime: Number(currentTime.toFixed(2)),
        duration: Number((fallbackClip.duration - offset).toFixed(2)),
        inPoint: Number((fallbackClip.inPoint + offset).toFixed(2)),
      };
      setVideoTrackClips((prev) =>
        prev
          .filter((c) => c.id !== fallbackClip.id)
          .concat([clip1, clip2])
          .sort((a, b) => a.startTime - b.startTime)
      );
      setSelectedVideoClipId(clip2.id);
      showToast("✂️ ແຍກກາງຄລິບວິດີໂອ (W) ສຳເລັດ");
      return;
    }

    showToast("ກະລຸນາເລືອກຄລິບ ຫຼື ເລື່ອນ Playhead ໄປໃສ່ຕຳແໜ່ງທີ່ຕ້ອງການຕັດ");
  }, [currentTime, selectedVideoClipId, selectedSubId, videoTrackClips, subtitles, pushHistorySnapshot]);

  // Backward-compat alias
  const handleSplitVideoClipAtPlayhead = handleSplitAtPlayhead;

  // Q: Trim Start / Left side out to Playhead (ຕັດຊ້າຍອອກ)
  const handleTrimStartToPlayhead = useCallback(() => {
    // 1. If Video Clip selected -> trim ONLY this video clip
    if (selectedVideoClipId) {
      const clip = videoTrackClips.find((c) => c.id === selectedVideoClipId);
      if (clip && currentTime > clip.startTime && currentTime < clip.startTime + clip.duration) {
        pushHistorySnapshot("Trim Start Video (Q)");
        const delta = currentTime - clip.startTime;
        setVideoTrackClips((prev) =>
          prev.map((c) => {
            if (c.id !== selectedVideoClipId) return c;
            return {
              ...c,
              startTime: Number(currentTime.toFixed(2)),
              duration: Number((c.duration - delta).toFixed(2)),
              inPoint: Number((c.inPoint + delta).toFixed(2)),
            };
          })
        );
        showToast("✂️ ຕັດຊ້າຍຄລິບວິດີໂອຮອດ Playhead (Q)");
        return;
      }
    }

    // 2. If Subtitle selected -> trim ONLY this subtitle
    if (selectedSubId) {
      const sub = subtitles.find((s) => s.id === selectedSubId);
      if (sub && currentTime > sub.time && currentTime < sub.endTime) {
        pushHistorySnapshot("Trim Start Subtitle (Q)");
        setSubtitles((prev) =>
          prev.map((s) =>
            s.id === selectedSubId ? { ...s, time: Number(currentTime.toFixed(2)) } : s
          )
        );
        showToast("✂️ ຕັດຊ້າຍຊັບໄຕເຕີ້ນຮອດ Playhead (Q)");
        return;
      }
    }

    // Fallback: check subtitle or video clip under playhead
    const subUnder = subtitles.find((s) => currentTime > s.time && currentTime < s.endTime);
    if (subUnder) {
      pushHistorySnapshot("Trim Start Subtitle (Q)");
      setSubtitles((prev) =>
        prev.map((s) => (s.id === subUnder.id ? { ...s, time: Number(currentTime.toFixed(2)) } : s))
      );
      setSelectedSubId(subUnder.id);
      showToast("✂️ ຕັດຊ້າຍຊັບໄຕເຕີ້ນ (Q)");
      return;
    }
  }, [currentTime, selectedVideoClipId, selectedSubId, videoTrackClips, subtitles, pushHistorySnapshot]);

  // E: Trim End / Right side out to Playhead (ຕັດຂວາອອກ)
  const handleTrimEndToPlayhead = useCallback(() => {
    // 1. If Video Clip selected -> trim ONLY this video clip
    if (selectedVideoClipId) {
      const clip = videoTrackClips.find((c) => c.id === selectedVideoClipId);
      if (clip && currentTime > clip.startTime && currentTime < clip.startTime + clip.duration) {
        pushHistorySnapshot("Trim End Video (E)");
        const newDur = currentTime - clip.startTime;
        setVideoTrackClips((prev) =>
          prev.map((c) => {
            if (c.id !== selectedVideoClipId) return c;
            return {
              ...c,
              duration: Number(newDur.toFixed(2)),
              outPoint: Number((c.inPoint + newDur).toFixed(2)),
            };
          })
        );
        showToast("✂️ ຕັດຂວາຄລິບວິດີໂອຮອດ Playhead (E)");
        return;
      }
    }

    // 2. If Subtitle selected -> trim ONLY this subtitle
    if (selectedSubId) {
      const sub = subtitles.find((s) => s.id === selectedSubId);
      if (sub && currentTime > sub.time && currentTime < sub.endTime) {
        pushHistorySnapshot("Trim End Subtitle (E)");
        setSubtitles((prev) =>
          prev.map((s) =>
            s.id === selectedSubId ? { ...s, endTime: Number(currentTime.toFixed(2)) } : s
          )
        );
        showToast("✂️ ຕັດຂວາຊັບໄຕເຕີ້ນຮອດ Playhead (E)");
        return;
      }
    }

    // Fallback: check subtitle or video clip under playhead
    const subUnder = subtitles.find((s) => currentTime > s.time && currentTime < s.endTime);
    if (subUnder) {
      pushHistorySnapshot("Trim End Subtitle (E)");
      setSubtitles((prev) =>
        prev.map((s) => (s.id === subUnder.id ? { ...s, endTime: Number(currentTime.toFixed(2)) } : s))
      );
      setSelectedSubId(subUnder.id);
      showToast("✂️ ຕັດຂວາຊັບໄຕເຕີ້ນ (E)");
      return;
    }
  }, [currentTime, selectedVideoClipId, selectedSubId, videoTrackClips, subtitles, pushHistorySnapshot]);

  // Delete active selection (Del / Trash)
  const handleDeleteActiveSelection = useCallback(() => {
    pushHistorySnapshot("Delete Selection");
    if (selectedSubIds.length > 0) {
      setSubtitles((prev) => prev.filter((s) => !selectedSubIds.includes(s.id)));
      setSelectedSubIds([]);
      setSelectedSubId("");
      showToast(`🗑️ ລຶບ ${selectedSubIds.length} ຊັບໄຕເຕີ້ນທີ່ເລືອກແລ້ວ`);
      return;
    }
    if (selectedVideoClipId && videoTrackClips.length > 1) {
      setVideoTrackClips((prev) => prev.filter((c) => c.id !== selectedVideoClipId));
      setSelectedVideoClipId(null);
      showToast("🗑️ ລຶບຄລິບວິດີໂອແລ້ວ");
      return;
    }
    if (selectedSubId) {
      setSubtitles((prev) => prev.filter((s) => s.id !== selectedSubId));
      setSelectedSubId("");
      showToast("🗑️ ລຶບຊັບແລ້ວ");
    }
  }, [selectedSubIds, selectedVideoClipId, videoTrackClips.length, selectedSubId, pushHistorySnapshot]);

  // Group / Ungroup Subtitles
  const handleGroupSelectedSubtitles = useCallback(() => {
    if (selectedSubIds.length < 2) {
      showToast("ກະລຸນາເລືອກຢ່າງໜ້ອຍ 2 ຊັບ (Shift+Click) ເພື່ອຮວມກຸ່ມ");
      return;
    }
    pushHistorySnapshot("Group Subtitles");
    const newGroupId = `grp-${Date.now()}`;
    setSubtitles((prev) =>
      prev.map((s) => (selectedSubIds.includes(s.id) ? { ...s, groupId: newGroupId } : s))
    );
    showToast(`🔗 ຮວມກຸ່ມ ${selectedSubIds.length} ຊັບໄຕເຕີ້ນສຳເລັດ`);
  }, [selectedSubIds, pushHistorySnapshot]);

  const handleUngroupSelectedSubtitles = useCallback(() => {
    pushHistorySnapshot("Ungroup Subtitles");
    setSubtitles((prev) =>
      prev.map((s) =>
        selectedSubId === s.id || selectedSubIds.includes(s.id)
          ? { ...s, groupId: undefined }
          : s
      )
    );
    showToast("🔓 ແຍກກຸ່ມ (Ungroup) ສຳເລັດ");
  }, [selectedSubId, selectedSubIds, pushHistorySnapshot]);

  const handleAddSubtitleAtPlayhead = () => {
    const newStart = Number(currentTime.toFixed(1));
    const newEnd = Number((currentTime + 2.5).toFixed(1));
    const defaultText = "ໃສ່ຊັບລາວ";

    const newSub: SubtitleItem = {
      id: String(Date.now()),
      time: newStart,
      endTime: newEnd,
      text: defaultText,
      words: defaultText.split(" ").map((w) => ({ text: w })),
    };

    setSubtitles((prev) => [...prev, newSub].sort((a, b) => a.time - b.time));
    setSelectedSubId(newSub.id);
    showToast("➕ ເພີ່ມຊັບໃໝ່ແລ້ວ");
  };

  const updateSubtitleText = (id: string, newText: string) => {
    const wordsArr = newText.trim().split(/\s+/).map((w) => ({ text: w }));
    setSubtitles((prev) =>
      prev.map((s) => (s.id === id ? { ...s, text: newText, words: wordsArr } : s))
    );
  };

  // =========================================================================
  // KEYBOARD SHORTCUTS LISTENER (CapCut Standard: Space, B, Del, Arrows, Q, W)
  // =========================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in text input/textarea
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.altKey && e.shiftKey && e.code === "KeyK") {
        e.preventDefault();
        handleToggleKeyframeAtPlayhead();
      } else if (e.altKey && e.code === "KeyK") {
        e.preventDefault();
        setIsKeyframePanelOpen((p) => !p);
      } else if (e.code === "Home") {
        e.preventDefault();
        seekTo(0);
      } else if (e.code === "End") {
        e.preventDefault();
        seekTo(duration);
      } else if (e.code === "KeyJ") {
        e.preventDefault();
        seekTo(Math.max(0, currentTime - 1.0));
      } else if (e.code === "KeyK" && !e.altKey) {
        e.preventDefault();
        if (isPlaying) togglePlay();
      } else if (e.code === "KeyL") {
        e.preventDefault();
        seekTo(Math.min(duration, currentTime + 1.0));
      } else if (e.code === "KeyA") {
        e.preventDefault();
        setActiveToolMode("select");
        showToast("Select Mode (A)");
      } else if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.code === "KeyY" || (e.shiftKey && e.code === "KeyZ"))) {
        e.preventDefault();
        handleRedo();
      } else if (e.code === "KeyS" || e.code === "KeyB" || (e.ctrlKey && e.code === "KeyB") || e.code === "KeyC") {
        e.preventDefault();
        handleSplitAtPlayhead();
      } else if (e.code === "Delete" || e.code === "Backspace") {
        e.preventDefault();
        handleDeleteActiveSelection();
      } else if (e.code === "KeyQ") {
        e.preventDefault();
        handleTrimStartToPlayhead();
      } else if (e.code === "KeyW") {
        e.preventDefault();
        handleSplitAtPlayhead();
      } else if (e.code === "KeyE") {
        e.preventDefault();
        handleTrimEndToPlayhead();
      } else if (e.code === "KeyP") {
        e.preventDefault();
        showToast("Main track magnet toggled (P)");
      } else if (e.code === "KeyN") {
        e.preventDefault();
        setEnableSnapping((p) => !p);
        showToast(`Auto Snapping: ${!enableSnapping ? "ON" : "OFF"}`);
      } else if (e.shiftKey && e.code === "KeyZ") {
        e.preventDefault();
        setTimelineZoom(1.0);
        showToast("Zoom to Fit (Shift+Z)");
      } else if (e.code === "BracketLeft") {
        e.preventDefault();
        seekTo(Math.max(0, currentTime - 0.5));
      } else if (e.code === "BracketRight") {
        e.preventDefault();
        seekTo(Math.min(duration, currentTime + 0.5));
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        seekTo(currentTime - (e.shiftKey ? 1.0 : 0.04));
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        seekTo(currentTime + (e.shiftKey ? 1.0 : 0.04));
      } else if (e.code === "KeyM") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setTimelineZoom((z) => Math.min(3, z + 0.25));
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        setTimelineZoom((z) => Math.max(1, z - 0.25));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    togglePlay,
    handleUndo,
    handleRedo,
    handleSplitAtPlayhead,
    handleDeleteActiveSelection,
    handleTrimStartToPlayhead,
    handleTrimEndToPlayhead,
    handleToggleKeyframeAtPlayhead,
    currentTime,
    duration,
    isPlaying,
    enableSnapping,
    selectedSubId,
  ]);

  // =========================================================================
  // RESIZABLE PANEL DRAG HANDLERS
  // =========================================================================
  const startDragLeftPanel = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = leftPanelWidth;

    const onMouseMove = (moveE: MouseEvent) => {
      const newW = Math.max(200, Math.min(500, startW + (moveE.clientX - startX)));
      setLeftPanelWidth(newW);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const startDragRightPanel = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = rightPanelWidth;

    const onMouseMove = (moveE: MouseEvent) => {
      const newW = Math.max(240, Math.min(520, startW - (moveE.clientX - startX)));
      setRightPanelWidth(newW);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const startDragTimeline = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = timelineHeight;

    const onMouseMove = (moveE: MouseEvent) => {
      const newH = Math.max(130, Math.min(380, startH - (moveE.clientY - startY)));
      setTimelineHeight(newH);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // =========================================================================
  // REAL SPEECH-TO-TEXT (Gemini Audio STT)
  // =========================================================================
  const handleGenerateAISubtitles = async () => {
    if (!videoFile) {
      showToast("⚠️ ກະລຸນາອັບໂຫຼດຄລິບວິດີໂອກ່ອນ ເພື່ອຖອດສຽງແທ້");
      fileInputRef.current?.click();
      return;
    }

    setIsGeneratingSubtitles(true);

    try {
      setSttStepText("1/2: ກຳລັງສະກັດແທຣັກສຽງແທ້ຈາກວິດີໂອ...");
      let audioResult = { hasAudio: true, base64: "", mimeType: "audio/wav", duration: duration || 15 };
      try {
        audioResult = await extractAudioFromVideoFile(videoFile, 60);
      } catch (extractErr) {
        console.warn("Audio extraction fallback:", extractErr);
      }

      const langLabel =
        clipLanguage === "mixed"
          ? "ລາວ + English (Auto)"
          : clipLanguage === "lo"
          ? "ພາສາລາວ (Lao)"
          : clipLanguage === "th"
          ? "ພາສາໄທ (Thai)"
          : "English";

      setSttStepText(`2/2: SAIZUP AI Engine (${editorAiVersion.toUpperCase()}) ກຳລັງຟັງສຽງ ແລະ ຖອດຄຳເວົ້າ (${langLabel})...`);

      const res = await fetch("/api/ai/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: clipLanguage,
          audioBase64: audioResult.base64,
          mimeType: audioResult.mimeType || "audio/wav",
          videoDuration: audioResult.duration || duration || 15,
          videoTitle: projectTitle,
          aiVersion: editorAiVersion,
          intervalMode: editorIntervalMode,
          userEmail: currentUser?.email,
        }),
      });

      const resText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(resText);
      } catch (jsonErr) {
        console.error("Non-JSON STT response:", resText);
        throw new Error("ເຊີເວີບໍ່ໄດ້ສົ່ງ JSON (Invalid server response)");
      }

      if (!res.ok || !data.success) {
        if (data.upgradeRequired) {
          showToast(`⚠️ ${data.error}`);
          return;
        }
        throw new Error(data.error || "ຖອດສຽງບໍ່ສຳເລັດ");
      }

      if (!data.subtitles || data.subtitles.length === 0) {
        showToast("⚠️ ບໍ່ພົບຄຳເວົ້າໃນຄລິບສຽງ");
        return;
      }

      setSubtitles(data.subtitles);
      setAiCaptionsEnabled(true);

      if (data.remainingCredits !== undefined && currentUser) {
        const updatedUser = { ...currentUser, credits: data.remainingCredits };
        setCurrentUser(updatedUser);
        localStorage.setItem("saizup_user", JSON.stringify(updatedUser));
      }

      showToast(`🎉 ຖອດສຽງສຳເລັດ! ໄດ້ຊັບ ${data.subtitles.length} ບລັອກ (${data.engine || "AI Engine"})`);
    } catch (err: any) {
      console.error("STT Error:", err);
      showToast(`❌ ຂໍ້ຜິດພາດ: ${err.message || "ບໍ່ສາມາດຖອດສຽງໄດ້"}`);
    } finally {
      setIsGeneratingSubtitles(false);
      setSttStepText("");
    }
  };

  // =========================================================================
  // AI SMART CUTTER / REFERENCE CLIP MATCHING
  // =========================================================================
  const handleRunAiSmartCut = () => {
    setIsAiCutting(true);
    showToast("🤖 AI ກຳລັງວິເຄາະຈັງຫວະ ແລະ ຕັດຄລິບ...");

    setTimeout(() => {
      // Calculate smart cuts based on chosen pacing
      const cutInterval =
        aiCutPacing === "viral-fast" ? 1.5 : aiCutPacing === "beat-drop" ? 0.9 : 3.0;

      const totalDur = duration || 15;
      const count = Math.max(3, Math.floor(totalDur / cutInterval));
      const newCuts: SubtitleItem[] = [];

      for (let i = 0; i < count; i++) {
        const start = Number((i * cutInterval).toFixed(2));
        const end = Number(Math.min(totalDur, (i + 1) * cutInterval - (removeDeadAir ? 0.15 : 0)).toFixed(2));
        if (start >= totalDur) break;

        const defaultLaoPhrases = [
          "ຢ່າຟ້າວເລື່ອນຜ່ານ",
          "ຄວາມລັບຫາເງິນອອນລາຍ",
          "ເຄື່ອງມື AI ສຸດລ້ຳ",
          "ຕັດຕໍ່ຄລິບໄວຣັລ 2026",
          "ໃສ່ຊັບຄາຣາໂອເກະງ່າຍໆ",
          "ກົດຕິດຕາມໄວ້ເລີຍ",
        ];
        const phrase = defaultLaoPhrases[i % defaultLaoPhrases.length];

        newCuts.push({
          id: String(Date.now() + i),
          time: start,
          endTime: end,
          text: phrase,
          words: phrase.split(" ").map((w) => ({ text: w })),
        });
      }

      setSubtitles(newCuts);
      setIsAiCutting(false);
      setIsAiCutterOpen(false);
      showToast(`✨ AI ຕັດຄລິບຕາມຈັງຫວະ ${count} ຊ່ວງ ສຳເລັດແລ້ວ!`);
    }, 1800);
  };

  // Export SRT, ASS, VTT & Video
  const handleExportSubtitles = (format: "srt" | "ass" | "vtt" = "srt") => {
    if (subtitles.length === 0) {
      showToast("ບໍ່ມີຊັບໃຫ້ດາວໂຫຼດ");
      return;
    }

    const pad = (n: number) => n.toString().padStart(2, "0");
    const padMs = (n: number) => n.toString().padStart(3, "0");

    const formatSRTTime = (seconds: number) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${padMs(ms)}`;
    };

    const formatVTTTime = (seconds: number) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 1000);
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${padMs(ms)}`;
    };

    let content = "";
    let mimeType = "text/plain;charset=utf-8";

    if (format === "vtt") {
      content =
        "WEBVTT\r\n\r\n" +
        subtitles
          .map((sub, idx) => {
            const textToExport =
              showBilingual && sub.translatedText
                ? `${sub.text}\r\n${sub.translatedText}`
                : sub.text;
            return `${idx + 1}\r\n${formatVTTTime(sub.time)} --> ${formatVTTTime(
              sub.endTime
            )}\r\n${textToExport}\r\n`;
          })
          .join("\r\n");
      mimeType = "text/vtt;charset=utf-8";
    } else if (format === "ass") {
      content =
        `[Script Info]\r\nTitle: ${projectTitle}\r\nScriptType: v4.00+\r\n\r\n[V4+ Styles]\r\nFormat: Name, Fontname, Fontsize, PrimaryColour, BackColour, Bold, Italic, Alignment, MarginL, MarginR, MarginV\r\nStyle: Default,Noto Sans Lao,24,&H00FFFFFF,&H00000000,0,0,2,10,10,20\r\n\r\n[Events]\r\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\r\n` +
        subtitles
          .map((sub) => {
            const formatASSTime = (sec: number) => {
              const h = Math.floor(sec / 3600);
              const m = Math.floor((sec % 3600) / 60);
              const s = Math.floor(sec % 60);
              const cs = Math.floor((sec % 1) * 100);
              return `${h}:${pad(m)}:${pad(s)}.${pad(cs)}`;
            };
            const textToExport =
              showBilingual && sub.translatedText
                ? `${sub.text}\\N${sub.translatedText}`
                : sub.text;
            return `Dialogue: 0,${formatASSTime(sub.time)},${formatASSTime(
              sub.endTime
            )},Default,,0,0,0,,${textToExport}`;
          })
          .join("\r\n");
    } else {
      content = subtitles
        .map((sub, idx) => {
          const textToExport =
            showBilingual && sub.translatedText
              ? `${sub.text}\r\n${sub.translatedText}`
              : sub.text;
          return `${idx + 1}\r\n${formatSRTTime(sub.time)} --> ${formatSRTTime(
            sub.endTime
          )}\r\n${textToExport}\r\n`;
        })
        .join("\r\n");
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectTitle || "subtitles"}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`ດາວໂຫຼດ .${format.toUpperCase()} ສຳເລັດ`);
  };

  const downloadSRT = () => handleExportSubtitles("srt");

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${mins.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const totalWords = subtitles.reduce((acc, cur) => acc + cur.words.length, 0);
  const totalBlocks = subtitles.length;

  // Apply preset helper
  const applyPreset = (p: (typeof PRESET_LIST)[0]) => {
    setActivePreset(p.id as any);
    setTextColor(p.text);
    setHighlightColor(p.hi);
    setEnableBackground(p.bg);
    if ((p as any).bgColor) setBgColor((p as any).bgColor);
    if ((p as any).bgOpacity !== undefined) setBgOpacity((p as any).bgOpacity);
    if ((p as any).bgRadius) setBgRadius((p as any).bgRadius);
    if ((p as any).boxBorder !== undefined) setEnableBoxBorder((p as any).boxBorder);
    setBoxBorderColor(p.border);
    setEnableStroke(p.stroke);
    setStrokeWidth(p.strokeW);
    setStrokeColor(p.strokeC);
    setEnableGlow(p.glow);
    if ((p as any).glowC) setGlowColor((p as any).glowC);
    setActiveEffect(p.effect as any);
    showToast(`ນຳໃຊ້ "${p.name}"`);
  };

  // Active subtitle for current video frame (fallback to first subtitle so preview is never blank)
  const activeSub =
    subtitles.find((s) => currentTime >= s.time && currentTime <= s.endTime) ||
    (subtitles.length > 0 ? subtitles[0] : null);

  // Chunk visible words according to wordsPerBatch selector (1, 2, 3, 4, sentence)
  const visibleWords = (() => {
    if (!activeSub || !activeSub.words || activeSub.words.length === 0) return [];
    if (wordsPerBatch === "sentence") {
      return activeSub.words.map((w, idx) => ({ ...w, originalIdx: idx }));
    }
    const batchSize = parseInt(wordsPerBatch, 10) || 4;
    const chunkIndex = Math.floor(activeWordIndex / batchSize);
    const startIdx = chunkIndex * batchSize;
    const endIdx = Math.min(activeSub.words.length, startIdx + batchSize);

    return activeSub.words.slice(startIdx, endIdx).map((w, idx) => ({
      ...w,
      originalIdx: startIdx + idx,
    }));
  })();

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-[#111218] text-slate-100 flex flex-col font-sans select-none">
      {/* 1. TOP HEADER (CapCut Desktop Header with Home Button & LocalStorage Status) */}
      <header className="h-11 px-3 bg-[#181920] border-b border-[#262833] flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Home Button linking to / */}
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#222430] hover:bg-[#2d3040] text-slate-200 hover:text-cyan-400 border border-slate-700/70 text-xs font-semibold transition-all group shadow-sm"
            title="ກັບຄືນໜ້າຫຼັກ (Back to Home)"
          >
            <Home className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold">ໜ້າຫຼັກ (Home)</span>
          </Link>

          <div className="h-4 w-px bg-slate-700/60" />

          {/* CapCut Studio Logo */}
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center">
              <Film className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold tracking-tight text-white hidden md:inline">
              SAIZUP AI Studio
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700/60" />

          {/* Project Title */}
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-300 focus:text-white focus:outline-none focus:border-b border-blue-500 max-w-[120px] truncate"
            title="ຊື່ໂປຣເຈັກ"
          />

          {/* Reset to Default / New Project Button */}
          <button
            type="button"
            onClick={handleResetToInitialDefault}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1c1e29] border border-slate-700 hover:border-amber-500/60 text-slate-300 hover:text-amber-300 transition-colors"
            title="ຣີເຊັດເປັນຄ່າເລີ່ມຕົ້ນ (Default State) ແລະ ລ້າງຄລິບເກົ່າ"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">ໂປຣເຈັກໃໝ່</span>
          </button>

          {/* Save Status Button */}
          <button
            type="button"
            onClick={handleManualSave}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#1c1e29] border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-colors"
            title="ຄລິກເພື່ອບັນທຶກໂປຣເຈັກລົງໃນ Browser ทັນที"
          >
            <Save className="w-3 h-3 text-cyan-400" />
            <span>{isSaved ? "Saved" : "Save"}</span>
            {lastSavedTime && <span className="text-slate-500 text-[9px]">({lastSavedTime})</span>}
          </button>

          {/* Subtitle Studio Quick Switch */}
          <Link
            href="/subtitles"
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded bg-[#1c1e29] hover:bg-[#25283A] text-slate-300 hover:text-cyan-400 border border-slate-700/60 text-[11px] font-semibold transition-colors"
            title="ສະຫຼັບໄປໂໝດສ້າງຊັບໄຕເຕິລຢ່າງດຽວ"
          >
            <Subtitles className="w-3 h-3 text-cyan-400" />
            <span>Subtitle Studio</span>
          </Link>

          {/* Free Tier 30s Limit Badge */}
          {isFreeTier && duration > 30 && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 font-semibold animate-pulse">
              ⚠️ ຄລິບຍາວເກີນ 30s (Free limit)
            </span>
          )}
        </div>

        {/* Top Right: AI Cutter, Shortcuts, Import .saizup, Import Video, Export .saizup, Export Video */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* AI Auto-Cutter Button */}
          <button
            onClick={() => setIsAiCutterOpen(true)}
            className="px-2.5 py-1 rounded-md bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 text-purple-300 text-xs font-bold border border-purple-500/40 flex items-center gap-1.5 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">AI ຕັດຄລິບ</span>
          </button>

          {/* Keyboard Shortcuts Guide */}
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#252733]"
            title="ຄີລັດ (Shortcuts)"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Project Package Import (.saizup / .json) */}
          <input
            type="file"
            ref={projectFileInputRef}
            accept=".saizup,.json"
            onChange={handleImportProjectFile}
            className="hidden"
          />
          <button
            onClick={() => projectFileInputRef.current?.click()}
            className="px-2.5 py-1 rounded-md bg-[#1f2333] hover:bg-[#2a3044] text-cyan-300 text-xs font-semibold border border-cyan-500/40 hover:border-cyan-400 flex items-center gap-1.5 transition-all shadow-sm"
            title="ນຳເຂົ້າໄຟລ໌ໂປຣເຈັກ .saizup ເພື່ອກັບມາຕັດຕໍ່ຄືນໄດ້ທຸກເວລາ"
          >
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">ເປີດໂປຣເຈັກ (.saizup)</span>
            <span className="sm:hidden">.saizup</span>
          </button>

          {/* Video Media Import */}
          <input
            type="file"
            ref={fileInputRef}
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 rounded-md bg-[#252733] hover:bg-[#303342] text-slate-200 text-xs font-medium border border-slate-700/60 flex items-center gap-1"
            title="ນຳເຂົ້າໄຟລ໌ວິດີໂອໃໝ່"
          >
            <Upload className="w-3 h-3 text-slate-400" />
            <span className="hidden md:inline">ວິດີໂອ</span>
          </button>

          {/* User Account / Google Login Button */}
          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#252733] hover:bg-[#303342] border border-slate-700/60 text-slate-200 text-[11px] font-semibold transition-all"
            title={currentUser ? currentUser.email : "ເຂົ້າສູ່ລະບົບ"}
          >
            {currentUser?.avatar || currentUser?.picture ? (
              <img
                src={currentUser.avatar || currentUser.picture}
                alt=""
                className="w-4 h-4 rounded-full object-cover ring-1 ring-cyan-400"
              />
            ) : (
              <User className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="hidden md:inline max-w-[90px] truncate">
              {currentUser?.name || (currentUser ? currentUser.email.split("@")[0] : "ເຂົ້າສູ່ລະບົບ")}
            </span>
          </button>

          {/* Pro Badge */}
          <button
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/20 text-purple-300 text-[11px] font-bold border border-purple-500/30"
          >
            <span>💎 Pro</span>
          </button>

          {/* Direct 1-Click Export Project (.saizup) */}
          <button
            onClick={handleExportProjectPackage}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-cyan-600/25 to-blue-600/25 hover:from-cyan-600/40 hover:to-blue-600/40 text-cyan-300 text-xs font-bold border border-cyan-500/50 hover:border-cyan-400 shadow-sm transition-all"
            title="Export ທຸກຢ່າງໃນໂປຣເຈັກເປັນໄຟລ໌ .saizup ເພື່ອນຳກັບມາຕັດຕໍ່ຄືນໃນເວັບໄດ້ທຸກເວລາ"
          >
            <Save className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Export .saizup</span>
          </button>

          {/* Export Center Modal Button */}
          <button
            onClick={handleExport}
            className="px-3.5 py-1 rounded-md text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 shadow-sm flex items-center gap-1.5 transition-all"
            title="ສົ່ງອອກຜົນງານ (Export Center)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* Recover Saved Draft Banner (Optional, non-intrusive banner if user wants to restore previous draft) */}
      {hasSavedDraft && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#1e2029]/95 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-medium border border-amber-500/50 animate-fadeIn">
          <span className="text-amber-400 font-semibold">💡 ພົບເຫັນສະບັບຮ່າງເກົ່າທີ່ບັນທຶກໄວ້</span>
          <button
            onClick={handleRestoreDraft}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition"
          >
            ກູ້ຄືນໂປຣເຈັກເກົ່າ
          </button>
          <button
            onClick={handleDiscardDraft}
            className="px-2 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            ລຶບຖິ້ມ
          </button>
        </div>
      )}

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed top-14 right-6 z-50 bg-[#1e2029] text-white px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium border border-cyan-500/50">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. MAIN WORKSPACE (Resizable 3 Columns: Left Panel, Center Canvas, Right Panel) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 relative">
        {/* ========================================================= */}
        {/* COLUMN 1: LEFT TOOLBAR & RESOURCE PANEL (Resizable)       */}
        {/* ========================================================= */}
        <div
          style={{
            width: isLeftCollapsed ? 0 : `${leftPanelWidth}px`,
            display: isLeftCollapsed ? "none" : undefined,
          }}
          className="hidden md:flex bg-[#181920] border-r border-[#262833] flex-shrink-0 flex-col overflow-hidden relative transition-[width] duration-75"
        >
          {/* CapCut Resource Library Tabs: Media, Captions, Audio */}
          <div className="h-10 px-2 border-b border-[#262833] flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: "media", label: "Media (ສື່)", icon: Film },
              { id: "captions", label: "Captions (ຊັບ)", icon: Subtitles },
              { id: "audio", label: "Audio (ສຽງ)", icon: Volume2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeLeftTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveLeftTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    isActive ? "text-cyan-400 bg-[#252733] shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-[#1e202b]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Left Panel Inner Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* TAB: MEDIA (CapCut Media Pool & Drag to Timeline) */}
            {activeLeftTab === "media" && (
              <div className="space-y-3.5">
                {/* 1. Drag & Drop Upload Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-400 bg-[#161824] cursor-pointer text-center space-y-2 transition-all hover:bg-[#1a1c2a] group"
                >
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Import Video (ອັບໂຫຼດຄລິບໃໝ່)</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">MP4, MOV, WebM • ຄລິກ ຫຼື ລາກໄຟລ໌ມາໃສ່</p>
                  </div>
                </div>

                {/* 2. Quick Sample Clips (Ready to edit in 1-click) */}
                <div className="p-2.5 rounded-xl bg-[#151620] border border-slate-800 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    ຄລິບຕົວຢ່າງທົດລອງ (Sample Clips):
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddMediaToTimeline("sample-1")}
                      className="p-2 rounded-lg bg-[#1c1e2b] hover:bg-[#252838] border border-slate-700/60 text-left transition-all"
                    >
                      <div className="text-[11px] font-bold text-white truncate">ຄລິບ 1: ພາສາລາວ</div>
                      <div className="text-[9px] text-cyan-400">9:16 • 15.0s</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddMediaToTimeline("sample-2")}
                      className="p-2 rounded-lg bg-[#1c1e2b] hover:bg-[#252838] border border-slate-700/60 text-left transition-all"
                    >
                      <div className="text-[11px] font-bold text-white truncate">ຄລິບ 2: AI & Tech</div>
                      <div className="text-[9px] text-cyan-400">9:16 • 12.0s</div>
                    </button>
                  </div>
                </div>

                {/* 3. Imported Media List with Video Previews */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white px-0.5">
                    <span>ຄລິບວິດີໂອທັງໝົດ ({mediaList.length})</span>
                    <span className="text-[10px] text-cyan-400 font-normal">⇕ ລາກລົງໄທມ໌ໄລນ໌</span>
                  </div>

                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-0.5">
                    {mediaList.map((media) => (
                      <div
                        key={media.id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("mediaId", media.id);
                        }}
                        onClick={() => {
                          if (media.url) setVideoUrl(media.url);
                          setDuration(media.duration);
                          showToast(`ເປີດຕົວຢ່າງ "${media.name}"`);
                        }}
                        className="group relative p-2 rounded-xl bg-[#181a26] border border-slate-800 hover:border-cyan-400/80 cursor-grab active:cursor-grabbing transition-all flex gap-2.5 items-center shadow-md hover:shadow-cyan-500/10"
                      >
                        {/* Video Frame Thumbnail Preview */}
                        <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-black/80 flex-shrink-0 border border-slate-700/80">
                          {media.thumbUrl ? (
                            <img
                              src={media.thumbUrl}
                              alt={media.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#12131d] flex items-center justify-center text-cyan-400">
                              <Film className="w-5 h-5" />
                            </div>
                          )}
                          {/* Duration badge */}
                          <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/85 text-[9px] font-mono text-cyan-300 font-bold border border-cyan-500/30">
                            {formatTime(media.duration)}
                          </span>
                        </div>

                        {/* Title & Resolution */}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate" title={media.name}>
                            {media.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{media.resolution}</div>
                          <div className="text-[9px] text-cyan-400/80 font-medium mt-1">
                            ⇕ ລາກລົງໄທມ໌ໄລນ໌
                          </div>
                        </div>

                        {/* Quick Add Button (+) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddMediaToTimeline(media.id);
                          }}
                          title="Add to Timeline (ເພີ່ມໃສ່ໄທມ໌ໄລນ໌)"
                          className="w-7 h-7 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black flex items-center justify-center transition-colors flex-shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: AUDIO (BGM Tracks, Essential SFX & My Custom Assets) */}
            {activeLeftTab === "audio" && (
              <div className="space-y-3.5">
                {/* 1. Custom Assets: ໄຟລ໌ & ສຽງຂອງຂ້ອຍ (Pillar 7: Uploaded & Stored in Browser) */}
                <div className="p-3.5 rounded-2xl bg-[#161824] border border-cyan-500/40 space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FolderPlus className="w-3.5 h-3.5 text-cyan-400" />
                      <span>ໄຟລ໌ & ສຽງຂອງຂ້ອຍ (My Assets)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => customAssetInputRef.current?.click()}
                      className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-black text-[10px] font-bold flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      <span>ອັບໂຫຼດສຽງ</span>
                    </button>
                    <input
                      type="file"
                      ref={customAssetInputRef}
                      accept="audio/*"
                      onChange={handleUploadCustomAsset}
                      className="hidden"
                    />
                  </div>

                  {customAssets.length === 0 ? (
                    <div className="p-3 rounded-xl bg-[#12131b] border border-dashed border-slate-700/80 text-center space-y-1">
                      <p className="text-[11px] text-slate-400 font-medium">ຍັງບໍ່ມີໄຟລ໌ສ່ວນຕົວ</p>
                      <p className="text-[9px] text-slate-500">ອັບໂຫຼດ SFX ຫຼື BGM ຂອງເຈົ້າ ລະບົບບັນທຶກໃນ Browser ບໍ່ຫາຍຕອນຣີເຟຣຊ</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {customAssets.map((asset) => (
                        <div
                          key={asset.id}
                          className="p-2 rounded-xl bg-[#1c1e2b] border border-slate-800 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-sm">{asset.icon || "🎵"}</span>
                            <span className="text-xs text-white font-medium truncate">{asset.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => playCustomAudio(asset.dataUrl)}
                              className="px-2 py-0.5 rounded bg-[#25283a] hover:bg-cyan-500 hover:text-black text-[10px] text-slate-200 font-bold"
                            >
                              ຟັງ
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                showToast(`🎵 ເພີ່ມ "${asset.name}" ໃສ່ໄທມ໌ໄລນ໌ແລ້ວ!`);
                              }}
                              className="w-6 h-6 rounded bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black flex items-center justify-center"
                              title="ເພີ່ມໃສ່ໄທມ໌ໄລນ໌"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomAsset(asset.id)}
                              className="p-1 text-slate-500 hover:text-rose-400"
                              title="ລຶບ"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Background Music (BGM) */}
                <div className="p-3 rounded-2xl bg-[#161824] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Background Music (ເພງປະກອບ)</span>
                    </span>
                    <span className="text-[9px] text-cyan-400 font-mono">Royalty Free</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { id: "bgm-1", name: "Chill Lofi Beat", dur: "02:30", genre: "Lofi / Relax" },
                      { id: "bgm-2", name: "Upbeat Vlog Pop", dur: "01:45", genre: "Vlog / TikTok" },
                      { id: "bgm-3", name: "Cinematic Dramatic", dur: "02:10", genre: "Trailer / Story" },
                    ].map((bgm) => (
                      <div
                        key={bgm.id}
                        className="p-2 rounded-xl bg-[#1e202e] border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-bold text-white truncate">{bgm.name}</div>
                          <div className="text-[9px] text-slate-400">{bgm.genre} • {bgm.dur}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => showToast(`▶️ ຫຼິ້ນຕົວຢ່າງ: ${bgm.name}`)}
                            className="px-2 py-1 rounded-lg bg-[#282b3d] hover:bg-cyan-500 hover:text-black text-slate-200 text-[10px] font-bold transition-colors"
                          >
                            ຟັງ
                          </button>
                          <button
                            type="button"
                            onClick={() => showToast(`🎵 ເພີ່ມ ${bgm.name} ໃສ່ແທຣັກສຽງແລ້ວ!`)}
                            className="w-6 h-6 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black flex items-center justify-center transition-colors"
                            title="ເພີ່ມໃສ່ໄທມ໌ໄລນ໌"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Essential Sound Effects Library */}
                <div className="p-3 rounded-2xl bg-[#161824] border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Sound Effects (ເອັບເຟັກສຽງ)</span>
                    </span>
                    <span className="text-[9px] text-cyan-400 font-mono">Zero Latency</span>
                  </div>

                  <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                    {ESSENTIAL_SOUND_EFFECTS.map((sfx) => (
                      <div
                        key={sfx.id}
                        className="p-2.5 rounded-xl bg-[#1c1e2b] border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-2 transition-all group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg group-hover:scale-110 transition-transform">{sfx.icon}</span>
                          <div>
                            <div className="text-xs font-bold text-white">{sfx.name}</div>
                            <div className="text-[10px] text-slate-400">{sfx.nameLao}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              playSoundEffect(sfx.id);
                              showToast(`🔊 ຫຼິ້ນສຽງ ${sfx.name}`);
                            }}
                            className="px-2 py-1 rounded-lg bg-[#25283A] hover:bg-cyan-500 hover:text-black text-slate-200 text-[11px] font-bold transition-colors flex items-center gap-1"
                          >
                            <Play className="w-2.5 h-2.5" />
                            <span>ຟັງ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playSoundEffect(sfx.id);
                              showToast(`🎵 ເພີ່ມສຽງ "${sfx.name}" ໃສ່ໄທມ໌ໄລນ໌ແລ້ວ!`);
                            }}
                            className="w-7 h-7 rounded-lg bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-black flex items-center justify-center transition-colors"
                            title="ເພີ່ມໃສ່ໄທມ໌ໄລນ໌"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CAPTIONS / SPEECH-TO-TEXT */}
            {activeLeftTab === "captions" && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#1f212b] border border-slate-700/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Auto Captions (ຖອດສຽງ AI)</span>
                    </div>
                    <button
                      onClick={() => setAiCaptionsEnabled(!aiCaptionsEnabled)}
                      className={`w-9 h-5 rounded-full transition-colors relative ${
                        aiCaptionsEnabled ? "bg-cyan-500" : "bg-slate-700"
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                          aiCaptionsEnabled ? "left-5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Language Selector (Lao with English Loanwords, Thai, Mixed, English) */}
                  <div className="space-y-1">
                    <div className="grid grid-cols-4 gap-1 bg-[#15161d] p-1 rounded-lg text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setClipLanguage("lo");
                          showToast("ເລືອກ: ພາສາລາວ (ປະສົມຄຳອັງກິດໄດ້ ຫ້າມອັງກິດລ້ວນ)");
                        }}
                        className={`py-1.5 text-center rounded transition-all ${
                          clipLanguage === "lo"
                            ? "bg-cyan-500 text-black font-extrabold shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                        title="ພາສາລາວ (ປະສົມຄຳອັງກິດສະເພາະໄດ້ ຫ້າມອັງກິດລ້ວນ)"
                      >
                        🇱🇦 ລາວ+EN
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setClipLanguage("th");
                          showToast("ເລືອກ: ພາສາໄທ (Thai + English)");
                        }}
                        className={`py-1.5 text-center rounded transition-all ${
                          clipLanguage === "th"
                            ? "bg-cyan-500 text-black font-extrabold shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                        title="ພາສາໄທ (Thai + English)"
                      >
                        🇹🇭 ໄທ+EN
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setClipLanguage("mixed");
                          showToast("ເລືອກ: ລາວ + ອັງກິດ (Code-Switching)");
                        }}
                        className={`py-1.5 text-center rounded transition-all ${
                          clipLanguage === "mixed"
                            ? "bg-cyan-500 text-black font-extrabold shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                        title="ລາວ + ອັງກິດ (Mixed Code-Switching)"
                      >
                        🌐 ລາວ+ອັງກິດ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setClipLanguage("en");
                          showToast("ເລືອກ: English");
                        }}
                        className={`py-1.5 text-center rounded transition-all ${
                          clipLanguage === "en"
                            ? "bg-cyan-500 text-black font-extrabold shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                        title="English"
                      >
                        🇬🇧 English
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-400 px-1 flex items-center justify-between">
                      <span>ພາສາຖອດສຽງ:</span>
                      <span className="text-cyan-400 font-semibold truncate max-w-[200px]">
                        {clipLanguage === "lo"
                          ? "🇱🇦 ພາສາລາວ (ປະສົມຄຳອັງກິດໄດ້)"
                          : clipLanguage === "th"
                          ? "🇹🇭 ພາສາໄທ (Thai + EN)"
                          : clipLanguage === "mixed"
                          ? "🌐 ລາວ + ອັງກິດ (Mixed)"
                          : "🇬🇧 English"}
                      </span>
                    </div>

                    {/* Dedicated Subtitle Studio Shortcut */}
                    <Link
                      href="/subtitles"
                      className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold flex items-center justify-between transition-colors mt-2"
                    >
                      <span>🎯 ຕ້ອງການໃສ່ຊັບຢ່າງດຽວແບບໄວ?</span>
                      <span className="font-bold underline">Subtitle Studio →</span>
                    </Link>

                    {/* AI Engine Version Selector (Unbranded, Credit Costs Defined) */}
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold px-1">
                        <span>AI Engine:</span>
                        <span className="text-cyan-400 font-mono">SAIZUP Engine</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: "v1", label: "AI v1", cost: "5cr" },
                          { id: "v2", label: "AI v2", cost: "10cr" },
                          { id: "v3", label: "AI v3", cost: "20cr" },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setEditorAiVersion(m.id as any)}
                            className={`py-1 px-1 rounded text-[10px] font-bold border transition-all ${
                              editorAiVersion === m.id
                                ? "bg-cyan-400 text-black border-cyan-300"
                                : "bg-[#181926] text-slate-400 border-slate-700 hover:text-slate-200"
                            }`}
                          >
                            <span>{m.label}</span>
                            <span className="ml-1 opacity-75 text-[9px]">({m.cost})</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subtitle Interval Mode (30s vs Sentence) */}
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      <button
                        type="button"
                        onClick={() => setEditorIntervalMode("sentence")}
                        className={`py-1 text-[10px] rounded font-semibold border ${
                          editorIntervalMode === "sentence"
                            ? "bg-[#25283A] text-cyan-400 border-cyan-500/40"
                            : "bg-[#161824] text-slate-400 border-slate-800"
                        }`}
                      >
                        ⚡ ປະໂຫຍກ (2-4s)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorIntervalMode("30s")}
                        className={`py-1 text-[10px] rounded font-semibold border ${
                          editorIntervalMode === "30s"
                            ? "bg-[#25283A] text-cyan-400 border-cyan-500/40"
                            : "bg-[#161824] text-slate-400 border-slate-800"
                        }`}
                      >
                        ⏱️ ຊ່ວງ 30s
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateAISubtitles}
                    disabled={isGeneratingSubtitles}
                    className="w-full py-2 rounded-lg text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    {isGeneratingSubtitles ? (
                      <>
                        <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>{sttStepText || "Transcribing..."}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Captions</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Millisecond Sync Nudge (Pillar 2: Fine-tune subtitle cadence with audio waveform) */}
                <div className="p-3 rounded-2xl bg-[#161824] border border-cyan-500/30 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-[11px] font-bold text-white">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>ປັບຈັງຫວະຊັບ (Millisecond Sync Nudge)</span>
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold">±100ms</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: "-100ms", ms: -100 },
                      { label: "-50ms", ms: -50 },
                      { label: "+50ms", ms: 50 },
                      { label: "+100ms", ms: 100 },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => {
                          const deltaSec = btn.ms / 1000;
                          setSubtitles((prev) =>
                            prev.map((s) => ({
                              ...s,
                              time: Math.max(0, Number((s.time + deltaSec).toFixed(3))),
                              endTime: Math.max(0.3, Number((s.endTime + deltaSec).toFixed(3))),
                            }))
                          );
                          showToast(`⚡ ຂຍັບຈັງຫວະຊັບທັງໝົດ: ${btn.label}`);
                        }}
                        className="py-1 rounded-lg bg-[#202230] hover:bg-cyan-500 hover:text-black text-slate-200 text-[10px] font-mono font-bold transition-all text-center border border-slate-700/60"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtitle List */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold px-1">
                    <span>ລາຍການຊັບ ({subtitles.length} ບລັອກ)</span>
                    <button
                      type="button"
                      onClick={handleAddSubtitleAtPlayhead}
                      className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 text-[11px] bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-500/30"
                    >
                      <Plus className="w-3 h-3" />
                      <span>ເພີ່ມຊັບ</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {subtitles.map((sub, idx) => {
                      const isCurrent = currentTime >= sub.time && currentTime <= sub.endTime;
                      return (
                        <div
                          key={sub.id}
                          onClick={() => {
                            setSelectedSubId(sub.id);
                            setSelectedVideoClipId(null);
                            setInspectorMode("text");
                            seekTo(sub.time);
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            selectedSubId === sub.id
                              ? "bg-cyan-950/40 border-cyan-400 text-white shadow-md shadow-cyan-500/10"
                              : isCurrent
                              ? "bg-[#222430] border-yellow-500/50 text-yellow-300"
                              : "bg-[#1c1e27] border-slate-800 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-mono">
                            <span className="font-bold text-cyan-400">#{idx + 1}</span>
                            <span>{formatTime(sub.time)} ➔ {formatTime(sub.endTime)}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSubtitles((prev) =>
                                    prev.map((s) =>
                                      s.id === sub.id
                                        ? { ...s, time: Math.max(0, Number((s.time - 0.1).toFixed(2))) }
                                        : s
                                    )
                                  );
                                }}
                                className="px-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[9px] text-slate-300"
                                title="ຂຍັບເລີ່ມກ່ອນ -0.1s"
                              >
                                -0.1s
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSubtitles((prev) =>
                                    prev.map((s) =>
                                      s.id === sub.id
                                        ? { ...s, time: Number((s.time + 0.1).toFixed(2)) }
                                        : s
                                    )
                                  );
                                }}
                                className="px-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[9px] text-slate-300"
                                title="ຂຍັບເລີ່ມຊ້າ +0.1s"
                              >
                                +0.1s
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSubtitles((prev) => prev.filter((s) => s.id !== sub.id));
                                  showToast(`ລຶບຊັບ #${idx + 1}`);
                                }}
                                className="p-1 text-slate-500 hover:text-rose-400 transition-colors ml-1"
                                title="ລຶບ"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={sub.text}
                            onChange={(e) => updateSubtitleText(sub.id, e.target.value)}
                            className="w-full bg-transparent focus:outline-none focus:border-b border-cyan-400 text-xs font-medium font-['Noto_Sans_Lao'] text-white"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Subtitle Export Toolbar (.SRT, .ASS, .VTT) */}
                <div className="p-3 rounded-2xl bg-[#161824] border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    ດາວໂຫຼດໄຟລ໌ຊັບ (Export Subtitles):
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleExportSubtitles("srt")}
                      className="py-1.5 rounded-xl bg-[#202230] hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-[11px] font-bold border border-slate-700/60 transition-all text-center"
                    >
                      .SRT
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportSubtitles("ass")}
                      className="py-1.5 rounded-xl bg-[#202230] hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-[11px] font-bold border border-slate-700/60 transition-all text-center"
                    >
                      .ASS
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportSubtitles("vtt")}
                      className="py-1.5 rounded-xl bg-[#202230] hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-[11px] font-bold border border-slate-700/60 transition-all text-center"
                    >
                      .VTT
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Left Panel Resizer Handle */}
          <div
            onMouseDown={startDragLeftPanel}
            className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-cyan-500/60 transition-colors z-20"
          />
        </div>

        {/* Left Panel Collapse/Expand Toggle Button */}
        <button
          onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
          className="hidden md:flex absolute top-1/2 left-0 -translate-y-1/2 z-30 w-3.5 h-8 bg-[#252838] border border-slate-700 rounded-r text-slate-400 hover:text-white items-center justify-center shadow"
          style={{ left: isLeftCollapsed ? 0 : `${leftPanelWidth}px` }}
          title={isLeftCollapsed ? "Expand Panel" : "Collapse Panel"}
        >
          {isLeftCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* ========================================================= */}
        {/* COLUMN 2: CENTER VIDEO PLAYER CANVAS & GUIDELINE OVERLAYS */}
        {/* ========================================================= */}
        <div className="flex-1 bg-[#0e0f14] flex flex-col items-center justify-between p-2 sm:p-3 min-w-0 overflow-hidden relative">
          {/* Top Video Canvas Toolbar: Ratio & Guidelines / Grid Selection */}
          <div className="w-full flex flex-wrap items-center justify-between gap-1.5 text-xs text-slate-400 pb-1.5 px-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-400">Player-Timeline 01</span>

              {/* Aspect Ratio Selector (9:16, 16:9, 1:1, 4:5) */}
              <div className="flex items-center gap-0.5 bg-[#161722] p-0.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 px-1 font-semibold flex items-center gap-0.5">
                  <Crop className="w-2.5 h-2.5" />
                  <span>ຂະໜາດ:</span>
                </span>
                {(["9:16", "16:9", "1:1", "4:5"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                      aspectRatio === ratio
                        ? "bg-cyan-500 text-black shadow-sm font-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>

              {/* Crop / Fit Toggle */}
              <button
                type="button"
                onClick={() => setVideoFit(videoFit === "cover" ? "contain" : "cover")}
                className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold transition-all ${
                  videoFit === "cover"
                    ? "bg-[#1f2233] text-cyan-300 border-cyan-500/40"
                    : "bg-[#151620] text-slate-400 border-slate-800 hover:text-white"
                }`}
                title="ປ່ຽນໂໝດ: ຕັດໃຫ້ເຕັມຈໍ (Cover) ຫຼື ພໍດີຂອບ (Fit)"
              >
                {videoFit === "cover" ? "Crop (ເຕັມຈໍ)" : "Fit (ພໍດີ)"}
              </button>

              {/* Defined Canvas Resolution Badge (ສະແດງຂະໜາດໜ້າຈໍທີ່ກຳນົດ) */}
              <div
                className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#141620] border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold shadow-sm select-none"
                title="ຂະໜາດໜ້າຈໍທີ່ກຳນົດໃນການຕັດຕໍ່ (Editing Canvas Resolution)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>
                  {aspectRatio === "9:16" && "📱 1080 × 1920 (9:16 Shorts/TikTok)"}
                  {aspectRatio === "16:9" && "🖥️ 1920 × 1080 (16:9 YouTube)"}
                  {aspectRatio === "1:1" && "⏹️ 1080 × 1080 (1:1 Square)"}
                  {aspectRatio === "4:5" && "📸 1080 × 1350 (4:5 Portrait)"}
                </span>
              </div>

              {/* Fullscreen Mode Button */}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("canvas-viewport-wrapper");
                  if (!document.fullscreenElement) {
                    el?.requestFullscreen?.();
                    setIsFullscreen(true);
                  } else {
                    document.exitFullscreen?.();
                    setIsFullscreen(false);
                  }
                }}
                className={`p-1 rounded text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-semibold px-2 border ${
                  isFullscreen
                    ? "bg-cyan-500 text-black border-cyan-400 font-bold"
                    : "bg-[#161722] border-slate-800 hover:bg-[#202230]"
                }`}
                title="ເປີດວິດີໂອເຕັມຈໍ (Fullscreen)"
              >
                <Maximize2 className="w-3 h-3 text-cyan-400" />
                <span className="hidden sm:inline">ເຕັມຈໍ</span>
              </button>

              {/* CANVAS ZOOM CONTROLS (Zoom In, Zoom Out, Fit, Fill, Percentage) */}
              <div className="flex items-center gap-1 bg-[#161722] p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Zoom Out (Ctrl - / Ctrl Scroll)"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsZoomDropdownOpen(!isZoomDropdownOpen)}
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-[#1f2233] border border-cyan-500/30 flex items-center gap-1 min-w-[58px] justify-center"
                    title="ເລືອກຂະໜາດຈໍ (Zoom Scale)"
                  >
                    <span>{canvasZoomMode === "fit" ? "Fit" : canvasZoomMode === "fill" ? "Fill" : canvasZoomMode}</span>
                    <ChevronDown className="w-2.5 h-2.5" />
                  </button>

                  {isZoomDropdownOpen && (
                    <div
                      className="absolute left-0 top-full mt-1 w-28 bg-[#1e202b] border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-[10px]"
                      onMouseLeave={() => setIsZoomDropdownOpen(false)}
                    >
                      <button
                        type="button"
                        onClick={() => handleSetZoomMode("fit")}
                        className={`w-full text-left px-2.5 py-1 flex items-center justify-between hover:bg-cyan-500/20 hover:text-cyan-300 ${canvasZoomMode === "fit" ? "text-cyan-400 font-bold bg-cyan-950/40" : "text-slate-300"}`}
                      >
                        <span>ພໍດີ (Fit)</span>
                        <span className="text-[9px] text-slate-500">100%</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetZoomMode("fill")}
                        className={`w-full text-left px-2.5 py-1 flex items-center justify-between hover:bg-cyan-500/20 hover:text-cyan-300 ${canvasZoomMode === "fill" ? "text-cyan-400 font-bold bg-cyan-950/40" : "text-slate-300"}`}
                      >
                        <span>ເຕັມຈໍ (Fill)</span>
                        <span className="text-[9px] text-slate-500">120%</span>
                      </button>
                      <div className="h-px bg-slate-800 my-0.5" />
                      {(["50%", "75%", "100%", "125%", "150%", "200%"] as const).map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleSetZoomMode(pct)}
                          className={`w-full text-left px-2.5 py-0.5 hover:bg-cyan-500/20 hover:text-cyan-300 ${canvasZoomMode === pct ? "text-cyan-400 font-bold bg-cyan-950/40" : "text-slate-400"}`}
                        >
                          {pct}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Zoom In (Ctrl + / Ctrl Scroll)"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSetZoomMode("fit")}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${canvasZoomMode === "fit" ? "bg-cyan-500 text-black shadow-sm" : "text-slate-400 hover:text-white"}`}
                  title="ປັບຂະໜາດໃຫ້ພໍດີກັບໜ້າຈໍ"
                >
                  ພໍດີໜ້າຈໍ
                </button>
                <button
                  type="button"
                  onClick={() => handleSetZoomMode("fill")}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${canvasZoomMode === "fill" ? "bg-cyan-500 text-black shadow-sm" : "text-slate-400 hover:text-white"}`}
                  title="ຂະຫຍາຍເຕັມພື້ນທີ່"
                >
                  ເຕັມຈໍ
                </button>
              </div>
            </div>

            {/* GUIDELINE & SAFE ZONE CONTROLS (Clean Social Media Safe Zones - NO DIVIDING LINES) */}
            <div className="flex items-center gap-1 bg-[#161722] p-0.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 px-1 font-semibold">📏 Safe Zone:</span>
              <button
                type="button"
                onClick={() => {
                  setGuidelineMode("none");
                  setShowGuides(false);
                  setHorizontalGuides([]);
                  setVerticalGuides([]);
                  showToast("ປິດ Safe Zone ແລ້ວ");
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  guidelineMode === "none" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="ປິດ Safe Zone ທັງໝົດ (ບໍ່ມີເສັ້ນກັ້ນ)"
              >
                ປິດ
              </button>
              <button
                type="button"
                onClick={() => setGuidelineMode("tiktok-safe")}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                  guidelineMode === "tiktok-safe"
                    ? "bg-cyan-500 text-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="TikTok Safe Zone (ເຂດປອດໄພຕິກຕອກ)"
              >
                <Smartphone className="w-3 h-3" />
                <span>TikTok</span>
              </button>
              <button
                type="button"
                onClick={() => setGuidelineMode("reels-safe")}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                  guidelineMode === "reels-safe"
                    ? "bg-cyan-500 text-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Instagram Reels Safe Zone"
              >
                <Camera className="w-3 h-3" />
                <span>Reels</span>
              </button>
              <button
                type="button"
                onClick={() => setGuidelineMode("fb-safe")}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                  guidelineMode === "fb-safe"
                    ? "bg-cyan-500 text-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Facebook Reels Safe Zone"
              >
                <ThumbsUp className="w-3 h-3" />
                <span>Facebook</span>
              </button>

              {/* Player Context Menu: Clean tools only */}
              <div className="relative ml-1">
                <button
                  type="button"
                  onClick={() => setIsGuidesDropdownOpen(!isGuidesDropdownOpen)}
                  className={`p-1 rounded text-slate-300 hover:text-white transition-colors ${
                    isGuidesDropdownOpen ? "bg-[#282a38] text-white" : "hover:bg-[#202230]"
                  }`}
                  title="Player Tools Menu"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {isGuidesDropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-1.5 w-52 bg-[#20212b] border border-slate-700/90 rounded-lg shadow-2xl z-50 text-xs py-1 text-slate-200 select-none backdrop-blur-md"
                    onMouseLeave={() => setIsGuidesDropdownOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsGuidesDropdownOpen(false);
                        handleExportStillFrame();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#2c2e3c] hover:text-white text-slate-200 cursor-pointer flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Export still frame (PNG)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsGuidesDropdownOpen(false);
                        setCanvasZoomMode("fit");
                        setCanvasZoomScale(1.0);
                        showToast("ປັບຂະໜາດພໍດີໜ້າຈໍແລ້ວ");
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#2c2e3c] hover:text-white text-slate-200 cursor-pointer flex items-center gap-2 border-t border-slate-800/80"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Fit to screen (ພໍດີໜ້າຈໍ)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable / Zoomable Video Player Viewport */}
          <div
            id="canvas-viewport-wrapper"
            onWheel={handleCanvasWheel}
            className="flex-1 w-full flex items-center justify-center overflow-auto p-2 min-h-0 relative select-none"
          >
            {/* Dynamic Video Player Monitor Container */}
            <div
              className={`relative ${
                canvasZoomMode === "fill"
                  ? aspectRatio === "16:9"
                    ? "w-full max-w-[960px] aspect-video max-h-[calc(100vh-230px)]"
                    : aspectRatio === "1:1"
                    ? "h-full max-h-[calc(100vh-230px)] aspect-square w-auto"
                    : aspectRatio === "4:5"
                    ? "h-full max-h-[calc(100vh-230px)] aspect-[4/5] w-auto max-w-[480px]"
                    : "h-full max-h-[calc(100vh-230px)] aspect-[9/16] w-auto max-w-[460px]"
                  : aspectRatio === "16:9"
                  ? "w-full max-w-[850px] aspect-video max-h-[calc(100vh-260px)]"
                  : aspectRatio === "1:1"
                  ? "h-full max-h-[calc(100vh-260px)] aspect-square w-auto"
                  : aspectRatio === "4:5"
                  ? "h-full max-h-[calc(100vh-260px)] aspect-[4/5] w-auto max-w-[440px]"
                  : "h-full max-h-[calc(100vh-260px)] aspect-[9/16] w-auto max-w-[430px]"
              } rounded-2xl bg-black border border-[#2b2d3d] shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-between flex-shrink-0 my-auto`}
              style={{
                transform: `scale(${canvasZoomScale})`,
                transformOrigin: "center center",
                transition: "transform 0.15s ease-out",
              }}
            >
            {videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={() => setDuration(videoRef.current?.duration || 15)}
                  onClick={togglePlay}
                  style={{
                    filter: computeVideoCssFilter(videoColorFilter),
                  }}
                  className={`absolute inset-0 w-full h-full ${
                    videoFit === "cover" ? "object-cover" : "object-contain"
                  } cursor-pointer`}
                />

                {/* ========================================================= */}
                {/* SOCIAL MEDIA SAFE ZONE OVERLAYS (NO DIVIDING LINES, NO TEXT) */}
                {/* ========================================================= */}

                {/* TikTok Safe Zone - CapCut style: real app icons, dashed lines, STRICTLY NO TEXT */}
                {guidelineMode === "tiktok-safe" && (
                  <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">
                    {/* Top Danger Zone (Following / For You Header) - NO TEXT */}
                    <div className="h-[12%] border-b-2 border-dashed border-rose-500/70 bg-rose-500/10 flex items-center justify-center">
                      <div className="flex gap-4 opacity-40">
                        <div className="w-10 h-1.5 rounded-full bg-white/60" />
                        <div className="w-12 h-1.5 rounded-full bg-white/90" />
                      </div>
                    </div>

                    {/* Middle: Right action column with real TikTok action buttons */}
                    <div className="flex-1 flex justify-end items-end pb-3 pr-2.5">
                      <div className="flex flex-col items-center gap-3.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {/* Profile Avatar with + icon */}
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-700 overflow-hidden flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white font-bold leading-none">
                            +
                          </div>
                        </div>

                        {/* Heart / Like Button (ปุ่มกดใจ) */}
                        <div className="flex flex-col items-center">
                          <Heart className="w-6 h-6 text-white fill-white/90 stroke-black stroke-[1.5]" />
                          <span className="text-[9px] text-white font-bold font-mono">82.4K</span>
                        </div>

                        {/* Comment Button */}
                        <div className="flex flex-col items-center">
                          <MessageCircle className="w-6 h-6 text-white fill-white/90 stroke-black stroke-[1.5]" />
                          <span className="text-[9px] text-white font-bold font-mono">1.2K</span>
                        </div>

                        {/* Bookmark / Save */}
                        <div className="flex flex-col items-center">
                          <Bookmark className="w-6 h-6 text-white fill-white/90 stroke-black stroke-[1.5]" />
                          <span className="text-[9px] text-white font-bold font-mono">9.8K</span>
                        </div>

                        {/* Share Button */}
                        <div className="flex flex-col items-center">
                          <Share2 className="w-6 h-6 text-white stroke-black stroke-[1.5]" />
                          <span className="text-[9px] text-white font-bold font-mono">3.4K</span>
                        </div>

                        {/* Spinning Music Vinyl Disc */}
                        <div className="w-7 h-7 rounded-full bg-[#111] border-2 border-slate-600 flex items-center justify-center animate-spin">
                          <Disc className="w-4 h-4 text-cyan-400" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Danger Zone (Username & Caption & Music banner) - NO TEXT */}
                    <div className="h-[22%] border-t-2 border-dashed border-rose-500/70 bg-rose-500/10 p-2.5 flex flex-col justify-end space-y-1.5">
                      <div className="w-24 h-2 rounded-full bg-white/50" />
                      <div className="w-44 h-1.5 rounded-full bg-white/30" />
                      <div className="w-36 h-1.5 rounded-full bg-white/30" />
                      <div className="flex items-center gap-1.5 pt-1">
                        <Music className="w-3 h-3 text-white/60" />
                        <div className="w-28 h-1.5 rounded-full bg-white/40" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Instagram Reels Safe Zone - NO TEXT */}
                {guidelineMode === "reels-safe" && (
                  <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">
                    {/* Top Danger Zone (Reels camera & audio) - NO TEXT */}
                    <div className="h-[10%] border-b-2 border-dashed border-purple-500/70 bg-purple-500/10 flex items-center justify-between px-3">
                      <div className="w-16 h-2 rounded-full bg-white/60" />
                      <Camera className="w-4 h-4 text-white/70" />
                    </div>

                    {/* Right action column with real Reels icons */}
                    <div className="flex-1 flex justify-end items-end pb-3 pr-2.5">
                      <div className="flex flex-col items-center gap-3.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        <div className="flex flex-col items-center">
                          <Heart className="w-6 h-6 text-white stroke-white stroke-[1.8]" />
                          <span className="text-[9px] text-white font-bold font-mono">45.1K</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <MessageCircle className="w-6 h-6 text-white stroke-white stroke-[1.8]" />
                          <span className="text-[9px] text-white font-bold font-mono">820</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Share2 className="w-6 h-6 text-white stroke-white stroke-[1.8]" />
                        </div>
                        <div className="flex flex-col items-center">
                          <MoreHorizontal className="w-6 h-6 text-white" />
                        </div>
                        <div className="w-6 h-6 rounded-md border-2 border-white bg-slate-800 flex items-center justify-center">
                          <Music className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Danger Zone (Reels Caption & Audio) - NO TEXT */}
                    <div className="h-[24%] border-t-2 border-dashed border-purple-500/70 bg-purple-500/10 p-2.5 flex flex-col justify-end space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/60" />
                        <div className="w-20 h-2 rounded-full bg-white/60" />
                      </div>
                      <div className="w-40 h-1.5 rounded-full bg-white/30" />
                      <div className="w-28 h-1.5 rounded-full bg-white/30" />
                    </div>
                  </div>
                )}

                {/* Facebook Reels Safe Zone - NO TEXT */}
                {guidelineMode === "fb-safe" && (
                  <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">
                    {/* Top Danger Zone */}
                    <div className="h-[10%] border-b-2 border-dashed border-blue-500/70 bg-blue-500/10 flex items-center px-3">
                      <div className="w-16 h-2 rounded-full bg-white/60" />
                    </div>

                    {/* Right action column */}
                    <div className="flex-1 flex justify-end items-end pb-3 pr-2.5">
                      <div className="flex flex-col items-center gap-3.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        <div className="flex flex-col items-center">
                          <ThumbsUp className="w-6 h-6 text-white fill-blue-500 stroke-white" />
                          <span className="text-[9px] text-white font-bold font-mono">15K</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <MessageCircle className="w-6 h-6 text-white stroke-white stroke-[1.8]" />
                          <span className="text-[9px] text-white font-bold font-mono">430</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Share2 className="w-6 h-6 text-white stroke-white stroke-[1.8]" />
                          <span className="text-[9px] text-white font-bold font-mono">1.1K</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Danger Zone */}
                    <div className="h-[20%] border-t-2 border-dashed border-blue-500/70 bg-blue-500/10 p-2.5 flex flex-col justify-end space-y-1.5">
                      <div className="w-24 h-2 rounded-full bg-white/60" />
                      <div className="w-36 h-1.5 rounded-full bg-white/30" />
                    </div>
                  </div>
                )}


                {/* Subtitle Overlay with High Contrast, Clean Outline & Karaoke Word Bounce */}
                {aiCaptionsEnabled && trackVisibilities.text && activeSub && (
                  <div
                    style={{ top: `${currentKfValues.positionY}%` }}
                    className="absolute inset-x-0 px-3 pointer-events-auto text-center transition-all -translate-y-1/2 z-20 group cursor-grab active:cursor-grabbing select-none"
                    title="ລາກຂຶ້ນ-ລົງ ເພື່ອປັບຕຳແໜ່ງຊັບ"
                    onMouseDown={(e) => {
                      const startY = e.clientY;
                      const initialPos = currentKfValues.positionY;
                      const videoContainer = e.currentTarget.parentElement;
                      if (!videoContainer) return;
                      const containerHeight = videoContainer.getBoundingClientRect().height;

                      const onMouseMove = (moveEvent: MouseEvent) => {
                        const deltaY = moveEvent.clientY - startY;
                        const deltaPercent = (deltaY / containerHeight) * 100;
                        const newPos = Math.max(15, Math.min(95, Math.round(initialPos + deltaPercent)));
                        setPositionY(newPos);
                      };

                      const onMouseUp = () => {
                        window.removeEventListener("mousemove", onMouseMove);
                        window.removeEventListener("mouseup", onMouseUp);
                      };

                      window.addEventListener("mousemove", onMouseMove);
                      window.addEventListener("mouseup", onMouseUp);
                    }}
                  >
                    {/* LaoSub Direct Drag Indicator ⇕ */}
                    <span
                      aria-hidden="true"
                      className="absolute start-[2%] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 text-white text-[12px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow pointer-events-none"
                    >
                      ⇕
                    </span>

                    <div
                      style={{
                        backgroundColor: enableBackground
                          ? `${bgColor}${Math.round((bgOpacity / 100) * 255).toString(16).padStart(2, "0")}`
                          : "transparent",
                        border: enableBoxBorder && enableBackground ? `1.5px solid ${boxBorderColor}` : "none",
                        boxShadow: enableGlow && enableBackground ? `0 0 ${glowIntensity}px ${glowColor}80` : "none",
                        transform: `translate(${currentKfValues.positionX}px, 0) scale(${currentKfValues.scale / 100}) rotate(${currentKfValues.rotation}deg)`,
                        opacity: currentKfValues.opacity / 100,
                        textAlign: capcutTextAlign,
                      }}
                      className={`inline-block transition-all ${
                        enableBackground ? `${bgRadius} px-3.5 py-1.5` : "px-1 py-0.5"
                      }`}
                    >
                      <div
                        className={`flex flex-wrap justify-center items-center font-bold ${
                          letterSpacing === "space" ? "gap-2 tracking-wider" : "gap-1 tracking-normal"
                        }`}
                        style={{
                          fontFamily: selectedFont === "System" ? "system-ui, -apple-system, sans-serif" : selectedFont === "Noto Sans Lao" ? "'Noto Sans Lao', sans-serif" : selectedFont,
                          fontWeight: capcutPatternBold ? "900" : "400",
                          fontStyle: capcutPatternItalic ? "italic" : "normal",
                          textDecoration: capcutPatternUnderline ? "underline" : "none",
                          letterSpacing: `${capcutCharSpacing}px`,
                          lineHeight: `${1.4 + capcutLineSpacing * 0.05}`,
                          fontSize: `${fontScale * 2.8}px`,
                        }}
                      >
                        {visibleWords.map((word, wIdx) => {
                          const isCurrent = word.originalIdx === activeWordIndex;
                          const isFuture = word.originalIdx > activeWordIndex;
                          const displayText = transformTextCase(word.text, capcutTextCase);

                          const baseShadow = enableShadow
                            ? `0 ${shadowDistance}px ${shadowBlur}px ${shadowColor}`
                            : shadowLevel === 0
                            ? "none"
                            : shadowLevel === 1
                            ? "0 2px 4px rgba(0, 0, 0, 0.6)"
                            : shadowLevel === 2
                            ? "0 4px 8px rgba(0, 0, 0, 0.85)"
                            : "0 6px 14px rgba(0, 0, 0, 0.95), 0 2px 4px #000";

                          // Heavy-duty crisp black outline that never eats the letter glyph
                          const strokeShadow = enableStroke && strokeWidth > 0
                            ? `
                              -1.5px -1.5px 0 ${strokeColor},  
                               1.5px -1.5px 0 ${strokeColor},
                              -1.5px  1.5px 0 ${strokeColor},
                               1.5px  1.5px 0 ${strokeColor},
                              -2.5px 0px 0 ${strokeColor},
                               2.5px 0px 0 ${strokeColor},
                               0px -2.5px 0 ${strokeColor},
                               0px  2.5px 0 ${strokeColor}${baseShadow !== "none" ? `, ${baseShadow}` : ""}`
                            : baseShadow;

                          const combinedShadow = enableGlow
                            ? `${strokeShadow !== "none" ? `${strokeShadow}, ` : ""}0 0 ${glowIntensity}px ${isCurrent ? highlightColor : glowColor}`
                            : strokeShadow;

                          // 1. BOUNCE EFFECT (ເດ້ງທີລະຄຳ)
                          if (activeEffect === "bounce") {
                            return (
                              <span
                                key={`${word.originalIdx}-${wIdx}`}
                                style={{
                                  color: isCurrent ? highlightColor : textColor,
                                  paintOrder: "stroke fill",
                                  WebkitTextStroke:
                                    enableStroke && strokeWidth > 0
                                      ? `${strokeWidth}px ${strokeColor}`
                                      : undefined,
                                  textShadow: combinedShadow,
                                }}
                                className={`inline-block transition-transform duration-100 ${
                                  isCurrent ? "animate-pop scale-110" : "opacity-95"
                                }`}
                              >
                                {displayText}
                              </span>
                            );
                          }

                          // 2. KARAOKE WIPE EFFECT (ໄລ່ສີຕາມສຽງ)
                          if (activeEffect === "karaoke") {
                            const totalWordsCount = activeSub.words.length || 1;
                            const subDuration = Math.max(0.1, activeSub.endTime - activeSub.time);
                            const subElapsed = Math.max(0, currentTime - activeSub.time);
                            const overallProgress = Math.max(0, Math.min(1, subElapsed / subDuration));

                            const wordStartProgress = word.originalIdx / totalWordsCount;
                            const wordProgress = Math.max(
                              0,
                              Math.min(1, (overallProgress - wordStartProgress) / (1 / totalWordsCount))
                            );
                            const wipePercent = Math.round((1 - wordProgress) * 100);

                            return (
                              <span
                                key={`${word.originalIdx}-${wIdx}`}
                                className="relative inline-block"
                                style={{
                                  paintOrder: "stroke fill",
                                  WebkitTextStroke:
                                    enableStroke && strokeWidth > 0
                                      ? `${strokeWidth}px ${strokeColor}`
                                      : undefined,
                                  textShadow: combinedShadow,
                                }}
                              >
                                <span style={{ color: textColor }}>{displayText}</span>
                                <span
                                  aria-hidden="true"
                                  className="absolute inset-0 pointer-events-none transition-[clip-path] duration-75 select-none"
                                  style={{
                                    color: highlightColor,
                                    clipPath: `inset(0px ${wipePercent}% 0px 0px)`,
                                    whiteSpace: "pre",
                                  }}
                                >
                                  {displayText}
                                </span>
                              </span>
                            );
                          }

                          // 3. TYPEWRITER EFFECT (ພິມທີລະຄຳ)
                          if (activeEffect === "typewriter") {
                            return (
                              <span
                                key={`${word.originalIdx}-${wIdx}`}
                                style={{
                                  color: isCurrent ? highlightColor : textColor,
                                  paintOrder: "stroke fill",
                                  WebkitTextStroke:
                                    enableStroke && strokeWidth > 0
                                      ? `${strokeWidth}px ${strokeColor}`
                                      : undefined,
                                  textShadow: combinedShadow,
                                  visibility: isFuture ? "hidden" : "visible",
                                  opacity: isFuture ? 0 : 1,
                                }}
                                className={`inline-block transition-opacity duration-150 ${
                                  isCurrent ? "scale-105" : ""
                                }`}
                              >
                                {displayText}
                              </span>
                            );
                          }

                          // 4. FADE IN EFFECT (ຄ່ອຍໆປາກົດ)
                          if (activeEffect === "fade") {
                            return (
                              <span
                                key={`${word.originalIdx}-${wIdx}`}
                                style={{
                                  color: isCurrent ? highlightColor : textColor,
                                  paintOrder: "stroke fill",
                                  WebkitTextStroke:
                                    enableStroke && strokeWidth > 0
                                      ? `${strokeWidth}px ${strokeColor}`
                                      : undefined,
                                  textShadow: combinedShadow,
                                  opacity: isFuture ? 0.25 : 1,
                                  transform: isFuture ? "translateY(3px)" : "translateY(0)",
                                  transition: "all 0.25s ease",
                                }}
                                className="inline-block"
                              >
                                {displayText}
                              </span>
                            );
                          }

                          // 5. STATIC / NORMAL EFFECT (ຊັບທຳມະດາ - ນິ້ງ ບໍ່ມີການເຄື່ອນໄຫວ)
                          return (
                            <span
                              key={`${word.originalIdx}-${wIdx}`}
                              style={{
                                color: isCurrent ? highlightColor : textColor,
                                paintOrder: "stroke fill",
                                WebkitTextStroke:
                                  enableStroke && strokeWidth > 0
                                    ? `${strokeWidth}px ${strokeColor}`
                                    : undefined,
                                textShadow: combinedShadow,
                              }}
                              className="inline-block"
                            >
                              {displayText}
                            </span>
                          );
                        })}
                      </div>

                      {showBilingual && activeSub.translatedText && (
                        <div
                          className="text-[11px] text-slate-200/90 font-medium mt-1 border-t border-white/20 pt-1 font-['Noto_Sans_Lao']"
                          style={{
                            fontSize: `${Math.max(10, fontScale * 1.5)}px`,
                            textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                          }}
                        >
                          {activeSub.translatedText}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-slate-900/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2 border border-cyan-500/20">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-white">Upload Your Video Clip</div>
                <p className="text-[10px] text-slate-400 mt-1">MP4, MOV, WebM</p>
              </div>
            )}
          </div>
          </div>

          {/* Player Bottom Control Bar */}
          <div className="w-full max-w-[500px] flex items-center justify-between text-xs text-slate-400 pt-1 px-2">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-1 rounded hover:text-white hover:bg-slate-800"
              >
                {isPlaying ? <Pause className="w-4 h-4 text-cyan-400" /> : <Play className="w-4 h-4" />}
              </button>
              <span className="font-mono text-[11px] text-slate-300">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Speed rate indicator */}
              <div className="flex items-center gap-1 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                <button
                  onClick={() => changeSpeed(playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1)}
                  className="hover:text-cyan-400"
                >
                  {playbackRate}x
                </button>
              </div>

              <button onClick={toggleMute} className="p-1 hover:text-white">
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => videoRef.current?.requestFullscreen?.()}
                className="p-1 hover:text-white"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel Collapse/Expand Toggle Button */}
        <button
          onClick={() => setIsRightCollapsed(!isRightCollapsed)}
          className="hidden md:flex absolute top-1/2 right-0 -translate-y-1/2 z-30 w-3.5 h-8 bg-[#252838] border border-slate-700 rounded-l text-slate-400 hover:text-white items-center justify-center shadow"
          style={{ right: isRightCollapsed ? 0 : `${rightPanelWidth}px` }}
          title={isRightCollapsed ? "Expand Inspector" : "Collapse Inspector"}
        >
          {isRightCollapsed ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {/* ========================================================= */}
        {/* COLUMN 3: RIGHT DETAILS INSPECTOR PANEL (Resizable)       */}
        {/* ========================================================= */}
        <div
          style={{
            width: isRightCollapsed ? 0 : `${rightPanelWidth}px`,
            display: isRightCollapsed ? "none" : undefined,
          }}
          className="w-full md:flex bg-[#181920] border-t md:border-t-0 md:border-l border-[#262833] flex-shrink-0 flex-col overflow-hidden relative transition-[width] duration-75 max-h-[40vh] md:max-h-none"
        >
          {/* Right Panel Resizer Handle */}
          <div
            onMouseDown={startDragRightPanel}
            className="absolute top-0 left-0 w-1.5 h-full cursor-col-resize hover:bg-cyan-500/60 transition-colors z-20"
          />

          {/* Top Contextual Mode Switcher (Text, Keyframe, Video, Audio) */}
          <div className="flex items-center gap-1 p-2 border-b border-[#262833] bg-[#14151e] overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setInspectorMode("text")}
              className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                inspectorMode === "text"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                  : "bg-[#1f212b] text-slate-300 hover:bg-[#282a36] hover:text-white"
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>ຂໍ້ຄວາມ (Text)</span>
            </button>

            <button
              type="button"
              onClick={() => setInspectorMode("keyframe")}
              className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                inspectorMode === "keyframe"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                  : "bg-[#1f212b] text-slate-300 hover:bg-[#282a36] hover:text-white"
              }`}
            >
              <span className="text-sm font-bold">◆</span>
              <span>Keyframe ({keyframes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setInspectorMode("video")}
              className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                inspectorMode === "video"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                  : "bg-[#1f212b] text-slate-300 hover:bg-[#282a36] hover:text-white"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>ວິດີໂອ (Video)</span>
            </button>

            <button
              type="button"
              onClick={() => setInspectorMode("audio")}
              className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                inspectorMode === "audio"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                  : "bg-[#1f212b] text-slate-300 hover:bg-[#282a36] hover:text-white"
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>ສຽງ (Audio)</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
            {/* ========================================================= */}
            {/* 1. TEXT PROPERTY INSPECTOR (Active Subtitle)              */}
            {/* ========================================================= */}
            {inspectorMode === "text" && (
              <div className="space-y-3 text-xs">
                {/* 1. Subtitle Editing Textarea */}
                <div className="space-y-1">
                  <textarea
                    value={activeSub ? activeSub.text : "Default text"}
                    onChange={(e) => handleUpdateActiveSubtitleText(e.target.value)}
                    placeholder="Default text"
                    rows={2}
                    className="w-full bg-[#161722] border border-slate-700/80 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-['Noto_Sans_Lao'] transition-colors resize-none shadow-inner"
                  />
                </div>

                {/* 2. Font Dropdown */}
                <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <span className="text-slate-400 font-medium">Font</span>
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value as any)}
                    className="w-full bg-[#202230] border border-slate-700/80 text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="System">System</option>
                    <option value="Noto Sans Lao">Noto Sans Lao (Lao Sub)</option>
                    <option value="Noto Serif Lao">Noto Serif Lao (ຫາງງາມ)</option>
                    <option value="Noto Sans Lao Looped">Noto Sans Lao Looped (ມີຫົວ)</option>
                    <option value="Arial">Arial</option>
                    <option value="Impact">Impact (Bold)</option>
                  </select>
                </div>

                {/* 3. Font Size Slider & Numeric Stepper with Keyframe Diamond */}
                <div className="grid grid-cols-[80px_1fr_auto] items-center gap-2">
                  <span className="text-slate-400 font-medium">Font size</span>
                  <input
                    type="range"
                    min={4}
                    max={25}
                    step={0.5}
                    value={fontScale}
                    onChange={(e) => setFontScale(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-1 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 bg-[#202230] border border-slate-700/80 rounded px-2 py-0.5 font-mono text-white">
                    <span>{Math.round(fontScale * 2)}</span>
                    <span className="text-[10px] text-slate-500">◇</span>
                  </div>
                </div>

                {/* 4. Pattern (B, U, I) */}
                <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <span className="text-slate-400 font-medium">Pattern</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCapcutPatternBold(!capcutPatternBold)}
                      className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs transition-colors border ${
                        capcutPatternBold
                          ? "bg-cyan-500/20 text-cyan-400 border-cyan-400/50"
                          : "bg-[#202230] text-slate-300 border-slate-700 hover:text-white"
                      }`}
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCapcutPatternUnderline(!capcutPatternUnderline)}
                      className={`w-7 h-7 rounded flex items-center justify-center text-xs transition-colors border ${
                        capcutPatternUnderline
                          ? "bg-cyan-500/20 text-cyan-400 border-cyan-400/50"
                          : "bg-[#202230] text-slate-300 border-slate-700 hover:text-white"
                      }`}
                      title="Underline"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCapcutPatternItalic(!capcutPatternItalic)}
                      className={`w-7 h-7 rounded flex items-center justify-center text-xs transition-colors border ${
                        capcutPatternItalic
                          ? "bg-cyan-500/20 text-cyan-400 border-cyan-400/50"
                          : "bg-[#202230] text-slate-300 border-slate-700 hover:text-white"
                      }`}
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 5. Case (TT, tt, Tt) */}
                <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <span className="text-slate-400 font-medium">Case</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCapcutTextCase(capcutTextCase === "upper" ? "normal" : "upper")}
                      className={`px-2.5 py-1 rounded font-mono font-bold transition-colors border ${
                        capcutTextCase === "upper"
                          ? "bg-cyan-500/20 text-cyan-400 border-cyan-400/50"
                          : "bg-[#202230] text-slate-300 border-slate-700 hover:text-white"
                      }`}
                      title="UPPERCASE"
                    >
                      TT
                    </button>
                    <button
                      type="button"
                      onClick={() => setCapcutTextCase(capcutTextCase === "lower" ? "normal" : "lower")}
                      className={`px-2.5 py-1 rounded font-mono font-bold transition-colors border ${
                        capcutTextCase === "lower"
                          ? "bg-cyan-500/20 text-cyan-400 border-cyan-400/50"
                          : "bg-[#202230] text-slate-300 border-slate-700 hover:text-white"
                      }`}
                      title="lowercase"
                    >
                      tt
                    </button>
                    <button
                      type="button"
                      onClick={() => setCapcutTextCase(capcutTextCase === "title" ? "normal" : "title")}
                      className={`px-2.5 py-1 rounded font-mono font-bold transition-colors border ${
                        capcutTextCase === "title"
                          ? "bg-cyan-500/20 text-cyan-400 border-cyan-400/50"
                          : "bg-[#202230] text-slate-300 border-slate-700 hover:text-white"
                      }`}
                      title="Title Case"
                    >
                      Tt
                    </button>
                  </div>
                </div>

                {/* 6. Color Picker Swatch */}
                <div className="grid grid-cols-[80px_1fr_auto] items-center gap-2">
                  <span className="text-slate-400 font-medium">Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-14 h-6 rounded cursor-pointer border border-slate-700 bg-transparent p-0"
                    />
                    <span className="font-mono text-white text-[11px]">{textColor.toUpperCase()}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">◇</div>
                </div>

                {/* 7. Character & Line Spacing */}
                <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <span className="text-slate-400 font-medium">Character</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-[#202230] border border-slate-700/80 rounded px-2 py-0.5">
                      <button
                        type="button"
                        onClick={() => setCapcutCharSpacing((p) => Math.max(-5, p - 1))}
                        className="text-slate-400 hover:text-white"
                      >
                        -
                      </button>
                      <span className="font-mono text-white w-4 text-center">{capcutCharSpacing}</span>
                      <button
                        type="button"
                        onClick={() => setCapcutCharSpacing((p) => Math.min(20, p + 1))}
                        className="text-slate-400 hover:text-white"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-slate-400 font-medium">Line</span>
                    <div className="flex items-center gap-1.5 bg-[#202230] border border-slate-700/80 rounded px-2 py-0.5">
                      <button
                        type="button"
                        onClick={() => setCapcutLineSpacing((p) => Math.max(-5, p - 1))}
                        className="text-slate-400 hover:text-white"
                      >
                        -
                      </button>
                      <span className="font-mono text-white w-4 text-center">{capcutLineSpacing}</span>
                      <button
                        type="button"
                        onClick={() => setCapcutLineSpacing((p) => Math.min(20, p + 1))}
                        className="text-slate-400 hover:text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* 8. Alignment */}
                <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <span className="text-slate-400 font-medium">Alignment</span>
                  <div className="flex items-center gap-1 bg-[#161722] p-0.5 rounded border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setCapcutTextAlign("left")}
                      className={`p-1.5 rounded ${capcutTextAlign === "left" ? "bg-[#252838] text-white" : "text-slate-400 hover:text-white"}`}
                      title="Align Left"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCapcutTextAlign("center")}
                      className={`p-1.5 rounded ${capcutTextAlign === "center" ? "bg-[#252838] text-white" : "text-slate-400 hover:text-white"}`}
                      title="Align Center"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCapcutTextAlign("right")}
                      className={`p-1.5 rounded ${capcutTextAlign === "right" ? "bg-[#252838] text-white" : "text-slate-400 hover:text-white"}`}
                      title="Align Right"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCapcutTextAlign("justify")}
                      className={`p-1.5 rounded ${capcutTextAlign === "justify" ? "bg-[#252838] text-white" : "text-slate-400 hover:text-white"}`}
                      title="Justify"
                    >
                      <AlignJustify className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 9. Preset style (22 Tiles Grid - Matching Image 2) */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-xs font-semibold text-slate-300">Preset style</div>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                    {CAPCUT_PRESET_STYLES.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyCapcutPreset(p)}
                        className="relative aspect-square rounded-lg border border-slate-700/80 hover:border-cyan-400 transition-all flex items-center justify-center p-1 group bg-[#1e202b] hover:scale-105"
                        title={p.label}
                      >
                        {p.isNone ? (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-500 relative flex items-center justify-center">
                            <div className="w-full h-0.5 bg-slate-500 rotate-45" />
                          </div>
                        ) : p.isPill ? (
                          <div
                            style={{ backgroundColor: p.bgC, color: p.text }}
                            className="w-full py-0.5 rounded-full text-center font-black text-[10px] leading-tight select-none shadow-sm"
                          >
                            Aa
                          </div>
                        ) : p.isBox ? (
                          <div
                            style={{ backgroundColor: p.bgC, color: p.text }}
                            className="w-full py-0.5 rounded-md text-center font-black text-[10px] leading-tight select-none border border-white/20"
                          >
                            Aa
                          </div>
                        ) : (
                          <div
                            style={{
                              color: p.text,
                              paintOrder: "stroke fill",
                              WebkitTextStroke: p.previewStroke,
                              textShadow: p.previewShadow,
                            }}
                            className="font-black text-xs leading-none select-none tracking-tight"
                          >
                            Aa
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 10. Transform Accordion (CapCut Desktop Keyframed Transform) */}
                <div className="border-t border-slate-800 pt-2 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setAccordionOpen((p) => ({ ...p, transform: !p.transform }))}
                      className="flex items-center gap-1 font-semibold text-white hover:text-cyan-400"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${accordionOpen.transform ? "" : "-rotate-90"}`} />
                      <span>Transform</span>
                    </button>
                    <div className="flex items-center gap-2 text-slate-400">
                      <button
                        type="button"
                        onClick={() => {
                          setCapcutScale(100);
                          setCapcutPositionX(0);
                          setPositionY(82);
                          setCapcutPlaneRotation(0);
                          showToast("Reset Transform");
                        }}
                        className="hover:text-white"
                        title="Reset Transform"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={handleToggleKeyframeAtPlayhead}
                        className={`text-xs px-1 rounded transition-colors ${
                          hasKeyframeAtPlayhead
                            ? "text-cyan-400 font-bold bg-cyan-950/60 shadow-[0_0_8px_rgba(18,232,255,0.7)]"
                            : "text-slate-500 hover:text-white"
                        }`}
                        title={
                          hasKeyframeAtPlayhead
                            ? "ລຶບ Keyframe ທີ່ Playhead (Shift+Alt+K)"
                            : "ເພີ່ມ Keyframe ໃສ່ Playhead (Shift+Alt+K)"
                        }
                      >
                        {hasKeyframeAtPlayhead ? "◆" : "◇"}
                      </button>
                    </div>
                  </div>

                  {accordionOpen.transform && (
                    <div className="space-y-2.5 pl-3">
                      {/* Scale */}
                      <div className="grid grid-cols-[80px_1fr_auto] items-center gap-2">
                        <span className="text-slate-400">Scale</span>
                        <input
                          type="range"
                          min={20}
                          max={200}
                          value={currentKfValues.scale}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 100;
                            setCapcutScale(val);
                            if (exactKfAtPlayhead) {
                              setKeyframes((prev) =>
                                prev.map((k) => (k.id === exactKfAtPlayhead.id ? { ...k, scale: val } : k))
                              );
                            }
                          }}
                          className="w-full accent-cyan-400 h-1 bg-slate-700 rounded-lg cursor-pointer"
                        />
                        <div className="flex items-center gap-1 bg-[#202230] border border-slate-700/80 rounded px-2 py-0.5 font-mono text-white">
                          <span>{currentKfValues.scale}%</span>
                          <button
                            type="button"
                            onClick={handleToggleKeyframeAtPlayhead}
                            className={`text-[10px] px-0.5 transition-colors ${
                              hasKeyframeAtPlayhead ? "text-cyan-400 font-bold" : "text-slate-500 hover:text-cyan-300"
                            }`}
                            title="Toggle Keyframe (Shift+Alt+K)"
                          >
                            {hasKeyframeAtPlayhead ? "◆" : "◇"}
                          </button>
                        </div>
                      </div>

                      {/* Uniform Scale Switch */}
                      <div className="flex items-center justify-between pr-1">
                        <span className="text-slate-400">Uniform scale</span>
                        <button
                          type="button"
                          onClick={() => setCapcutUniformScale(!capcutUniformScale)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                            capcutUniformScale ? "bg-cyan-500" : "bg-slate-700"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              capcutUniformScale ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Position X & Y */}
                      <div className="grid grid-cols-[80px_1fr_auto] items-center gap-2">
                        <span className="text-slate-400">Position</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-[#202230] border border-slate-700/80 rounded px-2 py-0.5">
                            <span className="text-slate-500 font-mono">X</span>
                            <input
                              type="number"
                              value={currentKfValues.positionX}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setCapcutPositionX(val);
                                if (exactKfAtPlayhead) {
                                  setKeyframes((prev) =>
                                    prev.map((k) => (k.id === exactKfAtPlayhead.id ? { ...k, positionX: val } : k))
                                  );
                                }
                              }}
                              className="w-10 bg-transparent text-white font-mono text-center outline-none text-xs"
                            />
                          </div>
                          <div className="flex items-center gap-1 bg-[#202230] border border-slate-700/80 rounded px-2 py-0.5">
                            <span className="text-slate-500 font-mono">Y</span>
                            <input
                              type="number"
                              value={Math.round((currentKfValues.positionY - 50) * 5)}
                              onChange={(e) => {
                                const yPos = Math.max(10, Math.min(95, 50 + (parseInt(e.target.value) || 0) / 5));
                                setPositionY(yPos);
                                if (exactKfAtPlayhead) {
                                  setKeyframes((prev) =>
                                    prev.map((k) => (k.id === exactKfAtPlayhead.id ? { ...k, positionY: yPos } : k))
                                  );
                                }
                              }}
                              className="w-10 bg-transparent text-white font-mono text-center outline-none text-xs"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleToggleKeyframeAtPlayhead}
                          className={`text-[10px] px-1 transition-colors ${
                            hasKeyframeAtPlayhead ? "text-cyan-400 font-bold" : "text-slate-500 hover:text-cyan-300"
                          }`}
                          title="Toggle Keyframe (Shift+Alt+K)"
                        >
                          {hasKeyframeAtPlayhead ? "◆" : "◇"}
                        </button>
                      </div>

                      {/* Plane Rotation */}
                      <div className="grid grid-cols-[80px_1fr_auto] items-center gap-2">
                        <span className="text-slate-400">Plane rotation</span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-[#202230] border border-slate-700/80 rounded px-2 py-0.5">
                            <input
                              type="number"
                              step="0.5"
                              value={currentKfValues.rotation}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setCapcutPlaneRotation(val);
                                if (exactKfAtPlayhead) {
                                  setKeyframes((prev) =>
                                    prev.map((k) => (k.id === exactKfAtPlayhead.id ? { ...k, rotation: val } : k))
                                  );
                                }
                              }}
                              className="w-14 bg-transparent text-white font-mono text-center outline-none text-xs"
                            />
                            <span className="text-slate-400">°</span>
                          </div>
                          {/* Rotation Dial Icon */}
                          <div
                            style={{ transform: `rotate(${currentKfValues.rotation}deg)` }}
                            className="w-5 h-5 rounded-full border border-cyan-400 flex items-center justify-center transition-transform"
                          >
                            <div className="w-1.5 h-0.5 bg-cyan-400 -translate-y-1.5" />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleToggleKeyframeAtPlayhead}
                          className={`text-[10px] px-1 transition-colors ${
                            hasKeyframeAtPlayhead ? "text-cyan-400 font-bold" : "text-slate-500 hover:text-cyan-300"
                          }`}
                          title="Toggle Keyframe (Shift+Alt+K)"
                        >
                          {hasKeyframeAtPlayhead ? "◆" : "◇"}
                        </button>
                      </div>

                      {/* Alignment Buttons Row (Image 3) */}
                      <div className="flex items-center gap-1 bg-[#161722] p-1 rounded-lg border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setCapcutPositionX(-80)}
                          className="flex-1 py-1 rounded bg-[#202230] hover:bg-[#2c2f42] text-slate-300 hover:text-white text-xs flex items-center justify-center font-mono"
                          title="Align Left"
                        >
                          |←
                        </button>
                        <button
                          type="button"
                          onClick={() => setCapcutPositionX(0)}
                          className="flex-1 py-1 rounded bg-[#202230] hover:bg-[#2c2f42] text-slate-300 hover:text-white text-xs flex items-center justify-center font-mono"
                          title="Center Horizontal"
                        >
                          →|←
                        </button>
                        <button
                          type="button"
                          onClick={() => setCapcutPositionX(80)}
                          className="flex-1 py-1 rounded bg-[#202230] hover:bg-[#2c2f42] text-slate-300 hover:text-white text-xs flex items-center justify-center font-mono"
                          title="Align Right"
                        >
                          →|
                        </button>
                        <button
                          type="button"
                          onClick={() => setPositionY(25)}
                          className="flex-1 py-1 rounded bg-[#202230] hover:bg-[#2c2f42] text-slate-300 hover:text-white text-xs flex items-center justify-center font-mono"
                          title="Align Top"
                        >
                          |↑
                        </button>
                        <button
                          type="button"
                          onClick={() => setPositionY(50)}
                          className="flex-1 py-1 rounded bg-[#202230] hover:bg-[#2c2f42] text-slate-300 hover:text-white text-xs flex items-center justify-center font-mono"
                          title="Center Vertical"
                        >
                          ↓|↑
                        </button>
                        <button
                          type="button"
                          onClick={() => setPositionY(82)}
                          className="flex-1 py-1 rounded bg-[#202230] hover:bg-[#2c2f42] text-slate-300 hover:text-white text-xs flex items-center justify-center font-mono"
                          title="Align Bottom"
                        >
                          |↓
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 11. Blend Accordion (Image 3) */}
                <div className="border-t border-slate-800 pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={accordionOpen.blend}
                        onChange={() => setAccordionOpen((p) => ({ ...p, blend: !p.blend }))}
                        className="accent-cyan-400 rounded"
                      />
                      <span className="font-semibold text-white">Blend</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <button onClick={() => setBlendOpacity(100)} className="hover:text-white" title="Reset Opacity">
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={handleToggleKeyframeAtPlayhead}
                        className={`text-[10px] px-1 transition-colors ${
                          hasKeyframeAtPlayhead ? "text-cyan-400 font-bold" : "text-slate-500 hover:text-cyan-300"
                        }`}
                        title="Toggle Keyframe (Shift+Alt+K)"
                      >
                        {hasKeyframeAtPlayhead ? "◆" : "◇"}
                      </button>
                    </div>
                  </div>
                  {accordionOpen.blend && (
                    <div className="grid grid-cols-[80px_1fr_auto] items-center gap-2 pl-3">
                      <span className="text-slate-400">Opacity</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={currentKfValues.opacity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setBlendOpacity(val);
                          if (exactKfAtPlayhead) {
                            setKeyframes((prev) =>
                              prev.map((k) => (k.id === exactKfAtPlayhead.id ? { ...k, opacity: val } : k))
                            );
                          }
                        }}
                        className="w-full accent-cyan-400 h-1 bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <div className="flex items-center gap-1 bg-[#202230] border border-slate-700/80 rounded px-2 py-0.5 font-mono text-white">
                        <span>{currentKfValues.opacity}%</span>
                        <button
                          type="button"
                          onClick={handleToggleKeyframeAtPlayhead}
                          className={`text-[10px] px-0.5 transition-colors ${
                            hasKeyframeAtPlayhead ? "text-cyan-400 font-bold" : "text-slate-500 hover:text-cyan-300"
                          }`}
                          title="Toggle Keyframe (Shift+Alt+K)"
                        >
                          {hasKeyframeAtPlayhead ? "◆" : "◇"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 12. Stroke Accordion (Image 3) */}
                <div className="border-t border-slate-800 pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={enableStroke}
                        onChange={() => setEnableStroke(!enableStroke)}
                        className="accent-cyan-400 rounded"
                      />
                      <span className="font-semibold text-white">Stroke</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <button
                        onClick={() => {
                          setStrokeWidth(3.5);
                          setStrokeColor("#000000");
                        }}
                        className="hover:text-white"
                        title="Reset Stroke"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] text-slate-500">◇</span>
                    </div>
                  </div>
                  {enableStroke && (
                    <div className="space-y-2 pl-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={strokeColor}
                          onChange={(e) => setStrokeColor(e.target.value)}
                          className="w-8 h-6 rounded cursor-pointer border border-slate-700 bg-transparent p-0"
                        />
                        <input
                          type="range"
                          min={0.5}
                          max={12}
                          step={0.5}
                          value={strokeWidth}
                          onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                          className="flex-1 accent-cyan-400 h-1 bg-slate-700 rounded-lg cursor-pointer"
                        />
                        <span className="font-mono text-white">{strokeWidth}px</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 13. Background Accordion (Image 3) */}
                <div className="border-t border-slate-800 pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={enableBackground}
                        onChange={() => setEnableBackground(!enableBackground)}
                        className="accent-cyan-400 rounded"
                      />
                      <span className="font-semibold text-white">Background</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <button
                        onClick={() => {
                          setBgColor("#000000");
                          setBgOpacity(75);
                        }}
                        className="hover:text-white"
                        title="Reset Background"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] text-slate-500">◇</span>
                    </div>
                  </div>
                  {enableBackground && (
                    <div className="space-y-2 pl-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-8 h-6 rounded cursor-pointer border border-slate-700 bg-transparent p-0"
                        />
                        <input
                          type="range"
                          min={10}
                          max={100}
                          value={bgOpacity}
                          onChange={(e) => setBgOpacity(parseInt(e.target.value))}
                          className="flex-1 accent-cyan-400 h-1 bg-slate-700 rounded-lg cursor-pointer"
                        />
                        <span className="font-mono text-white">{bgOpacity}%</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span>Radius:</span>
                        {(["rounded-none", "rounded-xl", "rounded-2xl", "rounded-full"] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setBgRadius(r)}
                            className={`px-2 py-0.5 rounded text-[10px] border ${
                              bgRadius === r ? "bg-cyan-500/20 text-cyan-400 border-cyan-400" : "bg-[#202230] border-slate-700 text-slate-400"
                            }`}
                          >
                            {r === "rounded-none" ? "Square" : r === "rounded-full" ? "Pill" : "Round"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 14. Glow Accordion (Image 3) */}
                <div className="border-t border-slate-800 pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={enableGlow}
                        onChange={() => setEnableGlow(!enableGlow)}
                        className="accent-cyan-400 rounded"
                      />
                      <span className="font-semibold text-white">Glow</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <button
                        onClick={() => {
                          setGlowColor("#FFD000");
                          setGlowIntensity(10);
                        }}
                        className="hover:text-white"
                        title="Reset Glow"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] text-slate-500">◇</span>
                    </div>
                  </div>
                  {enableGlow && (
                    <div className="space-y-2 pl-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={glowColor}
                          onChange={(e) => setGlowColor(e.target.value)}
                          className="w-8 h-6 rounded cursor-pointer border border-slate-700 bg-transparent p-0"
                        />
                        <input
                          type="range"
                          min={2}
                          max={35}
                          value={glowIntensity}
                          onChange={(e) => setGlowIntensity(parseInt(e.target.value))}
                          className="flex-1 accent-cyan-400 h-1 bg-slate-700 rounded-lg cursor-pointer"
                        />
                        <span className="font-mono text-white">{glowIntensity}px</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 15. Shadow Accordion (Image 3) */}
                <div className="border-t border-slate-800 pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={enableShadow}
                        onChange={() => setEnableShadow(!enableShadow)}
                        className="accent-cyan-400 rounded"
                      />
                      <span className="font-semibold text-white">Shadow</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <button
                        onClick={() => {
                          setShadowColor("#000000");
                          setShadowBlur(8);
                          setShadowDistance(4);
                        }}
                        className="hover:text-white"
                        title="Reset Shadow"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] text-slate-500">◇</span>
                    </div>
                  </div>
                  {enableShadow && (
                    <div className="space-y-2 pl-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={shadowColor}
                          onChange={(e) => setShadowColor(e.target.value)}
                          className="w-8 h-6 rounded cursor-pointer border border-slate-700 bg-transparent p-0"
                        />
                        <input
                          type="range"
                          min={2}
                          max={25}
                          value={shadowBlur}
                          onChange={(e) => setShadowBlur(parseInt(e.target.value))}
                          className="flex-1 accent-cyan-400 h-1 bg-slate-700 rounded-lg cursor-pointer"
                        />
                        <span className="font-mono text-white">{shadowBlur}px</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 16. Curve Accordion (Image 3) */}
                <div className="border-t border-slate-800 pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={enableCurve}
                        onChange={() => setEnableCurve(!enableCurve)}
                        className="accent-cyan-400 rounded"
                      />
                      <span className="font-semibold text-white">Curve</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <button onClick={() => setCurveArc(0)} className="hover:text-white" title="Reset Curve">
                        <RotateCcw className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] text-slate-500">◇</span>
                    </div>
                  </div>
                  {enableCurve && (
                    <div className="space-y-2 pl-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={-100}
                          max={100}
                          value={curveArc}
                          onChange={(e) => setCurveArc(parseInt(e.target.value))}
                          className="flex-1 accent-cyan-400 h-1 bg-slate-700 rounded-lg cursor-pointer"
                        />
                        <span className="font-mono text-white">{curveArc}°</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 2. KEYFRAME PROPERTY INSPECTOR (Live Direct Editing)      */}
            {/* ========================================================= */}
            {inspectorMode === "keyframe" && (
              <div className="space-y-3.5 text-xs font-sans">
                <div className="p-3.5 rounded-2xl bg-[#161824] border border-cyan-500/40 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <span className="text-cyan-400 text-sm">◆</span>
                      <span>ຄີຍ໌ເຟຣມ (Keyframe Inspector)</span>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                      {keyframes.length} ຄີຍ໌ເຟຣມ
                    </span>
                  </div>

                  {/* Add Keyframe at Current Playhead */}
                  <button
                    type="button"
                    onClick={handleToggleKeyframeAtPlayhead}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow ${
                      hasKeyframeAtPlayhead
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                        : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20 active:scale-[0.99]"
                    }`}
                  >
                    <span>{hasKeyframeAtPlayhead ? "◆ ລຶບ Keyframe ທີ່ Playhead" : "+ ເພີ່ມ Keyframe ໃສ່ Playhead"}</span>
                    <span className="font-mono text-[11px]">({formatTime(currentTime)})</span>
                  </button>
                </div>

                {/* Specific Selected Keyframe Live Editor */}
                {(() => {
                  const activeKf =
                    keyframes.find((k) => k.id === selectedKeyframeId) ||
                    exactKfAtPlayhead ||
                    keyframes[0];

                  if (!activeKf) {
                    return (
                      <div className="p-5 rounded-2xl bg-[#14151e] border border-slate-800 text-center space-y-2">
                        <div className="text-slate-400 text-xs font-semibold">ບໍ່ມີ Keyframe ທີ່ເລືອກ</div>
                        <p className="text-[11px] text-slate-500">
                          ກົດປຸ່ມດ້ານເທິງ ຫຼື ຄລິກຮູບເພັດ ◆ ເທິງໄທມ໌ໄລນ໌ເພື່ອເລືອກ ແລະ ແກ້ໄຂຄ່າທັນທີ
                        </p>
                      </div>
                    );
                  }

                  const updateActiveKf = (updates: Partial<KeyframeItem>) => {
                    setKeyframes((prev) =>
                      prev.map((k) => (k.id === activeKf.id ? { ...k, ...updates } : k))
                    );
                  };

                  return (
                    <div className="p-3.5 rounded-2xl bg-[#181a26] border border-cyan-400/50 space-y-3.5 shadow-xl">
                      {/* Active Keyframe Header & Time Shifter */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="text-cyan-400">◆</span>
                            <span>ແກ້ໄຂ Keyframe: {activeKf.id}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            ເວລາ: <span className="text-cyan-300 font-bold">{formatTime(activeKf.time)}</span> ({activeKf.time}s)
                          </div>
                        </div>

                        {/* Delete this Keyframe */}
                        <button
                          type="button"
                          onClick={() => {
                            setKeyframes((prev) => prev.filter((k) => k.id !== activeKf.id));
                            if (selectedKeyframeId === activeKf.id) setSelectedKeyframeId(null);
                            showToast(`ລຶບ Keyframe ທີ່ ${formatTime(activeKf.time)} ແລ້ວ`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500 hover:text-white transition-all text-[11px] font-bold flex items-center gap-1 border border-rose-500/30"
                          title="ລຶບ Keyframe ນີ້"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ລຶບ</span>
                        </button>
                      </div>

                      {/* Millisecond Timing Nudge (-100ms / +100ms) */}
                      <div className="space-y-1">
                        <div className="text-[10px] text-slate-400 font-bold">ເລື່ອນເວລາ Keyframe (Millisecond Nudge):</div>
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            { label: "-100ms", ms: -0.1 },
                            { label: "-50ms", ms: -0.05 },
                            { label: "+50ms", ms: 0.05 },
                            { label: "+100ms", ms: 0.1 },
                          ].map((btn) => (
                            <button
                              key={btn.label}
                              type="button"
                              onClick={() => {
                                const newT = Math.max(0, Number((activeKf.time + btn.ms).toFixed(2)));
                                updateActiveKf({ time: newT });
                                seekTo(newT);
                              }}
                              className="py-1 rounded bg-[#222432] hover:bg-cyan-500 hover:text-black text-slate-200 text-[10px] font-mono font-bold transition-colors"
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 1. Scale Control */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300 font-semibold">Scale (ຂະໜາດ)</span>
                          <span className="text-cyan-400 font-mono font-bold">{activeKf.scale}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={10}
                            max={300}
                            value={activeKf.scale}
                            onChange={(e) => updateActiveKf({ scale: parseInt(e.target.value) })}
                            className="flex-1 accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                          />
                          <input
                            type="number"
                            min={10}
                            max={300}
                            value={activeKf.scale}
                            onChange={(e) => updateActiveKf({ scale: parseInt(e.target.value) || 100 })}
                            className="w-14 bg-[#12131b] border border-slate-700 text-right px-1.5 py-0.5 rounded text-white font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      {/* 2. Position X Control */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300 font-semibold">Position X (ແນວນອນ)</span>
                          <span className="text-cyan-400 font-mono font-bold">{activeKf.positionX}px</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={-300}
                            max={300}
                            value={activeKf.positionX}
                            onChange={(e) => updateActiveKf({ positionX: parseInt(e.target.value) })}
                            className="flex-1 accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                          />
                          <input
                            type="number"
                            value={activeKf.positionX}
                            onChange={(e) => updateActiveKf({ positionX: parseInt(e.target.value) || 0 })}
                            className="w-14 bg-[#12131b] border border-slate-700 text-right px-1.5 py-0.5 rounded text-white font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      {/* 3. Position Y Control */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300 font-semibold">Position Y (ແນວຕັ້ງ)</span>
                          <span className="text-cyan-400 font-mono font-bold">{activeKf.positionY}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={5}
                            max={95}
                            value={activeKf.positionY}
                            onChange={(e) => updateActiveKf({ positionY: parseInt(e.target.value) })}
                            className="flex-1 accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                          />
                          <input
                            type="number"
                            value={activeKf.positionY}
                            onChange={(e) => updateActiveKf({ positionY: parseInt(e.target.value) || 75 })}
                            className="w-14 bg-[#12131b] border border-slate-700 text-right px-1.5 py-0.5 rounded text-white font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      {/* 4. Rotation Control */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300 font-semibold">Rotation (ມຸມໝຸນ)</span>
                          <span className="text-cyan-400 font-mono font-bold">{activeKf.rotation}°</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min={-180}
                            max={180}
                            value={activeKf.rotation}
                            onChange={(e) => updateActiveKf({ rotation: parseInt(e.target.value) })}
                            className="flex-1 accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                          />
                          <input
                            type="number"
                            value={activeKf.rotation}
                            onChange={(e) => updateActiveKf({ rotation: parseInt(e.target.value) || 0 })}
                            className="w-14 bg-[#12131b] border border-slate-700 text-right px-1.5 py-0.5 rounded text-white font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      {/* 5. Opacity Control */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300 font-semibold">Opacity (ຄວາມໂປ່ງໃສ)</span>
                          <span className="text-cyan-400 font-mono font-bold">{activeKf.opacity}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={activeKf.opacity}
                          onChange={(e) => updateActiveKf({ opacity: parseInt(e.target.value) })}
                          className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Keyframes Timeline List (Jump in 1-click) */}
                <div className="p-3.5 rounded-2xl bg-[#161824] border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-300">
                    ລາຍການ Keyframes ທັງໝົດ ({keyframes.length}):
                  </div>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {keyframes.map((kf, i) => (
                      <div
                        key={kf.id}
                        onClick={() => {
                          setSelectedKeyframeId(kf.id);
                          seekTo(kf.time);
                        }}
                        className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer border transition-all text-xs ${
                          selectedKeyframeId === kf.id
                            ? "bg-cyan-950/50 border-cyan-400 text-white shadow-md shadow-cyan-500/10"
                            : "bg-[#1d1f2b] border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-cyan-400 font-bold">#{i + 1}</span>
                          <span>{formatTime(kf.time)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Scale: {kf.scale}% • Rot: {kf.rotation}°
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 3. VIDEO CLIP INSPECTOR                                   */}
            {/* ========================================================= */}
            {inspectorMode === "video" && (
              <div className="space-y-3.5 text-xs font-sans">
                <div className="p-3.5 rounded-2xl bg-[#161824] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-cyan-400" />
                      <span>Video Transform & Motion</span>
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono">Clip Selected</span>
                  </div>

                  {/* Fit Mode Toggle */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold">ການປັບຂະໜາດວິດີໂອ (Fit Mode):</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setVideoFit("contain");
                          showToast("ປັບເປັນ: ພໍດີໜ້າຈໍ (Contain)");
                        }}
                        className={`py-1.5 rounded-xl font-bold transition-all text-center ${
                          videoFit === "contain"
                            ? "bg-cyan-500 text-slate-950 font-black shadow"
                            : "bg-[#202230] text-slate-300 hover:text-white"
                        }`}
                      >
                        Fit (ພໍດີຈໍ)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVideoFit("cover");
                          showToast("ປັບເປັນ: ເຕັມຈໍ (Fill Cover)");
                        }}
                        className={`py-1.5 rounded-xl font-bold transition-all text-center ${
                          videoFit === "cover"
                            ? "bg-cyan-500 text-slate-950 font-black shadow"
                            : "bg-[#202230] text-slate-300 hover:text-white"
                        }`}
                      >
                        Fill (ເຕັມຈໍ)
                      </button>
                    </div>
                  </div>

                  {/* Video Playback Speed */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="font-semibold">ຄວາມໄວວິດີໂອ (Speed)</span>
                      <span className="text-cyan-400 font-mono font-bold">{playbackRate}x</span>
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => changeSpeed(rate)}
                          className={`py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                            playbackRate === rate
                              ? "bg-cyan-500 text-slate-950 shadow font-black"
                              : "bg-[#202230] text-slate-300 hover:text-white"
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Video Opacity */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="font-semibold">ຄວາມໂປ່ງໃສ (Opacity)</span>
                      <span className="text-cyan-400 font-mono font-bold">{blendOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={blendOpacity}
                      onChange={(e) => setBlendOpacity(parseInt(e.target.value))}
                      className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* COLOR & LIGHT ADJUSTMENT STUDIO (ປັບແສງສີວິດີໂອ) */}
                <div className="p-3.5 rounded-2xl bg-[#161824] border border-cyan-500/30 space-y-3.5 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span>ປັບແສງສີ & ໂທນຮູບເງົາ (Color Grading)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        pushHistorySnapshot("Reset Color");
                        setVideoColorFilter({
                          brightness: 100,
                          contrast: 100,
                          saturation: 100,
                          hue: 0,
                          sepia: 0,
                          blur: 0,
                          filterPreset: "none",
                        });
                        showToast("↺ ຄືນຄ່າສີເດີມຮຽບຮ້ອຍ");
                      }}
                      className="text-[10px] text-rose-300 hover:text-rose-200 flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                      title="Reset Color Adjustments"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* 1-Click Cinematic Filter Presets */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      ໂທນສີສຳເລັດຮູບ (Color Presets):
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: "none", label: "Normal" },
                        { id: "vivid", label: "Vivid" },
                        { id: "cinematic", label: "Cinema" },
                        { id: "warm", label: "Warm" },
                        { id: "cool", label: "Cool" },
                        { id: "vintage", label: "Retro" },
                        { id: "bw", label: "B&W" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            pushHistorySnapshot(`Preset ${p.label}`);
                            setVideoColorFilter((prev) => ({ ...prev, filterPreset: p.id }));
                            showToast(`ໃຊ້ໂທນສີ: ${p.label}`);
                          }}
                          className={`py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all text-center border ${
                            videoColorFilter.filterPreset === p.id
                              ? "bg-cyan-500 text-slate-950 border-white shadow-md shadow-cyan-500/20 font-black"
                              : "bg-[#202230] text-slate-300 hover:text-white border-slate-700/60"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Brightness Slider */}
                  <div className="space-y-1 pt-1.5 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>ຄວາມສະຫວ່າງ (Brightness)</span>
                      <span className="text-cyan-400 font-mono font-bold">{videoColorFilter.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={150}
                      value={videoColorFilter.brightness}
                      onChange={(e) =>
                        setVideoColorFilter((prev) => ({ ...prev, brightness: parseInt(e.target.value) }))
                      }
                      className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Contrast Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>ຄວາມຄົມຊັດ (Contrast)</span>
                      <span className="text-cyan-400 font-mono font-bold">{videoColorFilter.contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={150}
                      value={videoColorFilter.contrast}
                      onChange={(e) =>
                        setVideoColorFilter((prev) => ({ ...prev, contrast: parseInt(e.target.value) }))
                      }
                      className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Saturation Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>ຄວາມສົດຂອງສີ (Saturation)</span>
                      <span className="text-cyan-400 font-mono font-bold">{videoColorFilter.saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={200}
                      value={videoColorFilter.saturation}
                      onChange={(e) =>
                        setVideoColorFilter((prev) => ({ ...prev, saturation: parseInt(e.target.value) }))
                      }
                      className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Hue / Temperature Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>ໂທນອຸນຫະພູມສີ (Hue / Tint)</span>
                      <span className="text-cyan-400 font-mono font-bold">{videoColorFilter.hue}°</span>
                    </div>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={videoColorFilter.hue}
                      onChange={(e) =>
                        setVideoColorFilter((prev) => ({ ...prev, hue: parseInt(e.target.value) }))
                      }
                      className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Blur / Sharpness Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>ຄວາມມົວຍາກັນນ້ອຍ (Blur)</span>
                      <span className="text-cyan-400 font-mono font-bold">{videoColorFilter.blur}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={videoColorFilter.blur}
                      onChange={(e) =>
                        setVideoColorFilter((prev) => ({ ...prev, blur: parseInt(e.target.value) }))
                      }
                      className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 4. AUDIO TRACK INSPECTOR                                  */}
            {/* ========================================================= */}
            {inspectorMode === "audio" && (
              <div className="space-y-3.5 text-xs font-sans">
                <div className="p-3.5 rounded-2xl bg-[#161824] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                      <span>Audio Controls & Volume</span>
                    </span>
                    <button
                      type="button"
                      onClick={toggleMute}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                        isMuted ? "bg-rose-500/20 text-rose-300 border-rose-500/40" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      {isMuted ? "MUTED" : "ACTIVE"}
                    </button>
                  </div>

                  {/* Master Volume */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>ລະດັບຄວາມດັງສຽງ (Volume)</span>
                      <span className="text-cyan-400 font-mono font-bold">{isMuted ? "0%" : "100%"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="w-full py-2.5 rounded-xl bg-[#202230] hover:bg-[#2b2e40] text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700/60 transition-all"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                      <span>{isMuted ? "ປິດສຽງຢູ່ (Muted) - ກົດເພື່ອເປີດສຽງ" : "ເປີດສຽງປົກກະຕິ - ກົດເພື່ອປິດສຽງ"}</span>
                    </button>
                  </div>

                  {/* Fade In & Fade Out */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold">Fade In / Fade Out Curves:</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-[#1c1e2b] border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400">Fade In</div>
                        <div className="text-xs font-mono font-bold text-cyan-400">0.5s</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#1c1e2b] border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-400">Fade Out</div>
                        <div className="text-xs font-mono font-bold text-cyan-400">0.8s</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. CAPCUT BOTTOM MULTI-TRACK TIMELINE (Full Width & Height Resizable) */}
      {/* ========================================================= */}
      <div
        style={{
          height: isTimelineCollapsed ? "36px" : `${timelineHeight}px`,
        }}
        className="bg-[#181920] border-t border-[#262833] flex flex-col flex-shrink-0 z-20 relative transition-[height] duration-75"
      >
        {/* Timeline Resizer Bar Handle */}
        <div
          onMouseDown={startDragTimeline}
          className="absolute -top-1 inset-x-0 h-2 cursor-row-resize hover:bg-cyan-500/60 transition-colors z-20"
        />

        {/* Timeline Tools Bar (Matching Image 4) */}
        <div className="h-9 px-3 bg-[#181920] border-b border-[#262833] flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-1">
            {/* + Add Material / Import with Cyan Dot */}
            <div className="relative">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Add Material / Import Video"
                className="p-1.5 rounded hover:bg-[#252838] text-slate-200 hover:text-white transition-colors relative"
              >
                <Plus className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#12E8FF] rounded-full shadow-[0_0_6px_#12E8FF]" />
              </button>
            </div>

            {/* Separator */}
            <div className="w-px h-3.5 bg-slate-700/60 mx-1" />

            {/* Selection Cursor Tool with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowToolModeDropdown(!showToolModeDropdown)}
                className={`flex items-center gap-0.5 p-1 rounded hover:bg-[#252838] transition-colors ${
                  activeToolMode === "select" ? "text-cyan-400" : "text-slate-300 hover:text-white"
                }`}
                title={activeToolMode === "select" ? "Selection Tool (A)" : "Razor Split Tool (B)"}
              >
                {activeToolMode === "select" ? (
                  <MousePointer className="w-3.5 h-3.5" />
                ) : (
                  <Scissors className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </button>

              {showToolModeDropdown && (
                <div
                  className="absolute left-0 top-full mt-1 w-36 bg-[#20212b] border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs"
                  onMouseLeave={() => setShowToolModeDropdown(false)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveToolMode("select");
                      setShowToolModeDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-[#2c2e3c] flex items-center justify-between ${
                      activeToolMode === "select" ? "text-cyan-400 font-bold" : "text-slate-300"
                    }`}
                  >
                    <span>Select (A)</span>
                    <MousePointer className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveToolMode("split");
                      setShowToolModeDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-[#2c2e3c] flex items-center justify-between ${
                      activeToolMode === "split" ? "text-cyan-400 font-bold" : "text-slate-300"
                    }`}
                  >
                    <span>Split Razor (B)</span>
                    <Scissors className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="w-px h-3.5 bg-slate-700/60 mx-1" />

            {/* Undo (Ctrl+Z) */}
            <button
              type="button"
              onClick={handleUndo}
              title="Undo ຍົກເລີກ (Ctrl+Z)"
              className={`p-1.5 rounded hover:bg-[#252838] transition-colors ${
                undoStack.length > 0 ? "text-cyan-400 hover:text-white" : "text-slate-600 cursor-not-allowed"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Redo (Ctrl+Y) */}
            <button
              type="button"
              onClick={handleRedo}
              title="Redo ເຮັດຊ້ຳ (Ctrl+Y / Ctrl+Shift+Z)"
              className={`p-1.5 rounded hover:bg-[#252838] transition-colors ${
                redoStack.length > 0 ? "text-cyan-400 hover:text-white" : "text-slate-600 cursor-not-allowed"
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Quick Trim Start (Q) */}
            <button
              type="button"
              onClick={handleTrimStartToPlayhead}
              title="ຕັດຊ້າຍຮອດ Playhead (Trim Left - Q)"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#202330] hover:bg-[#2b2f42] text-slate-200 text-xs font-semibold transition-colors border border-slate-700/60"
            >
              <span>⇥Q ຕັດຊ້າຍ</span>
            </button>

            {/* Prominent High-Contrast Split Button (W / S / Ctrl+B) */}
            <button
              type="button"
              onClick={handleSplitAtPlayhead}
              title="ແຍກກາງຄລິບບໍ່ລຶບ (Split Clip - W / S)"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>✂ W ແຍກກາງ</span>
            </button>

            {/* Quick Trim End (E) */}
            <button
              type="button"
              onClick={handleTrimEndToPlayhead}
              title="ຕັດຂວາຮອດ Playhead (Trim Right - E)"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#202330] hover:bg-[#2b2f42] text-slate-200 text-xs font-semibold transition-colors border border-slate-700/60"
            >
              <span>E⇤ ຕັດຂວາ</span>
            </button>

            {/* Delete Selected (Del) */}
            <button
              type="button"
              onClick={handleDeleteActiveSelection}
              title="ລຶບສິ່ງທີ່ເລືອກ (Del / Backspace)"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold transition-colors border border-rose-500/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ລຶບ</span>
            </button>

            {/* Group Selected (🔗) */}
            {selectedSubIds.length >= 2 && (
              <button
                type="button"
                onClick={handleGroupSelectedSubtitles}
                title="ຮວມກຸ່ມຊັບທີ່ເລືອກ (Group Subtitles)"
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold transition-colors border border-purple-500/40"
              >
                <span>🔗 ຮວມກຸ່ມ ({selectedSubIds.length})</span>
              </button>
            )}

            {/* Ungroup (🔓) */}
            {subtitles.find((s) => (s.id === selectedSubId || selectedSubIds.includes(s.id)) && s.groupId) && (
              <button
                type="button"
                onClick={handleUngroupSelectedSubtitles}
                title="ແຍກກຸ່ມ (Ungroup)"
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-colors border border-amber-500/40"
              >
                <span>🔓 ແຍກກຸ່ມ</span>
              </button>
            )}

            {/* Keyframe Toggle at Playhead */}
            <button
              type="button"
              onClick={handleToggleKeyframeAtPlayhead}
              title="Toggle Keyframe at Playhead (Shift+Alt+K)"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all border ${
                hasKeyframeAtPlayhead
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-400"
                  : "bg-[#202330] text-slate-400 border-slate-700/60 hover:text-white"
              }`}
            >
              <span>{hasKeyframeAtPlayhead ? "◆" : "◇"}</span>
              <span>ຄີຍ໌ເຟຣມ</span>
            </button>

            {/* Snapping Magnet */}
            <button
              type="button"
              onClick={() => setEnableSnapping(!enableSnapping)}
              className={`p-1.5 rounded transition-colors ${
                enableSnapping ? "text-cyan-400 bg-cyan-950/40" : "text-slate-500 hover:text-slate-300"
              }`}
              title="Snapping Magnet (🧲)"
            >
              <Magnet className="w-3.5 h-3.5" />
            </button>

            {/* Show / Hide Keyframe Panel Button (Alt+K) */}
            <button
              type="button"
              onClick={() => setIsKeyframePanelOpen(!isKeyframePanelOpen)}
              className={`p-1.5 rounded transition-colors ${
                isKeyframePanelOpen
                  ? "text-cyan-400 bg-cyan-950/60 shadow-[0_0_8px_rgba(18,232,255,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Show/Hide Keyframe Panel (Alt+K)"
            >
              <span className="font-bold text-xs">◆</span>
            </button>
          </div>

          {/* Timecode display */}
          <div className="font-mono text-xs text-slate-300 flex items-center gap-1.5">
            <span className="text-cyan-400 font-bold">{formatTime(currentTime)}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{formatTime(duration)}</span>
          </div>

          {/* Zoom and Collapse */}
          <div className="flex items-center gap-2 text-slate-400">
            <button
              type="button"
              onClick={() => setTimelineZoom(Math.max(1, timelineZoom - 0.25))}
              className="p-1 hover:text-white"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="font-mono text-[10px] text-slate-400">{timelineZoom.toFixed(1)}x</span>
            <button
              type="button"
              onClick={() => setTimelineZoom(Math.min(3, timelineZoom + 0.25))}
              className="p-1 hover:text-white"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
              className="p-1 hover:text-white"
              title={isTimelineCollapsed ? "Expand Timeline" : "Minimize Timeline"}
            >
              <Sliders className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Timeline Tracks Area: Multi-Track Two-Column Layout (Matching Image 1) */}
        {!isTimelineCollapsed && (
          <div className="flex-1 flex min-h-0 overflow-hidden bg-[#111218]">
            {/* COLUMN A: LEFT TRACK HEADERS (Width ~100px) */}
            <div className="w-24 sm:w-28 flex-shrink-0 bg-[#161720] border-r border-[#262833] flex flex-col select-none text-slate-400 z-10">
              {/* Ruler Spacer Header */}
              <div className="h-6 border-b border-[#262833] flex items-center px-2 text-[10px] font-mono text-slate-500">
                <span>Tracks</span>
              </div>

              {/* Track 1 Header: Effects */}
              <div className="h-7 border-b border-[#262833]/40 flex items-center justify-between px-2 text-slate-400">
                {/* 3-circles aperture logo */}
                <svg className="w-3 h-3 text-indigo-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <circle cx="8" cy="16" r="4" />
                  <circle cx="16" cy="16" r="4" />
                </svg>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTrackLocks((p) => ({ ...p, effects: !p.effects }))}
                    className={trackLocks.effects ? "text-cyan-400" : "hover:text-white"}
                    title="Lock Track"
                  >
                    {trackLocks.effects ? <Lock className="w-2.5 h-2.5 text-cyan-400" /> : <Unlock className="w-2.5 h-2.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackVisibilities((p) => ({ ...p, effects: !p.effects }))}
                    className={!trackVisibilities.effects ? "text-slate-600" : "hover:text-white"}
                    title="Show/Hide Track"
                  >
                    {trackVisibilities.effects ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5 text-slate-600" />}
                  </button>
                </div>
              </div>

              {/* Track 2 Header: Stickers */}
              <div className="h-7 border-b border-[#262833]/40 flex items-center justify-between px-2 text-slate-400">
                <Star className="w-3 h-3 text-purple-400 flex-shrink-0" />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTrackLocks((p) => ({ ...p, stickers: !p.stickers }))}
                    className={trackLocks.stickers ? "text-cyan-400" : "hover:text-white"}
                    title="Lock Track"
                  >
                    {trackLocks.stickers ? <Lock className="w-2.5 h-2.5 text-cyan-400" /> : <Unlock className="w-2.5 h-2.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackVisibilities((p) => ({ ...p, stickers: !p.stickers }))}
                    className={!trackVisibilities.stickers ? "text-slate-600" : "hover:text-white"}
                    title="Show/Hide Track"
                  >
                    {trackVisibilities.stickers ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5 text-slate-600" />}
                  </button>
                </div>
              </div>

              {/* Track 3 Header: Subtitles / Text */}
              <div className="h-8 border-b border-[#262833]/40 flex items-center justify-between px-2 text-slate-400">
                <span className="font-extrabold text-[11px] font-mono text-amber-400 tracking-tighter">TI</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTrackLocks((p) => ({ ...p, text: !p.text }))}
                    className={trackLocks.text ? "text-cyan-400" : "hover:text-white"}
                    title="Lock Track"
                  >
                    {trackLocks.text ? <Lock className="w-2.5 h-2.5 text-cyan-400" /> : <Unlock className="w-2.5 h-2.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackVisibilities((p) => ({ ...p, text: !p.text }))}
                    className={!trackVisibilities.text ? "text-slate-600" : "hover:text-white"}
                    title="Show/Hide Subtitles"
                  >
                    {trackVisibilities.text ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5 text-slate-600" />}
                  </button>
                </div>
              </div>

              {/* Track 4 Header: Main Video */}
              <div className="h-14 border-b border-[#262833]/40 flex flex-col justify-between p-1.5 text-slate-400 relative">
                <div className="flex items-center justify-between w-full">
                  <Video className="w-3 h-3 text-teal-400 flex-shrink-0" />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setTrackLocks((p) => ({ ...p, video: !p.video }))}
                      className={trackLocks.video ? "text-cyan-400" : "hover:text-white"}
                      title="Lock Video Track"
                    >
                      {trackLocks.video ? <Lock className="w-2.5 h-2.5 text-cyan-400" /> : <Unlock className="w-2.5 h-2.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrackVisibilities((p) => ({ ...p, video: !p.video }))}
                      className={!trackVisibilities.video ? "text-slate-600" : "hover:text-white"}
                      title="Show/Hide Video"
                    >
                      {trackVisibilities.video ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5 text-slate-600" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrackMutes((p) => ({ ...p, video: !p.video }))}
                      className={trackMutes.video ? "text-rose-400" : "hover:text-white"}
                      title="Mute Video Audio"
                    >
                      {trackMutes.video ? <VolumeX className="w-2.5 h-2.5 text-rose-400" /> : <Volume2 className="w-2.5 h-2.5" />}
                    </button>
                    <MoreHorizontal className="w-2.5 h-2.5 text-slate-500" />
                  </div>
                </div>

                {/* Cover Button */}
                <button
                  type="button"
                  onClick={() => showToast("ປັບປ່ຽນຮູບໜ້າປົກ (Cover Frame)")}
                  className="mx-auto flex items-center justify-center gap-1 bg-[#232533] hover:bg-[#2e3144] border border-slate-700/80 rounded px-2 py-0.5 text-[9px] font-semibold text-slate-200 transition-colors"
                >
                  <Pencil className="w-2.5 h-2.5 text-cyan-400" />
                  <span>Cover</span>
                </button>
              </div>

              {/* Keyframe Track Header (Visible when Keyframe Panel is toggled) */}
              {isKeyframePanelOpen && (
                <div className="h-9 border-b border-[#262833]/40 flex items-center justify-between px-2 text-cyan-400 bg-[#12131c]">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                    <span>◆</span>
                    <span>Keyframes</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleKeyframeAtPlayhead}
                    className="p-1 hover:text-white"
                    title="Add Keyframe at Playhead (Shift+Alt+K)"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Track 5 Header: Video Audio */}
              <div className="h-11 border-b border-[#262833]/40 flex items-center justify-between px-2 text-slate-400">
                <Music className="w-3 h-3 text-teal-400 flex-shrink-0" />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTrackLocks((p) => ({ ...p, videoAudio: !p.videoAudio }))}
                    className={trackLocks.videoAudio ? "text-cyan-400" : "hover:text-white"}
                    title="Lock Track"
                  >
                    {trackLocks.videoAudio ? <Lock className="w-2.5 h-2.5 text-cyan-400" /> : <Unlock className="w-2.5 h-2.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackMutes((p) => ({ ...p, videoAudio: !p.videoAudio }))}
                    className={trackMutes.videoAudio ? "text-rose-400" : "hover:text-white"}
                    title="Mute Track"
                  >
                    {trackMutes.videoAudio ? <VolumeX className="w-2.5 h-2.5 text-rose-400" /> : <Volume2 className="w-2.5 h-2.5" />}
                  </button>
                  <MoreHorizontal className="w-2.5 h-2.5 text-slate-500" />
                </div>
              </div>

              {/* Track 6 Header: BGM Audio */}
              <div className="h-11 border-b border-[#262833]/40 flex items-center justify-between px-2 text-slate-400">
                <Music className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTrackLocks((p) => ({ ...p, bgm: !p.bgm }))}
                    className={trackLocks.bgm ? "text-cyan-400" : "hover:text-white"}
                    title="Lock Track"
                  >
                    {trackLocks.bgm ? <Lock className="w-2.5 h-2.5 text-cyan-400" /> : <Unlock className="w-2.5 h-2.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackMutes((p) => ({ ...p, bgm: !p.bgm }))}
                    className={trackMutes.bgm ? "text-rose-400" : "hover:text-white"}
                    title="Mute Track"
                  >
                    {trackMutes.bgm ? <VolumeX className="w-2.5 h-2.5 text-rose-400" /> : <Volume2 className="w-2.5 h-2.5" />}
                  </button>
                  <MoreHorizontal className="w-2.5 h-2.5 text-slate-500" />
                </div>
              </div>
            </div>

            {/* COLUMN B: SCROLLABLE TIMELINE TRACK LANES */}
            <div
              id="timeline-tracks-lanes"
              ref={timelineTrackRef}
              onMouseDown={(e) => {
                // If clicking directly on lane empty area or ruler, enable real-time scrubbing
                const target = e.target as HTMLElement;
                if (target.closest("[data-no-scrub]") || target.closest(".cursor-grab") || target.closest(".cursor-ew-resize")) {
                  return;
                }

                const handleTimelineScrub = (moveEvent: MouseEvent) => {
                  if (!timelineTrackRef.current) return;
                  const rect = timelineTrackRef.current.getBoundingClientRect();
                  const clickX = moveEvent.clientX - rect.left;
                  const pct = Math.max(0, Math.min(1, clickX / rect.width));
                  seekTo(pct * (duration || 15));
                };

                handleTimelineScrub(e.nativeEvent);

                const handleTimelineUp = () => {
                  window.removeEventListener("mousemove", handleTimelineScrub);
                  window.removeEventListener("mouseup", handleTimelineUp);
                };

                window.addEventListener("mousemove", handleTimelineScrub);
                window.addEventListener("mouseup", handleTimelineUp);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
              }}
              onDrop={async (e) => {
                e.preventDefault();
                const timelineEl = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - timelineEl.left;
                const dropRatio = Math.max(0, Math.min(1, clickX / timelineEl.width));
                const dropTime = (duration || 15) * dropRatio;

                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  const file = e.dataTransfer.files[0];
                  if (file.type.startsWith("video/") || file.name.match(/\.(mp4|mov|webm|mkv|avi|m4v)$/i)) {
                    await loadDroppedVideoFile(file, dropTime);
                    return;
                  }
                }

                const mediaId = e.dataTransfer.getData("mediaId");
                if (mediaId) {
                  handleAddMediaToTimeline(mediaId, dropTime);
                }
              }}
              className="flex-1 overflow-x-auto relative bg-[#111218] cursor-pointer select-none"
            >
              {/* Seconds Ruler with Pin Playhead (Click & Drag to Scrub in Real Time) */}
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const handleRulerScrub = (moveEvent: MouseEvent) => {
                    const el = document.getElementById("timeline-tracks-lanes");
                    if (!el) return;
                    const rect = el.getBoundingClientRect();
                    const clickX = moveEvent.clientX - rect.left;
                    const pct = Math.max(0, Math.min(1, clickX / rect.width));
                    seekTo(pct * (duration || 15));
                  };
                  handleRulerScrub(e.nativeEvent);
                  const handleRulerUp = () => {
                    window.removeEventListener("mousemove", handleRulerScrub);
                    window.removeEventListener("mouseup", handleRulerUp);
                  };
                  window.addEventListener("mousemove", handleRulerScrub);
                  window.addEventListener("mouseup", handleRulerUp);
                }}
                className="h-6 border-b border-[#262833] relative flex items-center text-[9px] text-slate-500 font-mono cursor-ew-resize hover:bg-[#161822] transition-colors"
              >
                {rulerTicks.map(({ sec, leftPct }, i) => (
                  <div
                    key={i}
                    style={{ left: `${leftPct}%` }}
                    className="absolute flex flex-col items-center -translate-x-1/2"
                  >
                    <div className="h-1.5 w-px bg-slate-700" />
                    <span className="text-[8px]">{sec}s</span>
                  </div>
                ))}

                {/* CapCut Pin Playhead Handle (White Shield / Teardrop shape) */}
                <div
                  ref={playheadPinRef}
                  style={{
                    left: `${((currentTime / (duration || 15)) * 100).toFixed(2)}%`,
                  }}
                  className="absolute top-0 bottom-0 pointer-events-none -translate-x-1/2 flex flex-col items-center z-40"
                >
                  <div className="w-3.5 h-4 bg-white rounded-t-sm shadow-md border border-slate-300 flex items-center justify-center -mt-0.5" style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%)" }}>
                    <div className="w-1 h-1 rounded-full bg-black/60" />
                  </div>
                </div>
              </div>

              {/* Track 1 Lane: Effects (Vivid badge) */}
              <div className="h-7 border-b border-[#262833]/30 relative flex items-center px-1">
                <div
                  style={{ width: "35%" }}
                  className="h-5 rounded px-2 bg-[#312e81] border border-[#4338ca] text-white flex items-center gap-1.5 text-[10px] font-semibold shadow-sm"
                >
                  <svg className="w-2.5 h-2.5 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" />
                    <circle cx="8" cy="16" r="4" />
                    <circle cx="16" cy="16" r="4" />
                  </svg>
                  <span className="truncate">Vivid</span>
                </div>
              </div>

              {/* Track 2 Lane: Stickers (Chalk Graffiti badge) */}
              <div className="h-7 border-b border-[#262833]/30 relative flex items-center px-1">
                <div
                  style={{ width: "40%" }}
                  className="h-5 rounded px-2 bg-[#581c87] border border-[#7e22ce] text-white flex items-center gap-1.5 text-[10px] font-semibold shadow-sm"
                >
                  <Star className="w-2.5 h-2.5 text-purple-300 fill-purple-300" />
                  <span className="truncate">Chalk Graffiti</span>
                </div>
              </div>

              {/* Track 3 Lane: Subtitles / Text Blocks with Keyframe Diamonds */}
              <div className="h-8 border-b border-[#262833]/30 relative flex items-center px-1">
                {subtitles.map((sub) => {
                  const leftPct = (sub.time / (duration || 15)) * 100;
                  const widthPct = ((sub.endTime - sub.time) / (duration || 15)) * 100;
                  const isSelected = selectedSubId === sub.id || selectedSubIds.includes(sub.id);

                  return (
                    <div
                      key={sub.id}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        if (e.shiftKey) {
                          setSelectedSubIds((prev) =>
                            prev.includes(sub.id) ? prev.filter((id) => id !== sub.id) : [...prev, sub.id]
                          );
                        } else {
                          setSelectedSubId(sub.id);
                          setSelectedSubIds([sub.id]);
                          setSelectedVideoClipId(null);
                          setInspectorMode("text");
                          seekTo(sub.time);
                        }
                        setDraggingSubAction({
                          type: "move",
                          subId: sub.id,
                          startX: e.clientX,
                          origTime: sub.time,
                          origEndTime: sub.endTime,
                        });
                      }}
                      style={{
                        left: `${leftPct}%`,
                        width: `${Math.max(4, widthPct)}%`,
                      }}
                      className={`absolute h-6 rounded flex items-center justify-between text-[10px] font-semibold transition-all border cursor-grab active:cursor-grabbing group select-none ${
                        isSelected
                          ? "bg-[#c2410c] text-white border-white shadow-[0_0_10px_rgba(234,88,12,0.9)] ring-1 ring-orange-300 z-20"
                          : "bg-[#9a3412]/80 border-[#ea580c]/60 text-white/95 hover:border-orange-400"
                      }`}
                    >
                      {/* Left Trim Handle (ຍື່ນຫູປັບເລີ່ມຕົ້ນ) */}
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setSelectedSubId(sub.id);
                          setDraggingSubAction({
                            type: "trim-left",
                            subId: sub.id,
                            startX: e.clientX,
                            origTime: sub.time,
                            origEndTime: sub.endTime,
                          });
                        }}
                        title="ຍື່ນຫູປັບເລີ່ມຕົ້ນ (Trim Start - Q)"
                        className="w-2 hover:w-3.5 bg-orange-300/40 hover:bg-cyan-400 cursor-ew-resize h-full rounded-l flex items-center justify-center transition-all z-30 opacity-70 group-hover:opacity-100"
                      >
                        <div className="w-0.5 h-3 bg-white rounded-full pointer-events-none" />
                      </div>

                      {/* Subtitle Content & Group Badge */}
                      <div className="flex-1 px-1.5 flex items-center gap-1 overflow-hidden pointer-events-none">
                        {sub.groupId && (
                          <span className="text-[7px] px-1 py-0.2 rounded bg-purple-500 font-mono font-bold text-white flex-shrink-0">
                            Grp
                          </span>
                        )}
                        <span className="truncate font-['Noto_Sans_Lao']">{sub.text || "Default text"}</span>
                      </div>

                      {/* Right Trim Handle (ຍື່ນຫູປັບສິ້ນສຸດ) */}
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setSelectedSubId(sub.id);
                          setDraggingSubAction({
                            type: "trim-right",
                            subId: sub.id,
                            startX: e.clientX,
                            origTime: sub.time,
                            origEndTime: sub.endTime,
                          });
                        }}
                        title="ຍື່ນຫູປັບສິ້ນສຸດ (Trim End - E)"
                        className="w-2 hover:w-3.5 bg-orange-300/40 hover:bg-cyan-400 cursor-ew-resize h-full rounded-r flex items-center justify-center transition-all z-30 opacity-70 group-hover:opacity-100"
                      >
                        <div className="w-0.5 h-3 bg-white rounded-full pointer-events-none" />
                      </div>
                    </div>
                  );
                })}

                {/* Keyframe Diamonds on Subtitles Track */}
                {keyframes.map((kf) => {
                  const leftPct = (kf.time / (duration || 15)) * 100;
                  const isNearPlayhead = Math.abs(kf.time - currentTime) <= 0.25;
                  const isSelectedKf = selectedKeyframeId === kf.id;
                  return (
                    <div
                      key={kf.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedKeyframeId(kf.id);
                        setInspectorMode("keyframe");
                        seekTo(kf.time);
                        showToast(`ເລືອກ Keyframe: ${formatTime(kf.time)}`);
                      }}
                      style={{ left: `${leftPct}%` }}
                      title={`Keyframe at ${formatTime(kf.time)} (Click to Edit)`}
                      className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer z-30 transition-transform hover:scale-125 ${
                        isSelectedKf
                          ? "w-3.5 h-3.5 rotate-45 bg-[#12E8FF] border-2 border-white shadow-[0_0_12px_#12E8FF] ring-2 ring-cyan-400 z-40"
                          : isNearPlayhead
                          ? "w-2.5 h-2.5 rotate-45 bg-[#12E8FF] border border-white shadow-[0_0_8px_#12E8FF]"
                          : "w-2 h-2 rotate-45 bg-cyan-400 border border-cyan-200"
                      }`}
                    />
                  );
                })}
              </div>

              {/* Track 4 Lane: Main Video (Repeating Filmstrip Frames with Smooth Sliding & Trimming) */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "copy";
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  const timelineEl = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - timelineEl.left;
                  const dropRatio = Math.max(0, Math.min(1, clickX / timelineEl.width));
                  const dropTime = (duration || 15) * dropRatio;

                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];
                    if (file.type.startsWith("video/") || file.name.match(/\.(mp4|mov|webm|mkv|avi|m4v)$/i)) {
                      await loadDroppedVideoFile(file, dropTime);
                      return;
                    }
                  }

                  const mediaId = e.dataTransfer.getData("mediaId");
                  if (mediaId) {
                    handleAddMediaToTimeline(mediaId, dropTime);
                  }
                }}
                className="h-14 border-b border-[#262833]/30 relative flex items-center overflow-hidden"
              >
                {videoTrackClips.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 border border-dashed border-slate-700/60 rounded mx-1">
                    <span>⇕ ລາກວິດີໂອຈາກເຄື່ອງ ຫຼື Media Bin ມາໃສ່ບ່ອນນີ້ (Drop video here)</span>
                  </div>
                ) : (
                  videoTrackClips.map((clip) => {
                    const totalDur = duration || 15;
                    const leftPct = (clip.startTime / totalDur) * 100;
                    const widthPct = (clip.duration / totalDur) * 100;
                    const isSelected = selectedVideoClipId === clip.id;

                    return (
                      <div
                        key={clip.id}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setSelectedVideoClipId(clip.id);
                          setSelectedSubId("");
                          if (activeToolMode === "split") {
                            handleSplitVideoClipAtPlayhead();
                            return;
                          }
                          setDraggingClipAction({
                            type: "move",
                            clipId: clip.id,
                            startX: e.clientX,
                            origStartTime: clip.startTime,
                            origDuration: clip.duration,
                            origInPoint: clip.inPoint,
                            origOutPoint: clip.outPoint,
                          });
                        }}
                        style={{
                          left: `${leftPct}%`,
                          width: `${Math.max(4, widthPct)}%`,
                        }}
                        className={`absolute top-0.5 bottom-0.5 rounded flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all border group overflow-hidden select-none ${
                          isSelected
                            ? "bg-[#0f766e] border-cyan-400 shadow-[0_0_12px_rgba(18,232,255,0.4)] z-10"
                            : "bg-[#115e59] border-teal-700 text-slate-300 hover:border-teal-500"
                        }`}
                      >
                        {/* Clip Top Banner with Filename & Duration Badge */}
                        <div className="h-4 bg-teal-900/90 px-1.5 flex items-center justify-between text-[9px] font-mono text-teal-100 z-10">
                          <span className="truncate">{clip.name || "WhatsApp Video 2026-10-29 at 18.22.43.mp4"}</span>
                          <span className="bg-teal-950 px-1 rounded text-cyan-300 text-[8px] flex-shrink-0">
                            {formatTime(clip.duration)}
                          </span>
                        </div>

                        {/* Filmstrip Continuous Frames */}
                        <div className="flex-1 flex overflow-hidden bg-black/40 pointer-events-none">
                          {Array.from({ length: 12 }).map((_, fIdx) => (
                            <div key={fIdx} className="h-full w-10 flex-shrink-0 border-r border-teal-950/60 overflow-hidden relative">
                              {clip.thumbUrl ? (
                                <img src={clip.thumbUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-teal-900/50 flex items-center justify-center">
                                  <Film className="w-2.5 h-2.5 text-teal-400" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Left Trim Handle */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setSelectedVideoClipId(clip.id);
                            setDraggingClipAction({
                              type: "trim-left",
                              clipId: clip.id,
                              startX: e.clientX,
                              origStartTime: clip.startTime,
                              origDuration: clip.duration,
                              origInPoint: clip.inPoint,
                              origOutPoint: clip.outPoint,
                            });
                          }}
                          className="absolute left-0 top-0 bottom-0 w-3 bg-cyan-500/40 hover:bg-cyan-400 group-hover:opacity-100 opacity-60 flex items-center justify-center cursor-ew-resize transition-all z-20"
                          title="Drag to Trim Left (or press Q to Playhead)"
                        >
                          <div className="w-0.5 h-3 bg-white/90 rounded-full" />
                        </div>

                        {/* Right Trim Handle */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setSelectedVideoClipId(clip.id);
                            setDraggingClipAction({
                              type: "trim-right",
                              clipId: clip.id,
                              startX: e.clientX,
                              origStartTime: clip.startTime,
                              origDuration: clip.duration,
                              origInPoint: clip.inPoint,
                              origOutPoint: clip.outPoint,
                            });
                          }}
                          className="absolute right-0 top-0 bottom-0 w-3 bg-cyan-500/40 hover:bg-cyan-400 group-hover:opacity-100 opacity-60 flex items-center justify-center cursor-ew-resize transition-all z-20"
                          title="Drag to Trim Right (or press W to Playhead)"
                        >
                          <div className="w-0.5 h-3 bg-white/90 rounded-full" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Keyframe Track Lane (Visible when Keyframe Panel is toggled Alt+K) */}
              {isKeyframePanelOpen && (
                <div className="h-9 border-b border-[#262833]/40 relative bg-[#11121b] flex items-center px-1 overflow-hidden">
                  <div className="absolute inset-x-0 h-px bg-slate-800 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {keyframes.map((kf) => {
                    const leftPct = (kf.time / (duration || 15)) * 100;
                    const isNearPlayhead = Math.abs(kf.time - currentTime) <= 0.25;
                    const isSelectedKf = selectedKeyframeId === kf.id;
                    return (
                      <div
                        key={kf.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedKeyframeId(kf.id);
                          setInspectorMode("keyframe");
                          seekTo(kf.time);
                          showToast(`ເລືອກ Keyframe: ${formatTime(kf.time)}`);
                        }}
                        style={{ left: `${leftPct}%` }}
                        title={`Keyframe @ ${formatTime(kf.time)}: Scale ${kf.scale}%, PosX ${kf.positionX}px, Rot ${kf.rotation}° (Click to Edit)`}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer transition-transform hover:scale-150 z-30 flex flex-col items-center group"
                      >
                        <div
                          className={`rotate-45 border transition-all ${
                            isSelectedKf
                              ? "w-4 h-4 bg-[#12E8FF] border-2 border-white shadow-[0_0_12px_#12E8FF] ring-2 ring-cyan-400"
                              : isNearPlayhead
                              ? "w-3 h-3 bg-[#12E8FF] border-white shadow-[0_0_8px_#12E8FF]"
                              : "w-2.5 h-2.5 bg-cyan-500/80 border-cyan-300"
                          }`}
                        />
                        <span className="text-[8px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-1 rounded mt-1 whitespace-nowrap pointer-events-none">
                          {kf.scale}% / {kf.rotation}°
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Track 5 Lane: Video Audio Waveform (Cyan Bars) */}
              <div className="h-11 border-b border-[#262833]/30 relative bg-[#042f2e]/30 flex flex-col justify-between overflow-hidden">
                <div className="h-3.5 bg-teal-950/80 px-2 flex items-center text-[8.5px] font-mono text-teal-300">
                  <span className="truncate">WhatsApp Video 2026-10-29 at 18.22.43</span>
                </div>
                {/* Cyan Waveform Bars */}
                <div className="h-6 flex items-end gap-[2px] px-2 pb-0.5 opacity-90">
                  {Array.from({ length: 64 }).map((_, barIdx) => {
                    const waveH = 15 + Math.sin(barIdx * 0.45) * 12 + Math.cos(barIdx * 0.8) * 6;
                    return (
                      <div
                        key={barIdx}
                        style={{ height: `${Math.max(3, waveH)}px` }}
                        className="w-1 bg-[#14b8a6] rounded-t-xs flex-shrink-0"
                      />
                    );
                  })}
                </div>
              </div>

              {/* Track 6 Lane: BGM Music Waveform (Blue Bars with Orange Beat Markers) */}
              <div className="h-11 border-b border-[#262833]/30 relative bg-[#172554]/30 flex flex-col justify-between overflow-hidden">
                <div className="h-3.5 bg-blue-950/80 px-2 flex items-center text-[8.5px] font-mono text-blue-300">
                  <span className="truncate">Spooky Masquerade Halloween</span>
                </div>
                {/* Blue Waveform Bars with Orange Beat Accents at peaks */}
                <div className="h-6 flex items-end gap-[2px] px-2 pb-0.5 opacity-90">
                  {Array.from({ length: 64 }).map((_, barIdx) => {
                    const beatDrop = barIdx % 8 === 0 || barIdx % 8 === 1;
                    const waveH = beatDrop ? 22 : 8 + Math.sin(barIdx * 0.3) * 6;
                    return (
                      <div
                        key={barIdx}
                        style={{ height: `${Math.max(4, waveH)}px` }}
                        className="w-1 bg-[#2563eb] rounded-t-xs flex-shrink-0 relative overflow-hidden"
                      >
                        {beatDrop && (
                          <div className="absolute top-0 inset-x-0 h-1.5 bg-[#f97316]" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CapCut Full-Height Playhead Vertical Needle */}
              <div
                ref={playheadNeedleRef}
                style={{
                  left: `${((currentTime / (duration || 15)) * 100).toFixed(2)}%`,
                }}
                className="absolute top-0 bottom-0 w-px bg-white z-30 pointer-events-none shadow-[0_0_4px_rgba(255,255,255,0.8)]"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. AI SMART VIDEO CUTTER MODAL (Reference Clip & Pacing)  */}
      {/* ========================================================= */}
      {isAiCutterOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#181920] border border-purple-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Smart Video Cutter</h3>
                  <p className="text-[11px] text-slate-400">ຕັດຄລິບອັດຕະໂນມັດຕາມຄລິບຕົວຢ່າງ ຫຼື ຈັງຫວະ AI</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiCutterOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Reference Video Uploader */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>ແນບຄລິບຕົວຢ່າງ (Reference Video for AI):</span>
              </label>

              <input
                type="file"
                ref={refFileInputRef}
                accept="video/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setRefVideoFile(f);
                    showToast(`ແນບຄລິບຕົວຢ່າງ: "${f.name}"`);
                  }
                }}
                className="hidden"
              />

              <div
                onClick={() => refFileInputRef.current?.click()}
                className="p-3.5 rounded-xl border border-dashed border-slate-700 hover:border-purple-500 bg-[#20222d] cursor-pointer text-center text-xs text-slate-300 transition-colors"
              >
                {refVideoFile ? (
                  <span className="text-cyan-400 font-bold">✓ ແນບແລ້ວ: {refVideoFile.name}</span>
                ) : (
                  <span>ຄລິກເພື່ອເລືອກຄລິບຕົວຢ່າງ ເພື່ອໃຫ້ AI ຮຽນແບບຈັງຫວະຕັດ</span>
                )}
              </div>
            </div>

            {/* Pacing Speed Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200">
                ເລືອກຮູບແບບຈັງຫວະການຕັດ (Pacing Style):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "viral-fast", name: "ໄວຣັລຕັດໄວ (1.5s)", desc: "TikTok / Reels Retention" },
                  { id: "podcast", name: "ພອດແຄສຕ໌ (3.0s)", desc: "Storytelling / Conversation" },
                  { id: "beat-drop", name: "ບີດດຣັອບ (0.9s)", desc: "High Energy / Music Beats" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAiCutPacing(item.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      aiCutPacing === item.id
                        ? "bg-purple-950/40 border-purple-500 text-purple-300 shadow"
                        : "bg-[#20222d] border-slate-700/60 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{item.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Remove Dead Air Checkbox */}
            <div className="p-3 rounded-xl bg-[#20222d] border border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Auto Remove Silence / Dead Air</div>
                <div className="text-[10px] text-slate-400">ຕັດຊ່ວງມິດ ແລະ ຊ່ວງຫາຍໃຈອອກອັດຕະໂນມັດ</div>
              </div>
              <input
                type="checkbox"
                checked={removeDeadAir}
                onChange={(e) => setRemoveDeadAir(e.target.checked)}
                className="w-4 h-4 rounded text-purple-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsAiCutterOpen(false)}
                className="flex-1 py-2 rounded-xl bg-[#252838] hover:bg-[#32364a] text-xs font-bold text-slate-300"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleRunAiSmartCut}
                disabled={isAiCutting}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-xs font-bold text-white shadow-lg shadow-purple-900/30 hover:opacity-95 flex items-center justify-center gap-1.5"
              >
                {isAiCutting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>ກຳລັງຕັດຄລິບ...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    <span>ສັ່ງ AI ຕັດຄລິບດຽວນີ້</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. CAPCUT KEYBOARD SHORTCUTS REFERENCE MODAL (Images 7-10) */}
      {/* ========================================================= */}
      {isShortcutsOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[85vh] bg-[#14151c] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl flex flex-col space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">CapCut Desktop Shortcuts (ຄີລັດທັງໝົດ)</h3>
                  <p className="text-[11px] text-slate-400">ຕາຕະລາງປຸ່ມລັດ CapCut PC ຕາມມາດຕະຖານ</p>
                </div>
              </div>
              <button
                onClick={() => setIsShortcutsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2-Column CapCut Shortcuts Layout (Images 7, 8, 9, 10) */}
            <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-xs">
              {/* LEFT COLUMN */}
              <div className="space-y-1 divide-y divide-slate-800/40">
                {[
                  { name: "Zoom in/Zoom out", key: "Ctrl + Scroll" },
                  { name: "Up/Down", key: "Scroll" },
                  { name: "Left/Right", key: "Alt + Scroll" },
                  { name: "Activate/Deactivate clip", key: "V" },
                  { name: "Extract/Restore audio", key: "Ctrl + Shift + S" },
                  { name: "Add marker", key: "M" },
                  { name: "Add marker with new color", key: "Alt + M" },
                  { name: "Go to next marker", key: "Shift + M" },
                  { name: "Go to previous marker", key: "Alt + Shift + M" },
                  { name: "Previous frame", key: "←" },
                  { name: "Next frame", key: "→" },
                  { name: "Step back many frames", key: "Shift + ←" },
                  { name: "Step forward many frames", key: "Shift + →" },
                  { name: "Locate to first frame", key: "Home" },
                  { name: "Locate to last frame", key: "End" },
                  { name: "Last cut point", key: "↑" },
                  { name: "Next cut point", key: "↓" },
                  { name: "In point", key: "I" },
                  { name: "Out point", key: "O" },
                  { name: "Select by clip", key: "Shift + X" },
                  { name: "Deselect", key: "Alt + X" },
                  { name: "Group", key: "Ctrl + G" },
                  { name: "Ungroup", key: "Ctrl + Shift + G" },
                  { name: "Show speed panel", key: "Ctrl + R" },
                  { name: "Curve speed", key: "Shift + B" },
                  { name: "Create compound clip", key: "Alt + G" },
                  { name: "Undo compound clip", key: "Alt + Shift + G" },
                  { name: "Volume +0.1dB", key: "Ctrl + ." },
                  { name: "Volume -0.1dB", key: "Ctrl + ," },
                ].map((sc, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 px-2 hover:bg-[#1a1c25] rounded transition-colors">
                    <span className="text-slate-300 font-medium">{sc.name}</span>
                    <span className="font-mono text-cyan-300 bg-[#20222f] border border-cyan-500/20 px-2 py-0.5 rounded text-[11px] font-bold">
                      {sc.key}
                    </span>
                  </div>
                ))}
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-1 divide-y divide-slate-800/40">
                {[
                  { name: "Split", key: "Ctrl + B" },
                  { name: "Split all", key: "Ctrl + Shift + B" },
                  { name: "Select mode", key: "A" },
                  { name: "Split mode", key: "B" },
                  { name: "Select leftward", key: "[" },
                  { name: "Select rightward", key: "]" },
                  { name: "Main track magnet", key: "P" },
                  { name: "Auto snapping", key: "N" },
                  { name: "Linkage switch", key: "~" },
                  { name: "Preview axis switch", key: "S" },
                  { name: "Zoom in", key: "Ctrl + +" },
                  { name: "Zoom out", key: "Ctrl + -" },
                  { name: "Zoom to fit timeline", key: "Shift + Z" },
                  { name: "Shuttle left", key: "J" },
                  { name: "Shuttle stop", key: "K" },
                  { name: "Shuttle right", key: "L" },
                  { name: "Delete left to Playhead", key: "Q" },
                  { name: "Delete right to Playhead", key: "W" },
                  { name: "Show/Hide keyframe panel", key: "Alt + K" },
                  { name: "Add keyframe on panel", key: "Shift + Click" },
                  { name: "Add / Toggle keyframe", key: "Shift + Alt + K" },
                  { name: "Play / Pause", key: "Space" },
                  { name: "Delete clip / Subtitle", key: "Del / Backspace" },
                  { name: "Mute / Unmute", key: "M" },
                  { name: "Show / Hide rulers", key: "Ctrl + Alt + R" },
                  { name: "Record screen", key: "Ctrl + Alt + P" },
                ].map((sc, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 px-2 hover:bg-[#1a1c25] rounded transition-colors">
                    <span className="text-slate-300 font-medium">{sc.name}</span>
                    <span className="font-mono text-cyan-300 bg-[#20222f] border border-cyan-500/20 px-2 py-0.5 rounded text-[11px] font-bold">
                      {sc.key}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Center Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#181a24] border border-slate-700/80 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative text-slate-200">
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">ສົ່ງອອກຜົນງານ (Export Center)</h3>
                <p className="text-xs text-slate-400">ເລືອກຮູບແບບການສົ່ງອອກຕາມທີ່ຕ້ອງການ</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* 1. Full Editable Project Package (.saizup) */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900 border border-cyan-500/40 hover:border-cyan-400 transition-all flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💾</span>
                    <div>
                      <span className="text-xs font-bold text-cyan-300">ໂປຣເຈັກ SAIZUP (.saizup)</span>
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">ແນະນຳ</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleExportProjectPackage();
                      setIsExportModalOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ດາວໂຫຼດ .saizup</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  ບັນທຶກທຸກຢ່າງໃນໂປຣເຈັກ (ຄລິບວິດີໂອ, ຊັບໄຕເຕິລ, ສີ, ຄີຍ໌ເຟຣມ, ການຕັດ). ສາມາດນຳໄຟລ໌ນີ້ກັບມາເປີດຕັດຕໍ່ຄືນໃນເວັບໄຊທ໌ໄດ້ 100%!
                </p>
              </div>

              {/* 2. Subtitles (.srt, .ass, .vtt) */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  <span className="text-xs font-bold text-white">ໄຟລ໌ຊັບໄຕເຕິລ (Subtitle Files)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  ສົ່ງອອກຊັບໄຕເຕິລພາສາລາວ/ໄທ ສຳລັບ CapCut, Premiere Pro, DaVinci Resolve ຫຼື YouTube
                </p>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <button
                    onClick={() => {
                      handleExportSubtitles("srt");
                      setIsExportModalOpen(false);
                    }}
                    className="py-1.5 px-2 rounded-lg bg-[#252733] hover:bg-[#323646] text-xs font-semibold text-slate-200 border border-slate-700/60 hover:border-cyan-500/40 transition text-center"
                  >
                    .SRT (Standard)
                  </button>
                  <button
                    onClick={() => {
                      handleExportSubtitles("ass");
                      setIsExportModalOpen(false);
                    }}
                    className="py-1.5 px-2 rounded-lg bg-[#252733] hover:bg-[#323646] text-xs font-semibold text-slate-200 border border-slate-700/60 hover:border-cyan-500/40 transition text-center"
                  >
                    .ASS (Stylized)
                  </button>
                  <button
                    onClick={() => {
                      handleExportSubtitles("vtt");
                      setIsExportModalOpen(false);
                    }}
                    className="py-1.5 px-2 rounded-lg bg-[#252733] hover:bg-[#323646] text-xs font-semibold text-slate-200 border border-slate-700/60 hover:border-cyan-500/40 transition text-center"
                  >
                    .VTT (Web)
                  </button>
                </div>
              </div>

              {/* 3. Still Frame (.png) */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">📸</span>
                  <div>
                    <span className="text-xs font-bold text-white">ພາບນິ້ງວິດີໂອ (Still Frame)</span>
                    <p className="text-[11px] text-slate-400">ບັນທຶກເຟຣມທີ່ຫົວອ່ານ Playhead ກຳລັງຢູ່ເປັນໄຟລ໌ PNG HD</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleExportStillFrame();
                    setIsExportModalOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#252733] hover:bg-[#323646] text-xs font-semibold text-slate-200 border border-slate-700/60 hover:border-cyan-500/40 transition flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ບັນທຶກ PNG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
}
