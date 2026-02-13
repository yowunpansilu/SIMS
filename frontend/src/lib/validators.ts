import { z } from "zod";

export const studentSchema = z.object({
    admissionNumber: z
        .string()
        .min(1, "Admission number is required")
        .max(20, "Max 20 characters"),
    fullName: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Max 100 characters"),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"], {
        required_error: "Gender is required",
    }),
    address: z.string().max(500, "Max 500 characters").optional().or(z.literal("")),
    contactNumber: z
        .string()
        .regex(/^[0-9+\-\s()]*$/, "Invalid phone number format")
        .optional()
        .or(z.literal("")),
    grade: z.coerce.number().refine((v) => v === 12 || v === 13, {
        message: "Grade must be 12 or 13",
    }),
    stream: z.enum(["SCIENCE", "COMMERCE", "ARTS", "TECHNOLOGY", "OTHER"], {
        required_error: "Stream is required",
    }),
});

export type StudentSchemaType = z.infer<typeof studentSchema>;
