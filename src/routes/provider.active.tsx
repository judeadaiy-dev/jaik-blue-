import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/provider/active")({
  head: () => ({ meta: [{ title: "الطلب الجاري | جايك" }] }),
  component: ProviderActive,
});

function ProviderActive() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="الطلب الجاري" back="/provider" />
        <div className="flex-1 px-5 pb-6 space-y-4">
          <div className="bg-card rounded-3xl p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-water flex items-center justify-center text-white font-bold">مع</div>
              <div className="flex-1">
                <div className="font-bold">محمد علي</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" /> حدة - شارع 60
                </div>
              </div>
              <Button variant="outline" className="rounded-2xl h-11 w-11 p-0">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="rounded-2xl h-11 w-11 p-0">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="h-56 rounded-3xl shadow-[var(--shadow-soft)]" style={{ background: "linear-gradient(135deg, oklch(0.9 0.05 220), oklch(0.85 0.08 200))" }} />
          <Button className="w-full h-14 rounded-2xl text-base font-bold">في الطريق</Button>
          <Button onClick={() => navigate({ to: "/provider" })} className="w-full h-14 rounded-2xl text-base font-bold" variant="outline">
            تم التسليم
          </Button>
        </div>
      </div>
    </div>
  );
}