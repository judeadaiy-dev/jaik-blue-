import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Star } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/favorites")({
  head: () => ({ meta: [{ title: "المفضلة | جايك" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<{ id: string; business_name: string; service_type: string; rating_avg: number; price: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("favorites").select("providers(id,business_name,service_type,rating_avg,price)").eq("user_id", user.id).then(({ data }) => {
      // @ts-ignore joined
      setItems((data ?? []).map((r) => r.providers).filter(Boolean));
    });
  }, [user]);

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="المفضلة" back="/account" />
        <div className="flex-1 px-5 pb-6 space-y-3">
          {items.length === 0 && (
            <div className="bg-card rounded-3xl p-10 text-center shadow-[var(--shadow-soft)]">
              <Heart className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">لم تضف مزودين للمفضلة بعد</p>
            </div>
          )}
          {items.map((p) => (
            <Link key={p.id} to="/provider-detail/$id" params={{ id: p.id }} className="bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)] flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold ${p.service_type === "water" ? "bg-water" : "bg-gas"}`}>
                {p.business_name.slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="font-bold">{p.business_name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1"><Star className="w-3.5 h-3.5 text-warning fill-warning" /> {p.rating_avg.toFixed(1)} • {p.price.toLocaleString()} د.ع</div>
              </div>
            </Link>
          ))}
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
