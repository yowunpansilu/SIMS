import { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CalendarDays, Clock, MapPin, Users, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { AL_STREAM_LABELS } from "@/lib/alSubjects";
import type { ALStream, Student } from "@/types";

const STREAM_COLORS: Record<string, string> = {
    PHYSICAL_SCIENCE:   "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    BIOLOGICAL_SCIENCE: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    COMMERCE:           "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    TECHNOLOGY:         "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    ARTS:               "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    students: Student[];
    onScheduled: () => void;
}

type Step = 1 | 2 | 3;

function formatSlot(_date: string, time: string, index: number, duration: number): string {
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + index * duration;
    const sh = Math.floor(total / 60) % 24;
    const sm = total % 60;
    const eh = Math.floor((total + duration) / 60) % 24;
    const em = (total + duration) % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(sh)}:${pad(sm)} – ${pad(eh)}:${pad(em)}`;
}

export default function ScheduleInterviewDialog({ open, onOpenChange, students, onScheduled }: Props) {
    const [step, setStep] = useState<Step>(1);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [location, setLocation] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const DURATION = 10;

    const pending = students.filter(
        (s) => s.registrationStatus === "PENDING_APPROVAL" || s.registrationStatus === "SCHEDULED"
    );

    const toggleAll = () => {
        if (selectedIds.size === pending.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(pending.map((s) => s.id)));
        }
    };

    const selectedStudents = useMemo(
        () => pending.filter((s) => selectedIds.has(s.id)),
        [pending, selectedIds]
    );

    const slotCount = selectedStudents.length;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            const startAt = `${date}T${startTime}:00`;
            await api.post("/interviews/schedule-batch", {
                studentIds: selectedStudents.map((s) => s.id),
                startAt,
                durationMinutes: DURATION,
                location,
            });
            toast.success(`${slotCount} interview${slotCount !== 1 ? "s" : ""} scheduled — emails sent`);
            onScheduled();
            onOpenChange(false);
            resetState();
        } catch {
            toast.error("Failed to schedule interviews");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetState = () => {
        setStep(1);
        setSelectedIds(new Set());
        setDate("");
        setStartTime("09:00");
        setLocation("");
    };

    const handleClose = (open: boolean) => {
        if (!open) resetState();
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                    <DialogTitle className="text-xl font-semibold">Schedule Interviews</DialogTitle>
                    <DialogDescription>
                        Step {step} of 3 — {step === 1 ? "Select students" : step === 2 ? "Configure session" : "Preview & confirm"}
                    </DialogDescription>
                    {/* Step indicator */}
                    <div className="flex items-center gap-2 pt-1">
                        {([1, 2, 3] as Step[]).map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={cn(
                                    "h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                                    step >= s
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    {s}
                                </div>
                                {s < 3 && <div className={cn("h-px w-8 transition-colors", step > s ? "bg-primary" : "bg-muted")} />}
                            </div>
                        ))}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {/* Step 1: Select Students */}
                    {step === 1 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">{pending.length} applicants eligible</p>
                                <button
                                    className="text-xs text-primary hover:underline"
                                    onClick={toggleAll}
                                >
                                    {selectedIds.size === pending.length ? "Deselect all" : "Select all"}
                                </button>
                            </div>
                            {pending.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground text-sm">No pending applicants to schedule.</p>
                            ) : (
                                <div className="space-y-1.5">
                                    {pending.map((s) => (
                                        <label
                                            key={s.id}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                                                selectedIds.has(s.id)
                                                    ? "border-primary/50 bg-primary/5"
                                                    : "hover:bg-muted/50"
                                            )}
                                        >
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                                                checked={selectedIds.has(s.id)}
                                                onChange={(e) => {
                                                    setSelectedIds((prev) => {
                                                        const next = new Set(prev);
                                                        if (e.target.checked) next.add(s.id);
                                                        else next.delete(s.id);
                                                        return next;
                                                    });
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm truncate">{s.fullName}</span>
                                                    {s.alStream && (
                                                        <span className={cn(
                                                            "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                                                            STREAM_COLORS[s.alStream] ?? "bg-muted text-muted-foreground"
                                                        )}>
                                                            {AL_STREAM_LABELS[s.alStream as ALStream] ?? s.alStream}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{s.nicNumber}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Configure session */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="flex items-center gap-1.5">
                                        <CalendarDays className="h-3.5 w-3.5" /> Date *
                                    </Label>
                                    <Input
                                        type="date"
                                        value={date}
                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" /> Start Time *
                                    </Label>
                                    <Input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5" /> Location / Link
                                </Label>
                                <Input
                                    placeholder="e.g. Room 101 or Zoom link"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                            <div className="rounded-lg bg-muted/50 px-4 py-3 space-y-1 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>{slotCount} students selected</span>
                                </div>
                                <p className="text-muted-foreground text-xs">
                                    Slot duration: 10 minutes each · Total time: {slotCount * DURATION} minutes
                                </p>
                                {date && startTime && (
                                    <p className="text-xs font-medium mt-1">
                                        Session: {formatSlot(date, startTime, 0, DURATION).split(" – ")[0]} – {formatSlot(date, startTime, slotCount - 1, DURATION).split(" – ")[1]}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preview */}
                    {step === 3 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{date}</span>
                                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location || "No location set"}</span>
                            </div>
                            <div className="rounded-lg border overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
                                    <span>STUDENT</span>
                                    <span>TIME SLOT</span>
                                </div>
                                <div className="divide-y">
                                    {selectedStudents.map((s, i) => (
                                        <div key={s.id} className="px-4 py-2.5 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">{s.fullName}</p>
                                                <p className="text-xs text-muted-foreground">{s.nicNumber}</p>
                                            </div>
                                            <span className="font-mono text-sm text-muted-foreground">
                                                {formatSlot(date, startTime, i, DURATION)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Confirmation emails will be sent to each student after scheduling.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 border-t shrink-0 flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => step === 1 ? handleClose(false) : setStep((s) => (s - 1) as Step)}
                    >
                        {step === 1 ? "Cancel" : <><ChevronLeft className="mr-1 h-4 w-4" /> Back</>}
                    </Button>
                    {step < 3 ? (
                        <Button
                            onClick={() => setStep((s) => (s + 1) as Step)}
                            disabled={
                                (step === 1 && selectedIds.size === 0) ||
                                (step === 2 && (!date || !startTime))
                            }
                        >
                            Next <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm & Send Emails
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
