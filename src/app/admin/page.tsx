import AdminDashboard from "@/components/admin/AdminDashboard";
import Navbar from "@/components/landing/Navbar";
import { LandingLanguageProvider } from "@/components/landing/LanguageContext";

export const metadata = {
  title: "SAIZUP AI - Backoffice & Sales Monitor (ລະບົບຫຼັງບ້ານ)",
  description: "Monitor BCEL One revenue, credit transactions, and manage Gemini AI settings.",
};

export default function AdminPage() {
  return (
    <LandingLanguageProvider>
      <main className="min-h-screen bg-[#07080d]">
        <Navbar />
        <AdminDashboard />
      </main>
    </LandingLanguageProvider>
  );
}
