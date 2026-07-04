import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const STATUS_MSG: Record<string, { title: string; desc: string; kind: "info" | "success" | "error" }> = {
  pending:    { title: "تم إرسال طلبك",  desc: "بانتظار قبول المزود",  kind: "info" },
  accepted:   { title: "تم قبول طلبك ✅", desc: "المزود سيبدأ التجهيز", kind: "success" },
  on_the_way: { title: "المزود في الطريق 🚚", desc: "طلبك قادم إليك", kind: "info" },
  delivered:  { title: "تم تسليم طلبك 🎉", desc: "شكراً لاستخدامك جايك", kind: "success" },
  cancelled:  { title: "تم إلغاء الطلب",   desc: "الطلب أُلغي",          kind: "error" },
  rejected:   { title: "تم رفض الطلب",     desc: "المزود لم يقبل الطلب", kind: "error" },
};

/**
 * Global in-app listener: shows a toast whenever one of the current user's
 * orders changes status. Runs once at app root regardless of the visible route.
 */
export function OrderStatusListener() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const lastStatus = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      lastStatus.current = {};
      return;
    }
    const ch = supabase
      .channel(`user-orders-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const next = payload.new as { id: string; status: string };
          const prev = lastStatus.current[next.id];
          if (prev === next.status) return;
          lastStatus.current[next.id] = next.status;
          const meta = STATUS_MSG[next.status];
          if (!meta) return;
          const opts = { description: `${meta.desc} — #${next.id.slice(0, 6)}` };
          if (meta.kind === "success") toast.success(meta.title, opts);
          else if (meta.kind === "error") toast.error(meta.title, opts);
          else toast(meta.title, opts);
          qc.invalidateQueries({ queryKey: ["orders"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user, qc]);

  return null;
}