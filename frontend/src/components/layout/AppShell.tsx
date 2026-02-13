import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";

export default function AppShell() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
            <div
                className={cn(
                    "flex min-h-screen flex-col transition-all duration-300",
                    collapsed ? "ml-[68px]" : "ml-64"
                )}
            >
                <Header />
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
