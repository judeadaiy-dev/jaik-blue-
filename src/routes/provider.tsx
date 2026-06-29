import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, Star, CheckCircle, Edit2, ListOrdered } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/provider")({
  head: () => ({ meta: [{ title: "لوحة المزود | جايك" }] }),
  component: ProviderDashboard,
});

interface Stats { total: number; today: number; delivered: number; rating: number; ratingCount: number }

function ProviderDashboard() {
  const navigate = useNavigate();
  const { user, roles, loading } = useAuth();
  const [prov, setProv] = useState<{ id: string; business_name: string; is_available: boolean; status: string } | null>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0, delivered: 0, rating: 0, ratingCount: 0 });

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    if (!roles.includes("provider")) { navigate({ to: "/provider-setup" }); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, roles, loading]);

  async function load() {
    if (!user) return;
    const { data: p } = await supabase.from("providers").select("id,business_name,is_available,status,rating_avg,rating_count").eq("user_id", user.id).maybeSingle();
    if (!p) { navigate({ to: "/provider-setup" }); return; }
    setProv(p);
    const today = new Date(); today.setHours(0,0,0,0);
    const { count: totalC } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("provider_id", p.id);
    const { count: todayC } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("provider_id", p.id).gte("created_at", today.toISOString());
    const { count: doneC } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("provider_id", p.id).eq("status", "delivered");
    setStats({ total: totalC ?? 0, today: todayC ?? 0, delivered: doneC ?? 0, rating: p.rating_avg ?? 0, ratingCount: p.rating_count ?? 0 });
  }

  async function toggleAvailable(v: boolean) {
    if (!prov) return;
    setProv({ ...prov, is_available: v });
    const { error } = await supabase.from("providers").update({ is_available: v }).eq("id", prov.id);
    if (error) toast.error(error.message);
    else toast.success(v ? "أنت متاح الآن" : "تم إيقاف الاستلام");
  }

  if (!prov) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">جارٍ التحميل...</div>;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="لوحة المزود" back="/account" />
        <div className="flex-1 px-5 pb-6 space-y-5">
          <div className="rounded-3xl p-6 text-white shadow-[var(--shadow-card)]" style={{ background: "var(--gradient-hero)" }}>
            <div className="text-white/85 text-sm">{prov.business_name}</div>
            {prov.status !== "active" && <div className="mt-1 text-xs bg-warning/30 inline-block px-2 py-0.5 rounded-full">بانتظار توثيق الإدارة</div>}
            <div className="mt-4 flex items-center justify-between bg-white/15 rounded-2xl p-3">
              <div>
                <div className="font-extrabold text-lg">متاح الآن</div>
                <div className="text-white/85 text-xs">{prov.is_available ? "تستقبل الطلبات" : "متوقف عن استقبال الطلبات"}</div>
              </div>
              <Switch checked={prov.is_available} onCheckedChange={toggleAvailable} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatCard label="اليوم" value={stats.today} icon={Package} color="bg-water" />
            <StatCard label="مكتملة" value={stats.delivered} icon={CheckCircle} color="bg-success" />
            <StatCard label="التقييم" value={`${stats.rating.toFixed(1)} ⭐`} icon={Star} color="bg-warning" />
          </div>

          <Link to="/provider/active" className="bg-card rounded-3xl shadow-[var(--shadow-soft)] flex items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><ListOrdered className="w-6 h-6" /></div>
            <div className="flex-1">
              <div className="font-bold">إدارة الطلبات</div>
              <div className="text-xs text-muted-foreground">قبول، رفض، تحديث حالة التوصيل</div>
            </div>
            <span className="text-2xl font-extrabold text-primary">{stats.total}</span>
          </Link>

          <Link to="/provider-setup" className="bg-card rounded-3xl shadow-[var(--shadow-soft)] flex items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center"><Edit2 className="w-5 h-5" /></div>
            <div className="flex-1 font-bold">تعديل بياناتي والسعر والموقع</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: typeof Package; color: string }) {
  return (
    <div className="bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)] text-center">
      <div className={`${color} text-white w-10 h-10 rounded-2xl mx-auto flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-lg font-extrabold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
