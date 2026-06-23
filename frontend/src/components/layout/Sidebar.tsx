import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Upload,
    BarChart3,
    Settings,
    LogOut,
    GraduationCap,
    ChevronLeft,
    ChevronRight,
    ArrowUpCircle,
    ClipboardList,
    ClipboardCheck,
    CalendarDays,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { UserRole } from "@/types";

interface NavItem {
    label: string;
    icon: React.ElementType;
    href: string;
    roles?: UserRole[];
}

const navItems: NavItem[] = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/" },
    { label: "Students", icon: Users, href: "/students" },
    { label: "Applications", icon: ClipboardCheck, href: "/applications", roles: ["ADMIN"] },
    { label: "Schedule", icon: CalendarDays, href: "/schedule", roles: ["ADMIN"] },
    { label: "Data Import", icon: Upload, href: "/import", roles: ["ADMIN", "CLERK"] },
    { label: "Reports", icon: BarChart3, href: "/reports" },
    { label: "Promotion", icon: ArrowUpCircle, href: "/promote", roles: ["ADMIN", "CLERK"] },
    { label: "User Management", icon: Settings, href: "/users", roles: ["ADMIN"] },
    { label: "Audit Log", icon: ClipboardList, href: "/audit", roles: ["ADMIN"] },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const visibleItems = navItems.filter(
        (item) => !item.roles || (user && item.roles.includes(user.role))
    );

    const roleLabel = user?.role
        ? user.role.charAt(0) + user.role.slice(1).toLowerCase()
        : "";

    const initials = user?.fullName
        ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : user?.username?.slice(0, 2).toUpperCase() || "U";

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 flex h-screen flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out",
                    collapsed ? "w-[68px]" : "w-64"
                )}
            >
                {/* Brand */}
                <div className={cn(
                    "flex h-16 items-center border-b border-zinc-800",
                    collapsed ? "justify-center px-0" : "gap-3 px-5"
                )}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-900 dark:bg-white">
                        <GraduationCap className="h-4 w-4 text-white dark:text-zinc-950" />
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <h1 className="text-sm font-bold tracking-widest text-zinc-900 dark:text-white uppercase">SIMS</h1>
                            <p className="text-[10px] text-zinc-500 tracking-wide">A/L Management</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
                    {visibleItems.map((item) => {
                        const link = (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                end={item.href === "/"}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                                        collapsed && "justify-center px-0 py-2.5",
                                        isActive
                                            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                                    )
                                }
                            >
                                <item.icon className="h-4 w-4 shrink-0" />
                                {!collapsed && <span className="truncate">{item.label}</span>}
                            </NavLink>
                        );

                        if (collapsed) {
                            return (
                                <Tooltip key={item.href}>
                                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                                    <TooltipContent side="right" className="bg-zinc-800 text-white border-zinc-700">
                                        {item.label}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }
                        return link;
                    })}
                </nav>

                {/* Divider */}
                <div className="border-t border-zinc-200 dark:border-zinc-800" />

                {/* User + Logout */}
                <div className="p-3 space-y-1">
                    {!collapsed && user && (
                        <div className="mb-2 flex items-center gap-2.5 rounded-md bg-zinc-100 dark:bg-zinc-900 px-3 py-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-white text-xs font-semibold">
                                {initials}
                            </div>
                            <div className="overflow-hidden">
                                <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                    {user.fullName || user.username}
                                </p>
                                <p className="truncate text-[10px] text-zinc-500">{roleLabel}</p>
                            </div>
                        </div>
                    )}

                    {collapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    className="flex w-full items-center justify-center rounded-md py-2 text-zinc-600 hover:bg-zinc-100 hover:text-red-500 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-red-400 transition-colors"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-zinc-800 text-white border-zinc-700">
                                Sign Out
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <button
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-red-500 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-red-400 transition-colors"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            Sign Out
                        </button>
                    )}
                </div>

                {/* Collapse toggle */}
                <div className="border-t border-zinc-200 dark:border-zinc-800 p-2">
                    <button
                        className="flex w-full items-center justify-center rounded-md py-1.5 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 dark:text-zinc-400 transition-colors"
                        onClick={onToggle}
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </aside>
        </TooltipProvider>
    );
}
