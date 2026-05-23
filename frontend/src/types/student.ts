export type StudentType = "INTERNAL" | "EXTERNAL";
export type RegistrationStatus = "ACTIVE" | "PENDING_APPROVAL" | "REJECTED";
export type ALStream = "PHYSICAL_SCIENCE" | "BIOLOGICAL_SCIENCE" | "COMMERCE" | "TECHNOLOGY" | "ARTS";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type Grade = "12" | "13";
export type Stream = "SCIENCE" | "COMMERCE" | "ARTS" | "TECHNOLOGY" | "OTHER"; // legacy
export type Medium = "SINHALA" | "TAMIL" | "ENGLISH";
export type ALApplicationStatus = "NOT_APPLIED" | "APPLIED" | "PENDING";

export interface OLResultInput {
    subject: string;
    grade: string;
    examYear?: number | null;
}

export interface Student {
    id: number;
    admissionNumber?: string;
    fullName: string;
    dateOfBirth?: string;
    gender: Gender;
    address?: string;
    contactNumber?: string;
    whatsappNumber?: string;
    nicNumber?: string;
    grade: Grade;
    stream?: string;        // legacy field kept for backward compat
    alStream?: ALStream;
    alSubjects?: string[];
    medium?: Medium;
    parentName?: string;
    parentContactNumber?: string;
    alApplicationStatus?: ALApplicationStatus;
    studentType: StudentType;
    registrationStatus: RegistrationStatus;
    rejectionReason?: string;
}

export interface StudentFormData {
    admissionNumber?: string;
    fullName: string;
    dateOfBirth?: string;
    gender?: Gender;
    address?: string;
    contactNumber?: string;
    whatsappNumber?: string;
    nicNumber?: string;
    grade?: Grade;
    alStream?: ALStream;
    alSubjects?: string[];
    medium?: Medium;
    parentName?: string;
    parentContactNumber?: string;
    alApplicationStatus?: ALApplicationStatus;
    studentType?: StudentType;
    registrationStatus?: RegistrationStatus;
}
