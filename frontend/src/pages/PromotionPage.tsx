import { useState, useMemo } from "react";
import { useStudents } from "@/hooks/useStudents";
import PageContainer from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ChevronRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { Student } from "@/types";

type Step = "select" | "review" | "result";

interface PromotionResult {
    promoted: number;
    alreadyGrade13: number;
    notFound: number;
}

const STREAM_BADGE: Record<string, string> = {
    SCIENCE: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    COMMERCE: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    ARTS: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    TECHNOLOGY: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
    OTHER: "bg-muted text-muted-foreground",
};

export default function PromotionPage() {
    const { students, isLoading } = useStudents();
    const grade12Students = useMemo(
        () => students.filter((s: Student) => s.grade === "12"),
        [students]
    );

    const [step, setStep] = useState<Step>("select");
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [isPromoting, setIsPromoting] = useState(false);
    const [result, setResult] = useState<PromotionResult | null>(null);

    const toggleOne = (id: number) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === grade12Students.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(grade12Students.map((s) => s.id)));
        }
    };

    const handlePromote = async () => {
        setIsPromoting(true);
        try {
            const res = await api.post<PromotionResult>("/students/promote", Array.from(selected));
            setResult(res.data);
            setStep("result");
        } catch {
            toast.error("Promotion failed. Please try again.");
        } finally {
            setIsPromoting(false);
        }
    };

    const reset = () => {
        setStep("select");
        setSelected(new Set());
        setResult(null);
    };

    const selectedStudents = grade12Students.filter((s) => selected.has(s.id));

    return (
        <PageContainer
            title="Year-to-Year Promotion"
            description="Promote Grade 12 students to Grade 13"
        >
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6 text-sm">
                {(["select", "review", "result"] as Step[]).map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                        {i > 0 && <ChevronRight className="h-4 w-4 text-zinc-400" />}
                        <span className={cn(
                            "font-medium capitalize",
                            step === s ? "text-foreground" : "text-muted-foreground"
                        )}>
                            {i + 1}. {s === "select" ? "Select Students" : s === "review" ? "Review" : "Done"}
                        </span>
                    </div>
                ))}
            </div>

            {/* Step: Select */}
            {step === "select" && (
                <div className="space-y-4">
                    <div className="rounded-lg border bg-card overflow-hidden">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded"
                                    checked={selected.size === grade12Students.length && grade12Students.length > 0}
                                    onChange={toggleAll}
                                    title="Select all"
                                />
                                <span className="text-sm font-medium text-foreground">
                                    {selected.size > 0
                                        ? `${selected.size} of ${grade12Students.length} selected`
                                        : `${grade12Students.length} Grade 12 students`}
                                </span>
                            </div>
                            {selected.size > 0 && (
                                <Button
                                    size="sm"
                                    onClick={() => setStep("review")}
                                >
                                    Review Selection
                                    <ChevronRight className="ml-1.5 h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="p-4 space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                            </div>
                        ) : grade12Students.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                No Grade 12 students found.
                            </div>
                        ) : (
                            <div className="divide-y">
                                {grade12Students.map((student) => (
                                    <label
                                        key={student.id}
                                        className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded shrink-0"
                                            checked={selected.has(student.id)}
                                            onChange={() => toggleOne(student.id)}
                                        />
                                        <span className="font-mono text-xs text-muted-foreground w-24 shrink-0">
                                            {student.admissionNumber}
                                        </span>
                                        <span className="flex-1 text-sm font-medium text-foreground">
                                            {student.fullName}
                                        </span>
                                        <span className={cn(
                                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
                                            STREAM_BADGE[student.stream ?? "OTHER"] || STREAM_BADGE.OTHER
                                        )}>
                                            {student.stream}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Step: Review */}
            {step === "review" && (
                <div className="space-y-4">
                    <div className="rounded-lg border bg-card overflow-hidden">
                        <div className="border-b px-4 py-3 bg-amber-500/10">
                            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                                You are about to promote {selected.size} student{selected.size !== 1 ? "s" : ""} from Grade 12 to Grade 13.
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="divide-y">
                            {selectedStudents.map((student) => (
                                <div key={student.id} className="flex items-center gap-4 px-4 py-3">
                                    <span className="font-mono text-xs text-muted-foreground w-24 shrink-0">
                                        {student.admissionNumber}
                                    </span>
                                    <span className="flex-1 text-sm font-medium">{student.fullName}</span>
                                    <span className="text-xs text-muted-foreground">Grade 12</span>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-emerald-600">Grade 13</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep("select")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <Button onClick={handlePromote} disabled={isPromoting}>
                            {isPromoting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Promotion
                        </Button>
                    </div>
                </div>
            )}

            {/* Step: Result */}
            {step === "result" && result && (
                <div className="space-y-6">
                    <div className="flex flex-col items-center gap-3 py-8">
                        <CheckCircle2 className="h-14 w-14 text-emerald-500" />
                        <h2 className="text-xl font-bold text-foreground">Promotion Complete</h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3 max-w-lg mx-auto">
                        <div className="rounded-lg border bg-card p-5 text-center">
                            <p className="text-3xl font-bold text-emerald-600">{result.promoted}</p>
                            <p className="text-xs text-muted-foreground mt-1">Promoted</p>
                        </div>
                        <div className="rounded-lg border bg-card p-5 text-center">
                            <p className="text-3xl font-bold text-amber-500">{result.alreadyGrade13}</p>
                            <p className="text-xs text-muted-foreground mt-1">Already Grade 13</p>
                        </div>
                        <div className="rounded-lg border bg-card p-5 text-center">
                            <p className="text-3xl font-bold text-muted-foreground">{result.notFound}</p>
                            <p className="text-xs text-muted-foreground mt-1">Not Found</p>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Button onClick={reset} variant="outline">Run Another Promotion</Button>
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
