import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, MapPin, LogOut, ChevronLeft, Heart, ShieldCheck, Truck, Phone, Edit2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "حسابي | جايك" }] }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const { user, roles, signOut, loading } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string | null; phone: string | null; gov?: string; area?: string }>({ full_name: null, phone: null });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name,phone,governorates(name_ar),areas(name_ar)")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setProfile({
          full_name: data.full_name,
          phone: data.phone,
          // @ts-expect-error joined
          gov: data.governorates?.name_ar,
          // @ts-expect-error joined
          area: data.areas?.name_ar,
        });
      });
  }, [user]);

  const initials = (profile.full_name ?? user?.email ?? "م").slice(0, 1);

  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="حسابي" />
        <div className="flex-1 px-5 pb-6 space-y-5">
          <div className="bg-card rounded-3xl p-6 shadow-[var(--shadow-soft)] flex items-center gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-white text-3xl font-extrabold" style={{ background: "var(--gradient-hero)" }}>{initials}</div>
            <div className="flex-1 min-w-0">
              <div className="font-extrabold text-xl">{profile.full_name ?? "—"}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1 truncate"><Mail className="w-4 h-4 shrink-0" /> {user?.email}</div>
              {profile.phone && <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="w-4 h-4" /> {profile.phone}</div>}
              {profile.gov && <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-4 h-4" /> {profile.gov} - {profile.area}</div>}
            </div>
          </div>

          <div className="bg-card rounded-3xl shadow-[var(--shadow-soft)] divide-y divide-border">
            <Link to="/onboarding" className="flex items-center gap-3 p-4">
              <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center"><MapPin className="w-5 h-5" /></div>
              <div className="flex-1 font-semibold">تغيير المحافظة والمنطقة</div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link to="/favorites" className="flex items-center gap-3 p-4">
              <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center"><Heart className="w-5 h-5" /></div>
              <div className="flex-1 font-semibold">المفضلة</div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>

          {roles.includes("provider") && (
            <Link to="/provider" className="bg-card rounded-3xl shadow-[var(--shadow-soft)] flex items-center gap-3 p-4">
              <div className="w-11 h-11 rounded-2xl bg-success/10 text-success flex items-center justify-center"><Truck className="w-5 h-5" /></div>
              <div className="flex-1 font-bold">لوحة المزود</div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </Link>
          )}

          {!roles.includes("provider") && (
            <Link to="/provider-setup" className="bg-card rounded-3xl shadow-[var(--shadow-soft)] flex items-center gap-3 p-4">
              <div className="w-11 h-11 rounded-2xl bg-success/10 text-success flex items-center justify-center"><Edit2 className="w-5 h-5" /></div>
              <div className="flex-1 font-bold">سجّل كمزود خدمة</div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </Link>
          )}

          {roles.includes("admin") && (
            <Link to="/admin" className="bg-card rounded-3xl shadow-[var(--shadow-soft)] flex items-center gap-3 p-4">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
              <div className="flex-1 font-bold">لوحة الإدارة</div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </Link>
          )}

          <button onClick={signOut} className="w-full bg-card rounded-3xl shadow-[var(--shadow-soft)] flex items-center gap-3 p-4 text-destructive font-bold">
            <div className="w-11 h-11 rounded-2xl bg-destructive/10 flex items-center justify-center"><LogOut className="w-5 h-5" /></div>
            تسجيل الخروج
          </button>

          <div className="text-center text-xs text-muted-foreground pt-2">
            جميع الحقوق محفوظة © {new Date().getFullYear()}<br />
            <span className="font-bold text-foreground">شركة Blue للتقنية</span> — المطور: استبرق
          </div>
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
