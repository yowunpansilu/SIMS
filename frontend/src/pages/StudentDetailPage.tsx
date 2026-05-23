import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStudents } from "@/hooks/useStudents";
import { useOLResults, type OLResult } from "@/hooks/useOLResults";
import PageContainer from "@/components/layout/PageContainer";
import StudentForm from "@/components/forms/StudentForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowLeft,
    Pencil,
    Trash2,
    Plus,
    Check,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AL_STREAM_LABELS, AL_SUBJECT_LABELS } from "@/lib/alSubjects";
import type { Student, ALStream } from "@/types";
import type { StudentSchemaType } from "@/lib/validators";

const STREAM_BADGE: Record<string, string> = {
    PHYSICAL_SCIENCE:   "bg-blue-100 text-blue-700",
    BIOLOGICAL_SCIENCE: "bg-emerald-100 text-emerald-700",
    COMMERCE:           "bg-green-100 text-green-700",
    ARTS:               "bg-purple-100 text-purple-700",
    TECHNOLOGY:         "bg-orange-100 text-orange-700",
};

const TYPE_BADGE: Record<string, string> = {
    INTERNAL: "bg-zinc-100 text-zinc-600",
    EXTERNAL: "bg-sky-100 text-sky-700",
};

const AL_STATUS_BADGE: Record<string, string> = {
    APPLIED: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    NOT_APPLIED: "bg-zinc-100 text-zinc-600",
};

const OL_SUBJECTS = [
    "MATHEMATICS", "COMBINED_MATHS", "PHYSICS", "CHEMISTRY", "BIOLOGY",
    "ICT", "COMMERCE", "ACCOUNTING", "ECONOMICS", "BUSINESS_STUDIES",
    "HISTORY", "GEOGRAPHY", "POLITICAL_SCIENCE",
    "SINHALA", "TAMIL", "ENGLISH", "LITERATURE",
    "ART", "MUSIC", "DRAMA", "AGRICULTURE", "BUDDHISM", "OTHER",
];

const OL_GRADES = ["A", "B", "C", "S", "W"];

function InfoRow({ label, value, className }: { label: string; value?: string | number | null; className?: string }) {
    return (
        <div className={cn("flex flex-col py-2.5 border-b last:border-0", className)}>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</span>
            <span className="mt-0.5 text-sm font-medium text-zinc-900">{value || "—"}</span>
        </div>
    );
}

interface OLRowProps {
    result?: OLResult;
    onSave: (data: Omit<OLResult, "id">) => Promise<void>;
    onCancel: () => void;
}

function OLResultForm({ result, onSave, onCancel }: OLRowProps) {
    const [subject, setSubject] = useState(result?.subject || "");
    const [grade, setGrade] = useState(result?.grade || "");
    const [examYear, setExamYear] = useState(result?.examYear?.toString() || "");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!subject || !grade) { toast.error("Subject and grade are required"); return; }
        setSaving(true);
        try {
            await onSave({ subject, grade, examYear: examYear ? Number(examYear) : null });
        } finally {
            setSaving(false);
        }
    };

    return (
        <tr className="bg-zinc-50">
            <td className="px-3 py-2">
                <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Subject" /></SelectTrigger>
                    <SelectContent>
                        {OL_SUBJECTS.map((s) => (
                            <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </td>
            <td className="px-3 py-2">
                <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Grade" /></SelectTrigger>
                    <SelectContent>
                        {OL_GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                </Select>
            </td>
            <td className="px-3 py-2">
                <Input
                    className="h-8 text-xs"
                    placeholder="e.g. 2023"
                    value={examYear}
                    onChange={(e) => setExamYear(e.target.value)}
                    type="number"
                    min={2000}
                    max={2099}
                />
            </td>
            <td className="px-3 py-2">
                <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSave} disabled={saving}>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCancel}>
                        <X className="h-3.5 w-3.5 text-zinc-500" />
                    </Button>
                </div>
            </td>
        </tr>
    );
}

export default function StudentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getById, updateStudent, deleteStudent } = useStudents();
    const olResults = useOLResults(Number(id));

    const [student, setStudent] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [addingOL, setAddingOL] = useState(false);
    const [editingOLId, setEditingOLId] = useState<number | null>(null);
    const [deletingOLId, setDeletingOLId] = useState<number | null>(null);

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

    const handleAddOL = async (data: Omit<OLResult, "id">) => {
        await olResults.addResult(data);
        setAddingOL(false);
        toast.success("O/L result added");
    };

    const handleUpdateOL = async (resultId: number, data: Omit<OLResult, "id">) => {
        await olResults.updateResult(resultId, data);
        setEditingOLId(null);
        toast.success("O/L result updated");
    };

    const handleDeleteOL = async (resultId: number) => {
        setDeletingOLId(resultId);
        try {
            await olResults.deleteResult(resultId);
            toast.success("O/L result removed");
        } catch {
            toast.error("Failed to remove O/L result");
        } finally {
            setDeletingOLId(null);
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
                    <p className="text-zinc-500">The student record could not be found.</p>
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
            description={student.admissionNumber ? `Admission No: ${student.admissionNumber}` : `NIC: ${student.nicNumber ?? "—"}`}
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
            {/* ── Header badges ── */}
            <div className="flex flex-wrap gap-2 mb-6">
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", TYPE_BADGE[student.studentType] ?? TYPE_BADGE.INTERNAL)}>
                    {student.studentType === "EXTERNAL" ? "External" : "Internal"}
                </span>
                {student.alStream && (
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", STREAM_BADGE[student.alStream] ?? "bg-zinc-100 text-zinc-600")}>
                        {AL_STREAM_LABELS[student.alStream as ALStream] ?? student.alStream}
                    </span>
                )}
                <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-medium">
                    Grade {student.grade}
                </span>
                {student.medium && (
                    <span className="inline-flex items-center rounded-full bg-zinc-100 text-zinc-600 px-2.5 py-0.5 text-xs font-medium">
                        {student.medium.charAt(0) + student.medium.slice(1).toLowerCase()} Medium
                    </span>
                )}
                {student.alApplicationStatus && (
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", AL_STATUS_BADGE[student.alApplicationStatus] || AL_STATUS_BADGE.NOT_APPLIED)}>
                        A/L: {student.alApplicationStatus.replace(/_/g, " ")}
                    </span>
                )}
            </div>

            {/* ── Two-column cards ── */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border bg-white p-6">
                    <h3 className="mb-3 text-sm font-semibold text-zinc-900 uppercase tracking-wide">Personal Information</h3>
                    <InfoRow label="Full Name" value={student.fullName} />
                    <InfoRow label="Admission Number" value={student.admissionNumber} />
                    <InfoRow label="NIC Number" value={student.nicNumber} />
                    <InfoRow label="Gender" value={student.gender ? student.gender.charAt(0) + student.gender.slice(1).toLowerCase() : undefined} />
                    <InfoRow label="Date of Birth" value={student.dateOfBirth} />
                    <InfoRow label="Address" value={student.address} />
                </div>

                <div className="rounded-lg border bg-white p-6">
                    <h3 className="mb-3 text-sm font-semibold text-zinc-900 uppercase tracking-wide">Academic & Contact</h3>
                    <InfoRow label="Grade" value={student.grade ? `Grade ${student.grade}` : undefined} />
                    <InfoRow label="Stream" value={student.alStream ? (AL_STREAM_LABELS[student.alStream as ALStream] ?? student.alStream) : undefined} />
                    <InfoRow label="NIC Number" value={student.nicNumber} />
                    <InfoRow label="WhatsApp" value={student.whatsappNumber} />
                    <InfoRow label="Medium" value={student.medium} />
                    <InfoRow label="Contact Number" value={student.contactNumber} />
                    <InfoRow label="Parent / Guardian" value={student.parentName} />
                    <InfoRow label="Parent Contact" value={student.parentContactNumber} />
                </div>
            </div>

            {/* ── A/L Stream & Subjects ── */}
            {(student.alStream || (student.alSubjects && student.alSubjects.length > 0)) && (
                <div className="rounded-lg border bg-white p-6">
                    <h3 className="mb-3 text-sm font-semibold text-zinc-900 uppercase tracking-wide">
                        A/L Stream & Subjects
                    </h3>
                    {student.alStream && (
                        <div className="mb-3">
                            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Stream</span>
                            <p className="mt-0.5 text-sm font-medium text-zinc-900">
                                {AL_STREAM_LABELS[student.alStream as ALStream] ?? student.alStream}
                            </p>
                        </div>
                    )}
                    {student.alSubjects && student.alSubjects.length > 0 && (
                        <div>
                            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Subjects</span>
                            <div className="mt-1.5 flex flex-wrap gap-2">
                                {student.alSubjects.map((s) => (
                                    <span
                                        key={s}
                                        className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                                    >
                                        {AL_SUBJECT_LABELS[s] ?? s.replace(/_/g, " ")}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── O/L Results ── */}
            <div className="rounded-lg border bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">O/L Examination Results</h3>
                    <Button size="sm" variant="outline" onClick={() => { setAddingOL(true); setEditingOLId(null); }}>
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Add Result
                    </Button>
                </div>

                {olResults.isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-3 pb-2 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">Subject</th>
                                    <th className="px-3 pb-2 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">Grade</th>
                                    <th className="px-3 pb-2 text-left text-xs font-semibold uppercase tracking-widest text-zinc-500">Year</th>
                                    <th className="px-3 pb-2" />
                                </tr>
                            </thead>
                            <tbody>
                                {olResults.results.map((result) =>
                                    editingOLId === result.id ? (
                                        <OLResultForm
                                            key={result.id}
                                            result={result}
                                            onSave={(data) => handleUpdateOL(result.id, data)}
                                            onCancel={() => setEditingOLId(null)}
                                        />
                                    ) : (
                                        <tr key={result.id} className="border-b last:border-0 hover:bg-zinc-50">
                                            <td className="px-3 py-2.5 font-medium">
                                                {result.subject.replace(/_/g, " ")}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <span className={cn(
                                                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold",
                                                    result.grade === "A" && "bg-emerald-100 text-emerald-700",
                                                    result.grade === "B" && "bg-blue-100 text-blue-700",
                                                    result.grade === "C" && "bg-sky-100 text-sky-700",
                                                    result.grade === "S" && "bg-amber-100 text-amber-700",
                                                    result.grade === "W" && "bg-red-100 text-red-700",
                                                )}>
                                                    {result.grade}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2.5 text-zinc-500">{result.examYear || "—"}</td>
                                            <td className="px-3 py-2.5">
                                                <div className="flex gap-1">
                                                    <Button size="icon" variant="ghost" className="h-7 w-7"
                                                        onClick={() => { setEditingOLId(result.id); setAddingOL(false); }}>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive"
                                                        onClick={() => handleDeleteOL(result.id)}
                                                        disabled={deletingOLId === result.id}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}

                                {addingOL && (
                                    <OLResultForm
                                        onSave={handleAddOL}
                                        onCancel={() => setAddingOL(false)}
                                    />
                                )}

                                {olResults.results.length === 0 && !addingOL && (
                                    <tr>
                                        <td colSpan={4} className="px-3 py-6 text-center text-sm text-zinc-400">
                                            No O/L results recorded. Click Add Result to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Student</DialogTitle>
                        <DialogDescription>Update the student's information below.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-2">
                        <StudentForm
                            student={student}
                            onSubmit={handleUpdate}
                            onCancel={() => setEditOpen(false)}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </DialogContent>
            </Dialog>

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
