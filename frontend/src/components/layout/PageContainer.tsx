import { cn } from "@/lib/utils";

interface PageContainerProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export default function PageContainer({
    title,
    description,
    actions,
    children,
    className,
}: PageContainerProps) {
    return (
        <div className={cn("animate-fade-in space-y-6 p-6", className)}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    {description && (
                        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
            {children}
        </div>
    );
}
