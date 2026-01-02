import { Sheet, SheetContent, SheetFooter, SheetHeader } from "./ui/sheet";

export default function BladePanel({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  footer
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <div className="text-sm text-muted">{subtitle}</div>
          <h2 className="text-lg font-semibold">{title}</h2>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && <SheetFooter>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
