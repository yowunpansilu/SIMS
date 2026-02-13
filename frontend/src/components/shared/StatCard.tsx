import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: { value: number; isPositive: boolean };
    className?: string;
    iconColor?: string;
}

export default function StatCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
    iconColor = "text-primary",
}: StatCardProps) {
    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md",
                className
            )}
        >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold tracking-tight">{value}</p>
                    {description && (
                        <p className="text-xs text-muted-foreground">{description}</p>
                    )}
                    {trend && (
                        <p
                            className={cn(
                                "flex items-center gap-1 text-xs font-medium",
                                trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                            )}
                        >
                            <span>{trend.isPositive ? "↑" : "↓"}</span>
                            {Math.abs(trend.value)}% from last year
                        </p>
                    )}
                </div>
                <div
                    className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10",
                        iconColor
                    )}
                >
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}
