import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { useStudents } from "@/hooks/useStudents";
import PageContainer from "@/components/layout/PageContainer";
import { DataTable } from "@/components/shared/DataTable";
import StudentForm from "@/components/forms/StudentForm";
import StudentRegistrationDialog from "@/components/forms/StudentRegistrationDialog";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Users } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AL_STREAM_LABELS } from "@/lib/alSubjects";
import type { Student, ALStream } from "@/types";
import type { StudentSchemaType } from "@/lib/validators";

const STREAM_STYLES: Record<string, string> = {
    PHYSICAL_SCIENCE:   "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    BIOLOGICAL_SCIENCE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    COMMERCE:           "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    ARTS:               "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    TECHNOLOGY:         "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

const TYPE_STYLES: Record<string, string> = {
    INTERNAL: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    EXTERNAL: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
};

export default function StudentListPage() {
    // Only show ACTIVE students on this page
    const { students, isLoading, updateStudent, deleteStudent, refresh } = useStudents({
        registrationStatus: "ACTIVE",
    });
    const navigate = useNavigate();

    const [registerOpen, setRegisterOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | undefined>();
    const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = (student: Student) => {
        setEditingStudent(student);
        setEditOpen(true);
    };

    const handleFormSubmit = async (data: StudentSchemaType) => {
        if (!editingStudent) return;
        setIsSubmitting(true);
        try {
            await updateStudent(editingStudent.id, data);
            toast.success("Student updated successfully");
            setEditOpen(false);
        } catch {
            toast.error("Failed to update student");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await deleteStudent(deleteTarget.id);
            toast.success(`${deleteTarget.fullName} deleted`);
            setDeleteTarget(null);
        } catch {
            toast.error("Failed to delete student");
        } finally {
            setIsDeleting(false);
        }
    };

    const columns: ColumnDef<Student>[] = [
        {
            accessorKey: "admissionNumber",
            header: "Adm. No",
            cell: ({ row }) => (
                <span className="font-mono text-xs">
                    {row.original.admissionNumber || "—"}
                </span>
            ),
        },
        {
            accessorKey: "fullName",
            header: "Full Name",
            cell: ({ row }) => <span className="font-medium">{row.original.fullName}</span>,
        },
        {
            accessorKey: "studentType",
            header: "Type",
            cell: ({ row }) => (
                <span
                    className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        TYPE_STYLES[row.original.studentType] ?? TYPE_STYLES.INTERNAL
                    )}
                >
                    {row.original.studentType === "EXTERNAL" ? "External" : "Internal"}
                </span>
            ),
        },
        {
            accessorKey: "gender",
            header: "Gender",
            cell: ({ row }) => (
                <span className="capitalize">{row.original.gender?.toLowerCase() ?? "—"}</span>
            ),
        },
        {
            accessorKey: "grade",
            header: "Grade",
        },
        {
            accessorKey: "alStream",
            header: "Stream",
            cell: ({ row }) => {
                const stream = row.original.alStream;
                if (!stream) return <span className="text-muted-foreground">—</span>;
                return (
                    <span
                        className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            STREAM_STYLES[stream] ?? "bg-zinc-100 text-zinc-600"
                        )}
                    >
                        {AL_STREAM_LABELS[stream as ALStream] ?? stream}
                    </span>
                );
            },
        },
        {
            accessorKey: "contactNumber",
            header: "Contact",
            cell: ({ row }) => row.original.contactNumber || "—",
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/students/${row.original.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setDeleteTarget(row.original)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <PageContainer
            title="Students"
            description="Active student records"
            actions={
                <Button onClick={() => setRegisterOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Register Student
                </Button>
            }
        >
            <DataTable
                columns={columns}
                data={students}
                isLoading={isLoading}
                searchKey="fullName"
                searchPlaceholder="Search students…"
                noResults={
                    <EmptyState
                        title="No active students"
                        description="Register a new student to get started."
                        icon={Users}
                        action={
                            <Button onClick={() => setRegisterOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Register Student
                            </Button>
                        }
                    />
                }
            />

            {/* Registration dialog (3-step) */}
            <StudentRegistrationDialog
                open={registerOpen}
                onOpenChange={setRegisterOpen}
                onSuccess={(student) => {
                    if (student.registrationStatus === "ACTIVE") {
                        refresh();
                        toast.success(`${student.fullName} registered successfully`);
                    } else {
                        toast.success(`${student.fullName} submitted for approval`);
                    }
                }}
            />

            {/* Edit dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Student</DialogTitle>
                        <DialogDescription>
                            Update the student's information below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-2">
                        <StudentForm
                            student={editingStudent}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setEditOpen(false)}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Delete Student"
                description={`Are you sure you want to delete "${deleteTarget?.fullName}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </PageContainer>
    );
}
