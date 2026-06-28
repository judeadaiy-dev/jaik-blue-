import { createFileRoute } from "@tanstack/react-router";
import { Check, Truck, Bell, Megaphone } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "الإشعارات | جايك" }] }),
  component: NotificationsPage,
});

const items = [
  { icon: Check, title: "تم قبول طلبك", body: "أبو محمد للماء قبل طلبك #2461", time: "قبل 5 د", color: "bg-success" },
  { icon: Truck, title: "المزود في الطريق", body: "سيصل خلال 15 دقيقة", time: "قبل 12 د", color: "bg-primary" },
  { icon: Check, title: "تم تسليم الطلب", body: "نأمل أن تكون راضياً عن الخدمة", time: "أمس", color: "bg-success" },
  { icon: Megaphone, title: "عرض جديد", body: "خصم 10% على طلبات الغاز هذا الأسبوع", time: "قبل يومين", color: "bg-gas" },
  { icon: Bell, title: "تحديث التطبيق", body: "نسخة جديدة متاحة الآن", time: "قبل أسبوع", color: "bg-muted-foreground" },
];

function NotificationsPage() {
  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="الإشعارات" />
        <div className="flex-1 px-5 pb-4 space-y-3">
          {items.map((n, i) => {
            const Icon = n.icon;
            return (
              <div key={i} className="bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)] flex items-start gap-3">
                <div className={`${n.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold">{n.title}</div>
                    <div className="text-xs text-muted-foreground shrink-0">{n.time}</div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">{n.body}</div>
                </div>
              </div>
            );
          })}
        </div>
        <BottomNav />
      </div>
    </div>
  );
}