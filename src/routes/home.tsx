import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Droplets, Flame, Star, Phone } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { SideMenu } from "@/components/SideMenu";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "الرئيسية | جايك" }] }),
  component: HomePage,
});

interface Provider {
  id: string;
  business_name: string;
  service_type: "water" | "gas";
  price: number;
  phone: string;
  whatsapp: string | null;
  is_available: boolean;
  rating_avg: number;
  rating_count: number;
  is_featured: boolean;
}

function HomePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<{ governorate_id: number | null; area_id: number | null; governorate?: string; area?: string } | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filter, setFilter] = useState<"all" | "water" | "gas">("all");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("governorate_id, area_id, governorates(name_ar), areas(name_ar)")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        if (!data.governorate_id || !data.area_id) {
          navigate({ to: "/onboarding" });
          return;
        }
        setProfile({
          governorate_id: data.governorate_id,
          area_id: data.area_id,
          // @ts-ignore joined
          governorate: data.governorates?.name_ar,
          // @ts-ignore joined
          area: data.areas?.name_ar,
        });
      });
  }, [user, navigate]);

  useEffect(() => {
    if (!profile?.area_id) return;
    let q = supabase
      .from("providers")
      .select("id,business_name,service_type,price,phone,whatsapp,is_available,rating_avg,rating_count,is_featured")
      .eq("status", "active")
      .eq("area_id", profile.area_id)
      .order("is_featured", { ascending: false })
      .order("is_available", { ascending: false })
      .order("rating_avg", { ascending: false });
    if (filter !== "all") q = q.eq("service_type", filter);
    q.then(({ data }) => setProviders((data ?? []) as Provider[]));
  }, [profile?.area_id, filter]);

  const waterCount = providers.filter((p) => p.service_type === "water").length;
  const gasCount = providers.filter((p) => p.service_type === "gas").length;

  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col">
        <div className="px-5 pt-10 pb-20 rounded-b-[2.5rem] text-white relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute right-10 top-6 w-16 h-16 rounded-full bg-white/10" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-white/80 text-xs">موقعك الحالي</p>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="w-5 h-5" />
                <span className="font-bold text-lg">{profile?.governorate ?? "..."} - {profile?.area ?? "..."}</span>
              </div>
              <Link to="/onboarding" className="text-xs text-white/80 underline mt-1 block">تغيير الموقع</Link>
            </div>
            <SideMenu />
          </div>
          <h2 className="relative mt-6 text-2xl font-extrabold">مرحباً بك في جايك 👋</h2>
          <p className="relative text-white/90 text-sm mt-1">اختر الخدمة وشاهد المزودين المتوفرين</p>
        </div>

        <div className="flex-1 px-5 -mt-14 pb-4 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <FilterCard active={filter === "water" || filter === "all"} title="الماء" subtitle={`${waterCount} مزود`} icon={<Droplets className="w-8 h-8" />} gradient="var(--gradient-water)" onClick={() => setFilter(filter === "water" ? "all" : "water")} />
            <FilterCard active={filter === "gas" || filter === "all"} title="الغاز" subtitle={`${gasCount} مزود`} icon={<Flame className="w-8 h-8" />} gradient="var(--gradient-gas)" onClick={() => setFilter(filter === "gas" ? "all" : "gas")} />
          </div>

          <section>
            <h3 className="font-extrabold text-lg mb-3">المزودون في منطقتك</h3>
            {providers.length === 0 ? (
              <div className="bg-card rounded-3xl p-8 text-center shadow-[var(--shadow-soft)]">
                <p className="text-muted-foreground">لا يوجد مزودون متاحون في منطقتك حالياً</p>
                <p className="text-xs text-muted-foreground mt-2">سيتم عرضهم هنا فور توثيقهم</p>
              </div>
            ) : (
              <div className="space-y-3">
                {providers.map((p) => <ProviderCard key={p.id} p={p} />)}
              </div>
            )}
          </section>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}

function FilterCard({ active, title, subtitle, icon, gradient, onClick }: { active: boolean; title: string; subtitle: string; icon: React.ReactNode; gradient: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-3xl p-5 text-white shadow-[var(--shadow-card)] flex flex-col gap-2 active:scale-95 transition-transform ${active ? "" : "opacity-50"}`} style={{ background: gradient }}>
      <div className="w-12 h-12 rounded-2xl bg-white/25 flex items-center justify-center">{icon}</div>
      <div className="text-right">
        <div className="font-extrabold text-lg leading-tight">{title}</div>
        <div className="text-white/85 text-sm">{subtitle}</div>
      </div>
    </button>
  );
}

function ProviderCard({ p }: { p: Provider }) {
  const initials = p.business_name.slice(0, 2);
  return (
    <Link to="/provider-detail/$id" params={{ id: p.id }} className="bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)] flex items-center gap-3 active:scale-[0.98] transition-transform">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl ${p.service_type === "water" ? "bg-water" : "bg-gas"}`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <div className="font-bold truncate">{p.business_name}</div>
          {p.is_featured && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning text-white font-bold">مميز</span>}
        </div>
        <div className="flex items-center gap-2 mt-1 text-sm">
          <span className="flex items-center gap-0.5 text-warning">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-semibold text-foreground">{p.rating_avg.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({p.rating_count})</span>
          </span>
          <span className="text-muted-foreground">•</span>
          <span className={p.is_available ? "text-success font-semibold" : "text-muted-foreground"}>
            {p.is_available ? "متاح الآن" : "غير متاح"}
          </span>
        </div>
        <div className="text-sm font-bold text-primary mt-0.5">{p.price.toLocaleString()} د.ع</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Button asChild size="sm" className="rounded-xl h-9 px-4 font-bold" disabled={!p.is_available}>
          <span>اطلب</span>
        </Button>
        <a href={`tel:${p.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center justify-center rounded-xl h-9 px-4 border border-input bg-card">
          <Phone className="w-4 h-4" />
        </a>
      </div>
    </Link>
  );
}
