import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon;
    description?: string;
    accent?: "blue" | "green" | "purple" | "amber" | "default";
    className?: string;
}

const accentBorder: Record<string, string> = {
    blue: "border-l-blue-500",
    green: "border-l-emerald-500",
    purple: "border-l-purple-500",
    amber: "border-l-amber-500",
    default: "border-l-zinc-300",
};

export default function StatCard({
    title,
    value,
    description,
    accent = "default",
    className,
}: StatCardProps) {
    return (
        <div
            className={cn(
                "rounded-lg border border-l-4 bg-white p-6",
                accentBorder[accent],
                className
            )}
        >
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                {title}
            </p>
            <p className="text-3xl font-bold text-zinc-900 leading-none">
                {value.toLocaleString()}
            </p>
            {description && (
                <p className="mt-2 text-xs text-zinc-400">{description}</p>
            )}
        </div>
    );
}
