import { z } from "zod";

export const userSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(50, "Max 50 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
    fullName: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Max 100 characters"),
    email: z
        .string()
        .email("Invalid email address"),
    role: z.enum(["ADMIN", "TEACHER", "CLERK"], {
        message: "Role is required",
    }),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .optional()
        .or(z.literal("")),
});

export type UserSchemaType = z.infer<typeof userSchema>;
