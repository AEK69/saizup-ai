"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  Video,
  CreditCard,
  Key,
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Plus,
  Sliders,
  Settings,
  Bell,
  Check,
  Building,
  FileCheck,
  Lock,
  Edit3,
  History,
  UserCheck,
  UserX,
  Sparkles,
  Trash2,
  AlertCircle,
  X,
  ExternalLink,
  ChevronRight,
  Minus,
} from "lucide-react";
import { PaymentTransaction } from "@/types";
import { AppUserRecord } from "@/lib/userStore";
import AuthModal from "@/components/auth/AuthModal";

const OWNER_EMAIL = "kobx2.2005@gmail.com";

const INITIAL_MOCK_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: "TXN-8921A",
    orderId: "SZ-489211",
    customerName: "ສຸລິຍາ ວົງສາ (Suliya)",
    customerPhone: "020-5551-2345",
    planId: "yearly",
    planName: "ແພັກເກັດລາຍປີ (12 ເດືອນ)",
    amountLAK: 1999000,
    creditsGiven: 3500,
    status: "completed",
    paymentMethod: "BCEL_ONE",
    bcelKey: "jvixcloud_live_e50047095b0a...",
    qrPayload: "BCELONE://PAY...",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
  },
  {
    id: "TXN-3412B",
    orderId: "SZ-489190",
    customerName: "ຄຳໄພ ສີສຸວັນ (Khampai)",
    customerPhone: "020-9988-7711",
    planId: "monthly",
    planName: "ແພັກເກັດລາຍເດືອນ (1 ເດືອນ)",
    amountLAK: 199000,
    creditsGiven: 250,
    status: "completed",
    paymentMethod: "BCEL_ONE",
    bcelKey: "jvixcloud_live_e50047095b0a...",
    qrPayload: "BCELONE://PAY...",
    createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 94).toISOString(),
  },
  {
    id: "TXN-7734C",
    orderId: "SZ-489145",
    customerName: "ອາລຸນ ເດດວົງ (Aloun)",
    customerPhone: "020-2233-4455",
    planId: "credit_100k",
    planName: "ເຕີມເຄຣດິດ 120 Credits",
    amountLAK: 100000,
    creditsGiven: 120,
    status: "completed",
    paymentMethod: "BCEL_ONE",
    bcelKey: "jvixcloud_live_e50047095b0a...",
    qrPayload: "BCELONE://PAY...",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 179).toISOString(),
  },
  {
    id: "TXN-1290D",
    orderId: "SZ-489088",
    customerName: "ມະນີວອນ ພອນສະຫວັນ",
    customerPhone: "020-7766-5544",
    planId: "monthly",
    planName: "ແພັກເກັດລາຍເດືອນ (1 ເດືອນ)",
    amountLAK: 199000,
    creditsGiven: 250,
    status: "completed",
    paymentMethod: "BCEL_ONE",
    bcelKey: "jvixcloud_live_e50047095b0a...",
    qrPayload: "BCELONE://PAY...",
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 359).toISOString(),
  },
];

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "transactions" | "settings">("users");
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(INITIAL_MOCK_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Users Management State
  const [users, setUsers] = useState<AppUserRecord[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userPlanFilter, setUserPlanFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<AppUserRecord | null>(null);
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<AppUserRecord | null>(null);

  // Edit Modal Inputs
  const [editCredits, setEditCredits] = useState<number>(0);
  const [editPlan, setEditPlan] = useState<AppUserRecord["plan"]>("Free Trial");
  const [editBilling, setEditBilling] = useState<AppUserRecord["billingCycle"]>("none");
  const [editStatus, setEditStatus] = useState<AppUserRecord["status"]>("active");
  const [editTrialDays, setEditTrialDays] = useState<number>(7);
  const [adminNote, setAdminNote] = useState<string>("");
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Settings State
  const [geminiKey, setGeminiKey] = useState("AQ.Ab8RN6KuOM88-WiH6LqPQ78brmzp9yut44wNx3E6iqn82VUtiw");
  const [bcelKey, setBcelKey] = useState("jvixcloud_live_e50047095b0a768aa2df96822d529a865457428738949921");
  const [merchantAccount, setMerchantAccount] = useState("010120000889977001");
  const [merchantName, setMerchantName] = useState("SAIZUP AI STUDIO");
  const [activeModel, setActiveModel] = useState("Gemini 3.5 Flash Lite (ແນະນຳ)");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Sync Current User & Check Authorization
  useEffect(() => {
    try {
      const stored = localStorage.getItem("saizup_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuthChecking(false);
    }
  }, []);

  // Fetch Users from server API
  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch(`/api/admin/users?adminEmail=${encodeURIComponent(OWNER_EMAIL)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();

    try {
      const storedTx = localStorage.getItem("saizup_transactions");
      if (storedTx) {
        const parsed = JSON.parse(storedTx);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTransactions([...parsed, ...INITIAL_MOCK_TRANSACTIONS]);
        }
      }

      const savedAcc = localStorage.getItem("saizup_bcel_account");
      if (savedAcc) setMerchantAccount(savedAcc);
      const savedNm = localStorage.getItem("saizup_bcel_name");
      if (savedNm) setMerchantName(savedNm);
    } catch (e) {
      console.error(e);
    }
  }, [fetchUsers]);

  // Handle Edit User Modal Open
  const openEditModal = (user: AppUserRecord) => {
    setSelectedUserForEdit(user);
    setEditCredits(user.credits);
    setEditPlan(user.plan);
    setEditBilling(user.billingCycle);
    setEditStatus(user.status);
    setEditTrialDays(user.trialDaysRemaining || 0);
    setAdminNote("");
  };

  // Save User Edit Changes
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    setIsSavingUser(true);
    try {
      const res = await fetch(`/api/admin/users?adminEmail=${encodeURIComponent(OWNER_EMAIL)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedUserForEdit.id,
          updates: {
            credits: Number(editCredits),
            plan: editPlan,
            billingCycle: editBilling,
            status: editStatus,
            trialDaysRemaining: Number(editTrialDays),
          },
          adminNote: adminNote || `ແກ້ໄຂເຄຣດິດເປັນ ${editCredits}, ແພັກເກັດ: ${editPlan}`,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUsers((prev) => prev.map((u) => (u.id === data.user.id ? data.user : u)));
        showToast(`✅ ແກ້ໄຂຂໍ້ມູນ "${data.user.name}" ສຳເລັດແລ້ວ!`);
        setSelectedUserForEdit(null);
      } else {
        alert(data.error || "Failed to update user");
      }
    } catch (err) {
      console.error("Save user error:", err);
      alert("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ");
    } finally {
      setIsSavingUser(false);
    }
  };

  // Quick Credit Adjustment (+100 or -50)
  const handleQuickCreditAdjust = async (user: AppUserRecord, amount: number) => {
    const newCredits = Math.max(0, user.credits + amount);
    try {
      const res = await fetch(`/api/admin/users?adminEmail=${encodeURIComponent(OWNER_EMAIL)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          updates: { credits: newCredits },
          adminNote: `Quick adjust ${amount > 0 ? "+" : ""}${amount} credits (New total: ${newCredits})`,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUsers((prev) => prev.map((u) => (u.id === user.id ? data.user : u)));
        showToast(`⚡ ${amount > 0 ? "ເພີ່ມ" : "ຫຼຸດ"}ເຄຣດິດ "${user.name}" ເປັນ ${newCredits}`);
      }
    } catch (err) {
      console.error("Quick adjust error:", err);
    }
  };

  // Delete user account (Admin authority for TOS violations)
  const handleDeleteUser = async (user: AppUserRecord) => {
    if (user.isOwner || user.email.toLowerCase() === OWNER_EMAIL) {
      alert("ບໍ່ສາມາດລຶບບັນຊີເຈົ້າຂອງຮ້ານໄດ້");
      return;
    }

    const confirmed = window.confirm(
      `⚠️ ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບບັນຊີ "${user.name}" (${user.email}) ອອກຈາກລະບົບເນື່ອງຈາກລະເມີດເງື່ອນໄຂການໃຊ້ງານ?\n\nການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້!`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/users?id=${user.id}&adminEmail=${encodeURIComponent(OWNER_EMAIL)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        showToast(`🗑️ ລຶບບັນຊີ "${user.name}" ອອກຈາກລະບົບຮຽບຮ້ອຍແລ້ວ!`);
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      console.error("Delete user error:", err);
      alert("ເກີດຂໍ້ຜິດພາດໃນການລຶບບັນຊີ");
    }
  };

  // STRICT ACCESS BARRIER: Only kobx2.2005@gmail.com is authorized!
  const isOwner = currentUser?.email?.toLowerCase().trim() === OWNER_EMAIL;

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#07080d] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>ກຳລັງກວດສອບສິດການເຂົ້າເຖິງ...</span>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-[#07080d] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0f111a] border border-rose-500/40 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Access Restricted • 403 Forbidden
            </span>
            <h2 className="text-2xl font-black text-white mt-3 font-['Noto_Sans']">
              ການເຂົ້າເຖິງຖືກຈຳກັດ
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              ລະບົບຫຼັງບ້ານ SAIZUP AI ສະຫງວນສິດສະເພາະເຈົ້າຂອງຮ້ານ (
              <span className="text-[#12E8FF] font-semibold">{OWNER_EMAIL}</span>
              ) ເທົ່ານັ້ນ. ບັນຊີອື່ນໆບໍ່ສາມາດເຂົ້າເຖິງ ຫຼື ເບິ່ງຂໍ້ມູນໄດ້ທຸກກໍລະນີ.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs text-slate-300">
            <div>ສະຖານະບັນຊີປັດຈຸບັນ:</div>
            <div className="font-mono text-[#12E8FF] font-bold truncate mt-0.5">
              {currentUser?.email ? currentUser.email : "ຍັງບໍ່ໄດ້ເຂົ້າສູ່ລະບົບ (Guest)"}
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-[#090C14] font-bold text-xs shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>ເຂົ້າສູ່ລະບົບດ້ວຍອີເມວເຈົ້າຂອງຮ້ານ</span>
            </button>
            <a
              href="/"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold text-center transition-colors"
            >
              ກັບຄືນໜ້າຫຼັກ (Back to Home)
            </a>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
          }}
        />
      </div>
    );
  }

  // Filter Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearch.toLowerCase());
    const matchesPlan = userPlanFilter === "all" || u.plan === userPlanFilter;
    const matchesStatus = userStatusFilter === "all" || u.status === userStatusFilter;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Calculate Key Metrics
  const totalSubscribers = users.filter((u) => u.plan === "Monthly Pro" || u.plan === "Yearly VIP").length;
  const totalCreditsIssued = users.reduce((acc, u) => acc + (u.credits || 0), 0);
  const totalUserSpend = users.reduce((acc, u) => acc + (u.totalSpentLAK || 0), 0);

  return (
    <div className="min-h-screen bg-[#07080d] text-white pt-24 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed top-20 right-6 z-50 bg-[#12E8FF] text-[#090C14] px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#12E8FF]/10 text-[#12E8FF] border border-[#12E8FF]/30">
                Backoffice • ລະບົບຫຼັງບ້ານ
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400">
                ສະເພາະເຈົ້າຂອງຮ້ານ ({OWNER_EMAIL})
              </span>
            </div>
            <h1 className="text-3xl font-extrabold font-['Noto_Sans'] mt-2">
              ແຜງຄວບຄຸມຜູ້ໃຊ້ & ຍອດຂາຍ <span className="gradient-text">SAIZUP AI</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              ຈັດການບັນຊີຜູ້ໃຊ້ທັງໝົດ, ປະຫວັດການໃຊ້ງານ, ເຄຣດິດຄົງເຫຼືອ, ແລະ ການຊຳລະເງິນ BCEL One
            </p>
          </div>

          {/* Quick Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-slate-800 self-start md:self-auto overflow-x-auto max-w-full">
            {[
              { id: "users", label: "ຜູ້ໃຊ້ & ປະຫວັດ", icon: Users },
              { id: "overview", label: "ພາບລວມຍອດຂາຍ", icon: TrendingUp },
              { id: "transactions", label: "ລາຍການຊຳລະ BCEL", icon: CreditCard },
              { id: "settings", label: "ຄຸມລະບົບ", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-[#12E8FF] text-[#090C14] font-bold shadow-lg shadow-[#12E8FF]/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: USERS & USAGE HISTORY (ຜູ້ໃຊ້ທັງໝົດ & ປະຫວັດການໃຊ້ງານ - User Request) */}
        {/* ========================================================================= */}
        {activeTab === "users" && (
          <div className="space-y-6 mt-8">
            {/* 4 User Stat Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>ຜູ້ໃຊ້ທັງໝົດ (Users)</span>
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white font-mono">{users.length}</div>
                <div className="text-[11px] text-slate-400 mt-1">ລົງທະບຽນທັງໝົດໃນລະບົບ</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>ສະມາຊິກ Pro / VIP</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-purple-400 font-mono">{totalSubscribers}</div>
                <div className="text-[11px] text-slate-400 mt-1">ແພັກເກັດລາຍເດືອນ & ລາຍປີ</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>ເຄຣດິດທັງໝົດໃນລະບົບ</span>
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-yellow-400 font-mono">
                  {totalCreditsIssued.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">ເຄຣດິດຄົງເຫຼືອຂອງທຸກຄົນ</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                  <span>ຍອດຊຳລະສະສົມຜູ້ໃຊ້</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {totalUserSpend.toLocaleString()} <span className="text-sm font-bold">₭</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">ເຕີມຜ່ານ BCEL One</div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາຊື່, ອີເມວ ຫຼື ID ຜູ້ໃຊ້..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={userPlanFilter}
                  onChange={(e) => setUserPlanFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
                >
                  <option value="all">ທຸກແພັກເກັດ (All Plans)</option>
                  <option value="Free Trial">Free Trial</option>
                  <option value="Monthly Pro">Monthly Pro (ລາຍເດືອນ)</option>
                  <option value="Yearly VIP">Yearly VIP (ລາຍປີ)</option>
                  <option value="Pro Creator Pass">Pro Creator Pass</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
                >
                  <option value="all">ທຸກສະຖານະ (All Status)</option>
                  <option value="active">Active (ປົກກະຕິ)</option>
                  <option value="trial">Trial (ທົດລອງ)</option>
                  <option value="suspended">Suspended (ລະງັບ)</option>
                </select>

                <button
                  onClick={fetchUsers}
                  disabled={isLoadingUsers}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                  title="ໂຫຼດຂໍ້ມູນໃໝ່"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">ຜູ້ໃຊ້ (User)</th>
                      <th className="py-3 px-3">ແພັກເກັດ (Plan)</th>
                      <th className="py-3 px-3 text-center">ເຄຣດິດ (Credits)</th>
                      <th className="py-3 px-3">ການໃຊ້ງານ (Usage)</th>
                      <th className="py-3 px-3">ສະຖານະ (Status)</th>
                      <th className="py-3 px-3">ເຂົ້າຫຼ້າສຸດ (Last Login)</th>
                      <th className="py-3 px-4 text-right">ຈັດການ (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          ບໍ່ພົບລາຍຊື່ຜູ້ໃຊ້ທີ່ກົງກັບເງື່ອນໄຂ
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                          {/* User info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              {user.avatar || user.picture ? (
                                <img
                                  src={user.avatar || user.picture}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover ring-1 ring-cyan-400 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-black flex-shrink-0">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-bold text-white flex items-center gap-1.5 truncate">
                                  <span>{user.name}</span>
                                  {user.isOwner && (
                                    <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[9px] font-bold">
                                      Owner
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-400 text-[11px] font-mono truncate">{user.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Plan */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-0.5">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                                  user.plan === "Yearly VIP"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : user.plan === "Monthly Pro"
                                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                    : user.plan === "Pro Creator Pass"
                                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                    : "bg-slate-800 text-slate-300"
                                }`}
                              >
                                {user.plan}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {user.billingCycle === "yearly"
                                  ? "ລາຍປີ (12 ເດືອນ)"
                                  : user.billingCycle === "monthly"
                                  ? "ລາຍເດືອນ"
                                  : "ທົດລອງຟຣີ"}
                              </span>
                            </div>
                          </td>

                          {/* Credits + Quick +/- */}
                          <td className="py-3 px-3 text-center">
                            <div className="inline-flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                              <button
                                onClick={() => handleQuickCreditAdjust(user, -50)}
                                className="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400 flex items-center justify-center font-bold text-xs"
                                title="ຫຼຸດ 50 ເຄຣດິດ"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-mono font-bold text-cyan-400 text-xs px-1">
                                {user.credits}
                              </span>
                              <button
                                onClick={() => handleQuickCreditAdjust(user, 100)}
                                className="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 flex items-center justify-center font-bold text-xs"
                                title="ເພີ່ມ 100 ເຄຣດິດ"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                          {/* Usage */}
                          <td className="py-3 px-3">
                            <div className="text-white font-medium">{user.totalVideosGenerated || 0} ວິດີໂອ</div>
                            <div className="text-[10px] text-emerald-400 font-mono">
                              {(user.totalSpentLAK || 0).toLocaleString()} ₭
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                user.status === "active"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : user.status === "trial"
                                  ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                                  : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                              }`}
                            >
                              {user.status === "active" ? "Active" : user.status === "trial" ? "Trial" : "Suspended"}
                            </span>
                          </td>

                          {/* Last Login */}
                          <td className="py-3 px-3 text-slate-400 text-[11px] font-mono">
                            {new Date(user.lastLoginAt).toLocaleString("lo-LA", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(user)}
                                className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-bold transition-all flex items-center gap-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>ແກ້ໄຂ</span>
                              </button>
                              <button
                                onClick={() => setSelectedUserForHistory(user)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold transition-all flex items-center gap-1"
                              >
                                <History className="w-3 h-3" />
                                <span>ປະຫວັດ</span>
                              </button>
                              {!user.isOwner && (
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-[11px] font-bold transition-all flex items-center gap-1"
                                  title="ລຶບບັນຊີເນື່ອງຈາກລະເມີດເງື່ອນໄຂ (Delete User)"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>ລຶບ</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: OVERVIEW                                                           */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-8 mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-[#12E8FF]/10 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">ຍອດຂາຍລວມທັງໝົດ</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white font-['Noto_Sans']">
                  {transactions.reduce((sum, t) => sum + t.amountLAK, 21547000).toLocaleString()}{" "}
                  <span className="text-red-400 text-xl font-bold">₭</span>
                </div>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-emerald-400 font-semibold">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+18.4% ຈາກເດືອນກ່ອນ</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">ລາຍການຊຳລະ BCEL One</span>
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white font-['Noto_Sans']">
                  {transactions.length + 84}
                  <span className="text-sm font-normal text-slate-400 ml-2">ລາຍການ</span>
                </div>
                <div className="mt-3 text-xs text-slate-400 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                  <span>ສຳເລັດແລ້ວ 100%</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">ວິດີໂອທີ່ຕັດຕໍ່ແລ້ວ</span>
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white font-['Noto_Sans']">
                  1,420
                  <span className="text-sm font-normal text-slate-400 ml-2">ຄລິບ</span>
                </div>
                <div className="mt-3 text-xs text-slate-400">Gemini STT & CapCut Styles</div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider">ຜູ້ໃຊ້ງານ Active</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-white font-['Noto_Sans']">
                  {users.length}
                  <span className="text-sm font-normal text-slate-400 ml-2">ຄົນ</span>
                </div>
                <div className="mt-3 text-xs text-emerald-400">ລົງທະບຽນ ແລະ ລັອກອິນຈິງ</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TRANSACTIONS                                                       */}
        {/* ========================================================================= */}
        {activeTab === "transactions" && (
          <div className="space-y-6 mt-8">
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs">
                <span className="font-bold text-white">ປະຫວັດການຊຳລະເງິນ BCEL One</span>
                <span className="text-slate-400">{transactions.length} ລາຍການ</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">ລູກຄ້າ</th>
                      <th className="py-3 px-4">ແພັກເກັດ</th>
                      <th className="py-3 px-4 text-right">ຈຳນວນເງິນ</th>
                      <th className="py-3 px-4 text-center">ເຄຣດິດ</th>
                      <th className="py-3 px-4">ສະຖານະ</th>
                      <th className="py-3 px-4">ເວລາ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-cyan-400">{tx.orderId}</td>
                        <td className="py-3 px-4 text-white font-medium">{tx.customerName}</td>
                        <td className="py-3 px-4 text-slate-300">{tx.planName}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                          {tx.amountLAK.toLocaleString()} ₭
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-purple-400">
                          +{tx.creditsGiven}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Completed
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                          {new Date(tx.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SETTINGS                                                           */}
        {/* ========================================================================= */}
        {activeTab === "settings" && (
          <div className="max-w-3xl space-y-6 mt-8">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                <span>ຕັ້ງຄ່າບັນຊີຮ້ານ BCEL One & Gemini AI</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1.5">ເລກບັນຊີຮ້ານ BCEL (Merchant Account):</label>
                  <input
                    type="text"
                    value={merchantAccount}
                    onChange={(e) => setMerchantAccount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1.5">ຊື່ບັນຊີຮ້ານ (Merchant Name):</label>
                  <input
                    type="text"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1.5">BCEL One API Gateway Key:</label>
                  <input
                    type="text"
                    value={bcelKey}
                    onChange={(e) => setBcelKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-400 font-mono text-[11px] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1.5">Gemini 3.5 AI Key:</label>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-400 font-mono text-[11px] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    localStorage.setItem("saizup_bcel_account", merchantAccount);
                    localStorage.setItem("saizup_bcel_name", merchantName);
                    showToast("✅ ບັນທຶກການຕັ້ງຄ່າບັນຊີຮ້ານສຳເລັດແລ້ວ!");
                  }}
                  className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold transition-all"
                >
                  ບັນທຶກການຕັ້ງຄ່າ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT USER (ແກ້ໄຂຂໍ້ມູນ & ເຄຣດິດຜູ້ໃຊ້)                               */}
      {/* ========================================================================= */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#11131c] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້</h3>
              </div>
              <button
                onClick={() => setSelectedUserForEdit(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-3.5 text-xs">
              {/* User Identity Banner */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-sm flex-shrink-0">
                  {selectedUserForEdit.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white text-sm truncate">{selectedUserForEdit.name}</div>
                  <div className="font-mono text-slate-400 text-xs truncate">{selectedUserForEdit.email}</div>
                </div>
              </div>

              {/* Credits & Trial Days */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">ເຄຣດິດຄົງເຫຼືອ (Credits):</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editCredits}
                    onChange={(e) => setEditCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">ວັນທົດລອງເຫຼືອ (Trial Days):</label>
                  <input
                    type="number"
                    min={0}
                    value={editTrialDays}
                    onChange={(e) => setEditTrialDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Plan & Billing Cycle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">ແພັກເກັດ (Plan):</label>
                  <select
                    value={editPlan}
                    onChange={(e) => setEditPlan(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="Free Trial">Free Trial</option>
                    <option value="Monthly Pro">Monthly Pro</option>
                    <option value="Yearly VIP">Yearly VIP</option>
                    <option value="Pro Creator Pass">Pro Creator Pass</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">ຮອບບິນ (Billing Cycle):</label>
                  <select
                    value={editBilling}
                    onChange={(e) => setEditBilling(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="none">None (ບໍ່ມີ)</option>
                    <option value="monthly">Monthly (ລາຍເດືອນ)</option>
                    <option value="yearly">Yearly (ລາຍປີ)</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">ສະຖານະບັນຊີ (Status):</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: "active", label: "Active (ປົກກະຕິ)" },
                    { val: "trial", label: "Trial (ທົດລອງ)" },
                    { val: "suspended", label: "Suspended (ລະງັບ)" },
                  ].map((st) => (
                    <button
                      key={st.val}
                      type="button"
                      onClick={() => setEditStatus(st.val as any)}
                      className={`py-1.5 rounded-lg border font-bold text-center transition-all ${
                        editStatus === st.val
                          ? "bg-cyan-500 text-black border-cyan-400 shadow-sm"
                          : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Note */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">ບັນທຶກຂອງເຈົ້າຂອງຮ້ານ (Admin Note):</label>
                <input
                  type="text"
                  placeholder="ເຊັ່ນ: ເຕີມເຄຣດິດເພີ່ມ 200, ອັບເກຣດລາຍປີຜ່ານ BCEL One..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold flex items-center gap-1.5 shadow"
                >
                  {isSavingUser ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>ກຳລັງບັນທຶກ...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>ບັນທຶກການແກ້ໄຂ</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: USER ACTIVITY HISTORY (ປະຫວັດການໃຊ້ງານຂອງຜູ້ໃຊ້)                     */}
      {/* ========================================================================= */}
      {selectedUserForHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#11131c] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">ປະຫວັດການໃຊ້ງານ (Activity History)</h3>
              </div>
              <button
                onClick={() => setSelectedUserForHistory(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info Strip */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between flex-shrink-0">
              <div>
                <div className="font-bold text-white text-xs">{selectedUserForHistory.name}</div>
                <div className="font-mono text-cyan-400 text-[11px]">{selectedUserForHistory.email}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">ເຄຣດິດປັດຈຸບັນ</div>
                <div className="font-mono font-bold text-white text-xs">{selectedUserForHistory.credits} Credits</div>
              </div>
            </div>

            {/* Chronological Activity Feed */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {selectedUserForHistory.activityHistory && selectedUserForHistory.activityHistory.length > 0 ? (
                selectedUserForHistory.activityHistory.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3 text-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white truncate">{act.action}</span>
                        <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">
                          {new Date(act.timestamp).toLocaleString("lo-LA", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{act.detail}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  ຍັງບໍ່ມີປະຫວັດການໃຊ້ງານບັນທຶກໄວ້
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedUserForHistory(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                ປິດໜ້າຕ່າງ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
