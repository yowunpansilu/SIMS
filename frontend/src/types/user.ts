// ── User & Auth Types ───────────────────────────────

export type UserRole = "ADMIN" | "TEACHER" | "CLERK";

export interface User {
    id: number;
    username: string;
    fullName: string;
    email: string;
    role: UserRole;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    message: string;
}
