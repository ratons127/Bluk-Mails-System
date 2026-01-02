import { cn } from "../lib/utils";

const colorMap: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PENDING_APPROVAL: "bg-amber-50 text-warning",
  APPROVED: "bg-emerald-50 text-success",
  SCHEDULED: "bg-blue-50 text-primary",
  SENDING: "bg-indigo-50 text-accent",
  COMPLETED: "bg-slate-200 text-slate-700",
  REJECTED: "bg-rose-50 text-danger",
  CANCELLED: "bg-slate-100 text-muted",
  ACTIVE: "bg-emerald-50 text-success",
  INACTIVE: "bg-slate-100 text-muted"
};

export default function StatusBadge({ value }: { value: string }) {
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", colorMap[value] || "bg-slate-100")}> 
      {value.replace(/_/g, " ")}
    </span>
  );
}
