import { useEffect, useId, useMemo, useRef, useState, type RefObject } from "react";
import {
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  Bell,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Menu,
  Search,
  Settings,
  X,
} from "lucide-react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { cn } from "@/lib/utils";
import {
  NAV_GROUPS,
  allNavItems,
  isNavActive,
  navItemForPath,
  type NavItem,
} from "@/constants/nav";

export function DashboardShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const current = navItemForPath(pathname);

  useEffect(() => {
    setMobileOpen(false);
    setCommandOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
      if (event.key === "Escape") {
        setMobileOpen(false);
        setCommandOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex h-full min-h-dvh bg-surface">
      <aside
        className={cn(
          "hidden h-dvh shrink-0 flex-col border-r border-border bg-background lg:flex",
          collapsed ? "w-[72px]" : "w-60",
        )}
      >
        <Sidebar
          collapsed={collapsed}
          pathname={pathname}
          onToggle={() => setCollapsed((value) => !value)}
        />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-navy/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-background">
            <Sidebar
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          current={current}
          onOpenMobile={() => setMobileOpen(true)}
          onOpenCommand={() => setCommandOpen(true)}
        />
        <main className="min-h-0 flex-1 overflow-auto px-4 py-6 sm:px-6">
          <Outlet />
        </main>
        <footer className="border-t border-border bg-background px-4 py-3 sm:px-6">
          <p className="text-xs text-muted">© C.N Connect</p>
        </footer>
      </div>

      {commandOpen ? (
        <CommandPalette onClose={() => setCommandOpen(false)} />
      ) : null}
    </div>
  );
}

function Sidebar({
  collapsed = false,
  pathname,
  onToggle,
  onNavigate,
  onClose,
}: {
  collapsed?: boolean;
  pathname: string;
  onToggle?: () => void;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  return (
    <>
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-border",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        <Link
          to="/dashboard"
          className="flex min-w-0 items-center gap-2.5 no-underline"
          onClick={onNavigate}
        >
          <span className="flex size-8 shrink-0 items-center justify-center bg-brand font-display text-xs font-bold tracking-wide text-white">
            CN
          </span>
          {!collapsed ? (
            <span className="min-w-0">
              <span className="block truncate font-display text-sm font-bold tracking-[0.12em] text-navy uppercase">
                C.N Connect
              </span>
              <span className="block truncate text-[11px] text-muted">
                Operations
              </span>
            </span>
          ) : null}
        </Link>
        {onClose ? (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="flex size-8 cursor-pointer items-center justify-center text-muted transition-colors duration-150 hover:text-navy"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>

      <nav
        aria-label="Dashboard"
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-6 px-2 py-4",
          collapsed ? "overflow-visible" : "overflow-auto",
        )}
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.id}>
            {!collapsed ? (
              <p className="px-2 pb-2 text-[11px] font-medium tracking-[0.14em] text-subtle uppercase">
                {group.label}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    item={item}
                    active={isNavActive(pathname, item)}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {onToggle ? (
        <div className="border-t border-border p-2">
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-9 w-full cursor-pointer items-center justify-center text-muted transition-colors duration-150 hover:bg-surface hover:text-navy"
          >
            {collapsed ? (
              <ChevronsRight className="size-4" aria-hidden />
            ) : (
              <span className="flex w-full items-center gap-2 px-2 text-sm">
                <ChevronsLeft className="size-4" aria-hidden />
                Collapse
              </span>
            )}
          </button>
        </div>
      ) : null}
    </>
  );
}

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-9 items-center gap-2.5 text-sm font-medium no-underline transition-colors duration-150",
        collapsed ? "justify-center px-0" : "px-2.5",
        active
          ? "bg-navy text-white"
          : "text-muted hover:bg-surface hover:text-navy",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
      {collapsed ? (
        <span className="pointer-events-none absolute left-full z-20 ml-2 hidden whitespace-nowrap border border-border bg-background px-2 py-1 text-xs font-medium text-navy shadow-sm group-hover:block group-focus-visible:block">
          {item.label}
        </span>
      ) : null}
    </Link>
  );
}

function Header({
  current,
  onOpenMobile,
  onOpenCommand,
}: {
  current?: NavItem;
  onOpenMobile: () => void;
  onOpenCommand: () => void;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onOpenMobile}
          className="flex size-9 cursor-pointer items-center justify-center text-navy transition-colors duration-150 hover:bg-surface lg:hidden"
        >
          <Menu className="size-4" aria-hidden />
        </button>
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link
                to="/dashboard"
                className="text-muted no-underline transition-colors duration-150 hover:text-navy"
              >
                Dashboard
              </Link>
            </li>
            {current && !current.exact ? (
              <>
                <li aria-hidden className="text-subtle">
                  /
                </li>
                <li className="truncate font-medium text-navy">
                  {current.label}
                </li>
              </>
            ) : null}
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenCommand}
          className="hidden h-9 gap-2 text-muted sm:inline-flex"
        >
          <Search className="size-3.5" aria-hidden />
          Search
          <kbd className="ml-2 hidden border border-border px-1.5 py-0.5 text-[10px] font-medium text-subtle md:inline">
            ⌘K
          </kbd>
        </Button>
        <button
          type="button"
          aria-label="Open search"
          onClick={onOpenCommand}
          className="flex size-9 cursor-pointer items-center justify-center text-muted transition-colors duration-150 hover:bg-surface hover:text-navy sm:hidden"
        >
          <Search className="size-4" aria-hidden />
        </button>
        <Notifications />
        <UserMenu />
      </div>
    </header>
  );
}

function Notifications() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useDismiss(open, () => setOpen(false), rootRef);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex size-9 cursor-pointer items-center justify-center transition-colors duration-150",
          open ? "bg-surface text-navy" : "text-muted hover:bg-surface hover:text-navy",
        )}
      >
        <Bell className="size-4" aria-hidden />
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute top-[calc(100%+8px)] right-0 z-30 w-[min(20rem,calc(100vw-2rem))] border border-border bg-background"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-navy">Notifications</p>
          </div>
          <p className="px-4 py-6 text-sm leading-relaxed text-muted">
            No notifications yet.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function UserMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useDismiss(open, () => setOpen(false), rootRef);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex size-9 cursor-pointer items-center justify-center text-xs font-semibold transition-colors duration-150",
          open ? "bg-navy text-white" : "bg-navy-soft text-navy hover:bg-navy hover:text-white",
        )}
      >
        CN
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute top-[calc(100%+8px)] right-0 z-30 w-48 border border-border bg-background py-1"
        >
          <p className="px-3 py-2 text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
            Admin
          </p>
          <Link
            to="/dashboard/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground no-underline hover:bg-surface"
          >
            <Settings className="size-4 text-muted" aria-hidden />
            Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void navigate({ to: "/" });
            }}
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-surface"
          >
            <LogOut className="size-4 text-muted" aria-hidden />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const items = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const all = allNavItems();
    if (!normalized) return all;
    return all.filter((item) => item.label.toLowerCase().includes(normalized));
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function go(to: string) {
    onClose();
    void navigate({ to });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh]">
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 bg-navy/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Go to"
        className="relative w-full max-w-lg border border-border bg-background"
      >
        <div className="border-b border-border px-3">
          <Input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Go to…"
            aria-label="Search pages"
            className="h-12 border-0 px-1 shadow-none focus-visible:ring-0"
            onKeyDown={(event) => {
              if (event.key === "Enter" && items[0]) go(items[0].to);
            }}
          />
        </div>
        <ul className="max-h-80 overflow-auto p-1">
          {items.length === 0 ? (
            <li className="px-3 py-6 text-sm text-muted">No matching pages.</li>
          ) : (
            items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <button
                    type="button"
                    onClick={() => go(item.to)}
                    className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm text-navy hover:bg-surface"
                  >
                    <Icon className="size-4 text-muted" aria-hidden />
                    {item.label}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

function useDismiss(
  open: boolean,
  onClose: () => void,
  rootRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) onClose();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, rootRef]);
}
