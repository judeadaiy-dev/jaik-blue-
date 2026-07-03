import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Truck, MapPin } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { MapLibreMap } from "@/components/MapLibreMap";

export const Route = createFileRoute("/provider-setup")({
  head: () => ({ meta: [{ title: "تسجيل كمزود | جايك" }] }),
  component: ProviderSetupPage,
});

function ProviderSetupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [govs, setGovs] = useState<{ id: number; name_ar: string }[]>([]);
  const [areas, setAreas] = useState<{ id: number; name_ar: string }[]>([]);
  const [form, setForm] = useState({
    business_name: "",
    service_type: "water" as "water" | "gas",
    phone: "",
    whatsapp: "",
    governorate_id: "",
    area_id: "",
    price: "",
    description: "",
    available_from: "08:00",
    available_to: "20:00",
  });
  const [pos, setPos] = useState<[number, number]>([33.3152, 44.3661]); // Baghdad default
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("governorates").select("id,name_ar").order("id").then(({ data }) => setGovs(data ?? []));
  }, []);
  useEffect(() => {
    if (!form.governorate_id) return;
    supabase.from("areas").select("id,name_ar").eq("governorate_id", Number(form.governorate_id)).order("name_ar").then(({ data }) => setAreas(data ?? []));
    setForm((f) => ({ ...f, area_id: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.governorate_id]);

  async function submit() {
    if (!user) return;
    if (!form.business_name || !form.phone || !form.area_id || !form.price) return toast.error("أكمل الحقول المطلوبة");
    setSaving(true);
    const payload = {
      user_id: user.id,
      business_name: form.business_name,
      service_type: form.service_type,
      phone: form.phone,
      whatsapp: form.whatsapp || form.phone,
      governorate_id: Number(form.governorate_id),
      area_id: Number(form.area_id),
      price: Number(form.price),
      description: form.description || null,
      available_from: form.available_from,
      available_to: form.available_to,
      lat: pos[0],
      lng: pos[1],
      is_available: true,
      status: "active" as const,
    };
    // upsert: if exists update, else insert
    const { data: existing } = await supabase.from("providers").select("id").eq("user_id", user.id).maybeSingle();
    const { error } = existing
      ? await supabase.from("providers").update(payload).eq("user_id", user.id)
      : await supabase.from("providers").insert(payload);
    if (!error) {
      // Ensure provider role
      await supabase.from("user_roles").upsert({ user_id: user.id, role: "provider" }, { onConflict: "user_id,role" });
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("تم حفظ بياناتك", { description: "حسابك بانتظار توثيق الإدارة لعرضه للعملاء" });
    navigate({ to: "/provider" });
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="بيانات المزود" back="/account" />
        <div className="flex-1 px-5 pb-8 space-y-4">
          <div className="bg-card rounded-3xl p-5 shadow-[var(--shadow-soft)] flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center"><Truck className="w-6 h-6" /></div>
            <div className="text-sm text-muted-foreground">عرّف عن خدمتك. لن يظهر حسابك للعملاء حتى يوثقه فريق الإدارة.</div>
          </div>

          <div className="bg-card rounded-3xl p-5 shadow-[var(--shadow-soft)] space-y-4">
            <Field label="اسم النشاط *" value={form.business_name} onChange={(v) => setForm({ ...form, business_name: v })} placeholder="مثلاً: تنكر أبو محمد" />
            <div className="space-y-2">
              <Label className="font-semibold">نوع الخدمة *</Label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setForm({ ...form, service_type: "water" })} className={`rounded-2xl p-4 font-bold border-2 ${form.service_type === "water" ? "border-water bg-water/10 text-water" : "border-transparent bg-muted"}`}>💧 ماء</button>
                <button type="button" onClick={() => setForm({ ...form, service_type: "gas" })} className={`rounded-2xl p-4 font-bold border-2 ${form.service_type === "gas" ? "border-gas bg-gas/10 text-gas" : "border-transparent bg-muted"}`}>🔥 غاز</button>
              </div>
            </div>
            <Field label="السعر (د.ع) *" value={form.price} onChange={(v) => setForm({ ...form, price: v })} placeholder="15000" type="number" />
            <Field label="رقم الهاتف *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="07XXXXXXXXX" ltr />
            <Field label="واتساب (اختياري)" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} placeholder="07XXXXXXXXX" ltr />
            <div className="space-y-2">
              <Label className="font-semibold">المحافظة *</Label>
              <Select value={form.governorate_id} onValueChange={(v) => setForm({ ...form, governorate_id: v })}>
                <SelectTrigger className="h-12 rounded-2xl"><SelectValue placeholder="اختر" /></SelectTrigger>
                <SelectContent>{govs.map((g) => <SelectItem key={g.id} value={String(g.id)}>{g.name_ar}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">المنطقة *</Label>
              <Select value={form.area_id} onValueChange={(v) => setForm({ ...form, area_id: v })} disabled={!form.governorate_id}>
                <SelectTrigger className="h-12 rounded-2xl"><SelectValue placeholder="اختر" /></SelectTrigger>
                <SelectContent>{areas.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name_ar}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="متاح من" value={form.available_from} onChange={(v) => setForm({ ...form, available_from: v })} type="time" />
              <Field label="متاح إلى" value={form.available_to} onChange={(v) => setForm({ ...form, available_to: v })} type="time" />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">وصف الخدمة</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="معلومات إضافية، الكميات، التغطية..." className="rounded-2xl min-h-[80px]" />
            </div>
          </div>

          <div className="bg-card rounded-3xl p-3 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 mb-2 px-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">حدد موقعك على الخريطة (اضغط أو اسحب الدبوس)</span>
            </div>
            <MapLibreMap center={pos} zoom={13} draggable onChange={(la, ln) => setPos([la, ln])} height={240} />
          </div>

          <Button onClick={submit} disabled={saving} className="w-full h-14 rounded-2xl text-base font-bold">
            {saving ? "..." : "حفظ بيانات المزود"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", ltr }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; ltr?: boolean }) {
  return (
    <div className="space-y-2">
      <Label className="font-semibold">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} dir={ltr ? "ltr" : undefined} className="h-12 rounded-2xl" />
    </div>
  );
}
