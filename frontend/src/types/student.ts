// ── Student Types ───────────────────────────────────

export type Gender = "MALE" | "FEMALE" | "OTHER";
export type Grade = 12 | 13;
export type Stream = "SCIENCE" | "COMMERCE" | "ARTS" | "TECHNOLOGY" | "OTHER";

export interface Student {
    id: number;
    admissionNumber: string;
    fullName: string;
    dateOfBirth?: string; // ISO date string
    gender: Gender;
    address?: string;
    contactNumber?: string;
    grade: Grade;
    stream: Stream;
}

export interface StudentFormData {
    admissionNumber: string;
    fullName: string;
    dateOfBirth?: string;
    gender: Gender;
    address?: string;
    contactNumber?: string;
    grade: Grade;
    stream: Stream;
}
