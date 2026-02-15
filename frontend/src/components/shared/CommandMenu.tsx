import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    LayoutDashboard,
    Users,
    FileSpreadsheet,
    BarChart3,
    UserCircle,
    Sun,
    Moon,
    LogOut,
    Laptop,
} from "lucide-react";

export function CommandMenu() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { setTheme } = useTheme();
    const { logout, user } = useAuth();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                    <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/students"))}>
                        <Users className="mr-2 h-4 w-4" />
                        Students
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/reports"))}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Reports
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/import"))}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Data Import
                    </CommandItem>
                </CommandGroup>

                {user?.role === "ADMIN" && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Admin">
                            <CommandItem onSelect={() => runCommand(() => navigate("/users"))}>
                                <UserCircle className="mr-2 h-4 w-4" />
                                User Management
                            </CommandItem>
                        </CommandGroup>
                    </>
                )}

                <CommandSeparator />
                <CommandGroup heading="Theme">
                    <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
                        <Sun className="mr-2 h-4 w-4" />
                        Light
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
                        <Moon className="mr-2 h-4 w-4" />
                        Dark
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
                        <Laptop className="mr-2 h-4 w-4" />
                        System
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />
                <CommandGroup heading="Settings">
                    <CommandItem onSelect={() => runCommand(() => { logout(); navigate("/login"); })}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
