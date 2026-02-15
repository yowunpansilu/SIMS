import { FileQuestion } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: LucideIcon;
    action?: React.ReactNode;
    className?: string;
}

export default function EmptyState({
    title = "No data found",
    description = "No results match your criteria.",
    icon: Icon = FileQuestion,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex h-full min-h-[400px] w-full flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50",
                className
            )}
        >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mb-4 mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
