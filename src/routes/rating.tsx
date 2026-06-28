import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rating")({
  head: () => ({ meta: [{ title: "تقييم الخدمة | جايك" }] }),
  component: RatingPage,
});

function RatingPage() {
  const [rating, setRating] = useState(5);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="تقييم الخدمة" back="/orders" />
        <div className="flex-1 px-5 pb-6 space-y-5">
          <div className="bg-card rounded-3xl p-6 shadow-[var(--shadow-soft)] text-center">
            <div className="w-20 h-20 rounded-3xl bg-water mx-auto flex items-center justify-center text-white font-bold text-2xl">أم</div>
            <h2 className="font-extrabold text-xl mt-4">أبو محمد للماء</h2>
            <p className="text-muted-foreground text-sm">كيف كانت تجربتك؟</p>
            <div className="flex items-center justify-center gap-2 mt-5" dir="ltr">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} نجوم`}>
                  <Star className={cn("w-10 h-10 transition-transform", n <= rating ? "fill-warning text-warning scale-110" : "text-muted-foreground")} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-semibold">تعليق</label>
            <Textarea placeholder="شاركنا رأيك..." className="min-h-32 rounded-2xl text-base" />
          </div>
          <Button onClick={() => navigate({ to: "/home" })} className="w-full h-14 rounded-2xl text-base font-bold">
            إرسال التقييم
          </Button>
        </div>
      </div>
    </div>
  );
}