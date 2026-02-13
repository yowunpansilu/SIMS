import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const breadcrumbMap: Record<string, string> = {
    "/": "Dashboard",
    "/students": "Students",
    "/import": "Data Import",
    "/reports": "Reports",
    "/users": "User Management",
};

export default function Header() {
    const { user, logout } = useAuth();
    const { resolvedTheme, setTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Build breadcrumb segments
    const segments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = [
        { label: "Home", href: "/" },
        ...segments.map((_, i) => {
            const href = "/" + segments.slice(0, i + 1).join("/");
            return { label: breadcrumbMap[href] || segments[i], href };
        }),
    ];

    const initials = user?.fullName
        ? user.fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : user?.username?.slice(0, 2).toUpperCase() || "U";

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 px-6 backdrop-blur-sm">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1 text-sm">
                {breadcrumbs.map((crumb, i) => (
                    <span key={crumb.href} className="flex items-center gap-1">
                        {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                        {i < breadcrumbs.length - 1 ? (
                            <Link
                                to={crumb.href}
                                className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {crumb.label}
                            </Link>
                        ) : (
                            <span className="font-medium text-foreground">{crumb.label}</span>
                        )}
                    </span>
                ))}
            </nav>

            {/* Right side: theme toggle + user menu */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                    aria-label="Toggle theme"
                >
                    {resolvedTheme === "dark" ? (
                        <Sun className="h-5 w-5" />
                    ) : (
                        <Moon className="h-5 w-5" />
                    )}
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <p className="text-sm font-medium">{user?.fullName || user?.username}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                                {user?.role.toLowerCase().replace("_", " ")}
                            </p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-destructive focus:text-destructive"
                        >
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
