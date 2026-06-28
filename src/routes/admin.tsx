import { createFileRoute } from "@tanstack/react-router";
import { Users, Truck, ShieldCheck, Flag, Megaphone, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة الإدارة | جايك" }] }),
  component: AdminPage,
});

const stats = [
  { label: "المستخدمون", value: "1,248", icon: Users, color: "bg-water" },
  { label: "المزودون", value: "84", icon: Truck, color: "bg-success" },
  { label: "الطلبات", value: "5,621", icon: BarChart3, color: "bg-gas" },
];

const actions = [
  { label: "توثيق المزودين", icon: ShieldCheck, badge: "3 جديدة" },
  { label: "إدارة المستخدمين", icon: Users, badge: undefined },
  { label: "إدارة المزودين", icon: Truck, badge: undefined },
  { label: "البلاغات", icon: Flag, badge: "5" },
  { label: "إرسال إشعار عام", icon: Megaphone, badge: undefined },
  { label: "إحصائيات التطبيق", icon: BarChart3, badge: undefined },
];

function AdminPage() {
  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="لوحة الإدارة" back="/account" />
        <div className="flex-1 px-5 pb-6 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)] text-center">
                <div className={`${s.color} text-white w-10 h-10 rounded-2xl mx-auto flex items-center justify-center mb-2`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <div className="text-xl font-extrabold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {actions.map((a) => (
              <button key={a.label} className="bg-card rounded-3xl p-5 shadow-[var(--shadow-soft)] text-right flex flex-col items-start gap-3 active:scale-95 transition-transform">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <a.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold">{a.label}</span>
                  {a.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground font-bold">
                      {a.badge}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}