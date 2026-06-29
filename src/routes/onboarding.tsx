import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "حدد موقعك | جايك" }] }),
  component: OnboardingPage,
});

interface Gov { id: number; name_ar: string }
interface Area { id: number; name_ar: string; governorate_id: number }

function OnboardingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [govs, setGovs] = useState<Gov[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [gov, setGov] = useState<string>("");
  const [area, setArea] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("governorates").select("id,name_ar").order("id").then(({ data }) => setGovs(data ?? []));
  }, []);
  useEffect(() => {
    if (!gov) return;
    supabase.from("areas").select("id,name_ar,governorate_id").eq("governorate_id", Number(gov)).order("name_ar").then(({ data }) => setAreas(data ?? []));
    setArea("");
  }, [gov]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  async function save() {
    if (!user || !gov || !area) return toast.error("اختر المحافظة والمنطقة");
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ governorate_id: Number(gov), area_id: Number(area) }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("تم حفظ موقعك");
    navigate({ to: "/home" });
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col">
        <div className="px-6 pt-12 pb-16 rounded-b-[2.5rem] text-white" style={{ background: "var(--gradient-hero)" }}>
          <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center">
            <MapPin className="w-8 h-8" />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold">حدد موقعك في العراق</h2>
          <p className="text-white/85 mt-1">لنعرض لك المزودين الأقرب إليك</p>
        </div>
        <div className="-mt-10 mx-5 bg-card rounded-3xl p-6 shadow-[var(--shadow-card)] space-y-5">
          <div className="space-y-2">
            <Label className="font-semibold">المحافظة</Label>
            <Select value={gov} onValueChange={setGov}>
              <SelectTrigger className="h-14 rounded-2xl"><SelectValue placeholder="اختر المحافظة" /></SelectTrigger>
              <SelectContent>{govs.map((g) => <SelectItem key={g.id} value={String(g.id)}>{g.name_ar}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">المنطقة</Label>
            <Select value={area} onValueChange={setArea} disabled={!gov}>
              <SelectTrigger className="h-14 rounded-2xl"><SelectValue placeholder="اختر المنطقة" /></SelectTrigger>
              <SelectContent>{areas.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.name_ar}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button onClick={save} disabled={saving} className="w-full h-14 rounded-2xl font-bold text-base">
            {saving ? "..." : "تأكيد الموقع"}
          </Button>
        </div>
      </div>
    </div>
  );
}
