import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/rating/$id")({
  head: () => ({ meta: [{ title: "تقييم الخدمة | جايك" }] }),
  component: RatingPage,
});

function RatingPage() {
  const { id } = useParams({ from: "/rating/$id" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [order, setOrder] = useState<{ provider_id: string; user_id: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("orders").select("provider_id,user_id").eq("id", id).maybeSingle().then(({ data }) => setOrder(data));
  }, [id]);

  async function submit() {
    if (!user || !order) return;
    setSaving(true);
    const { error } = await supabase.from("ratings").insert({
      order_id: id,
      user_id: user.id,
      provider_id: order.provider_id,
      stars,
      comment: comment || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("شكراً لتقييمك");
    navigate({ to: "/orders" });
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="تقييم الخدمة" back="/orders" />
        <div className="flex-1 px-5 pb-6 space-y-5">
          <div className="bg-card rounded-3xl p-6 shadow-[var(--shadow-soft)] text-center">
            <p className="text-lg font-bold mb-4">كيف كانت تجربتك مع المزود؟</p>
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setStars(n)} aria-label={`${n} نجمة`}>
                  <Star className={`w-12 h-12 ${n <= stars ? "text-warning fill-warning" : "text-muted"}`} />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{["", "سيء", "مقبول", "جيد", "ممتاز", "رائع"][stars]}</p>
          </div>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="اكتب تعليقاً (اختياري)" className="rounded-3xl min-h-[120px] bg-card shadow-[var(--shadow-soft)] border-0 p-4" />
          <Button onClick={submit} disabled={saving} className="w-full h-14 rounded-2xl text-base font-bold">
            {saving ? "..." : "إرسال التقييم"}
          </Button>
        </div>
      </div>
    </div>
  );
}
