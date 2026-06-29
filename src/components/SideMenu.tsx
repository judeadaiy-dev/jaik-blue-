import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Home, Package, Bell, User, Heart, ShieldCheck, LogOut, Truck, Phone } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function SideMenu() {
  const [open, setOpen] = useState(false);
  const { roles, signOut, user } = useAuth();
  const isAdmin = roles.includes("admin");
  const isProvider = roles.includes("provider");

  return (
    <>
      <button
        type="button"
        aria-label="القائمة"
        onClick={() => setOpen(true)}
        className="w-11 h-11 rounded-2xl bg-card border border-border flex items-center justify-center shadow-[var(--shadow-soft)]"
      >
        <Menu className="w-5 h-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <aside
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
            className="relative ms-auto w-[85%] max-w-[340px] h-full bg-card shadow-2xl flex flex-col"
          >
            <div className="p-5 text-white" style={{ background: "var(--gradient-hero)" }}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-2xl font-extrabold">جايك</div>
                  <div className="text-white/80 text-sm">{user?.email ?? "ضيف"}</div>
                </div>
                <button onClick={() => setOpen(false)} aria-label="إغلاق" className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              <Item to="/home" icon={Home} label="الرئيسية" onClick={() => setOpen(false)} />
              <Item to="/orders" icon={Package} label="طلباتي" onClick={() => setOpen(false)} />
              <Item to="/notifications" icon={Bell} label="الإشعارات" onClick={() => setOpen(false)} />
              <Item to="/favorites" icon={Heart} label="المفضلة" onClick={() => setOpen(false)} />
              <Item to="/account" icon={User} label="حسابي" onClick={() => setOpen(false)} />
              {isProvider && <Item to="/provider" icon={Truck} label="لوحة المزود" onClick={() => setOpen(false)} />}
              {isAdmin && <Item to="/admin" icon={ShieldCheck} label="لوحة الإدارة" onClick={() => setOpen(false)} />}
              <a href="tel:+9647700000000" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted">
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Phone className="w-5 h-5" /></span>
                <span className="font-semibold">الدعم الفني</span>
              </a>
              {user && (
                <button
                  onClick={() => { setOpen(false); signOut(); }}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-destructive/10 text-destructive"
                >
                  <span className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center"><LogOut className="w-5 h-5" /></span>
                  <span className="font-semibold">تسجيل الخروج</span>
                </button>
              )}
            </nav>
            <div className="border-t border-border p-4 text-center text-xs text-muted-foreground leading-relaxed">
              جميع الحقوق محفوظة © {new Date().getFullYear()}
              <div className="font-bold text-foreground mt-1">شركة Blue للتقنية</div>
              <div>المطور: استبرق</div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function Item({ to, icon: Icon, label, onClick }: { to: string; icon: typeof Home; label: string; onClick: () => void }) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted">
      <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </span>
      <span className="font-semibold">{label}</span>
    </Link>
  );
}