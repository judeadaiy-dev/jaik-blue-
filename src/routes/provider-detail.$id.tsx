import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Phone, Star, MapPin, Clock, MessageCircle, Heart } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { MapLibreMap } from "@/components/MapLibreMap";

export const Route = createFileRoute("/provider-detail/$id")({
  head: () => ({ meta: [{ title: "تفاصيل المزود | جايك" }] }),
  component: ProviderDetail,
});

interface Provider {
  id: string;
  business_name: string;
  service_type: "water" | "gas";
  description: string | null;
  price: number;
  phone: string;
  whatsapp: string | null;
  is_available: boolean;
  available_from: string | null;
  available_to: string | null;
  rating_avg: number;
  rating_count: number;
  lat: number | null;
  lng: number | null;
}

function ProviderDetail() {
  const { id } = useParams({ from: "/provider-detail/$id" });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [p, setP] = useState<Provider | null>(null);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    supabase.from("providers").select("*").eq("id", id).maybeSingle().then(({ data }) => setP(data as Provider | null));
    if (user) {
      supabase.from("favorites").select("provider_id").eq("user_id", user.id).eq("provider_id", id).maybeSingle().then(({ data }) => setFav(!!data));
    }
  }, [id, user]);

  async function toggleFav() {
    if (!user) return;
    if (fav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("provider_id", id);
      setFav(false);
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, provider_id: id });
      setFav(true);
    }
  }

  async function placeOrder() {
    if (!user || !p) return;
    if (!address.trim()) return toast.error("أدخل عنوان التوصيل");
    setPlacing(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        provider_id: p.id,
        service_type: p.service_type,
        price: p.price * qty,
        quantity: qty,
        notes: notes || null,
        address,
      })
      .select()
      .single();
    if (error) {
      setPlacing(false);
      return toast.error(error.message);
    }
    // Get provider user_id to notify
    const { data: prov } = await supabase.from("providers").select("user_id").eq("id", p.id).maybeSingle();
    if (prov) {
      await supabase.from("notifications").insert({
        user_id: prov.user_id,
        title: "طلب جديد",
        body: `طلب ${p.service_type === "water" ? "ماء" : "غاز"} × ${qty}`,
        type: "new_order",
        related_order_id: order.id,
      });
    }
    // Notify the customer that the booking reached the provider
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "تم إرسال طلبك للمزود",
      body: `طلب #${order.id.slice(0, 8)} — بانتظار قبول المزود`,
      type: "order_update",
      related_order_id: order.id,
    });
    // Open WhatsApp for coordination
    if (p.whatsapp) {
      const msg = encodeURIComponent(`السلام عليكم، طلبت ${p.service_type === "water" ? "ماء" : "غاز"} × ${qty}\nالعنوان: ${address}\n${notes ? "ملاحظات: " + notes : ""}\nرقم الطلب: ${order.id.slice(0, 8)}`);
      window.open(`https://wa.me/${p.whatsapp.replace(/\D/g, "")}?text=${msg}`, "_blank");
    }
    toast.success("تم إرسال الطلب");
    navigate({ to: "/tracking/$id", params: { id: order.id } });
  }

  if (!p) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">جارٍ التحميل...</div>;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="تفاصيل المزود" back="/home" />
        <div className="flex-1 px-5 pb-6 space-y-4">
          <div className="bg-card rounded-3xl p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white font-bold text-2xl ${p.service_type === "water" ? "bg-water" : "bg-gas"}`}>
                {p.business_name.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-xl">{p.business_name}</div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <span className="flex items-center gap-0.5 text-warning">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold text-foreground">{p.rating_avg.toFixed(1)}</span>
                  </span>
                  <span>•</span>
                  <span className={p.is_available ? "text-success font-semibold" : "text-muted-foreground"}>
                    {p.is_available ? "متاح الآن" : "غير متاح"}
                  </span>
                </div>
                {p.available_from && p.available_to && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3.5 h-3.5" /> {p.available_from} - {p.available_to}
                  </div>
                )}
              </div>
              <button onClick={toggleFav} aria-label="مفضلة" className={`w-10 h-10 rounded-2xl flex items-center justify-center ${fav ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                <Heart className={`w-5 h-5 ${fav ? "fill-current" : ""}`} />
              </button>
            </div>
            {p.description && <p className="text-sm text-muted-foreground mt-3">{p.description}</p>}
            <div className="mt-3 p-3 bg-primary/5 rounded-2xl flex items-center justify-between">
              <span className="text-sm font-semibold">سعر {p.service_type === "water" ? "التنكر" : "الدبة"}</span>
              <span className="font-extrabold text-primary text-lg">{p.price.toLocaleString()} د.ع</span>
            </div>
          </div>

          {p.lat && p.lng && (
            <div className="bg-card rounded-3xl p-3 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-2 mb-2 px-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">موقع المزود</span>
              </div>
              <MapLibreMap center={[Number(p.lat), Number(p.lng)]} zoom={14} height={200} />
            </div>
          )}

          <div className="bg-card rounded-3xl p-5 shadow-[var(--shadow-soft)] space-y-4">
            <h3 className="font-extrabold">تفاصيل الطلب</h3>
            <div className="flex items-center justify-between">
              <Label className="font-semibold">الكمية</Label>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" className="w-10 h-10 rounded-xl p-0" onClick={() => setQty(Math.max(1, qty - 1))}>-</Button>
                <span className="font-extrabold text-xl w-8 text-center">{qty}</span>
                <Button type="button" variant="outline" className="w-10 h-10 rounded-xl p-0" onClick={() => setQty(qty + 1)}>+</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">عنوان التوصيل</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="الحي - الزقاق - رقم الدار" className="h-12 rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">ملاحظات (اختياري)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="مثلاً: لون الدبة، وقت محدد..." className="rounded-2xl min-h-[80px]" />
            </div>
            <div className="p-3 bg-muted rounded-2xl flex items-center justify-between">
              <span className="font-semibold">الإجمالي</span>
              <span className="font-extrabold text-primary text-xl">{(p.price * qty).toLocaleString()} د.ع</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <a href={`tel:${p.phone}`} className="rounded-2xl bg-card border border-border h-14 flex flex-col items-center justify-center text-primary font-bold">
              <Phone className="w-5 h-5 mb-0.5" />
              <span className="text-xs">اتصال</span>
            </a>
            {p.whatsapp && (
              <a href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="rounded-2xl bg-card border border-border h-14 flex flex-col items-center justify-center text-success font-bold">
                <MessageCircle className="w-5 h-5 mb-0.5" />
                <span className="text-xs">واتساب</span>
              </a>
            )}
            <Button onClick={placeOrder} disabled={!p.is_available || placing} className="h-14 rounded-2xl font-bold col-span-1">
              {placing ? "..." : "تأكيد الطلب"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
