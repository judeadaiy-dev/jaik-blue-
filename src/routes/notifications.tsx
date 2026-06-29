import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "الإشعارات | جايك" }] }),
  component: NotifPage,
});

interface Notif {
  id: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
  related_order_id: string | null;
}

function NotifPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);

  async function load() {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    setItems((data ?? []) as Notif[]);
  }
  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase.channel(`notifs-${user.id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => load()).subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function markAll() {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    load();
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col">
        <PageHeader title="الإشعارات" right={
          <button onClick={markAll} aria-label="قراءة الكل" className="w-11 h-11 rounded-2xl bg-card border border-border flex items-center justify-center">
            <CheckCheck className="w-5 h-5" />
          </button>
        } />
        <div className="flex-1 px-5 pb-6 space-y-2">
          {items.length === 0 ? (
            <div className="bg-card rounded-3xl p-10 text-center shadow-[var(--shadow-soft)]">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">لا توجد إشعارات</p>
            </div>
          ) : items.map((n) => {
            const Body = (
              <div className={`bg-card rounded-3xl p-4 shadow-[var(--shadow-soft)] flex gap-3 ${!n.is_read ? "border-2 border-primary/40" : ""}`}>
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><Bell className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold">{n.title}</div>
                  {n.body && <div className="text-sm text-muted-foreground">{n.body}</div>}
                  <div className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString("ar-IQ")}</div>
                </div>
                {!n.is_read && <span className="w-2.5 h-2.5 rounded-full bg-primary mt-2" />}
              </div>
            );
            return n.related_order_id ? (
              <Link key={n.id} to="/tracking/$id" params={{ id: n.related_order_id }}>{Body}</Link>
            ) : <div key={n.id}>{Body}</div>;
          })}
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
