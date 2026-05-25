import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    registrationStep1Schema,
    registrationStep2Schema,
    registrationStep3Schema,
    type RegistrationStep1Type,
    type RegistrationStep2Type,
    type RegistrationStep3Type,
} from "@/lib/validators";
import {
    OL_MOTHER_TONGUE_OPTIONS,
    OL_RELIGION_OPTIONS,
    OL_CATEGORY_A,
    OL_CATEGORY_B,
    OL_CATEGORY_C,
    AL_STREAM_LABELS,
    type ALStream,
} from "@/lib/alSubjects";
import ALSubjectSelector from "./ALSubjectSelector";
import api from "@/lib/api";
import { toast } from "sonner";
import type { Student, OLResultInput } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";

interface StudentRegistrationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (student: Student) => void;
}

const STEPS = [
    { number: 1, label: "Personal Info" },
    { number: 2, label: "O/L Results" },
    { number: 3, label: "A/L Stream" },
];

const OL_GRADE_OPTIONS = ["A", "B", "C", "S", "W"];

function StepIndicator({ current }: { current: number }) {
    return (
        <div className="flex items-center justify-center gap-2 mb-6">
            {STEPS.map((step, i) => (
                <div key={step.number} className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                        <div
                            className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                                step.number < current
                                    ? "bg-primary text-primary-foreground"
                                    : step.number === current
                                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                                    : "bg-muted text-muted-foreground"
                            )}
                        >
                            {step.number < current ? <Check className="h-4 w-4" /> : step.number}
                        </div>
                        <span
                            className={cn(
                                "text-xs",
                                step.number === current ? "text-foreground font-medium" : "text-muted-foreground"
                            )}
                        >
                            {step.label}
                        </span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div
                            className={cn(
                                "h-0.5 w-8 mb-4 transition-colors",
                                step.number < current ? "bg-primary" : "bg-muted"
                            )}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

function GradeSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger className="w-24">
                <SelectValue placeholder="Grade" />
            </SelectTrigger>
            <SelectContent>
                {OL_GRADE_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>
                        {g}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

// ── Step 1 — Personal Info ────────────────────────────────────────────────────
function Step1Form({
    defaultValues,
    onNext,
}: {
    defaultValues?: Partial<RegistrationStep1Type>;
    onNext: (data: RegistrationStep1Type) => void;
}) {
    const { register, handleSubmit, watch, setValue, formState: { errors } } =
        useForm<RegistrationStep1Type>({
            resolver: zodResolver(registrationStep1Schema),
            defaultValues: defaultValues ?? { studentType: "INTERNAL" },
        });

    const studentType = watch("studentType");

    return (
        <form onSubmit={handleSubmit(onNext)} className="space-y-5">
            {/* Student type toggle */}
            <div className="space-y-2">
                <Label>Student Type *</Label>
                <div className="grid grid-cols-2 gap-3">
                    {(["INTERNAL", "EXTERNAL"] as const).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setValue("studentType", t, { shouldValidate: true })}
                            className={cn(
                                "rounded-lg border-2 p-3 text-sm font-medium transition-colors text-left",
                                studentType === t
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-muted text-muted-foreground hover:border-muted-foreground/40"
                            )}
                        >
                            <span className="block font-semibold">
                                {t === "INTERNAL" ? "Internal" : "External"}
                            </span>
                            <span className="text-xs font-normal">
                                {t === "INTERNAL"
                                    ? "O/L done at this school"
                                    : "O/L done at another school"}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {studentType === "INTERNAL" ? (
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="admissionNumber">Admission Number *</Label>
                        <Input
                            id="admissionNumber"
                            placeholder="e.g. ADM2024001"
                            {...register("admissionNumber")}
                        />
                        {errors.admissionNumber && (
                            <p className="text-xs text-destructive">{errors.admissionNumber.message}</p>
                        )}
                    </div>
                ) : (
                    <div className="sm:col-span-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
                        NIC number will be used as identifier until an admin assigns an admission number upon approval.
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" placeholder="Student full name" {...register("fullName")} />
                    {errors.fullName && (
                        <p className="text-xs text-destructive">{errors.fullName.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="nicNumber">NIC Number *</Label>
                    <Input
                        id="nicNumber"
                        placeholder="12 digits or 9 digits + V/X"
                        {...register("nicNumber")}
                    />
                    {errors.nicNumber && (
                        <p className="text-xs text-destructive">{errors.nicNumber.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Gender *</Label>
                    <Select
                        value={watch("gender") || ""}
                        onValueChange={(v) =>
                            setValue("gender", v as RegistrationStep1Type["gender"], {
                                shouldValidate: true,
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.gender && (
                        <p className="text-xs text-destructive">{errors.gender.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Medium *</Label>
                    <Select
                        value={watch("medium") || ""}
                        onValueChange={(v) =>
                            setValue("medium", v as RegistrationStep1Type["medium"], {
                                shouldValidate: true,
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select medium" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SINHALA">Sinhala</SelectItem>
                            <SelectItem value="TAMIL">Tamil</SelectItem>
                            <SelectItem value="ENGLISH">English</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.medium && (
                        <p className="text-xs text-destructive">{errors.medium.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                    {errors.dateOfBirth && (
                        <p className="text-xs text-destructive">{errors.dateOfBirth.message as string}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number *</Label>
                    <Input
                        id="contactNumber"
                        placeholder="e.g. 0771234567"
                        {...register("contactNumber")}
                    />
                    {errors.contactNumber && (
                        <p className="text-xs text-destructive">{errors.contactNumber.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                    <Input
                        id="whatsappNumber"
                        placeholder="e.g. 0771234567"
                        {...register("whatsappNumber")}
                    />
                    {errors.whatsappNumber && (
                        <p className="text-xs text-destructive">{errors.whatsappNumber.message as string}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="parentName">Parent / Guardian Name *</Label>
                    <Input
                        id="parentName"
                        placeholder="Guardian full name"
                        {...register("parentName")}
                    />
                    {errors.parentName && (
                        <p className="text-xs text-destructive">{errors.parentName.message as string}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="parentContactNumber">Parent / Guardian Contact *</Label>
                    <Input
                        id="parentContactNumber"
                        placeholder="e.g. 0771234567"
                        {...register("parentContactNumber")}
                    />
                    {errors.parentContactNumber && (
                        <p className="text-xs text-destructive">{errors.parentContactNumber.message as string}</p>
                    )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                        id="address"
                        placeholder="Home address"
                        rows={2}
                        {...register("address")}
                    />
                    {errors.address && (
                        <p className="text-xs text-destructive">{errors.address.message as string}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <Button type="submit">
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </form>
    );
}

// ── Step 2 — O/L Results ──────────────────────────────────────────────────────
function Step2Form({
    defaultValues,
    onNext,
    onBack,
}: {
    defaultValues?: Partial<RegistrationStep2Type>;
    onNext: (data: RegistrationStep2Type) => void;
    onBack: () => void;
}) {
    const { register, handleSubmit, watch, setValue, formState: { errors } } =
        useForm<RegistrationStep2Type>({
            resolver: zodResolver(registrationStep2Schema),
            defaultValues,
        });

    const gradeField = (
        name: keyof RegistrationStep2Type,
        label: string,
        subjectEl?: React.ReactNode
    ) => (
        <div className="flex items-center gap-3 py-2 border-b last:border-0">
            <div className="flex-1 min-w-0">
                {subjectEl ?? (
                    <span className="text-sm font-medium">{label}</span>
                )}
            </div>
            <div className="shrink-0">
                <GradeSelect
                    value={(watch(name) as string) || ""}
                    onChange={(v) =>
                        setValue(name, v as RegistrationStep2Type[typeof name], {
                            shouldValidate: true,
                        })
                    }
                />
                {errors[name] && (
                    <p className="text-xs text-destructive mt-0.5">{(errors[name] as { message?: string }).message}</p>
                )}
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit(onNext)} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="olExamYear">O/L Examination Year *</Label>
                <Input
                    id="olExamYear"
                    type="number"
                    placeholder="e.g. 2024"
                    min={2000}
                    max={2030}
                    {...register("olExamYear", { valueAsNumber: true })}
                />
                {errors.olExamYear && (
                    <p className="text-xs text-destructive">{errors.olExamYear.message}</p>
                )}
            </div>

            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Compulsory Subjects
                </p>

                {/* Mother tongue — subject + grade */}
                <div className="flex items-center gap-3 py-2 border-b">
                    <div className="flex-1">
                        <Select
                            value={watch("motherTongue") || ""}
                            onValueChange={(v) =>
                                setValue("motherTongue", v, { shouldValidate: true })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Mother Tongue *" />
                            </SelectTrigger>
                            <SelectContent>
                                {OL_MOTHER_TONGUE_OPTIONS.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.motherTongue && (
                            <p className="text-xs text-destructive mt-0.5">{errors.motherTongue.message}</p>
                        )}
                    </div>
                    <div className="shrink-0">
                        <GradeSelect
                            value={watch("motherTongueGrade") || ""}
                            onChange={(v) =>
                                setValue("motherTongueGrade", v as RegistrationStep2Type["motherTongueGrade"], { shouldValidate: true })
                            }
                        />
                        {errors.motherTongueGrade && (
                            <p className="text-xs text-destructive mt-0.5">{errors.motherTongueGrade.message}</p>
                        )}
                    </div>
                </div>

                {gradeField("englishGrade", "English Language")}
                {gradeField("mathsGrade", "Mathematics")}
                {gradeField("scienceGrade", "Science")}
                {gradeField("historyGrade", "History")}

                {/* Religion — subject + grade */}
                <div className="flex items-center gap-3 py-2">
                    <div className="flex-1">
                        <Select
                            value={watch("religion") || ""}
                            onValueChange={(v) =>
                                setValue("religion", v, { shouldValidate: true })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Religion *" />
                            </SelectTrigger>
                            <SelectContent>
                                {OL_RELIGION_OPTIONS.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.religion && (
                            <p className="text-xs text-destructive mt-0.5">{errors.religion.message}</p>
                        )}
                    </div>
                    <div className="shrink-0">
                        <GradeSelect
                            value={watch("religionGrade") || ""}
                            onChange={(v) =>
                                setValue("religionGrade", v as RegistrationStep2Type["religionGrade"], { shouldValidate: true })
                            }
                        />
                        {errors.religionGrade && (
                            <p className="text-xs text-destructive mt-0.5">{errors.religionGrade.message}</p>
                        )}
                    </div>
                </div>
            </div>

            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Optional Subjects (one from each category)
                </p>

                {/* Category A */}
                <div className="flex items-center gap-3 py-2 border-b">
                    <div className="flex-1">
                        <Select
                            value={watch("categoryASubject") || ""}
                            onValueChange={(v) =>
                                setValue("categoryASubject", v, { shouldValidate: true })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Category A — Aesthetic *" />
                            </SelectTrigger>
                            <SelectContent>
                                {OL_CATEGORY_A.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.categoryASubject && (
                            <p className="text-xs text-destructive mt-0.5">{errors.categoryASubject.message}</p>
                        )}
                    </div>
                    <div className="shrink-0">
                        <GradeSelect
                            value={watch("categoryAGrade") || ""}
                            onChange={(v) =>
                                setValue("categoryAGrade", v as RegistrationStep2Type["categoryAGrade"], { shouldValidate: true })
                            }
                        />
                        {errors.categoryAGrade && (
                            <p className="text-xs text-destructive mt-0.5">{errors.categoryAGrade.message}</p>
                        )}
                    </div>
                </div>

                {/* Category B */}
                <div className="flex items-center gap-3 py-2 border-b">
                    <div className="flex-1">
                        <Select
                            value={watch("categoryBSubject") || ""}
                            onValueChange={(v) =>
                                setValue("categoryBSubject", v, { shouldValidate: true })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Category B — Technical *" />
                            </SelectTrigger>
                            <SelectContent>
                                {OL_CATEGORY_B.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.categoryBSubject && (
                            <p className="text-xs text-destructive mt-0.5">{errors.categoryBSubject.message}</p>
                        )}
                    </div>
                    <div className="shrink-0">
                        <GradeSelect
                            value={watch("categoryBGrade") || ""}
                            onChange={(v) =>
                                setValue("categoryBGrade", v as RegistrationStep2Type["categoryBGrade"], { shouldValidate: true })
                            }
                        />
                        {errors.categoryBGrade && (
                            <p className="text-xs text-destructive mt-0.5">{errors.categoryBGrade.message}</p>
                        )}
                    </div>
                </div>

                {/* Category C */}
                <div className="flex items-center gap-3 py-2">
                    <div className="flex-1">
                        <Select
                            value={watch("categoryCSubject") || ""}
                            onValueChange={(v) =>
                                setValue("categoryCSubject", v, { shouldValidate: true })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Category C — Humanities / Languages *" />
                            </SelectTrigger>
                            <SelectContent>
                                {OL_CATEGORY_C.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.categoryCSubject && (
                            <p className="text-xs text-destructive mt-0.5">{errors.categoryCSubject.message}</p>
                        )}
                    </div>
                    <div className="shrink-0">
                        <GradeSelect
                            value={watch("categoryCGrade") || ""}
                            onChange={(v) =>
                                setValue("categoryCGrade", v as RegistrationStep2Type["categoryCGrade"], { shouldValidate: true })
                            }
                        />
                        {errors.categoryCGrade && (
                            <p className="text-xs text-destructive mt-0.5">{errors.categoryCGrade.message}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={onBack}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button type="submit">
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </form>
    );
}

// ── Step 3 — A/L Stream & Subjects ────────────────────────────────────────────
function Step3Form({
    defaultValues,
    onSubmit,
    onBack,
    isSubmitting,
}: {
    defaultValues?: Partial<RegistrationStep3Type>;
    onSubmit: (data: RegistrationStep3Type) => void;
    onBack: () => void;
    isSubmitting: boolean;
}) {
    const { handleSubmit, watch, setValue, formState: { errors } } =
        useForm<RegistrationStep3Type>({
            resolver: zodResolver(registrationStep3Schema),
            defaultValues: defaultValues ?? { alSubjects: [] },
        });

    const alStream = watch("alStream");
    const alSubjects = watch("alSubjects") ?? [];

    const streamCards: { value: ALStream; description: string }[] = [
        { value: "PHYSICAL_SCIENCE", description: "Combined Maths · Physics + 1" },
        { value: "BIOLOGICAL_SCIENCE", description: "Biology · Chemistry + 1" },
        { value: "COMMERCE", description: "Accounting · Economics + 1" },
        { value: "TECHNOLOGY", description: "SFT · Tech Subject + 1" },
        { value: "ARTS", description: "Choose any 3 from arts basket" },
    ];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
                <Label>A/L Stream *</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {streamCards.map((s) => (
                        <button
                            key={s.value}
                            type="button"
                            onClick={() => {
                                setValue("alStream", s.value, { shouldValidate: true });
                                setValue("alSubjects", [], { shouldValidate: false });
                            }}
                            className={cn(
                                "rounded-lg border-2 p-3 text-left transition-colors",
                                alStream === s.value
                                    ? "border-primary bg-primary/5"
                                    : "border-muted hover:border-muted-foreground/40"
                            )}
                        >
                            <p
                                className={cn(
                                    "text-sm font-semibold",
                                    alStream === s.value ? "text-primary" : "text-foreground"
                                )}
                            >
                                {AL_STREAM_LABELS[s.value]}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                        </button>
                    ))}
                </div>
                {errors.alStream && (
                    <p className="text-xs text-destructive">{errors.alStream.message}</p>
                )}
            </div>

            {alStream && (
                <div className="space-y-2">
                    <Label>Subjects</Label>
                    <ALSubjectSelector
                        stream={alStream}
                        value={alSubjects}
                        onChange={(subjects) =>
                            setValue("alSubjects", subjects, { shouldValidate: true })
                        }
                        error={(errors.alSubjects as { message?: string } | undefined)?.message}
                    />
                </div>
            )}

            <div className="space-y-2">
                <Label>A/L Application Status</Label>
                <Select
                    value={watch("alApplicationStatus") || ""}
                    onValueChange={(v) =>
                        setValue(
                            "alApplicationStatus",
                            v as RegistrationStep3Type["alApplicationStatus"],
                            { shouldValidate: true }
                        )
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select status (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="NOT_APPLIED">Not Applied</SelectItem>
                        <SelectItem value="APPLIED">Applied</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Register Student
                </Button>
            </div>
        </form>
    );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildOLResults(step2: RegistrationStep2Type): OLResultInput[] {
    const year = step2.olExamYear;
    return [
        { subject: step2.motherTongue, grade: step2.motherTongueGrade, examYear: year },
        { subject: "ENGLISH_LANGUAGE", grade: step2.englishGrade, examYear: year },
        { subject: "MATHEMATICS", grade: step2.mathsGrade, examYear: year },
        { subject: "SCIENCE", grade: step2.scienceGrade, examYear: year },
        { subject: "HISTORY", grade: step2.historyGrade, examYear: year },
        { subject: step2.religion, grade: step2.religionGrade, examYear: year },
        { subject: step2.categoryASubject, grade: step2.categoryAGrade, examYear: year },
        { subject: step2.categoryBSubject, grade: step2.categoryBGrade, examYear: year },
        { subject: step2.categoryCSubject, grade: step2.categoryCGrade, examYear: year },
    ];
}

// ── Main dialog ───────────────────────────────────────────────────────────────
export default function StudentRegistrationDialog({
    open,
    onOpenChange,
    onSuccess,
}: StudentRegistrationDialogProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [step1Data, setStep1Data] = useState<RegistrationStep1Type | undefined>();
    const [step2Data, setStep2Data] = useState<RegistrationStep2Type | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClose = (open: boolean) => {
        if (!open) {
            setStep(1);
            setStep1Data(undefined);
            setStep2Data(undefined);
        }
        onOpenChange(open);
    };

    const handleStep1 = (data: RegistrationStep1Type) => {
        setStep1Data(data);
        setStep(2);
    };

    const handleStep2 = (data: RegistrationStep2Type) => {
        setStep2Data(data);
        setStep(3);
    };

    const handleStep3 = async (step3: RegistrationStep3Type) => {
        if (!step1Data || !step2Data) return;
        setIsSubmitting(true);
        try {
            const studentPayload = {
                admissionNumber: step1Data.admissionNumber || undefined,
                fullName: step1Data.fullName,
                nicNumber: step1Data.nicNumber,
                gender: step1Data.gender,
                dateOfBirth: step1Data.dateOfBirth || undefined,
                medium: step1Data.medium,
                contactNumber: step1Data.contactNumber || undefined,
                whatsappNumber: step1Data.whatsappNumber || undefined,
                parentName: step1Data.parentName || undefined,
                parentContactNumber: step1Data.parentContactNumber || undefined,
                address: step1Data.address || undefined,
                studentType: step1Data.studentType,
                grade: "12",
                alStream: step3.alStream,
                alSubjects: step3.alSubjects,
                alApplicationStatus: step3.alApplicationStatus,
            };

            const { data: newStudent } = await api.post<Student>("/students", studentPayload);

            const olResults = buildOLResults(step2Data);
            await Promise.all(
                olResults.map((r) =>
                    api.post(`/students/${newStudent.id}/ol-results`, r)
                )
            );

            handleClose(false);
            onSuccess(newStudent);
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                "Registration failed. Please try again.";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Register New Student</DialogTitle>
                    <DialogDescription>
                        Complete all three steps to register a student in the system.
                    </DialogDescription>
                </DialogHeader>

                <StepIndicator current={step} />

                {step === 1 && (
                    <Step1Form defaultValues={step1Data} onNext={handleStep1} />
                )}
                {step === 2 && (
                    <Step2Form
                        defaultValues={step2Data}
                        onNext={handleStep2}
                        onBack={() => setStep(1)}
                    />
                )}
                {step === 3 && (
                    <Step3Form
                        onSubmit={handleStep3}
                        onBack={() => setStep(2)}
                        isSubmitting={isSubmitting}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
