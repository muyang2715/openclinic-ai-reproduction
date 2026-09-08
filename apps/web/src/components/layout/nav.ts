import {
  LayoutDashboard,
  Stethoscope,
  CalendarDays,
  PhoneCall,
  BookOpen,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { label: "工作台", href: "/dashboard", icon: LayoutDashboard },
  { label: "医生管理", href: "/doctors", icon: Stethoscope },
  { label: "预约管理", href: "/appointments", icon: CalendarDays },
  { label: "通话记录", href: "/calls", icon: PhoneCall },
  { label: "知识库", href: "/knowledge-base", icon: BookOpen },
  { label: "运营分析", href: "/analytics", icon: BarChart3 },
  { label: "系统设置", href: "/settings", icon: Settings },
];
