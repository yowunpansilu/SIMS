import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { useStudents } from "@/hooks/useStudents";
import PageContainer from "@/components/layout/PageContainer";
import { DataTable } from "@/components/shared/DataTable";
import StudentForm from "@/components/forms/StudentForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Student } from "@/types";
import type { StudentSchemaType } from "@/lib/validators";

const streamStyles: Record<string, string> = {
    SCIENCE: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    COMMERCE: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    ARTS: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    TECHNOLOGY: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    OTHER: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export default function StudentListPage() {
    const { students, isLoading, createStudent, updateStudent, deleteStudent } = useStudents();
    const navigate = useNavigate();

    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | undefined>();
    const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleAdd = () => {
        setEditingStudent(undefined);
        setSheetOpen(true);
    };

    const handleEdit = (student: Student) => {
        setEditingStudent(student);
        setSheetOpen(true);
    };

    const handleFormSubmit = async (data: StudentSchemaType) => {
        setIsSubmitting(true);
        try {
            if (editingStudent) {
                await updateStudent(editingStudent.id, data);
                toast.success("Student updated successfully");
            } else {
                await createStudent(data);
                toast.success("Student added successfully");
            }
            setSheetOpen(false);
        } catch {
            toast.error(editingStudent ? "Failed to update student" : "Failed to add student");
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
                <span className="font-mono text-xs">{row.original.admissionNumber}</span>
            ),
        },
        {
            accessorKey: "fullName",
            header: "Full Name",
            cell: ({ row }) => <span className="font-medium">{row.original.fullName}</span>,
        },
        {
            accessorKey: "gender",
            header: "Gender",
            cell: ({ row }) => (
                <span className="capitalize">{row.original.gender.toLowerCase()}</span>
            ),
        },
        {
            accessorKey: "grade",
            header: "Grade",
        },
        {
            accessorKey: "stream",
            header: "Stream",
            cell: ({ row }) => (
                <span
                    className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        streamStyles[row.original.stream] || streamStyles.OTHER
                    )}
                >
                    {row.original.stream.charAt(0) + row.original.stream.slice(1).toLowerCase()}
                </span>
            ),
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
            description="Manage student records"
            actions={
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Student
                </Button>
            }
        >
            <DataTable
                columns={columns}
                data={students}
                isLoading={isLoading}
                searchKey="fullName"
                searchPlaceholder="Search students…"
                emptyMessage="No students found. Add your first student to get started."
            />

            {/* Add / Edit Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{editingStudent ? "Edit Student" : "Add Student"}</SheetTitle>
                        <SheetDescription>
                            {editingStudent
                                ? "Update the student's information below."
                                : "Fill in the details to register a new student."}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                        <StudentForm
                            student={editingStudent}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setSheetOpen(false)}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Delete Confirmation */}
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
