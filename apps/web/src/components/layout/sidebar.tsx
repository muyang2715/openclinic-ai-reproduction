import { Sparkles } from "lucide-react";

import { Logo } from "./logo";
import { SidebarNav } from "./sidebar-nav";

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-16 items-center px-6">
        <Logo />
      </div>
      <div className="flex flex-1 flex-col py-4">
        <SidebarNav />
      </div>
      <div className="p-3">
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-brand-gradient">
              <Sparkles className="size-3.5 text-white" />
            </span>
            <span className="text-sm font-semibold text-foreground">
              AI Receptionist
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Voice agents arrive in the next release.
          </p>
        </div>
      </div>
    </aside>
  );
}

export { Sidebar };
