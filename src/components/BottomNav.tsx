import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Package, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/home", label: "الرئيسية", icon: Home },
  { to: "/orders", label: "طلباتي", icon: Package },
  { to: "/notifications", label: "الإشعارات", icon: Bell },
  { to: "/account", label: "حسابي", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="sticky bottom-0 inset-x-0 bg-card border-t border-border px-2 pt-2 pb-3 shadow-[0_-6px_20px_-12px_oklch(0.5_0.1_240_/_0.18)]">
      <ul className="flex items-center justify-around">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== "/home" && pathname.startsWith(to));
          return (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors min-w-16",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("w-6 h-6", active && "stroke-[2.5]")} />
                <span className="text-[11px] font-semibold">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}