import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Star, Check, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/provider")({
  head: () => ({ meta: [{ title: "لوحة المزود | جايك" }] }),
  component: ProviderDashboard,
});

function ProviderDashboard() {
  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col">
        <div className="px-5 pt-10 pb-20 rounded-b-[2.5rem] text-white" style={{ background: "var(--gradient-hero)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-xs">أهلاً</p>
              <div className="font-extrabold text-xl">أبو محمد للماء</div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-2xl px-3 py-2">
              <span className="text-sm font-bold">متاح</span>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <div className="flex-1 px-5 -mt-14 pb-6 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="طلبات اليوم" value="8" color="bg-water" />
            <Stat label="مكتملة" value="6" color="bg-success" />
            <Stat label="التقييم" value="4.9" color="bg-warning" icon={<Star className="w-4 h-4 fill-current" />} />
          </div>

          <section>
            <h2 className="font-extrabold text-lg mb-3">طلبات جديدة</h2>
            <div className="space-y-3">
              {[
                { id: 2462, name: "محمد علي", area: "حدة - شارع 60", service: "تنكر مياه" },
                { id: 2463, name: "أحمد سعيد", area: "بير الشيف", service: "تنكر مياه" },
              ].map((o) => (
                <div key={o.id} className="bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">{o.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" /> {o.area}
                      </div>
                    </div>
                    <div className="text-xs px-2.5 py-1 rounded-full bg-water/15 text-water font-bold">{o.service}</div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button asChild className="flex-1 h-12 rounded-2xl font-bold">
                      <Link to="/provider/active">
                        <Check className="w-4 h-4 ms-1" /> قبول
                      </Link>
                    </Button>
                    <Button variant="outline" className="flex-1 h-12 rounded-2xl font-bold text-destructive">
                      <X className="w-4 h-4 ms-1" /> رفض
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Link to="/provider/history" className="bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)] flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div className="flex-1 font-semibold">سجل الطلبات</div>
            <span className="text-muted-foreground text-sm">عرض</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color, icon }: { label: string; value: string; color: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)] text-center">
      <div className={`${color} text-white w-10 h-10 rounded-2xl mx-auto flex items-center justify-center mb-2`}>
        {icon ?? <Package className="w-4 h-4" />}
      </div>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}