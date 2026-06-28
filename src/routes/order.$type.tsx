import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin, Droplets, Flame, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/order/$type")({
  head: () => ({ meta: [{ title: "تفاصيل الطلب | جايك" }] }),
  component: OrderPage,
});

function OrderPage() {
  const { type } = Route.useParams();
  const navigate = useNavigate();
  const isWater = type === "water";
  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="تفاصيل الطلب" />
        <div className="flex-1 px-5 pb-6 space-y-4">
          <div
            className="relative h-48 rounded-3xl overflow-hidden shadow-[var(--shadow-soft)]"
            style={{ background: "linear-gradient(135deg, oklch(0.9 0.05 220), oklch(0.85 0.08 200))" }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 40%, oklch(0.75 0.1 220) 0 2px, transparent 3px), radial-gradient(circle at 70% 60%, oklch(0.7 0.12 200) 0 2px, transparent 3px)",
                backgroundSize: "60px 60px",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg ring-4 ring-primary/30 animate-pulse">
                <MapPin className="w-6 h-6" />
              </div>
            </div>
            <Button size="sm" className="absolute bottom-3 right-3 rounded-2xl h-10 px-4 font-bold">
              تأكيد الموقع
            </Button>
          </div>

          <div className="bg-card rounded-3xl p-5 shadow-[var(--shadow-soft)] space-y-4">
            <Row label="المزود" value="أبو محمد للماء" />
            <Row
              label="الخدمة"
              value={
                <span className="flex items-center gap-1.5 font-bold">
                  {isWater ? <Droplets className="w-4 h-4 text-water" /> : <Flame className="w-4 h-4 text-gas" />}
                  {isWater ? "تنكر مياه" : "دبة غاز"}
                </span>
              }
            />
            <Row label="الموقع" value="صنعاء - حدة - شارع 60" />
            <Row label="السعر التقديري" value={isWater ? "8,000 ر.ي" : "5,500 ر.ي"} />
          </div>

          <div className="space-y-2">
            <label className="font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" /> ملاحظات
            </label>
            <Textarea placeholder="مثال: الباب الأزرق بجانب البقالة" className="min-h-24 rounded-2xl text-base" />
          </div>

          <Button onClick={() => navigate({ to: "/tracking" })} className="w-full h-14 rounded-2xl text-base font-bold">
            تأكيد الطلب
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}