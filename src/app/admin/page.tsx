import AdminDashboard from "@/components/admin/AdminDashboard";
import Navbar from "@/components/landing/Navbar";

export const metadata = {
  title: "SAIZUP AI - Backoffice & Sales Monitor (ລະບົບຫຼັງບ້ານ)",
  description: "Monitor BCEL One revenue, credit transactions, and manage Gemini AI settings.",
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#07080d]">
      <Navbar />
      <AdminDashboard />
    </main>
  );
}
