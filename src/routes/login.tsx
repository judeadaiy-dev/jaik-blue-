import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Droplets, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "تسجيل الدخول | جايك" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) return toast.error("فشل تسجيل الدخول", { description: error.message });
    toast.success("مرحباً بعودتك");
    // route based on role
    const userId = data.user?.id;
    if (userId) {
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      const isProvider = (roles ?? []).some((r: { role: string }) => r.role === "provider");
      navigate({ to: isProvider ? "/provider" : "/home" });
    } else {
      navigate({ to: "/home" });
    }
  }

  async function handleGoogle() {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) toast.error("تعذر تسجيل الدخول عبر جوجل");
    else if (!res.redirected) navigate({ to: "/home" });
  }

  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col">
        <div className="px-6 pt-12 pb-16 rounded-b-[2.5rem] text-white" style={{ background: "var(--gradient-hero)" }}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/95 flex items-center justify-center">
              <Droplets className="w-7 h-7 text-primary" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">جايك</h1>
              <p className="text-white/80 text-sm">الخدمة جايك</p>
            </div>
          </div>
          <h2 className="mt-8 text-2xl font-bold">مرحباً بعودتك</h2>
          <p className="text-white/80 mt-1">سجل دخولك للمتابعة</p>
        </div>

        <form onSubmit={handleLogin} className="-mt-10 mx-5 bg-card rounded-3xl p-6 shadow-[var(--shadow-card)] space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold">البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="h-14 rounded-2xl pr-11" dir="ltr" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pw" className="font-semibold">كلمة المرور</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input id="pw" type={showPw ? "text" : "password"} required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" className="h-14 rounded-2xl pr-11 pl-11" />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="إظهار كلمة المرور">
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl text-base font-bold">
            {loading ? "..." : "تسجيل الدخول"}
          </Button>
          <Button type="button" variant="outline" onClick={handleGoogle} className="w-full h-14 rounded-2xl text-base font-bold flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            متابعة عبر جوجل
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link to="/register" className="text-primary font-bold">إنشاء حساب</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
