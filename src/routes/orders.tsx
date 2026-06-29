import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, Droplets, Flame } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "طلباتي | جايك" }] }),
  component: OrdersPage,
});

interface Order {
  id: string;
  status: string;
  service_type: "water" | "gas";
  price: number;
  quantity: number;
  created_at: string;
  providers: { business_name: string } | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "بانتظار القبول", color: "bg-warning/20 text-warning" },
  accepted: { label: "تم القبول", color: "bg-water/20 text-water" },
  on_the_way: { label: "في الطريق", color: "bg-primary/20 text-primary" },
  delivered: { label: "تم التسليم", color: "bg-success/20 text-success" },
  cancelled: { label: "ملغي", color: "bg-destructive/20 text-destructive" },
  rejected: { label: "مرفوض", color: "bg-destructive/20 text-destructive" },
};

function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id,status,service_type,price,quantity,created_at,providers(business_name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as unknown as Order[]));
  }, [user]);

  const ongoing = orders.filter((o) => ["pending", "accepted", "on_the_way"].includes(o.status));
  const done = orders.filter((o) => o.status === "delivered");
  const cancelled = orders.filter((o) => ["cancelled", "rejected"].includes(o.status));

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="طلباتي" />
        <Tabs defaultValue="ongoing" className="flex-1 flex flex-col px-5">
          <TabsList className="grid grid-cols-3 rounded-2xl h-12 bg-muted">
            <TabsTrigger value="ongoing" className="rounded-xl">جارية ({ongoing.length})</TabsTrigger>
            <TabsTrigger value="done" className="rounded-xl">مكتملة ({done.length})</TabsTrigger>
            <TabsTrigger value="cancelled" className="rounded-xl">ملغية ({cancelled.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="ongoing" className="mt-4 space-y-3"><List orders={ongoing} empty="لا طلبات جارية" /></TabsContent>
          <TabsContent value="done" className="mt-4 space-y-3"><List orders={done} empty="لا طلبات مكتملة" /></TabsContent>
          <TabsContent value="cancelled" className="mt-4 space-y-3"><List orders={cancelled} empty="لا طلبات ملغية" /></TabsContent>
        </Tabs>
        <BottomNav />
      </div>
    </div>
  );
}

function List({ orders, empty }: { orders: Order[]; empty: string }) {
  if (orders.length === 0)
    return (
      <div className="bg-card rounded-3xl p-8 text-center shadow-[var(--shadow-soft)]">
        <Package className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">{empty}</p>
      </div>
    );
  return (
    <>
      {orders.map((o) => {
        const st = STATUS_LABELS[o.status] ?? { label: o.status, color: "bg-muted" };
        return (
          <Link key={o.id} to="/tracking/$id" params={{ id: o.id }} className="bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)] flex items-center gap-3 active:scale-[0.98] transition-transform">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${o.service_type === "water" ? "bg-water" : "bg-gas"}`}>
              {o.service_type === "water" ? <Droplets className="w-6 h-6" /> : <Flame className="w-6 h-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{o.providers?.business_name ?? "—"}</div>
              <div className="text-xs text-muted-foreground">#{o.id.slice(0, 8)} • {o.quantity}× • {o.price.toLocaleString()} د.ع</div>
              <div className="text-xs text-muted-foreground mt-0.5">{new Date(o.created_at).toLocaleString("ar-IQ")}</div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
          </Link>
        );
      })}
    </>
  );
}
