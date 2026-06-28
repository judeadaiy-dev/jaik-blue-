import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Phone, Clock, Navigation } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/providers")({
  head: () => ({ meta: [{ title: "المزودون | جايك" }] }),
  component: ProvidersPage,
});

const list = [
  { id: 1, name: "أبو محمد للماء", rating: 4.9, distance: "1.2 كم", eta: "15 د", service: "water" as const, initials: "أم" },
  { id: 2, name: "غاز السرعة", rating: 4.7, distance: "2.0 كم", eta: "20 د", service: "gas" as const, initials: "غس" },
  { id: 3, name: "تنكر النور", rating: 4.8, distance: "2.4 كم", eta: "22 د", service: "water" as const, initials: "تن" },
  { id: 4, name: "غاز الأمان", rating: 4.6, distance: "3.1 كم", eta: "28 د", service: "gas" as const, initials: "غأ" },
];

function ProvidersPage() {
  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="المزودون القريبون" />
        <div className="flex-1 px-5 pb-4 space-y-3">
          {list.map((p) => (
            <div key={p.id} className="bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl ${
                    p.service === "water" ? "bg-water" : "bg-gas"
                  }`}
                >
                  {p.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold">{p.name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-0.5 text-warning">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold text-foreground">{p.rating}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5" /> {p.distance}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {p.eta}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button asChild className="flex-1 h-12 rounded-2xl font-bold">
                  <Link to="/order/$type" params={{ type: p.service }}>اطلب</Link>
                </Button>
                <Button variant="outline" className="h-12 w-12 rounded-2xl p-0">
                  <Phone className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <BottomNav />
      </div>
    </div>
  );
}