// ── API Response Types ──────────────────────────────

export interface ApiError {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number; // current page (0-indexed)
    size: number;
}

// Dashboard types
export interface DashboardStats {
    totalStudents: number;
    grade12Count: number;
    grade13Count: number;
    newAdmissionsThisYear: number;
    maleCount: number;
    femaleCount: number;
}

export interface DistributionItem {
    label: string;
    count: number;
}

export interface DemographicsData {
    streamDistribution: DistributionItem[];
    genderDistribution: DistributionItem[];
    gradeDistribution: DistributionItem[];
}

// Import result
export interface ImportResult {
    total: number;
    success: number;
    failed: number;
    errors: string[];
}
