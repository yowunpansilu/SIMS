import { useState } from "react";
import { useStudents } from "@/hooks/useStudents";
import PageContainer from "@/components/layout/PageContainer";
import { DataTable } from "@/components/shared/DataTable";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type ColumnDef } from "@tanstack/react-table";
import {
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    ClipboardList,
    Loader2,
    RotateCcw,
    Trash2,
    Info,
    BarChart2,
    CalendarDays,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import EmptyState from "@/components/shared/EmptyState";
import ScheduleInterviewDialog from "@/components/ScheduleInterviewDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AL_STREAM_LABELS } from "@/lib/alSubjects";
import type { Student, ALStream } from "@/types";

const STATUS_STYLES: Record<string, string> = {
    PENDING_APPROVAL: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    REJECTED:         "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

type TabValue = "PENDING_APPROVAL" | "REJECTED";

export default function ApplicationsPage() {
    const { students, isLoading, approveStudent, rejectStudent, requeueStudent, deleteStudent } = useStudents({
        studentType: "EXTERNAL",
    });

    const [activeTab, setActiveTab] = useState<TabValue>("PENDING_APPROVAL");

    // Approve dialog state
    const [approveTarget, setApproveTarget] = useState<Student | null>(null);
    const [admissionInput, setAdmissionInput] = useState("");
    const [isApproving, setIsApproving] = useState(false);

    // Reject dialog state
    const [rejectTarget, setRejectTarget] = useState<Student | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    // Requeue / delete state
    const [isRequeueing, setIsRequeueing] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const [scheduleOpen, setScheduleOpen] = useState(false);

    const filtered = students.filter((s) =>
        s.registrationStatus === activeTab
    );

    const handleApprove = async () => {
        if (!approveTarget || !admissionInput.trim()) return;
        setIsApproving(true);
        try {
            await approveStudent(approveTarget.id, admissionInput.trim());
            toast.success(`${approveTarget.fullName} approved and assigned ${admissionInput.trim()}`);
            setApproveTarget(null);
            setAdmissionInput("");
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
            await rejectStudent(rejectTarget.id, rejectReason.trim());
            toast.success(`Application rejected`);
            setRejectTarget(null);
            setRejectReason("");
        } catch {
            toast.error("Failed to reject application");
        } finally {
            setIsRejecting(false);
        }
    };

    const rejectionReasonColumn: ColumnDef<Student> = {
        accessorKey: "rejectionReason",
        header: "Reason",
        cell: ({ row }) => {
            const reason = row.original.rejectionReason;
            if (!reason) return <span className="text-muted-foreground">—</span>;
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 cursor-default max-w-[200px]">
                                <span className="text-sm truncate">{reason}</span>
                                <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs whitespace-pre-wrap">
                            {reason}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        },
    };

    const columns: ColumnDef<Student>[] = [
        {
            accessorKey: "fullName",
            header: "Full Name",
            cell: ({ row }) => <span className="font-medium">{row.original.fullName}</span>,
        },
        {
            accessorKey: "nicNumber",
            header: "NIC",
            cell: ({ row }) => (
                <span className="font-mono text-xs">{row.original.nicNumber || "—"}</span>
            ),
        },
        {
            accessorKey: "medium",
            header: "Medium",
            cell: ({ row }) =>
                row.original.medium
                    ? row.original.medium.charAt(0) + row.original.medium.slice(1).toLowerCase()
                    : "—",
        },
        {
            accessorKey: "alStream",
            header: "Stream",
            cell: ({ row }) => {
                const stream = row.original.alStream;
                if (!stream) return <span className="text-muted-foreground">—</span>;
                return (
                    <span className="text-sm">
                        {AL_STREAM_LABELS[stream as ALStream] ?? stream}
                    </span>
                );
            },
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => row.original.email || "—",
        },
        {
            accessorKey: "contactNumber",
            header: "Contact",
            cell: ({ row }) => row.original.contactNumber || "—",
        },
        {
            accessorKey: "registrationStatus",
            header: "Status",
            cell: ({ row }) => (
                <span
                    className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        STATUS_STYLES[row.original.registrationStatus] ?? ""
                    )}
                >
                    {row.original.registrationStatus === "PENDING_APPROVAL"
                        ? "Pending"
                        : row.original.registrationStatus === "REJECTED"
                        ? "Rejected"
                        : row.original.registrationStatus}
                </span>
            ),
        },
        ...(activeTab === "REJECTED" ? [rejectionReasonColumn] : []),
        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => {
                const s = row.original;
                if (s.registrationStatus === "ACTIVE") return null;

                if (s.registrationStatus === "REJECTED") {
                    return (
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs text-amber-600 border-amber-300 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-800 dark:hover:bg-amber-950/40"
                                disabled={isRequeueing === s.id}
                                onClick={async () => {
                                    setIsRequeueing(s.id);
                                    try {
                                        await requeueStudent(s.id);
                                        toast.success(`${s.fullName} moved back to pending`);
                                    } catch {
                                        toast.error("Failed to requeue student");
                                    } finally {
                                        setIsRequeueing(null);
                                    }
                                }}
                            >
                                {isRequeueing === s.id
                                    ? <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                    : <RotateCcw className="mr-1 h-3 w-3" />}
                                Queue
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                                disabled={isDeleting === s.id}
                                onClick={async () => {
                                    setIsDeleting(s.id);
                                    try {
                                        await deleteStudent(s.id);
                                        toast.success(`${s.fullName} deleted`);
                                    } catch {
                                        toast.error("Failed to delete record");
                                    } finally {
                                        setIsDeleting(null);
                                    }
                                }}
                            >
                                {isDeleting === s.id
                                    ? <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                    : <Trash2 className="mr-1 h-3 w-3" />}
                                Delete
                            </Button>
                        </div>
                    );
                }

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => {
                                    setApproveTarget(s);
                                    setAdmissionInput("");
                                }}
                                className="text-emerald-700 focus:text-emerald-700"
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    setRejectTarget(s);
                                    setRejectReason("");
                                }}
                                className="text-destructive focus:text-destructive"
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <PageContainer
            title="Student Applications"
            description="External students awaiting approval"
            actions={
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open("/analytics", "_blank")}>
                        <BarChart2 className="mr-2 h-4 w-4" />
                        Analytics
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setScheduleOpen(true)}>
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Schedule Interviews
                    </Button>
                </div>
            }
        >
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
                <TabsList className="mb-4">
                    <TabsTrigger value="PENDING_APPROVAL">Pending</TabsTrigger>
                    <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
                </TabsList>
            </Tabs>

            <DataTable
                columns={columns}
                data={filtered}
                isLoading={isLoading}
                searchKey="fullName"
                searchPlaceholder="Search applicants…"
                noResults={
                    <EmptyState
                        title="No applications"
                        description="External student applications will appear here."
                        icon={ClipboardList}
                    />
                }
            />

            {/* Approve dialog */}
            <Dialog
                open={!!approveTarget}
                onOpenChange={(open) => !open && setApproveTarget(null)}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Approve Application</DialogTitle>
                        <DialogDescription>
                            Assign an admission number to{" "}
                            <span className="font-medium">{approveTarget?.fullName}</span> and move
                            them to the active students list.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label htmlFor="admissionInput">Admission Number *</Label>
                        <Input
                            id="admissionInput"
                            placeholder="e.g. ADM2024042"
                            value={admissionInput}
                            onChange={(e) => setAdmissionInput(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setApproveTarget(null)}
                            disabled={isApproving}
                        >
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

            {/* Reject dialog */}
            <Dialog
                open={!!rejectTarget}
                onOpenChange={(open) => !open && setRejectTarget(null)}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reject Application</DialogTitle>
                        <DialogDescription>
                            The record will be kept with REJECTED status and can be re-reviewed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <p className="text-sm text-muted-foreground">
                            Rejecting application from{" "}
                            <span className="font-medium text-foreground">{rejectTarget?.fullName}</span>
                        </p>
                        <Label htmlFor="rejectReason">Reason *</Label>
                        <Textarea
                            id="rejectReason"
                            placeholder="Enter reason for rejection"
                            rows={3}
                            maxLength={500}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setRejectTarget(null)}
                            disabled={isRejecting}
                        >
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

            {/* Schedule interviews dialog */}
            <ScheduleInterviewDialog
                open={scheduleOpen}
                onOpenChange={setScheduleOpen}
                students={students}
                onScheduled={() => {/* students list auto-refreshes via hook */}}
            />
        </PageContainer>
    );
}
