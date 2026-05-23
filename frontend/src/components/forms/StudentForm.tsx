import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentSchema, type StudentSchemaType } from "@/lib/validators";
import { AL_STREAM_LABELS, type ALStream } from "@/lib/alSubjects";
import ALSubjectSelector from "./ALSubjectSelector";
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
import { Loader2 } from "lucide-react";
import type { Student } from "@/types";

interface StudentFormProps {
    student?: Student;
    onSubmit: (data: StudentSchemaType) => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export default function StudentForm({
    student,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: StudentFormProps) {
    const form = useForm<StudentSchemaType>({
        resolver: zodResolver(studentSchema),
        defaultValues: student
            ? {
                admissionNumber: student.admissionNumber || "",
                fullName: student.fullName,
                dateOfBirth: student.dateOfBirth || "",
                gender: student.gender,
                address: student.address || "",
                contactNumber: student.contactNumber || "",
                whatsappNumber: student.whatsappNumber || "",
                nicNumber: student.nicNumber || "",
                grade: student.grade,
                alStream: student.alStream,
                alSubjects: student.alSubjects ?? [],
                medium: student.medium,
                parentName: student.parentName || "",
                parentContactNumber: student.parentContactNumber || "",
                alApplicationStatus: student.alApplicationStatus,
            }
            : {
                admissionNumber: "",
                fullName: "",
                dateOfBirth: "",
                gender: undefined,
                address: "",
                contactNumber: "",
                whatsappNumber: "",
                nicNumber: "",
                grade: undefined,
                alStream: undefined,
                alSubjects: [],
                medium: undefined,
                parentName: "",
                parentContactNumber: "",
                alApplicationStatus: undefined,
            },
    });

    const { register, handleSubmit, setValue, watch, formState: { errors } } = form;
    const alStream = watch("alStream");
    const alSubjects = watch("alSubjects") ?? [];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="admissionNumber">
                        Admission Number
                        {student?.studentType !== "EXTERNAL" && " *"}
                    </Label>
                    <Input
                        id="admissionNumber"
                        placeholder="e.g. ADM2024001"
                        {...register("admissionNumber")}
                    />
                    {errors.admissionNumber && (
                        <p className="text-xs text-destructive">{errors.admissionNumber.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" placeholder="Student full name" {...register("fullName")} />
                    {errors.fullName && (
                        <p className="text-xs text-destructive">{errors.fullName.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="nicNumber">NIC Number</Label>
                    <Input id="nicNumber" placeholder="12-digit NIC" {...register("nicNumber")} />
                    {errors.nicNumber && (
                        <p className="text-xs text-destructive">{errors.nicNumber.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                </div>

                <div className="space-y-2">
                    <Label>Gender *</Label>
                    <Select
                        value={watch("gender") || ""}
                        onValueChange={(v) =>
                            setValue("gender", v as StudentSchemaType["gender"], {
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
                    <Label>Grade *</Label>
                    <Select
                        value={watch("grade") || ""}
                        onValueChange={(v) =>
                            setValue("grade", v as StudentSchemaType["grade"], {
                                shouldValidate: true,
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="12">Grade 12</SelectItem>
                            <SelectItem value="13">Grade 13</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.grade && (
                        <p className="text-xs text-destructive">{errors.grade.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>A/L Stream</Label>
                    <Select
                        value={watch("alStream") || ""}
                        onValueChange={(v) => {
                            setValue("alStream", v as ALStream, { shouldValidate: true });
                            setValue("alSubjects", []); // reset subjects when stream changes
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select stream" />
                        </SelectTrigger>
                        <SelectContent>
                            {(Object.keys(AL_STREAM_LABELS) as ALStream[]).map((s) => (
                                <SelectItem key={s} value={s}>
                                    {AL_STREAM_LABELS[s]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Medium</Label>
                    <Select
                        value={watch("medium") || ""}
                        onValueChange={(v) =>
                            setValue("medium", v as StudentSchemaType["medium"], {
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
                </div>

                <div className="space-y-2">
                    <Label>A/L Application Status</Label>
                    <Select
                        value={watch("alApplicationStatus") || ""}
                        onValueChange={(v) =>
                            setValue(
                                "alApplicationStatus",
                                v as StudentSchemaType["alApplicationStatus"],
                                { shouldValidate: true }
                            )
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NOT_APPLIED">Not Applied</SelectItem>
                            <SelectItem value="APPLIED">Applied</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
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
                    <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                    <Input
                        id="whatsappNumber"
                        placeholder="e.g. 0771234567"
                        {...register("whatsappNumber")}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="parentName">Parent / Guardian Name</Label>
                    <Input
                        id="parentName"
                        placeholder="Guardian full name"
                        {...register("parentName")}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="parentContactNumber">Parent / Guardian Contact</Label>
                    <Input
                        id="parentContactNumber"
                        placeholder="e.g. 0771234567"
                        {...register("parentContactNumber")}
                    />
                    {errors.parentContactNumber && (
                        <p className="text-xs text-destructive">
                            {errors.parentContactNumber.message}
                        </p>
                    )}
                </div>
            </div>

            {alStream && (
                <div className="space-y-2">
                    <Label>A/L Subjects</Label>
                    <ALSubjectSelector
                        stream={alStream as ALStream}
                        value={alSubjects}
                        onChange={(subjects) =>
                            setValue("alSubjects", subjects, { shouldValidate: true })
                        }
                        error={errors.alSubjects?.message as string}
                    />
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                    id="address"
                    placeholder="Home address"
                    rows={3}
                    {...register("address")}
                />
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {student ? "Update Student" : "Add Student"}
                </Button>
            </div>
        </form>
    );
}
