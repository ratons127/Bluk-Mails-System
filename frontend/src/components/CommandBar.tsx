import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export type CommandBarAction = {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost" | "subtle" | "danger";
  disabled?: boolean;
};

export default function CommandBar({ actions, className }: { actions: CommandBarAction[]; className?: string }) {
  return (
    <div
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3",
        className
      )}
    >
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant || "outline"}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.label}
          </Button>
        ))}
      </div>
      <div className="text-xs text-muted">Command bar</div>
    </div>
  );
}
