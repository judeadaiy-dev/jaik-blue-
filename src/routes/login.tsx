import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "تسجيل الدخول | جايك بلو" }] }),
  component: LoginPage,
});

type Lang = "ar" | "ku";
const T: Record<Lang, Record<string, string>> = {
  ar: {
    brand: "جايك بلو",
    tagline: "خدماتك… بلمسة واحدة",
    welcome: "مرحباً بعودتك",
    sub: "سجّل دخولك للمتابعة",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    login: "تسجيل الدخول",
    google: "متابعة عبر جوجل",
    noAcc: "ليس لديك حساب؟",
    create: "إنشاء حساب",
    forgot: "نسيت كلمة المرور؟",
    or: "أو",
  },
  ku: {
    brand: "جایک بلوو",
    tagline: "خزمەتگوزارییەکانت… بە یەک کلیک",
    welcome: "بەخێربێیتەوە",
    sub: "بۆ بەردەوامبوون بچۆرە ژوورەوە",
    email: "ئیمەیڵ",
    password: "وشەی نهێنی",
    login: "چوونەژوورەوە",
    google: "بەردەوامبوون بە گووگڵ",
    noAcc: "هەژمارت نییە؟",
    create: "دروستکردنی هەژمار",
    forgot: "وشەی نهێنیت بیرچووە؟",
    or: "یان",
  },
};

function LoginPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>("ar");
  const t = T[lang];
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
    toast.success(t.welcome);
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
    <div className="min-h-screen w-full bg-background flex justify-center" dir="rtl">
      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col">
        {/* Hero */}
        <div className="relative px-6 pt-10 pb-20 rounded-b-[2.75rem] text-white overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -right-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex items-center justify-between">
            <div className="inline-flex items-center gap-1 bg-white/15 backdrop-blur rounded-full p-1 text-xs font-bold">
              <button type="button" onClick={() => setLang("ar")} className={`px-3 py-1.5 rounded-full transition ${lang === "ar" ? "bg-white text-primary" : "text-white/90"}`}>العربية</button>
              <button type="button" onClick={() => setLang("ku")} className={`px-3 py-1.5 rounded-full transition ${lang === "ku" ? "bg-white text-primary" : "text-white/90"}`}>کوردی</button>
            </div>
            <Globe className="w-5 h-5 opacity-70" />
          </div>

          <div className="relative mt-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/95 flex items-center justify-center shadow-lg">
              <img src="/icon-192.png" alt={t.brand} className="w-14 h-14 rounded-2xl" />
            </div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight">{t.brand}</h1>
            <p className="text-white/85 text-sm mt-1">{t.tagline}</p>
          </div>

          <div className="relative mt-8 text-center">
            <h2 className="text-xl font-bold">{t.welcome}</h2>
            <p className="text-white/80 text-sm mt-1">{t.sub}</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="-mt-12 mx-5 bg-card rounded-3xl p-6 shadow-[var(--shadow-card)] space-y-5 relative z-10">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold text-sm">{t.email}</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="h-14 rounded-2xl pr-11" dir="ltr" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pw" className="font-semibold text-sm">{t.password}</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input id="pw" type={showPw ? "text" : "password"} required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" className="h-14 rounded-2xl pr-11 pl-11" />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="show password">
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="text-left">
              <button type="button" className="text-xs text-primary font-semibold">{t.forgot}</button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl text-base font-bold shadow-md">
            {loading ? "..." : t.login}
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">{t.or}</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <Button type="button" variant="outline" onClick={handleGoogle} className="w-full h-14 rounded-2xl text-base font-bold flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {t.google}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            {t.noAcc}{" "}
            <Link to="/register" className="text-primary font-bold">{t.create}</Link>
          </div>
        </form>
        <div className="flex-1" />
      </div>
    </div>
  );
}