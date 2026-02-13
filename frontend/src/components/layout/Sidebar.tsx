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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    { label: "Data Import", icon: Upload, href: "/import", roles: ["ADMIN", "CLERK"] },
    { label: "Reports", icon: BarChart3, href: "/reports" },
    { label: "User Management", icon: Settings, href: "/users", roles: ["ADMIN"] },
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

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card transition-all duration-300 ease-in-out",
                    collapsed ? "w-[68px]" : "w-64"
                )}
            >
                {/* Brand */}
                <div className="flex h-16 items-center gap-3 border-b px-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden transition-all duration-300">
                            <h1 className="text-lg font-bold tracking-tight">SIMS</h1>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                    {visibleItems.map((item) => {
                        const link = (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                end={item.href === "/"}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )
                                }
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
                                {!collapsed && <span className="truncate">{item.label}</span>}
                            </NavLink>
                        );

                        if (collapsed) {
                            return (
                                <Tooltip key={item.href}>
                                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                                    <TooltipContent side="right">{item.label}</TooltipContent>
                                </Tooltip>
                            );
                        }
                        return link;
                    })}
                </nav>

                <Separator />

                {/* User + Logout */}
                <div className="p-3">
                    {!collapsed && user && (
                        <div className="mb-2 rounded-md bg-muted/50 px-3 py-2">
                            <p className="truncate text-sm font-medium">{user.fullName || user.username}</p>
                            <p className="truncate text-xs text-muted-foreground capitalize">
                                {user.role.toLowerCase().replace("_", " ")}
                            </p>
                        </div>
                    )}
                    {collapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-full text-muted-foreground hover:text-destructive"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Sign Out</TooltipContent>
                        </Tooltip>
                    ) : (
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-5 w-5" />
                            Sign Out
                        </Button>
                    )}
                </div>

                {/* Collapse toggle */}
                <div className="border-t p-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-full"
                        onClick={onToggle}
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </aside>
        </TooltipProvider>
    );
}
