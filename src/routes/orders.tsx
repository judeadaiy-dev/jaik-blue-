import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PackageOpen, Droplets, Flame, ChevronLeft, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
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

const STATUS_META: Record<string, { label: string; tone: string; icon: typeof Clock; step: number }> = {
  pending:    { label: "بانتظار القبول", tone: "bg-warning/15 text-warning",   icon: Clock,        step: 1 },
  accepted:   { label: "تم القبول",     tone: "bg-water/15 text-water",       icon: CheckCircle2, step: 2 },
  on_the_way: { label: "في الطريق",     tone: "bg-primary/15 text-primary",   icon: Truck,        step: 3 },
  delivered:  { label: "تم التسليم",    tone: "bg-success/15 text-success",   icon: CheckCircle2, step: 4 },
  cancelled:  { label: "ملغي",          tone: "bg-destructive/15 text-destructive", icon: XCircle, step: 0 },
  rejected:   { label: "مرفوض",         tone: "bg-destructive/15 text-destructive", icon: XCircle, step: 0 },
};

type TabKey = "ongoing" | "done" | "cancelled";

function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<TabKey>("ongoing");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id,status,service_type,price,quantity,created_at,providers(business_name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as unknown as Order[]));
  }, [user]);

  const { ongoing, done, cancelled } = useMemo(() => ({
    ongoing:   orders.filter((o) => ["pending", "accepted", "on_the_way"].includes(o.status)),
    done:      orders.filter((o) => o.status === "delivered"),
    cancelled: orders.filter((o) => ["cancelled", "rejected"].includes(o.status)),
  }), [orders]);

  const current = tab === "ongoing" ? ongoing : tab === "done" ? done : cancelled;
  const emptyText = tab === "ongoing" ? "لا توجد طلبات جارية بعد" : tab === "done" ? "لا توجد طلبات مكتملة" : "لا توجد طلبات ملغية";

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "ongoing",   label: "جارية",    count: ongoing.length },
    { key: "done",      label: "مكتملة",  count: done.length },
    { key: "cancelled", label: "ملغية",   count: cancelled.length },
  ];

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="طلباتي" />
        <div className="flex-1 px-5 pb-24 space-y-3">
          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-2xl p-3 text-center transition-all ${
                  tab === t.key
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-card)]"
                    : "bg-card text-foreground shadow-[var(--shadow-soft)]"
                }`}
              >
                <div className="text-xl font-extrabold leading-none">{t.count}</div>
                <div className={`text-[11px] mt-1 ${tab === t.key ? "opacity-90" : "text-muted-foreground"}`}>{t.label}</div>
              </button>
            ))}
          </div>

          {current.length === 0 ? (
            <div className="bg-card rounded-3xl p-10 text-center shadow-[var(--shadow-soft)]">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-3">
                <PackageOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-bold mb-1">{emptyText}</p>
              <p className="text-sm text-muted-foreground mb-4">اطلب الآن ووصلك خلال دقائق</p>
              <Link to="/home" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-2xl px-5 py-2.5 font-bold text-sm">
                اطلب الآن
              </Link>
            </div>
          ) : (
            current.map((o) => <OrderCard key={o.id} order={o} />)
          )}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const meta = STATUS_META[order.status] ?? { label: order.status, tone: "bg-muted text-foreground", icon: Clock, step: 0 };
  const StatusIcon = meta.icon;
  const isWater = order.service_type === "water";
  const isActive = meta.step > 0 && meta.step < 4;
  const totalSteps = 4;

  return (
    <Link
      to="/tracking/$id"
      params={{ id: order.id }}
      className="block bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)] active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 ${isWater ? "bg-water" : "bg-gas"}`}>
          {isWater ? <Droplets className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold truncate">{order.providers?.business_name ?? "مزود غير محدد"}</span>
            <span className="text-[10px] text-muted-foreground">#{order.id.slice(0, 6)}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {order.quantity}× • {order.price.toLocaleString()} د.ع
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${meta.tone}`}>
          <StatusIcon className="w-3 h-3" />
          {meta.label}
        </span>
      </div>

      {isActive && (
        <div className="mt-3 flex items-center gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i < meta.step ? (isWater ? "bg-water" : "bg-gas") : "bg-muted"}`}
            />
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{new Date(order.created_at).toLocaleString("ar-IQ", { dateStyle: "short", timeStyle: "short" })}</span>
        <span className="inline-flex items-center gap-0.5 text-primary font-semibold">
          تفاصيل <ChevronLeft className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
