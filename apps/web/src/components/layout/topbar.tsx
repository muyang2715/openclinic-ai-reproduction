"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Menu, Settings } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "./logo";
import { SidebarNav } from "./sidebar-nav";

function Topbar() {
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const email = user?.email ?? "";
  const displayName = user?.name || email.split("@")[0] || "Admin";
  const initials =
    displayName
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AU";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:px-6">
      {/* Mobile menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="打开导航菜单"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetTitle className="sr-only">主导航</SheetTitle>
          <div className="flex h-16 items-center px-6">
            <Logo />
          </div>
          <div className="py-4">
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden flex-1 sm:block">
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="搜索医生或预约记录…"
          containerClassName="max-w-md"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-1 sm:flex-none">
        <Button
          variant="ghost"
          size="icon"
          aria-label="通知"
          className="relative"
        >
          <Bell className="size-5" />
          <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-accent-sky ring-2 ring-surface" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="系统设置">
          <Settings className="size-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="ml-1 flex items-center gap-2 rounded-full focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
              aria-label="账户菜单"
            >
              <Avatar className="size-9">
                <AvatarImage src={user?.image ?? ""} alt={displayName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {displayName}
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {email || "已登录"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>个人资料</DropdownMenuItem>
            <DropdownMenuItem>系统设置</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() =>
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => router.push("/sign-in"),
                  },
                })
              }
            >
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export { Topbar };
