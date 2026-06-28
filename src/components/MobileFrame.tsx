import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Centers a phone-shaped container on the page so the web preview matches
 * the mobile-first reference design.
 */
export function MobileFrame({
  children,
  className,
  bare = false,
}: {
  children: ReactNode;
  className?: string;
  bare?: boolean;
}) {
  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div
        className={cn(
          "relative w-full max-w-[440px] min-h-screen bg-background",
          !bare && "shadow-[var(--shadow-soft)]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}