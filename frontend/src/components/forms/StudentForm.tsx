import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentSchema, type StudentSchemaType } from "@/lib/validators";
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
    student?: Student; // if provided, edit mode
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
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<StudentSchemaType>({
        resolver: zodResolver(studentSchema),
        defaultValues: student
            ? {
                admissionNumber: student.admissionNumber,
                fullName: student.fullName,
                dateOfBirth: student.dateOfBirth || "",
                gender: student.gender,
                address: student.address || "",
                contactNumber: student.contactNumber || "",
                grade: student.grade,
                stream: student.stream,
            }
            : {
                admissionNumber: "",
                fullName: "",
                dateOfBirth: "",
                gender: undefined,
                address: "",
                contactNumber: "",
                grade: undefined,
                stream: undefined,
            },
    });

    const selectedGender = watch("gender");
    const selectedStream = watch("stream");

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
                {/* Admission Number */}
                <div className="space-y-2">
                    <Label htmlFor="admissionNumber">Admission Number *</Label>
                    <Input id="admissionNumber" placeholder="e.g. ADM2024001" {...register("admissionNumber")} />
                    {errors.admissionNumber && (
                        <p className="text-xs text-destructive">{errors.admissionNumber.message}</p>
                    )}
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" placeholder="Student full name" {...register("fullName")} />
                    {errors.fullName && (
                        <p className="text-xs text-destructive">{errors.fullName.message}</p>
                    )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                    {errors.dateOfBirth && (
                        <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>
                    )}
                </div>

                {/* Gender */}
                <div className="space-y-2">
                    <Label>Gender *</Label>
                    <Select
                        value={selectedGender}
                        onValueChange={(val) => setValue("gender", val as StudentSchemaType["gender"], { shouldValidate: true })}
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

                {/* Grade */}
                <div className="space-y-2">
                    <Label>Grade *</Label>
                    <Select
                        value={watch("grade")?.toString()}
                        onValueChange={(val) => setValue("grade", Number(val) as 12 | 13, { shouldValidate: true })}
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

                {/* Stream */}
                <div className="space-y-2">
                    <Label>Stream *</Label>
                    <Select
                        value={selectedStream}
                        onValueChange={(val) => setValue("stream", val as StudentSchemaType["stream"], { shouldValidate: true })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select stream" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SCIENCE">Science</SelectItem>
                            <SelectItem value="COMMERCE">Commerce</SelectItem>
                            <SelectItem value="ARTS">Arts</SelectItem>
                            <SelectItem value="TECHNOLOGY">Technology</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.stream && (
                        <p className="text-xs text-destructive">{errors.stream.message}</p>
                    )}
                </div>

                {/* Contact Number */}
                <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input id="contactNumber" placeholder="e.g. 0771234567" {...register("contactNumber")} />
                    {errors.contactNumber && (
                        <p className="text-xs text-destructive">{errors.contactNumber.message}</p>
                    )}
                </div>
            </div>

            {/* Address — full width */}
            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" placeholder="Home address" rows={3} {...register("address")} />
                {errors.address && (
                    <p className="text-xs text-destructive">{errors.address.message}</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
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
