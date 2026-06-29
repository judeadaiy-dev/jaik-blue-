import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Phone, MessageCircle, Check, X, Truck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/provider/active")({
  head: () => ({ meta: [{ title: "الطلبات | جايك" }] }),
  component: ProviderActivePage,
});

interface Order {
  id: string;
  status: string;
  price: number;
  quantity: number;
  service_type: "water" | "gas";
  address: string | null;
  notes: string | null;
  user_id: string;
  created_at: string;
  profiles: { full_name: string | null; phone: string | null } | null;
}

function ProviderActivePage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [providerId, setProviderId] = useState<string | null>(null);

  async function load(pid: string) {
    const { data } = await supabase
      .from("orders")
      .select("id,status,price,quantity,service_type,address,notes,user_id,created_at,profiles(full_name,phone)")
      .eq("provider_id", pid)
      .in("status", ["pending", "accepted", "on_the_way"])
      .order("created_at", { ascending: false });
    setOrders((data ?? []) as unknown as Order[]);
  }

  useEffect(() => {
    if (!user) return;
    supabase.from("providers").select("id").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (!data) return;
      setProviderId(data.id);
      load(data.id);
      const ch = supabase
        .channel(`prov-orders-${data.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `provider_id=eq.${data.id}` }, () => load(data.id))
        .subscribe();
      return () => { supabase.removeChannel(ch); };
    });
  }, [user]);

  async function setStatus(o: Order, status: "accepted" | "on_the_way" | "delivered" | "rejected") {
    const { error } = await supabase.from("orders").update({ status }).eq("id", o.id);
    if (error) return toast.error(error.message);
    // notify customer
    const map: Record<typeof status, string> = { accepted: "تم قبول طلبك", on_the_way: "المزود في الطريق", delivered: "تم تسليم طلبك", rejected: "تم رفض الطلب" };
    await supabase.from("notifications").insert({ user_id: o.user_id, title: map[status], body: `طلب #${o.id.slice(0,8)}`, type: "order_update", related_order_id: o.id });
    toast.success(map[status]);
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="إدارة الطلبات" back="/provider" />
        <div className="flex-1 px-5 pb-6 space-y-3">
          {orders.length === 0 && <div className="bg-card rounded-3xl p-10 text-center text-muted-foreground shadow-[var(--shadow-soft)]">لا توجد طلبات حالياً</div>}
          {orders.map((o) => (
            <div key={o.id} className="bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)] space-y-3">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold ${o.service_type === "water" ? "bg-water" : "bg-gas"}`}>
                  {o.service_type === "water" ? "💧" : "🔥"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold">{o.profiles?.full_name ?? "عميل"}</div>
                  <div className="text-xs text-muted-foreground">#{o.id.slice(0, 8)} • {o.quantity}× • {o.price.toLocaleString()} د.ع</div>
                  {o.address && <div className="text-sm mt-1">📍 {o.address}</div>}
                  {o.notes && <div className="text-xs text-muted-foreground mt-0.5">💬 {o.notes}</div>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {o.profiles?.phone && (
                  <>
                    <a href={`tel:${o.profiles.phone}`} className="rounded-xl h-10 w-10 flex items-center justify-center border border-input"><Phone className="w-4 h-4" /></a>
                    <a href={`https://wa.me/${o.profiles.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="rounded-xl h-10 w-10 flex items-center justify-center border border-input text-success"><MessageCircle className="w-4 h-4" /></a>
                  </>
                )}
                <div className="flex-1" />
                {o.status === "pending" && (
                  <>
                    <Button onClick={() => setStatus(o, "rejected")} variant="outline" className="rounded-xl h-10 px-3 text-destructive border-destructive/40"><X className="w-4 h-4 ml-1" /> رفض</Button>
                    <Button onClick={() => setStatus(o, "accepted")} className="rounded-xl h-10 px-3"><Check className="w-4 h-4 ml-1" /> قبول</Button>
                  </>
                )}
                {o.status === "accepted" && (
                  <Button onClick={() => setStatus(o, "on_the_way")} className="rounded-xl h-10 px-3"><Truck className="w-4 h-4 ml-1" /> في الطريق</Button>
                )}
                {o.status === "on_the_way" && (
                  <Button onClick={() => setStatus(o, "delivered")} className="rounded-xl h-10 px-3 bg-success hover:bg-success/90"><Check className="w-4 h-4 ml-1" /> تم التسليم</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
