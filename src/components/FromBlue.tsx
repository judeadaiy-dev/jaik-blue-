export function FromBlue({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-x-0 bottom-6 flex justify-center items-baseline gap-1.5 text-white/90 animate-in fade-in duration-1000 ${className}`}
      dir="ltr"
    >
      <span className="text-base font-medium">From</span>
      <span className="font-brand text-2xl font-extrabold tracking-wide">BLUE</span>
    </div>
  );
}