import { cn } from "../lib/utils";

export default function FilterBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 bg-white px-4 py-3", className)}>
      {children}
    </div>
  );
}
