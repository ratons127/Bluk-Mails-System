import { HelpCircle, User } from "lucide-react";
import { useAuth } from "../lib/auth";

export default function TopBar() {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
      <div>
        <div className="text-xs text-muted">Tenant</div>
        <div className="text-sm font-semibold">Contoso Global</div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-muted hover:text-ink">
          <HelpCircle className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1">
          <User className="h-4 w-4 text-muted" />
          <div className="text-xs">
            <div className="font-semibold">{user?.name || "Admin"}</div>
            <button onClick={logout} className="text-muted hover:text-ink">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
