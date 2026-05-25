import { z } from "zod";
import { isValidALCombination } from "./alSubjects";
import type { ALStream } from "@/types";

const phoneField = z
    .string()
    .refine(
        (val) => !val || /^(\+94|0)\d{9}$/.test(val),
        "Must be a valid phone number (e.g. 0771234567)"
    )
    .optional()
    .or(z.literal(""));

const requiredPhoneField = z
    .string()
    .min(1, "Phone number is required")
    .regex(/^(\+94|0)\d{9}$/, "Must be a valid phone number (e.g. 0771234567)");

const olGrade = z.enum(["A", "B", "C", "S", "W"], { message: "Grade is required" });

// ── Edit schema (used by StudentForm for editing existing students) ────────────
export const studentSchema = z.object({
    admissionNumber: z.string().max(20, "Max 20 characters").optional().or(z.literal("")),
    fullName: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Max 100 characters"),
    dateOfBirth: z.string().optional().or(z.literal("")),
    gender: z.enum(["MALE", "FEMALE", "OTHER"], { message: "Gender is required" }),
    address: z.string().max(500, "Max 500 characters").optional().or(z.literal("")),
    contactNumber: phoneField,
    whatsappNumber: phoneField,
    nicNumber: z
        .string()
        .regex(/^(\d{12}|\d{9}[VXvx])$/, "NIC must be 12 digits or 9 digits followed by V/X")
        .optional()
        .or(z.literal("")),
    grade: z.enum(["12", "13"], { message: "Grade must be 12 or 13" }),
    alStream: z
        .enum(["PHYSICAL_SCIENCE", "BIOLOGICAL_SCIENCE", "COMMERCE", "TECHNOLOGY", "ARTS"])
        .optional(),
    alSubjects: z.array(z.string()).optional(),
    medium: z.enum(["SINHALA", "TAMIL", "ENGLISH"]).optional(),
    parentName: z.string().max(100).optional().or(z.literal("")),
    parentContactNumber: phoneField,
    alApplicationStatus: z.enum(["NOT_APPLIED", "APPLIED"]).optional(),
});

export type StudentSchemaType = z.infer<typeof studentSchema>;

// ── Registration Step 1 — Identity & Personal Info ────────────────────────────
export const registrationStep1Schema = z
    .object({
        studentType: z.enum(["INTERNAL", "EXTERNAL"], { message: "Student type is required" }),
        admissionNumber: z.string().max(20).optional().or(z.literal("")),
        fullName: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(100, "Max 100 characters")
            .regex(/^[^\d]+$/, "Name cannot contain numbers"),
        nicNumber: z.string().regex(/^(\d{12}|\d{9}[VXvx])$/, "NIC must be 12 digits or 9 digits followed by V/X"),
        gender: z.enum(["MALE", "FEMALE", "OTHER"], { message: "Gender is required" }),
        dateOfBirth: z.string().min(1, "Date of birth is required"),
        medium: z.enum(["SINHALA", "TAMIL", "ENGLISH"], { message: "Medium is required" }),
        contactNumber: requiredPhoneField,
        whatsappNumber: requiredPhoneField,
        parentName: z.string().min(1, "Parent / guardian name is required").max(100),
        parentContactNumber: requiredPhoneField,
        address: z.string().min(1, "Address is required").max(500),
    })
    .superRefine((data, ctx) => {
        if (data.studentType === "INTERNAL" && !data.admissionNumber?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["admissionNumber"],
                message: "Admission number is required for internal students",
            });
        }
        if (data.dateOfBirth) {
            const dob = new Date(data.dateOfBirth);
            if (!isNaN(dob.getTime())) {
                const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                if (age < 13 || age > 30) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["dateOfBirth"],
                        message: "Age must be between 13 and 30 years",
                    });
                }
            }
        }
    });

export type RegistrationStep1Type = z.infer<typeof registrationStep1Schema>;

// ── Registration Step 2 — O/L Results ────────────────────────────────────────
export const registrationStep2Schema = z.object({
    olExamYear: z
        .number({ required_error: "Exam year is required" })
        .int()
        .min(2000, "Year must be 2000 or later")
        .max(2030, "Year must be 2030 or earlier"),
    motherTongue: z.string().min(1, "Mother tongue is required"),
    motherTongueGrade: olGrade,
    englishGrade: olGrade,
    mathsGrade: olGrade,
    scienceGrade: olGrade,
    historyGrade: olGrade,
    religion: z.string().min(1, "Religion is required"),
    religionGrade: olGrade,
    categoryASubject: z.string().min(1, "Aesthetic subject is required"),
    categoryAGrade: olGrade,
    categoryBSubject: z.string().min(1, "Technical subject is required"),
    categoryBGrade: olGrade,
    categoryCSubject: z.string().min(1, "Humanities/Languages subject is required"),
    categoryCGrade: olGrade,
});

export type RegistrationStep2Type = z.infer<typeof registrationStep2Schema>;

// ── Registration Step 3 — A/L Stream & Subjects ───────────────────────────────
export const registrationStep3Schema = z
    .object({
        alStream: z.enum(
            ["PHYSICAL_SCIENCE", "BIOLOGICAL_SCIENCE", "COMMERCE", "TECHNOLOGY", "ARTS"],
            { message: "Stream is required" }
        ),
        alSubjects: z
            .array(z.string())
            .length(3, "Exactly 3 A/L subjects are required"),
        alApplicationStatus: z.enum(["NOT_APPLIED", "APPLIED"]).optional(),
    })
    .superRefine((data, ctx) => {
        if (data.alSubjects.length === 3) {
            if (!isValidALCombination(data.alStream as ALStream, data.alSubjects)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["alSubjects"],
                    message: "Invalid subject combination for the selected stream",
                });
            }
        }
    });

export type RegistrationStep3Type = z.infer<typeof registrationStep3Schema>;
