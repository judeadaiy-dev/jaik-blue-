import { createFileRoute, Link } from "@tanstack/react-router";
import { Droplets, Flame } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "طلباتي | جايك" }] }),
  component: OrdersPage,
});

type Tab = "current" | "done" | "canceled";
type Order = { id: number; name: string; service: "water" | "gas"; status: string; date: string; statusColor: string };

const data: Record<Tab, Order[]> = {
  current: [
    { id: 2461, name: "أبو محمد للماء", service: "water", status: "في الطريق", date: "اليوم 14:20", statusColor: "text-primary" },
    { id: 2460, name: "غاز السرعة", service: "gas", status: "قُبل", date: "اليوم 13:05", statusColor: "text-success" },
  ],
  done: [
    { id: 2440, name: "تنكر النور", service: "water", status: "تم التسليم", date: "أمس 10:15", statusColor: "text-success" },
    { id: 2421, name: "غاز الأمان", service: "gas", status: "تم التسليم", date: "قبل 3 أيام", statusColor: "text-success" },
  ],
  canceled: [
    { id: 2400, name: "أبو محمد للماء", service: "water", status: "ملغي", date: "قبل أسبوع", statusColor: "text-destructive" },
  ],
};

function OrdersPage() {
  const [tab, setTab] = useState<Tab>("current");
  const tabs: Array<{ key: Tab; label: string }> = [
    { key: "current", label: "جارية" },
    { key: "done", label: "مكتملة" },
    { key: "canceled", label: "ملغية" },
  ];
  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="طلباتي" />
        <div className="px-5">
          <div className="bg-card rounded-2xl p-1 flex shadow-[var(--shadow-soft)]">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex-1 h-11 rounded-xl text-sm font-bold transition-colors",
                  tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 px-5 py-4 space-y-3">
          {data[tab].map((o) => (
            <Link key={o.id} to="/tracking" className="block bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-3">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white", o.service === "water" ? "bg-water" : "bg-gas")}>
                  {o.service === "water" ? <Droplets className="w-7 h-7" /> : <Flame className="w-7 h-7" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{o.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">#{o.id} • {o.date}</div>
                </div>
                <div className={cn("text-sm font-bold", o.statusColor)}>{o.status}</div>
              </div>
            </Link>
          ))}
          {data[tab].length === 0 && <div className="text-center text-muted-foreground py-16">لا توجد طلبات</div>}
        </div>
        <BottomNav />
      </div>
    </div>
  );
}