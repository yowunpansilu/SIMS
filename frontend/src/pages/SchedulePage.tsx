import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    CheckCircle2,
    XCircle,
    Clock,
    MapPin,
    Phone,
    Mail,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { AL_STREAM_LABELS } from "@/lib/alSubjects";
import type { ALStream } from "@/types";

// ── Types ────────────────────────────────────────────────────────────────────

interface InterviewDTO {
    id: number;
    studentId: number;
    studentName: string;
    studentNic: string;
    studentEmail: string;
    studentAlStream: string;
    studentContactNumber: string;
    studentParentContactNumber: string;
    scheduledAt: string;
    durationMinutes: number;
    location: string;
    status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
    notes?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STREAM_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    PHYSICAL_SCIENCE:   { bg: "bg-blue-50 dark:bg-blue-950/30",   text: "text-blue-700 dark:text-blue-300",   border: "border-blue-200 dark:border-blue-800",   dot: "bg-blue-500" },
    BIOLOGICAL_SCIENCE: { bg: "bg-green-50 dark:bg-green-950/30",  text: "text-green-700 dark:text-green-300",  border: "border-green-200 dark:border-green-800",  dot: "bg-green-500" },
    COMMERCE:           { bg: "bg-purple-50 dark:bg-purple-950/30",text: "text-purple-700 dark:text-purple-300",border: "border-purple-200 dark:border-purple-800",dot: "bg-purple-500" },
    TECHNOLOGY:         { bg: "bg-orange-50 dark:bg-orange-950/30",text: "text-orange-700 dark:text-orange-300",border: "border-orange-200 dark:border-orange-800",dot: "bg-orange-500" },
    ARTS:               { bg: "bg-rose-50 dark:bg-rose-950/30",    text: "text-rose-700 dark:text-rose-300",    border: "border-rose-200 dark:border-rose-800",    dot: "bg-rose-500" },
};

const STATUS_STYLES: Record<InterviewDTO["status"], string> = {
    SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const TIMELINE_START = 8;   // 08:00
const TIMELINE_END   = 18;  // 18:00
const HOUR_HEIGHT    = 300; // px per hour (increased to accommodate 10-min slots)

function toDateStr(d: Date) {
    return d.toISOString().split("T")[0];
}

function formatDisplayDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function timeToMinutes(isoStr: string): number {
    const d = new Date(isoStr);
    return d.getHours() * 60 + d.getMinutes();
}

function formatTime(isoStr: string) {
    const d = new Date(isoStr);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SchedulePage() {
    const [date, setDate] = useState(toDateStr(new Date()));
    const [interviews, setInterviews] = useState<InterviewDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Approve dialog
    const [approveTarget, setApproveTarget] = useState<InterviewDTO | null>(null);
    const [admissionInput, setAdmissionInput] = useState("");
    const [isApproving, setIsApproving] = useState(false);

    // Reject dialog
    const [rejectTarget, setRejectTarget] = useState<InterviewDTO | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    const fetchInterviews = useCallback(async (d: string) => {
        setIsLoading(true);
        try {
            const res = await api.get<InterviewDTO[]>(`/interviews?date=${d}`);
            setInterviews(res.data);
        } catch {
            toast.error("Failed to load interviews");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInterviews(date);
    }, [date, fetchInterviews]);

    const navigate = (delta: number) => {
        const d = new Date(date + "T00:00:00");
        d.setDate(d.getDate() + delta);
        setDate(toDateStr(d));
    };


    const handleApprove = async () => {
        if (!approveTarget || !admissionInput.trim()) return;
        setIsApproving(true);
        try {
            await api.post(`/students/${approveTarget.studentId}/approve`, {
                admissionNumber: admissionInput.trim(),
            });
            toast.success(`${approveTarget.studentName} approved`);
            setApproveTarget(null);
            setAdmissionInput("");
            fetchInterviews(date);
        } catch {
            toast.error("Failed to approve student");
        } finally {
            setIsApproving(false);
        }
    };

    const handleReject = async () => {
        if (!rejectTarget || !rejectReason.trim()) return;
        setIsRejecting(true);
        try {
            await api.post(`/students/${rejectTarget.studentId}/reject`, { reason: rejectReason.trim() });
            toast.success("Application rejected");
            setRejectTarget(null);
            setRejectReason("");
            fetchInterviews(date);
        } catch {
            toast.error("Failed to reject application");
        } finally {
            setIsRejecting(false);
        }
    };

    // Summary counts
    const counts = {
        SCHEDULED: interviews.filter((i) => i.status === "SCHEDULED").length,
        COMPLETED: interviews.filter((i) => i.status === "COMPLETED").length,
        CANCELLED: interviews.filter((i) => i.status === "CANCELLED").length,
    };

    return (
        <TooltipProvider>
            <div className="flex flex-col h-full animate-fade-in">

                {/* ── Header ───────────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-6 py-5 border-b shrink-0">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Interview Schedule</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">Day-view interview timeline</p>
                    </div>

                    {/* Date navigation */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-center min-w-[200px]">
                            <p className="text-sm font-semibold">{formatDisplayDate(date)}</p>
                        </div>
                        <Button variant="outline" size="icon" onClick={() => navigate(1)}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-1"
                            onClick={() => setDate(toDateStr(new Date()))}
                            disabled={date === toDateStr(new Date())}
                        >
                            Today
                        </Button>
                        <input
                            type="date"
                            className="ml-1 h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">

                    {/* ── Timeline ─────────────────────────────────────────── */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="relative px-4 py-4">
                                {/* Hour rows */}
                                {Array.from({ length: TIMELINE_END - TIMELINE_START }, (_, i) => {
                                    const hour = TIMELINE_START + i;
                                    return (
                                        <div
                                            key={hour}
                                            className="flex"
                                            style={{ height: `${HOUR_HEIGHT}px` }}
                                        >
                                            <div className="w-16 shrink-0 text-xs text-muted-foreground pt-0.5 select-none">
                                                {hour === 12 ? "12 PM" : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
                                            </div>
                                            <div className="flex-1 border-t border-border/50" />
                                        </div>
                                    );
                                })}

                                {/* Interview cards — absolutely positioned */}
                                {interviews.map((interview) => {
                                    const minutes = timeToMinutes(interview.scheduledAt);
                                    const offsetMinutes = minutes - TIMELINE_START * 60;
                                    if (offsetMinutes < 0 || offsetMinutes >= (TIMELINE_END - TIMELINE_START) * 60) return null;

                                    const top = (offsetMinutes / 60) * HOUR_HEIGHT;
                                    const height = Math.max((interview.durationMinutes / 60) * HOUR_HEIGHT, 50);
                                    const colors = STREAM_COLORS[interview.studentAlStream] ?? {
                                        bg: "bg-muted", text: "text-foreground", border: "border-border", dot: "bg-muted-foreground"
                                    };

                                    return (
                                        <div
                                            key={interview.id}
                                            className={cn(
                                                "absolute left-[72px] right-4 rounded-lg border px-3 py-2 shadow-sm transition-shadow hover:shadow-md group",
                                                colors.bg,
                                                colors.border,
                                                interview.status === "CANCELLED" && "opacity-50"
                                            )}
                                            style={{ top: `${top + 16}px`, height: `${height}px` }}
                                        >
                                            <div className="flex items-start justify-between gap-2 h-full">
                                                <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                                                    {/* Top row: name + stream badge */}
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className={cn("text-sm font-semibold truncate", colors.text)}>
                                                                {interview.studentName}
                                                            </span>
                                                            {interview.studentAlStream && (
                                                                <span className={cn(
                                                                    "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                                                                    colors.text,
                                                                    "bg-white/50 dark:bg-black/20"
                                                                )}>
                                                                    {AL_STREAM_LABELS[interview.studentAlStream as ALStream] ?? interview.studentAlStream}
                                                                </span>
                                                            )}
                                                            <span className={cn(
                                                                "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                                                                STATUS_STYLES[interview.status]
                                                            )}>
                                                                {interview.status}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-0.5">
                                                            <span className={cn("text-xs", colors.text, "opacity-70")}>
                                                                {interview.studentNic}
                                                            </span>
                                                            <span className={cn("flex items-center gap-1 text-xs", colors.text, "opacity-70")}>
                                                                <Clock className="h-3 w-3" />
                                                                {formatTime(interview.scheduledAt)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Hover-revealed contact info */}
                                                    <div className="hidden group-hover:flex items-center gap-3 mt-1">
                                                        {interview.studentEmail && (
                                                            <span className={cn("flex items-center gap-1 text-[10px]", colors.text, "opacity-70")}>
                                                                <Mail className="h-3 w-3" />
                                                                {interview.studentEmail}
                                                            </span>
                                                        )}
                                                        {interview.studentContactNumber && (
                                                            <span className={cn("flex items-center gap-1 text-[10px]", colors.text, "opacity-70")}>
                                                                <Phone className="h-3 w-3" />
                                                                {interview.studentContactNumber}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action buttons — visible on hover */}
                                                <div className="hidden group-hover:flex items-start gap-1 shrink-0 pt-0.5">
                                                    {interview.status === "SCHEDULED" && (
                                                        <>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-7 w-7 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                                                                        onClick={() => {
                                                                            setApproveTarget(interview);
                                                                            setAdmissionInput("");
                                                                        }}
                                                                    >
                                                                        <CheckCircle2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Approve student</TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                                                        onClick={() => {
                                                                            setRejectTarget(interview);
                                                                            setRejectReason("");
                                                                        }}
                                                                    >
                                                                        <XCircle className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Reject application</TooltipContent>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                    {interview.status === "COMPLETED" && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-7 w-7 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                                                                    onClick={() => {
                                                                        setApproveTarget(interview);
                                                                        setAdmissionInput("");
                                                                    }}
                                                                >
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Approve student</TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {interviews.length === 0 && !isLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground pointer-events-none">
                                        <CalendarDays className="h-10 w-10 opacity-20" />
                                        <p className="text-sm">No interviews scheduled for this day</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Sidebar summary ───────────────────────────────────── */}
                    <div className="w-64 shrink-0 border-l bg-muted/20 p-4 space-y-4 overflow-y-auto">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            Day Summary
                        </h2>

                        {/* Count cards */}
                        <div className="space-y-2">
                            {(["SCHEDULED", "COMPLETED", "CANCELLED"] as const).map((s) => (
                                <div
                                    key={s}
                                    className={cn(
                                        "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm",
                                        s === "SCHEDULED" ? "bg-blue-50 dark:bg-blue-950/30" :
                                        s === "COMPLETED" ? "bg-emerald-50 dark:bg-emerald-950/30" :
                                        "bg-red-50 dark:bg-red-950/30"
                                    )}
                                >
                                    <span className={cn(
                                        "font-medium",
                                        s === "SCHEDULED" ? "text-blue-700 dark:text-blue-300" :
                                        s === "COMPLETED" ? "text-emerald-700 dark:text-emerald-300" :
                                        "text-red-700 dark:text-red-300"
                                    )}>
                                        {s.charAt(0) + s.slice(1).toLowerCase()}
                                    </span>
                                    <span className={cn(
                                        "text-xl font-bold tabular-nums",
                                        s === "SCHEDULED" ? "text-blue-700 dark:text-blue-300" :
                                        s === "COMPLETED" ? "text-emerald-700 dark:text-emerald-300" :
                                        "text-red-700 dark:text-red-300"
                                    )}>
                                        {counts[s]}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Location */}
                        {interviews.length > 0 && interviews[0].location && (
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</p>
                                <div className="flex items-start gap-1.5 text-sm">
                                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                                    <span className="break-words">{interviews[0].location}</span>
                                </div>
                            </div>
                        )}

                        {/* Stream breakdown */}
                        {interviews.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">By Stream</p>
                                {Object.entries(
                                    interviews.reduce<Record<string, number>>((acc, i) => {
                                        const s = i.studentAlStream || "UNKNOWN";
                                        acc[s] = (acc[s] ?? 0) + 1;
                                        return acc;
                                    }, {})
                                ).map(([stream, count]) => {
                                    const c = STREAM_COLORS[stream];
                                    return (
                                        <div key={stream} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1.5">
                                                {c && <div className={cn("h-2 w-2 rounded-full shrink-0", c.dot)} />}
                                                <span className="text-muted-foreground">
                                                    {AL_STREAM_LABELS[stream as ALStream] ?? stream}
                                                </span>
                                            </div>
                                            <span className="font-semibold tabular-nums">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Interview list */}
                        {interviews.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">All Slots</p>
                                <div className="space-y-1">
                                    {[...interviews]
                                        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
                                        .map((i) => {
                                            const c = STREAM_COLORS[i.studentAlStream];
                                            return (
                                                <div key={i.id} className="flex items-center gap-2 py-1.5">
                                                    {c && <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", c.dot)} />}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium truncate">{i.studentName}</p>
                                                        <p className="text-[10px] text-muted-foreground">{formatTime(i.scheduledAt)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Approve dialog ─────────────────────────────────────── */}
                <Dialog open={!!approveTarget} onOpenChange={(o) => !o && setApproveTarget(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Approve Application</DialogTitle>
                            <DialogDescription>
                                Assign an admission number to{" "}
                                <span className="font-medium">{approveTarget?.studentName}</span>.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 px-4 py-3 flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
                            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                            <p>
                                This will move <strong>{approveTarget?.studentName}</strong> to active students.
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="space-y-2 py-1">
                            <Label htmlFor="schedAdmission">Admission Number *</Label>
                            <Input
                                id="schedAdmission"
                                placeholder="e.g. ADM2024042"
                                value={admissionInput}
                                onChange={(e) => setAdmissionInput(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setApproveTarget(null)} disabled={isApproving}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleApprove}
                                disabled={!admissionInput.trim() || isApproving}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Approve
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* ── Reject dialog ─────────────────────────────────────── */}
                <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Reject Application</DialogTitle>
                            <DialogDescription>
                                Rejecting the application of{" "}
                                <span className="font-medium">{rejectTarget?.studentName}</span>.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 px-4 py-3 flex items-start gap-2 text-sm text-red-800 dark:text-red-300">
                            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                            <p>
                                This will reject <strong>{rejectTarget?.studentName}</strong>'s application.
                                They can be re-queued from the Applications page.
                            </p>
                        </div>
                        <div className="space-y-2 py-1">
                            <Label htmlFor="schedRejectReason">Reason *</Label>
                            <Textarea
                                id="schedRejectReason"
                                rows={3}
                                maxLength={500}
                                placeholder="Enter reason for rejection"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRejectTarget(null)} disabled={isRejecting}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || isRejecting}
                            >
                                {isRejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Reject
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}
