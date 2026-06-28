import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Droplets } from "lucide-react";

export const Route = createFileRoute("/provider/history")({
  head: () => ({ meta: [{ title: "سجل الطلبات | جايك" }] }),
  component: ProviderHistory,
});

const list = [
  { id: 2461, name: "محمد علي", date: "اليوم 14:20", price: "8,000 ر.ي" },
  { id: 2459, name: "علي سالم", date: "اليوم 11:05", price: "8,000 ر.ي" },
  { id: 2455, name: "خالد أحمد", date: "أمس 16:10", price: "16,000 ر.ي" },
  { id: 2451, name: "سعيد محمد", date: "أمس 09:30", price: "8,000 ر.ي" },
];

function ProviderHistory() {
  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="سجل الطلبات" back="/provider" />
        <div className="flex-1 px-5 pb-6 space-y-3">
          {list.map((o) => (
            <div key={o.id} className="bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)] flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-water flex items-center justify-center text-white">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold">{o.name}</div>
                <div className="text-xs text-muted-foreground">#{o.id} • {o.date}</div>
              </div>
              <div className="font-bold">{o.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}