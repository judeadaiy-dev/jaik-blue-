import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Droplets, Flame, Star, Phone, ChevronLeft } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [{ title: "الرئيسية | جايك" }] }),
  component: HomePage,
});

const providers = [
  { id: 1, name: "أبو محمد للماء", rating: 4.9, available: true, service: "ماء", initials: "أم" },
  { id: 2, name: "غاز السرعة", rating: 4.7, available: true, service: "غاز", initials: "غس" },
  { id: 3, name: "تنكر النور", rating: 4.8, available: false, service: "ماء", initials: "تن" },
];

function HomePage() {
  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col">
        {/* Header */}
        <div
          className="px-5 pt-10 pb-20 rounded-b-[2.5rem] text-white relative overflow-hidden"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute right-10 top-6 w-16 h-16 rounded-full bg-white/10" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-white/80 text-xs">موقعك الحالي</p>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="w-5 h-5" />
                <span className="font-bold text-lg">صنعاء - حدة</span>
              </div>
            </div>
            <Link
              to="/account"
              className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center font-bold"
            >
              م
            </Link>
          </div>
          <h2 className="relative mt-6 text-2xl font-extrabold">مرحباً بك في جايك 👋</h2>
          <p className="relative text-white/90 text-sm mt-1">ماذا تريد أن تطلب اليوم؟</p>
        </div>

        <div className="flex-1 px-5 -mt-14 pb-4 space-y-6">
          {/* Service cards */}
          <div className="grid grid-cols-2 gap-4">
            <ServiceCard
              to="/order/water"
              title="طلب ماء"
              subtitle="تنكر مياه"
              icon={<Droplets className="w-10 h-10" />}
              gradient="var(--gradient-water)"
            />
            <ServiceCard
              to="/order/gas"
              title="طلب غاز"
              subtitle="دبة غاز"
              icon={<Flame className="w-10 h-10" />}
              gradient="var(--gradient-gas)"
            />
          </div>

          {/* Nearby providers */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-lg">أقرب المزودين</h3>
              <Link to="/providers" className="text-sm text-primary font-semibold flex items-center">
                عرض الكل <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {providers.map((p) => (
                <ProviderCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}

function ServiceCard({
  to,
  title,
  subtitle,
  icon,
  gradient,
}: {
  to: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-3xl p-5 text-white shadow-[var(--shadow-card)] flex flex-col gap-3 min-h-40 active:scale-95 transition-transform"
      style={{ background: gradient }}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/25 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="font-extrabold text-lg leading-tight">{title}</div>
        <div className="text-white/85 text-sm">{subtitle}</div>
      </div>
    </Link>
  );
}

function ProviderCard({
  id,
  name,
  rating,
  available,
  service,
  initials,
}: {
  id: number;
  name: string;
  rating: number;
  available: boolean;
  service: string;
  initials: string;
}) {
  return (
    <div className="bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)] flex items-center gap-3">
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl ${
          service === "ماء" ? "bg-water" : "bg-gas"
        }`}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold truncate">{name}</div>
        <div className="flex items-center gap-2 mt-1 text-sm">
          <span className="flex items-center gap-0.5 text-warning">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-semibold text-foreground">{rating}</span>
          </span>
          <span className="text-muted-foreground">•</span>
          <span className={available ? "text-success font-semibold" : "text-muted-foreground"}>
            {available ? "متاح الآن" : "غير متاح"}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Button asChild size="sm" className="rounded-xl h-9 px-4 font-bold" disabled={!available}>
          <Link to="/order/$type" params={{ type: service === "ماء" ? "water" : "gas" }}>
            اطلب
          </Link>
        </Button>
        <Button size="sm" variant="outline" className="rounded-xl h-9 px-4">
          <Phone className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}