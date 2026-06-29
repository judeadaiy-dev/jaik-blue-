import { useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { SideMenu } from "@/components/SideMenu";

export function PageHeader({
  title,
  back = "/home",
  right,
}: {
  title: string;
  back?: string;
  right?: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur px-5 pt-5 pb-3 flex items-center gap-3">
      <button
        type="button"
        onClick={() => navigate({ to: back as never })}
        className="w-11 h-11 rounded-2xl bg-card border border-border flex items-center justify-center shadow-[var(--shadow-soft)]"
        aria-label="رجوع"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      <h1 className="flex-1 text-center font-extrabold text-lg">{title}</h1>
      {right ?? <SideMenu />}
    </header>
  );
}