import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Package, Truck, Home as HomeIcon, Phone, MessageCircle, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/tracking/$id")({
  head: () => ({ meta: [{ title: "تتبع الطلب | جايك" }] }),
  component: TrackingPage,
});

const STATUSES = ["pending", "accepted", "on_the_way", "delivered"] as const;
const STEPS = [
  { key: "pending", icon: Package, label: "تم الإرسال" },
  { key: "accepted", icon: Check, label: "تم قبول الطلب" },
  { key: "on_the_way", icon: Truck, label: "في الطريق" },
  { key: "delivered", icon: HomeIcon, label: "تم التسليم" },
] as const;

interface Order {
  id: string;
  status: string;
  price: number;
  quantity: number;
  service_type: "water" | "gas";
  address: string | null;
  notes: string | null;
  provider: { business_name: string; phone: string; whatsapp: string | null } | null;
}

function TrackingPage() {
  const { id } = useParams({ from: "/tracking/$id" });
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);

  async function load() {
    const { data } = await supabase
      .from("orders")
      .select("id,status,price,quantity,service_type,address,notes,providers(business_name,phone,whatsapp)")
      .eq("id", id)
      .maybeSingle();
    if (data) {
      // @ts-expect-error joined
      setOrder({ ...data, provider: data.providers });
    }
  }
  useEffect(() => {
    load();
    const channel = supabase
      .channel(`order-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  async function cancel() {
    const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم إلغاء الطلب");
    navigate({ to: "/orders" });
  }

  if (!order) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">جارٍ التحميل...</div>;

  const cancelled = order.status === "cancelled" || order.status === "rejected";
  const current = STATUSES.indexOf(order.status as (typeof STATUSES)[number]);
  const progress = cancelled ? 0 : ((current + 1) / STATUSES.length) * 100;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="تتبع الطلب" back="/orders" />
        <div className="flex-1 px-5 pb-6 space-y-5">
          <div className="bg-card rounded-3xl p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold ${order.service_type === "water" ? "bg-water" : "bg-gas"}`}>
                {order.provider?.business_name.slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="font-bold">{order.provider?.business_name}</div>
                <div className="text-sm text-muted-foreground">رقم الطلب #{order.id.slice(0, 8)}</div>
              </div>
              {order.provider?.phone && (
                <a href={`tel:${order.provider.phone}`} className="rounded-2xl h-11 w-11 flex items-center justify-center border border-input"><Phone className="w-4 h-4" /></a>
              )}
              {order.provider?.whatsapp && (
                <a href={`https://wa.me/${order.provider.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="rounded-2xl h-11 w-11 flex items-center justify-center border border-input text-success"><MessageCircle className="w-4 h-4" /></a>
              )}
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              {order.address && <div>📍 {order.address}</div>}
              <div className="mt-1 font-semibold text-foreground">المجموع: {order.price.toLocaleString()} د.ع</div>
            </div>
          </div>

          {cancelled ? (
            <div className="bg-destructive/10 text-destructive rounded-3xl p-6 text-center">
              <X className="w-10 h-10 mx-auto mb-2" />
              <div className="font-extrabold text-lg">تم إلغاء الطلب</div>
            </div>
          ) : (
            <div className="bg-card rounded-3xl p-5 shadow-[var(--shadow-soft)]">
              <div className="mb-5">
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--gradient-hero)" }} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground text-center">
                  {order.status === "delivered" ? "تم تسليم طلبك بنجاح 🎉" : order.status === "on_the_way" ? "مزودك في الطريق إليك الآن 🚚" : order.status === "accepted" ? "تم قبول طلبك ✅" : "بانتظار قبول المزود..."}
                </div>
              </div>
              <ol className="space-y-4">
                {STEPS.map((s, i) => {
                  const done = i <= current;
                  const Icon = s.icon;
                  return (
                    <li key={s.key} className="flex items-center gap-3">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className={cn("font-semibold", done ? "text-foreground" : "text-muted-foreground")}>{s.label}</div>
                      {i === current && order.status !== "delivered" && (
                        <span className="ms-auto text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-bold">الآن</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {order.status === "delivered" && (
            <Button asChild className="w-full h-14 rounded-2xl text-base font-bold">
              <Link to="/rating/$id" params={{ id: order.id }}>قيّم الخدمة الآن</Link>
            </Button>
          )}
          {!cancelled && order.status === "pending" && (
            <Button onClick={cancel} variant="outline" className="w-full h-12 rounded-2xl text-destructive border-destructive/30">
              إلغاء الطلب
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
