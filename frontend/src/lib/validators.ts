import { z } from "zod";
import { isValidALCombination } from "./alSubjects";
import type { ALStream } from "@/types";

const phoneField = z
    .string()
    .regex(/^[0-9+\-\s()]*$/, "Invalid phone number format")
    .optional()
    .or(z.literal(""));

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
        .regex(/^\d{12}$/, "NIC must be exactly 12 digits")
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
    alApplicationStatus: z.enum(["NOT_APPLIED", "APPLIED", "PENDING"]).optional(),
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
            .max(100, "Max 100 characters"),
        nicNumber: z.string().regex(/^\d{12}$/, "NIC must be exactly 12 digits"),
        gender: z.enum(["MALE", "FEMALE", "OTHER"], { message: "Gender is required" }),
        dateOfBirth: z.string().optional().or(z.literal("")),
        medium: z.enum(["SINHALA", "TAMIL", "ENGLISH"], { message: "Medium is required" }),
        contactNumber: phoneField,
        whatsappNumber: phoneField,
        parentName: z.string().max(100).optional().or(z.literal("")),
        parentContactNumber: phoneField,
        address: z.string().max(500).optional().or(z.literal("")),
    })
    .superRefine((data, ctx) => {
        if (data.studentType === "INTERNAL" && !data.admissionNumber?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["admissionNumber"],
                message: "Admission number is required for internal students",
            });
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
        alApplicationStatus: z.enum(["NOT_APPLIED", "APPLIED", "PENDING"]).optional(),
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
