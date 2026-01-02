import { Outlet } from "react-router-dom";
import LeftNav from "./LeftNav";
import TopBar from "./TopBar";

export default function AppShell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <LeftNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-surface px-8 py-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
