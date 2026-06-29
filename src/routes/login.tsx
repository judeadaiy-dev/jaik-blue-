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
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) {
      toast.error("فشل تسجيل الدخول", { description: error.message });
      return;
    }
    navigate({ to: "/home" });
  }

  async function handleGoogle() {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) toast.error("تعذر تسجيل الدخول عبر جوجل");
    if (!res.redirected && !res.error) navigate({ to: "/home" });
  }

  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col">
        <div
          className="px-6 pt-12 pb-16 rounded-b-[2.5rem] text-white"
          style={{ background: "var(--gradient-hero)" }}
        >
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/home" });
          }}
          className="-mt-10 mx-5 bg-card rounded-3xl p-6 shadow-[var(--shadow-card)] space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold">البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="h-14 rounded-2xl pr-11 text-base"
                dir="ltr"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pw" className="font-semibold">كلمة المرور</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="pw"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                className="h-14 rounded-2xl pr-11 pl-11 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label="إظهار كلمة المرور"
              >
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="text-left">
              <Link to="/login" className="text-sm text-primary font-medium">نسيت كلمة المرور؟</Link>
            </div>
          </div>
          <Button type="submit" className="w-full h-14 rounded-2xl text-base font-bold">
            تسجيل الدخول
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