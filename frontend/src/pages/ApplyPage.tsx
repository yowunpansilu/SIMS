import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
    registrationStep1Schema,
    registrationStep2Schema,
    registrationStep3Schema,
    type RegistrationStep1Type,
    type RegistrationStep2Type,
    type RegistrationStep3Type,
} from "@/lib/validators";
import { decodeNIC } from "@/lib/nicDecoder";
import {
    OL_MOTHER_TONGUE_OPTIONS,
    OL_RELIGION_OPTIONS,
    OL_CATEGORY_A,
    OL_CATEGORY_B,
    OL_CATEGORY_C,
    AL_STREAM_LABELS,
    type ALStream,
} from "@/lib/alSubjects";
import ALSubjectSelector from "@/components/forms/ALSubjectSelector";
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
import { ChevronLeft, ChevronRight, Check, CheckCircle2, Loader2 } from "lucide-react";

const API_BASE = "http://localhost:8080/api";
const OL_GRADE_OPTIONS = ["A", "B", "C", "S", "W"];

const STEPS = [
    { number: 1, label: "Personal Info" },
    { number: 2, label: "O/L Results" },
    { number: 3, label: "A/L Stream" },
];

function StepIndicator({ current }: { current: number }) {
    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {STEPS.map((step, i) => (
                <div key={step.number} className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                        <div className={cn(
                            "h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                            step.number < current ? "bg-primary text-primary-foreground"
                                : step.number === current ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                                : "bg-muted text-muted-foreground"
                        )}>
                            {step.number < current ? <Check className="h-4 w-4" /> : step.number}
                        </div>
                        <span className={cn("text-xs", step.number === current ? "text-foreground font-medium" : "text-muted-foreground")}>
                            {step.label}
                        </span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div className={cn("h-0.5 w-10 mb-4 transition-colors", step.number < current ? "bg-primary" : "bg-muted")} />
                    )}
                </div>
            ))}
        </div>
    );
}

function GradeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger className="w-24"><SelectValue placeholder="Grade" /></SelectTrigger>
            <SelectContent>
                {OL_GRADE_OPTIONS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
        </Select>
    );
}

// ── Step 1 ────────────────────────────────────────────────────────────────────
function Step1({ defaultValues, onNext }: { defaultValues?: Partial<RegistrationStep1Type>; onNext: (d: RegistrationStep1Type) => void }) {
    const { register, handleSubmit, watch, setValue, formState: { errors } } =
        useForm<RegistrationStep1Type>({
            resolver: zodResolver(registrationStep1Schema),
            defaultValues: defaultValues ?? { studentType: "EXTERNAL" },
        });

    const nicValue = watch("nicNumber");
    const [nicAutoFilled, setNicAutoFilled] = useState(false);

    useEffect(() => {
        const decoded = decodeNIC(nicValue || "");
        if (decoded) {
            setValue("dateOfBirth", decoded.dob, { shouldValidate: true });
            setValue("gender", decoded.gender, { shouldValidate: true });
            setNicAutoFilled(true);
        } else {
            setNicAutoFilled(false);
        }
    }, [nicValue, setValue]);

    return (
        <form onSubmit={handleSubmit(onNext)} className="space-y-5">
            <input type="hidden" {...register("studentType")} value="EXTERNAL" />

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" {...register("fullName")} />
                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="nicNumber">NIC Number *</Label>
                    <Input id="nicNumber" placeholder="12 digits or 9 digits + V/X" {...register("nicNumber")} />
                    {errors.nicNumber && <p className="text-xs text-destructive">{errors.nicNumber.message}</p>}
                    {nicAutoFilled && !errors.nicNumber && <p className="text-xs text-emerald-600">DOB and gender auto-filled from NIC</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message as string}</p>}
                </div>

                <div className="space-y-2">
                    <Label>Gender *</Label>
                    <Select value={watch("gender") || ""} onValueChange={(v) => setValue("gender", v as RegistrationStep1Type["gender"], { shouldValidate: true })}>
                        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
                    {nicAutoFilled && !errors.gender && <p className="text-xs text-emerald-600">Auto-filled from NIC</p>}
                </div>

                <div className="space-y-2">
                    <Label>Medium *</Label>
                    <Select value={watch("medium") || ""} onValueChange={(v) => setValue("medium", v as RegistrationStep1Type["medium"], { shouldValidate: true })}>
                        <SelectTrigger><SelectValue placeholder="Select medium" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SINHALA">Sinhala</SelectItem>
                            <SelectItem value="TAMIL">Tamil</SelectItem>
                            <SelectItem value="ENGLISH">English</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.medium && <p className="text-xs text-destructive">{errors.medium.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                    {errors.dateOfBirth && <p className="text-xs text-destructive">{errors.dateOfBirth.message as string}</p>}
                    {nicAutoFilled && !errors.dateOfBirth && <p className="text-xs text-emerald-600">Auto-filled from NIC</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number *</Label>
                    <Input id="contactNumber" placeholder="e.g. 0771234567" {...register("contactNumber")} />
                    {errors.contactNumber && <p className="text-xs text-destructive">{errors.contactNumber.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                    <Input id="whatsappNumber" placeholder="e.g. 0771234567" {...register("whatsappNumber")} />
                    {errors.whatsappNumber && <p className="text-xs text-destructive">{errors.whatsappNumber.message as string}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="parentName">Parent / Guardian Name *</Label>
                    <Input id="parentName" {...register("parentName")} />
                    {errors.parentName && <p className="text-xs text-destructive">{errors.parentName.message as string}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="parentContactNumber">Parent / Guardian Contact *</Label>
                    <Input id="parentContactNumber" placeholder="e.g. 0771234567" {...register("parentContactNumber")} />
                    {errors.parentContactNumber && <p className="text-xs text-destructive">{errors.parentContactNumber.message as string}</p>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea id="address" rows={2} {...register("address")} />
                    {errors.address && <p className="text-xs text-destructive">{errors.address.message as string}</p>}
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <Button type="submit">Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
            </div>
        </form>
    );
}

// ── Step 2 ────────────────────────────────────────────────────────────────────
function Step2({ defaultValues, onNext, onBack }: { defaultValues?: Partial<RegistrationStep2Type>; onNext: (d: RegistrationStep2Type) => void; onBack: () => void }) {
    const { register, handleSubmit, watch, setValue, formState: { errors } } =
        useForm<RegistrationStep2Type>({ resolver: zodResolver(registrationStep2Schema), defaultValues });

    const gradeField = (name: keyof RegistrationStep2Type, label: string, subjectEl?: React.ReactNode) => (
        <div className="flex items-center gap-3 py-2 border-b last:border-0">
            <div className="flex-1 min-w-0">{subjectEl ?? <span className="text-sm font-medium">{label}</span>}</div>
            <div className="shrink-0">
                <GradeSelect value={(watch(name) as string) || ""} onChange={(v) => setValue(name, v as RegistrationStep2Type[typeof name], { shouldValidate: true })} />
                {errors[name] && <p className="text-xs text-destructive mt-0.5">{(errors[name] as { message?: string }).message}</p>}
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit(onNext)} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="olExamYear">O/L Examination Year *</Label>
                <Input id="olExamYear" type="number" min={2000} max={2030} {...register("olExamYear", { valueAsNumber: true })} />
                {errors.olExamYear && <p className="text-xs text-destructive">{errors.olExamYear.message}</p>}
            </div>

            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Compulsory Subjects</p>
                <div className="flex items-center gap-3 py-2 border-b">
                    <div className="flex-1">
                        <Select value={watch("motherTongue") || ""} onValueChange={(v) => setValue("motherTongue", v, { shouldValidate: true })}>
                            <SelectTrigger><SelectValue placeholder="Mother Tongue *" /></SelectTrigger>
                            <SelectContent>{OL_MOTHER_TONGUE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                        </Select>
                        {errors.motherTongue && <p className="text-xs text-destructive mt-0.5">{errors.motherTongue.message}</p>}
                    </div>
                    <div className="shrink-0">
                        <GradeSelect value={watch("motherTongueGrade") || ""} onChange={(v) => setValue("motherTongueGrade", v as RegistrationStep2Type["motherTongueGrade"], { shouldValidate: true })} />
                        {errors.motherTongueGrade && <p className="text-xs text-destructive mt-0.5">{errors.motherTongueGrade.message}</p>}
                    </div>
                </div>
                {gradeField("englishGrade", "English Language")}
                {gradeField("mathsGrade", "Mathematics")}
                {gradeField("scienceGrade", "Science")}
                {gradeField("historyGrade", "History")}
                <div className="flex items-center gap-3 py-2">
                    <div className="flex-1">
                        <Select value={watch("religion") || ""} onValueChange={(v) => setValue("religion", v, { shouldValidate: true })}>
                            <SelectTrigger><SelectValue placeholder="Religion *" /></SelectTrigger>
                            <SelectContent>{OL_RELIGION_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                        </Select>
                        {errors.religion && <p className="text-xs text-destructive mt-0.5">{errors.religion.message}</p>}
                    </div>
                    <div className="shrink-0">
                        <GradeSelect value={watch("religionGrade") || ""} onChange={(v) => setValue("religionGrade", v as RegistrationStep2Type["religionGrade"], { shouldValidate: true })} />
                        {errors.religionGrade && <p className="text-xs text-destructive mt-0.5">{errors.religionGrade.message}</p>}
                    </div>
                </div>
            </div>

            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Optional Subjects</p>
                {[
                    { subject: "categoryASubject" as const, grade: "categoryAGrade" as const, options: OL_CATEGORY_A, placeholder: "Category A — Aesthetic *" },
                    { subject: "categoryBSubject" as const, grade: "categoryBGrade" as const, options: OL_CATEGORY_B, placeholder: "Category B — Technical *" },
                    { subject: "categoryCSubject" as const, grade: "categoryCGrade" as const, options: OL_CATEGORY_C, placeholder: "Category C — Humanities *" },
                ].map(({ subject, grade, options, placeholder }) => (
                    <div key={subject} className="flex items-center gap-3 py-2 border-b last:border-0">
                        <div className="flex-1">
                            <Select value={watch(subject) || ""} onValueChange={(v) => setValue(subject, v, { shouldValidate: true })}>
                                <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
                                <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                            </Select>
                            {errors[subject] && <p className="text-xs text-destructive mt-0.5">{(errors[subject] as { message?: string }).message}</p>}
                        </div>
                        <div className="shrink-0">
                            <GradeSelect value={watch(grade) || ""} onChange={(v) => setValue(grade, v as RegistrationStep2Type[typeof grade], { shouldValidate: true })} />
                            {errors[grade] && <p className="text-xs text-destructive mt-0.5">{(errors[grade] as { message?: string }).message}</p>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={onBack}><ChevronLeft className="mr-2 h-4 w-4" />Back</Button>
                <Button type="submit">Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
            </div>
        </form>
    );
}

// ── Step 3 ────────────────────────────────────────────────────────────────────
function Step3({ onSubmit, onBack, isSubmitting }: { onSubmit: (d: RegistrationStep3Type) => void; onBack: () => void; isSubmitting: boolean }) {
    const { handleSubmit, watch, setValue, formState: { errors } } =
        useForm<RegistrationStep3Type>({ resolver: zodResolver(registrationStep3Schema), defaultValues: { alSubjects: [] } });

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
                        <button key={s.value} type="button"
                            onClick={() => { setValue("alStream", s.value, { shouldValidate: true }); setValue("alSubjects", [], { shouldValidate: false }); }}
                            className={cn("rounded-lg border-2 p-3 text-left transition-colors",
                                alStream === s.value ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/40"
                            )}>
                            <p className={cn("text-sm font-semibold", alStream === s.value ? "text-primary" : "text-foreground")}>{AL_STREAM_LABELS[s.value]}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                        </button>
                    ))}
                </div>
                {errors.alStream && <p className="text-xs text-destructive">{errors.alStream.message}</p>}
            </div>

            {alStream && (
                <div className="space-y-2">
                    <Label>Subjects</Label>
                    <ALSubjectSelector stream={alStream} value={alSubjects} onChange={(subjects) => setValue("alSubjects", subjects, { shouldValidate: true })}
                        error={(errors.alSubjects as { message?: string } | undefined)?.message} />
                </div>
            )}

            <div className="space-y-2">
                <Label>A/L Application Status</Label>
                <Select value={watch("alApplicationStatus") || ""} onValueChange={(v) => setValue("alApplicationStatus", v as RegistrationStep3Type["alApplicationStatus"], { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="Select status (optional)" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="NOT_APPLIED">Not Applied</SelectItem>
                        <SelectItem value="APPLIED">Applied</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}><ChevronLeft className="mr-2 h-4 w-4" />Back</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Application
                </Button>
            </div>
        </form>
    );
}

// ── OL result builder (same as registration dialog) ───────────────────────────
function buildOLResults(step2: RegistrationStep2Type) {
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

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ApplyPage() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [step1Data, setStep1Data] = useState<RegistrationStep1Type>();
    const [step2Data, setStep2Data] = useState<RegistrationStep2Type>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedNic, setSubmittedNic] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleStep3 = async (step3: RegistrationStep3Type) => {
        if (!step1Data || !step2Data) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const payload = {
                fullName: step1Data.fullName,
                email: step1Data.email,
                nicNumber: step1Data.nicNumber,
                gender: step1Data.gender,
                dateOfBirth: step1Data.dateOfBirth,
                medium: step1Data.medium,
                contactNumber: step1Data.contactNumber,
                whatsappNumber: step1Data.whatsappNumber,
                parentName: step1Data.parentName,
                parentContactNumber: step1Data.parentContactNumber,
                address: step1Data.address,
                studentType: "EXTERNAL",
                grade: "12",
                alStream: step3.alStream,
                alSubjects: step3.alSubjects,
                alApplicationStatus: step3.alApplicationStatus,
            };

            const { data } = await axios.post(`${API_BASE}/public/students`, payload);
            const studentId = data.id;

            await Promise.all(
                buildOLResults(step2Data).map((r) =>
                    axios.post(`${API_BASE}/students/${studentId}/ol-results`, r, { withCredentials: true })
                        .catch(() => {}) // OL results non-critical on public path
                )
            );

            setSubmittedNic(step1Data.nicNumber);
        } catch {
            setError("Submission failed. Please check your details and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submittedNic) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-4">
                    <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
                    <h1 className="text-2xl font-bold">Application Submitted</h1>
                    <p className="text-muted-foreground">
                        Your application has been received and is pending review.
                        You will be contacted via email once a decision is made.
                    </p>
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Reference NIC</p>
                        <p className="font-mono font-semibold text-lg">{submittedNic}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-2xl mx-auto px-4 py-10">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold">Student Application</h1>
                    <p className="text-muted-foreground mt-1">Apply for Grade 12 A/L programme</p>
                </div>

                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <StepIndicator current={step} />

                    {error && (
                        <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {step === 1 && <Step1 defaultValues={step1Data} onNext={(d) => { setStep1Data(d); setStep(2); }} />}
                    {step === 2 && <Step2 defaultValues={step2Data} onNext={(d) => { setStep2Data(d); setStep(3); }} onBack={() => setStep(1)} />}
                    {step === 3 && <Step3 onSubmit={handleStep3} onBack={() => setStep(2)} isSubmitting={isSubmitting} />}
                </div>
            </div>
        </div>
    );
}
