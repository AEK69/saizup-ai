"use client";

import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  Clock,
  Copy,
  QrCode,
  ShieldCheck,
  X,
  AlertCircle,
  Smartphone,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { PaymentTransaction } from "@/types";

interface BcelPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  amountLAK: number;
  credits: number;
  planId: string;
  onPaymentSuccess?: (transaction: PaymentTransaction) => void;
}

export default function BcelPaymentModal({
  isOpen,
  onClose,
  planName,
  amountLAK,
  credits,
  planId,
  onPaymentSuccess,
}: BcelPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string>("");
  const [qrUrl, setQrUrl] = useState<string>("");
  const [qrPayload, setQrPayload] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes default
  const [copied, setCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const processedTxnsRef = useRef<Set<string>>(new Set());

  // Web Audio chime for instant success feedback
  const playSuccessChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.24); // D6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.error(e);
    }
  };

  // Clear timers helper
  const clearAllTimers = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Generate OnePlay BCEL QR
  const initPayment = async () => {
    clearAllTimers();
    setLoading(true);
    setErrorMessage("");
    setIsSuccess(false);
    setIsExpired(false);
    setPollCount(0);

    try {
      const res = await fetch("/api/payment/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountLAK: Math.max(1000, Math.round(amountLAK)),
          planId,
          planName,
          credits,
        }),
      });

      const data = await res.json();
      if (data.success && data.transactionId) {
        setTransactionId(data.transactionId);
        setQrUrl(data.qrUrl);
        setQrPayload(data.payload);
        setTimeLeft(data.expiresIn || 300);

        // Start 3-second polling
        startPolling(data.transactionId);
        // Start countdown
        startCountdown(data.expiresIn || 300);
      } else {
        setErrorMessage(data.error || "ບໍ່ສາມາດສ້າງ QR ຊຳລະເງິນໄດ້");
      }
    } catch (err) {
      console.error("Init payment error:", err);
      setErrorMessage("ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ລະບົບ");
    } finally {
      setLoading(false);
    }
  };

  // Polling check every 3 seconds
  const startPolling = (txId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        setPollCount((prev) => prev + 1);

        const res = await fetch("/api/payment/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId: txId }),
        });

        const data = await res.json();

        // Check if paid successfully
        if (data.isPaid) {
          handlePaymentSuccess(txId);
        } else if (data.isExpired) {
          clearAllTimers();
          setIsExpired(true);
        }
      } catch (e) {
        console.error("Poll check error:", e);
      }
    }, 3000);
  };

  // Countdown timer
  const startCountdown = (initialSecs: number) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimeLeft(initialSecs);

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearAllTimers();
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle successful payment (Idempotent: runs exactly once per transactionId)
  const handlePaymentSuccess = (txId: string) => {
    clearAllTimers();

    // Prevent duplicate processing
    if (processedTxnsRef.current.has(txId)) return;
    processedTxnsRef.current.add(txId);

    setIsSuccess(true);
    playSuccessChime();

    try {
      // 1. Add user credits in localStorage
      const prevCredits = Number(localStorage.getItem("saizup_credits") || "25");
      const newCredits = prevCredits + (credits || 0);
      localStorage.setItem("saizup_credits", String(newCredits));

      // 2. Update user profile if logged in
      const userStr = localStorage.getItem("saizup_user");
      if (userStr) {
        const u = JSON.parse(userStr);
        u.credits = (u.credits || 0) + (credits || 0);
        if (planId === "monthly" || planId === "yearly") {
          u.plan = planId;
        }
        localStorage.setItem("saizup_user", JSON.stringify(u));
      }

      // 3. Save to transaction history
      const completedTxn: PaymentTransaction = {
        id: txId,
        orderId: txId,
        customerName: "ລູກຄ້າ BCEL One",
        customerPhone: "020-XXXX-XXXX",
        planId: planId as any,
        planName,
        amountLAK,
        creditsGiven: credits || 0,
        status: "completed",
        paymentMethod: "BCEL_ONE",
        bcelKey: "jvixcloud_live_e50047095b0a...",
        qrPayload,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      const history = JSON.parse(localStorage.getItem("saizup_transactions") || "[]");
      const exists = history.some((t: any) => t.id === txId);
      if (!exists) {
        history.unshift(completedTxn);
        localStorage.setItem("saizup_transactions", JSON.stringify(history));
      }

      // 4. Callback
      if (onPaymentSuccess) {
        onPaymentSuccess(completedTxn);
      }
    } catch (e) {
      console.error("Save transaction error:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      initPayment();
    } else {
      clearAllTimers();
    }
    return () => clearAllTimers();
  }, [isOpen, planId, amountLAK]);

  const formatMinutes = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-md my-8 rounded-3xl bg-[#0f111a] border border-slate-800 shadow-2xl overflow-hidden font-sans">
        {/* Header with BCEL Red & Blue Banner */}
        <div className="relative p-5 bg-gradient-to-r from-[#d91424] via-[#b70e1c] to-[#002b66] text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md flex items-center justify-center flex-shrink-0">
              <span className="font-extrabold text-[#d91424] text-xs leading-none text-center">
                BCEL<br />
                <span className="text-[#002b66]">One</span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg font-['Noto_Sans']">OnePay Lao QR</h3>
                <span className="px-2 py-0.5 text-[10px] bg-white/20 rounded-full font-medium">
                  Auto-Cut ⚡
                </span>
              </div>
              <p className="text-xs text-white/80">ຕັດຍອດອັດຕະໂນມັດ ບໍ່ຕ້ອງແນບສະລິບ</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* STATE 1: PAYMENT SUCCESS */}
          {isSuccess ? (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-12 h-12 animate-bounce" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-2">
                  ✓ ຕັດຍອດສຳເລັດແລ້ວ
                </span>
                <h4 className="text-2xl font-extrabold text-white font-['Noto_Sans']">
                  ຊຳລະເງິນສຳເລັດ!
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                  ລະບົບໄດ້ເພີ່ມ <strong className="text-[#12E8FF] font-bold">+{credits} ເຄຣດິດ</strong> ເຂົ້າບັນຊີຂອງທ່ານຮຽບຮ້ອຍແລ້ວ.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>ແພັກເກັດ:</span>
                  <span className="text-white font-semibold">{planName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ຍອດຊຳລະ:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {amountLAK.toLocaleString()} ₭
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Transaction ID:</span>
                  <span className="text-slate-300 font-mono text-[11px] truncate max-w-[180px]">
                    {transactionId}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full capcut-btn-cyan py-3.5 rounded-2xl font-bold text-sm shadow-lg"
              >
                ເລີ່ມໃຊ້ງານດຽວນີ້
              </button>
            </div>
          ) : isExpired ? (
            /* STATE 2: EXPIRED */
            <div className="text-center py-8 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
                <Clock className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white">QR Code ໝົດອາຍຸແລ້ວ</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                ລາຍການຊຳລະນີ້ໝົດອາຍຸຕາມກຳນົດ ກະລຸນາກົດປຸ່ມດ້ານລຸ່ມເພື່ອສ້າງ QR Code ໃໝ່
              </p>
              <button
                onClick={initPayment}
                className="w-full gradient-btn py-3 rounded-2xl font-bold text-xs text-white flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ສ້າງ QR Code ໃໝ່</span>
              </button>
            </div>
          ) : (
            /* STATE 3: PENDING PAYMENT (SCAN QR + AUTO-POLL) */
            <div className="space-y-4">
              {/* Order Info & Price Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div>
                  <div className="text-[11px] text-slate-400">ແພັກເກັດທີ່ເລືອກ</div>
                  <div className="text-sm font-bold text-white">{planName}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">ຍອດທີ່ຕ້ອງຊຳລະ</div>
                  <div className="text-xl font-extrabold text-red-400 font-mono">
                    {amountLAK.toLocaleString()} ₭
                  </div>
                </div>
              </div>

              {/* Dynamic QR Code Card */}
              <div className="relative p-5 rounded-3xl bg-white border-2 border-slate-700/60 shadow-xl text-center">
                {loading ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-3">
                    <RefreshCw className="w-8 h-8 text-[#12E8FF] animate-spin" />
                    <span className="text-xs text-slate-600 font-medium">
                      ກຳລັງສ້າງ OnePay QR Code ຈາກ Jvix Cloud...
                    </span>
                  </div>
                ) : qrUrl ? (
                  <div className="flex flex-col items-center">
                    <div className="relative p-2 bg-white rounded-2xl">
                      <img
                        src={qrUrl}
                        alt="BCEL OnePay QR Code"
                        className="w-56 h-56 object-contain rounded-xl"
                      />
                      {/* Center Brand Mini Logo */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white p-1 shadow-md border border-slate-200 flex items-center justify-center">
                        <span className="font-extrabold text-[#d91424] text-[9px] leading-tight text-center">
                          BCEL<br /><span className="text-[#002b66]">One</span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-slate-800 text-xs font-semibold">
                      ສະແກນຜ່ານແອັບ BCEL One ຫຼື ທະນາຄານລາວທຸກແຫ່ງ
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-red-500 text-xs gap-2">
                    <AlertCircle className="w-6 h-6" />
                    <span>{errorMessage || "ບໍ່ສາມາດໂຫຼດ QR ໄດ້"}</span>
                    <button
                      onClick={initPayment}
                      className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold mt-2"
                    >
                      ລອງໃໝ່
                    </button>
                  </div>
                )}
              </div>

              {/* Live Auto-Check Status Indicator (No slip needed!) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#12E8FF]/10 via-blue-950/40 to-slate-900 border border-[#12E8FF]/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-[#12E8FF] font-semibold">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span>ກຳລັງກວດສອບຍອດເງິນອັດຕະໂນມັດ...</span>
                  </span>
                  <span className="font-mono text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{formatMinutes(timeLeft)}</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  ✓ ຕັດຍອດອັດຕະໂນມັດທັນທີເມື່ອສະແກນສຳເລັດ <strong>ບໍ່ຕ້ອງແນບສະລິບ</strong>
                </p>
              </div>

              {/* Deep Link to BCEL One App */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href="bcelone://"
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#d91424] to-[#002b66] hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>ເປີດແອັບ BCEL One</span>
                </a>

                <button
                  type="button"
                  onClick={() => copyToClipboard(qrPayload || String(amountLAK))}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-[#12E8FF]" />
                  <span>{copied ? "ກັອບປີ້ແລ້ວ!" : "ກັອບປີ້ QR Payload"}</span>
                </button>
              </div>

              {/* Transaction ID Footer */}
              <div className="text-center pt-2 border-t border-slate-800/60">
                <div className="text-[10px] text-slate-500 font-mono">
                  Ref: {transactionId || "Generating..."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
