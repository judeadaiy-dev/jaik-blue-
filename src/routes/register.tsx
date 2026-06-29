import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { User, Truck, Mail, Lock, UserCircle2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "إنشاء حساب | جايك" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"user" | "provider">("user");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pw,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: name, phone },
      },
    });
    if (error) {
      setLoading(false);
      return toast.error("فشل إنشاء الحساب", { description: error.message });
    }
    // If user picked provider, also add 'provider' role
    if (role === "provider" && data.user) {
      await supabase.from("user_roles").insert({ user_id: data.user.id, role: "provider" });
    }
    setLoading(false);
    toast.success("تم إنشاء حسابك", { description: "أكمل بياناتك للبدء" });
    navigate({ to: role === "provider" ? "/provider-setup" : "/onboarding" });
  }

  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col px-6 pt-10 pb-10">
        <h1 className="text-3xl font-extrabold">إنشاء حساب</h1>
        <p className="text-muted-foreground mt-1">اختر نوع الحساب للمتابعة</p>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <RoleCard active={role === "user"} onClick={() => setRole("user")} color="water" icon={<User className="w-8 h-8" />} title="مستخدم" desc="أطلب الخدمات" />
          <RoleCard active={role === "provider"} onClick={() => setRole("provider")} color="success" icon={<Truck className="w-8 h-8" />} title="مزود خدمة" desc="قدّم الخدمات" />
        </div>

        <form onSubmit={handleSubmit} className="mt-6 bg-card rounded-3xl p-6 shadow-[var(--shadow-card)] space-y-4">
          <Field icon={<UserCircle2 className="w-5 h-5" />} label="الاسم الكامل" placeholder="محمد أحمد" value={name} onChange={setName} required />
          <Field icon={<Phone className="w-5 h-5" />} label="رقم الهاتف" placeholder="07XXXXXXXXX" value={phone} onChange={setPhone} ltr required />
          <Field icon={<Mail className="w-5 h-5" />} label="البريد الإلكتروني" type="email" placeholder="name@example.com" value={email} onChange={setEmail} ltr required />
          <Field icon={<Lock className="w-5 h-5" />} label="كلمة المرور" type="password" placeholder="••••••••" value={pw} onChange={setPw} required />
          <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl text-base font-bold mt-2">
            {loading ? "..." : "متابعة"}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            لديك حساب؟ <Link to="/login" className="text-primary font-bold">تسجيل الدخول</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function RoleCard({ active, onClick, color, icon, title, desc }: { active: boolean; onClick: () => void; color: "water" | "success"; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button type="button" onClick={onClick} className={cn("rounded-3xl p-5 text-right border-2 transition-all bg-card", active ? "border-primary shadow-[var(--shadow-card)] scale-[1.02]" : "border-transparent shadow-[var(--shadow-soft)]")}>
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-3", color === "water" ? "bg-water" : "bg-success")}>{icon}</div>
      <div className="font-bold text-lg">{title}</div>
      <div className="text-sm text-muted-foreground">{desc}</div>
    </button>
  );
}

function Field({ icon, label, placeholder, type = "text", ltr, value, onChange, required }: { icon: React.ReactNode; label: string; placeholder: string; type?: string; ltr?: boolean; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div className="space-y-2">
      <Label className="font-semibold">{label}</Label>
      <div className="relative">
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <Input type={type} required={required} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} dir={ltr ? "ltr" : undefined} className="h-14 rounded-2xl pr-11 text-base" />
      </div>
    </div>
  );
}
