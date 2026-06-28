import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MapPin, Globe, Moon, LogOut, ChevronLeft, Heart, Shield, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "حسابي | جايك" }] }),
  component: AccountPage,
});

function AccountPage() {
  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="حسابي" />
        <div className="flex-1 px-5 pb-6 space-y-5">
          <div className="bg-card rounded-3xl p-6 shadow-[var(--shadow-soft)] flex items-center gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-white text-3xl font-extrabold" style={{ background: "var(--gradient-hero)" }}>
              م
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-xl">محمد أحمد</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Mail className="w-4 h-4" /> mohammed@example.com
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-4 h-4" /> صنعاء - حدة
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl shadow-[var(--shadow-soft)] divide-y divide-border">
            <Row icon={<Heart className="w-5 h-5" />} label="المفضلة" trailing={<ChevronLeft className="w-4 h-4 text-muted-foreground" />} />
            <Row icon={<Shield className="w-5 h-5" />} label="الخصوصية والأمان" trailing={<ChevronLeft className="w-4 h-4 text-muted-foreground" />} />
            <Row icon={<Globe className="w-5 h-5" />} label="اللغة" trailing={<span className="text-sm text-muted-foreground">العربية</span>} />
            <Row icon={<Moon className="w-5 h-5" />} label="الوضع الداكن" trailing={<Switch />} />
          </div>

          <Link to="/admin" className="bg-card rounded-3xl shadow-[var(--shadow-soft)] flex items-center gap-3 p-4">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 font-bold">لوحة الإدارة</div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </Link>

          <Link to="/login" className="bg-card rounded-3xl shadow-[var(--shadow-soft)] flex items-center gap-3 p-4 text-destructive font-bold">
            <div className="w-11 h-11 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            تسجيل الخروج
          </Link>

          <Link to="/provider" className="block text-center text-sm text-muted-foreground underline">
            معاينة شاشات مزود الخدمة ←
          </Link>
        </div>
        <BottomNav />
      </div>
    </div>
  );
}

function Row({ icon, label, trailing }: { icon: React.ReactNode; label: string; trailing: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center text-foreground">{icon}</div>
      <div className="flex-1 font-semibold">{label}</div>
      {trailing}
    </div>
  );
}