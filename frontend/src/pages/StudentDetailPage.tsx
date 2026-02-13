import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStudents } from "@/hooks/useStudents";
import PageContainer from "@/components/layout/PageContainer";
import StudentForm from "@/components/forms/StudentForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    ArrowLeft,
    Pencil,
    Trash2,
    User,
    Calendar,
    MapPin,
    Phone,
    BookOpen,
    GraduationCap,
    Hash,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Student } from "@/types";
import type { StudentSchemaType } from "@/lib/validators";

const streamColors: Record<string, string> = {
    SCIENCE: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    COMMERCE: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    ARTS: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    TECHNOLOGY: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    OTHER: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | number }) {
    return (
        <div className="flex items-start gap-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value || "—"}</p>
            </div>
        </div>
    );
}

export default function StudentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getById, updateStudent, deleteStudent } = useStudents();

    const [student, setStudent] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        getById(Number(id))
            .then(setStudent)
            .catch(() => toast.error("Student not found"))
            .finally(() => setIsLoading(false));
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleUpdate = async (data: StudentSchemaType) => {
        if (!student) return;
        setIsSubmitting(true);
        try {
            const updated = await updateStudent(student.id, data);
            setStudent(updated);
            setEditOpen(false);
            toast.success("Student updated");
        } catch {
            toast.error("Failed to update student");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!student) return;
        setIsDeleting(true);
        try {
            await deleteStudent(student.id);
            toast.success(`${student.fullName} deleted`);
            navigate("/students");
        } catch {
            toast.error("Failed to delete student");
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <PageContainer title="Student Details">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <div className="grid gap-4 md:grid-cols-2">
                        <Skeleton className="h-64 rounded-lg" />
                        <Skeleton className="h-64 rounded-lg" />
                    </div>
                </div>
            </PageContainer>
        );
    }

    if (!student) {
        return (
            <PageContainer title="Student Not Found">
                <div className="flex flex-col items-center gap-4 py-16">
                    <p className="text-muted-foreground">The student record could not be found.</p>
                    <Button variant="outline" onClick={() => navigate("/students")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Students
                    </Button>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            title={student.fullName}
            description={`Admission No: ${student.admissionNumber}`}
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate("/students")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            }
        >
            <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Information */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold">Personal Information</h3>
                    <div className="divide-y">
                        <InfoRow icon={Hash} label="Admission Number" value={student.admissionNumber} />
                        <InfoRow icon={User} label="Full Name" value={student.fullName} />
                        <InfoRow
                            icon={User}
                            label="Gender"
                            value={student.gender.charAt(0) + student.gender.slice(1).toLowerCase()}
                        />
                        <InfoRow icon={Calendar} label="Date of Birth" value={student.dateOfBirth} />
                    </div>
                </div>

                {/* Academic & Contact */}
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold">Academic & Contact</h3>
                    <div className="divide-y">
                        <InfoRow icon={BookOpen} label="Grade" value={student.grade} />
                        <div className="flex items-start gap-3 py-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Stream</p>
                                <span
                                    className={cn(
                                        "mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                        streamColors[student.stream] || streamColors.OTHER
                                    )}
                                >
                                    {student.stream.charAt(0) + student.stream.slice(1).toLowerCase()}
                                </span>
                            </div>
                        </div>
                        <InfoRow icon={Phone} label="Contact Number" value={student.contactNumber} />
                        <InfoRow icon={MapPin} label="Address" value={student.address} />
                    </div>
                </div>
            </div>

            {/* Edit Sheet */}
            <Sheet open={editOpen} onOpenChange={setEditOpen}>
                <SheetContent className="sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Edit Student</SheetTitle>
                        <SheetDescription>Update the student's information below.</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                        <StudentForm
                            student={student}
                            onSubmit={handleUpdate}
                            onCancel={() => setEditOpen(false)}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete Student"
                description={`Are you sure you want to delete "${student.fullName}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </PageContainer>
    );
}
