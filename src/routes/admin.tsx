import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Truck, ShieldCheck, Flag, BarChart3, Star, Ban, CheckCircle, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "لوحة الإدارة | جايك" }] }),
  component: AdminPage,
});

interface ProviderRow {
  id: string;
  business_name: string;
  service_type: string;
  status: string;
  is_featured: boolean;
  rating_avg: number;
  phone: string;
}

function AdminPage() {
  const navigate = useNavigate();
  const { roles, loading } = useAuth();
  const [stats, setStats] = useState({ users: 0, providers: 0, orders: 0 });
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [filter, setFilter] = useState<"pending_approval" | "active" | "suspended" | "banned">("pending_approval");

  useEffect(() => {
    if (loading) return;
    if (!roles.includes("admin")) { navigate({ to: "/home" }); return; }
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles, loading]);

  useEffect(() => { if (roles.includes("admin")) loadProviders(); }, [filter, roles]);

  async function loadStats() {
    const { count: u } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    const { count: p } = await supabase.from("providers").select("*", { count: "exact", head: true });
    const { count: o } = await supabase.from("orders").select("*", { count: "exact", head: true });
    setStats({ users: u ?? 0, providers: p ?? 0, orders: o ?? 0 });
  }

  async function loadProviders() {
    const { data } = await supabase.from("providers").select("id,business_name,service_type,status,is_featured,rating_avg,phone").eq("status", filter).order("created_at", { ascending: false });
    setProviders((data ?? []) as ProviderRow[]);
  }

  async function setStatus(id: string, status: "active" | "suspended" | "banned") {
    const { error } = await supabase.from("providers").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم التحديث");
    loadProviders();
    loadStats();
  }

  async function toggleFeatured(id: string, val: boolean) {
    const { error } = await supabase.from("providers").update({ is_featured: val }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(val ? "تم ترقيته" : "تم إلغاء الترقية");
    loadProviders();
  }

  async function remove(id: string) {
    if (!confirm("حذف هذا المزود نهائياً؟")) return;
    const { error } = await supabase.from("providers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    loadProviders();
    loadStats();
  }

  if (!roles.includes("admin")) return null;

  const tabs: { key: typeof filter; label: string }[] = [
    { key: "pending_approval", label: "بانتظار التوثيق" },
    { key: "active", label: "النشطون" },
    { key: "suspended", label: "موقوفون" },
    { key: "banned", label: "محظورون" },
  ];

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="لوحة الإدارة" back="/account" />
        <div className="flex-1 px-5 pb-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="المستخدمون" value={stats.users} icon={Users} color="bg-water" />
            <StatCard label="المزودون" value={stats.providers} icon={Truck} color="bg-success" />
            <StatCard label="الطلبات" value={stats.orders} icon={BarChart3} color="bg-gas" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setFilter(t.key)} className={`shrink-0 px-4 h-10 rounded-2xl text-sm font-bold ${filter === t.key ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {providers.length === 0 && <div className="bg-card rounded-3xl p-10 text-center text-muted-foreground">لا يوجد</div>}
            {providers.map((p) => (
              <div key={p.id} className="bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold ${p.service_type === "water" ? "bg-water" : "bg-gas"}`}>
                    {p.business_name.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold flex items-center gap-1.5">
                      {p.business_name}
                      {p.is_featured && <Star className="w-3.5 h-3.5 text-warning fill-warning" />}
                    </div>
                    <div className="text-xs text-muted-foreground">{p.phone} • ⭐ {p.rating_avg.toFixed(1)}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {p.status !== "active" && <Button size="sm" className="rounded-xl h-9" onClick={() => setStatus(p.id, "active")}><CheckCircle className="w-4 h-4 ml-1" /> توثيق</Button>}
                  {p.status === "active" && (
                    <>
                      <Button size="sm" variant="outline" className="rounded-xl h-9" onClick={() => toggleFeatured(p.id, !p.is_featured)}>
                        <Star className="w-4 h-4 ml-1" /> {p.is_featured ? "إلغاء الترقية" : "ترقية"}
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-xl h-9" onClick={() => setStatus(p.id, "suspended")}>إيقاف</Button>
                    </>
                  )}
                  <Button size="sm" variant="outline" className="rounded-xl h-9 text-destructive border-destructive/30" onClick={() => setStatus(p.id, "banned")}>
                    <Ban className="w-4 h-4 ml-1" /> حظر
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-xl h-9 text-destructive border-destructive/30" onClick={() => remove(p.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof Users; color: string }) {
  return (
    <div className="bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)] text-center">
      <div className={`${color} text-white w-10 h-10 rounded-2xl mx-auto flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-xl font-extrabold">{value.toLocaleString()}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
