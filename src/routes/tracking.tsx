import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Package, Truck, Home as HomeIcon, Phone, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tracking")({
  head: () => ({ meta: [{ title: "تتبع الطلب | جايك" }] }),
  component: TrackingPage,
});

const steps = [
  { icon: Package, label: "تم الإرسال" },
  { icon: Check, label: "تم قبول الطلب" },
  { icon: Truck, label: "في الطريق" },
  { icon: HomeIcon, label: "تم التسليم" },
];

function TrackingPage() {
  const current = 2;
  const progress = ((current + 1) / steps.length) * 100;
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="تتبع الطلب" back="/orders" />
        <div className="flex-1 px-5 pb-6 space-y-5">
          <div className="bg-card rounded-3xl p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-water flex items-center justify-center text-white font-bold">أم</div>
              <div className="flex-1">
                <div className="font-bold">أبو محمد للماء</div>
                <div className="text-sm text-muted-foreground">رقم الطلب #2461</div>
              </div>
              <Button variant="outline" className="rounded-2xl h-11 w-11 p-0">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="rounded-2xl h-11 w-11 p-0">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-3xl p-5 shadow-[var(--shadow-soft)]">
            <div className="mb-5">
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--gradient-hero)" }} />
              </div>
              <div className="mt-2 text-sm text-muted-foreground text-center">مزودك في الطريق إليك الآن 🚚</div>
            </div>
            <ol className="space-y-4">
              {steps.map((s, i) => {
                const done = i <= current;
                const Icon = s.icon;
                return (
                  <li key={s.label} className="flex items-center gap-3">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className={cn("font-semibold", done ? "text-foreground" : "text-muted-foreground")}>{s.label}</div>
                    {i === current && (
                      <span className="ms-auto text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-bold">الآن</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          <Button onClick={() => navigate({ to: "/rating" })} className="w-full h-14 rounded-2xl text-base font-bold" variant="outline">
            تأكيد الاستلام والتقييم
          </Button>
        </div>
      </div>
    </div>
  );
}