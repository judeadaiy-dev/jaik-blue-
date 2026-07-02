import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Droplets } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "جايك" },
      { name: "description", content: "تطبيق جايك لتوصيل الماء والغاز إلى باب منزلك." },
      { property: "og:title", content: "جايك" },
      { property: "og:description", content: "الخدمة جايك" },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      navigate({ to: user ? "/home" : "/login" });
    }, 3000);
    return () => clearTimeout(t);
  }, [navigate, user, loading]);
  return (
    <div
      className="relative flex min-h-screen items-center justify-center"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="flex flex-col items-center gap-5 animate-in fade-in duration-700">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-white/20 splash-ripple" />
          <span className="absolute inset-0 rounded-full bg-white/15 splash-ripple [animation-delay:0.6s]" />
          <span className="absolute inset-2 rounded-full bg-white/10 splash-ripple [animation-delay:1.2s]" />
          <div className="relative w-28 h-28 rounded-[2rem] bg-white/95 flex items-center justify-center shadow-[var(--shadow-card)] splash-drop">
            <Droplets className="w-14 h-14 text-primary" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="text-white text-5xl font-extrabold tracking-tight">جايك</h1>
        <p className="text-white/90 text-lg font-medium">الخدمة جايك</p>
        <div className="mt-6 flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white/80 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-white/80 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-white/80 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
