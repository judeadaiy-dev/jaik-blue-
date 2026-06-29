import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Droplets } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

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
    }, 1500);
    return () => clearTimeout(t);
  }, [navigate, user, loading]);
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="flex flex-col items-center gap-5 animate-in fade-in zoom-in duration-700">
        <div className="w-28 h-28 rounded-[2rem] bg-white/95 flex items-center justify-center shadow-[var(--shadow-card)]">
          <Droplets className="w-14 h-14 text-primary" strokeWidth={2.5} />
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
