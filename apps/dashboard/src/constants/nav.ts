import {
  ArrowLeftRight,
  Building2,
  Globe,
  Landmark,
  LayoutDashboard,
  Percent,
  Settings,
  Smartphone,
  Waypoints,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "main",
    label: "Main",
    items: [
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      { to: "/dashboard/transfers", label: "Transfers", icon: ArrowLeftRight },
    ],
  },
  {
    id: "configuration",
    label: "Configuration",
    items: [
      { to: "/dashboard/routes", label: "Routes", icon: Waypoints },
      { to: "/dashboard/countries", label: "Countries", icon: Globe },
      // { to: "/dashboard/banks", label: "Banks", icon: Landmark },
      // {
      //   to: "/dashboard/networks",
      //   label: "Mobile networks",
      //   icon: Smartphone,
      // },
      // { to: "/dashboard/rates", label: "Exchange rates", icon: Percent },
      {
        to: "/dashboard/payment-accounts",
        label: "Payment accounts",
        icon: Building2,
      },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [{ to: "/dashboard/settings", label: "Settings", icon: Settings }],
  },
];

export function allNavItems() {
  return NAV_GROUPS.flatMap((group) => group.items);
}

export function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

export function isNavActive(pathname: string, item: NavItem) {
  const path = normalizePath(pathname);
  const to = normalizePath(item.to);
  if (item.exact) return path === to;
  return path === to || path.startsWith(`${to}/`);
}

export function navItemForPath(pathname: string) {
  const items = allNavItems();
  const exact = items.find((item) => item.exact && isNavActive(pathname, item));
  if (exact) return exact;
  return [...items]
    .filter((item) => !item.exact)
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => isNavActive(pathname, item));
}
