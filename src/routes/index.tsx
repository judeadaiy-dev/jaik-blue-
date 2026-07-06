import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
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
    <div className="relative flex min-h-screen items-center justify-center bg-white">
      <img
        src="/icon-192.png"
        alt="جايك"
        className="w-20 h-20 rounded-2xl animate-in fade-in zoom-in duration-500"
      />
    </div>
  );
}
