import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface RecentStudent {
    id: number;
    admissionNumber: string;
    fullName: string;
    grade: string;
    stream: string;
}

export interface DashboardStatsData {
    totalStudents: number;
    grade12Count: number;
    grade13Count: number;
    maleCount: number;
    femaleCount: number;
    newAdmissionsThisYear: number;
    streamCounts: Record<string, number>;
    recentStudents: RecentStudent[];
}

const defaultStats: DashboardStatsData = {
    totalStudents: 0,
    grade12Count: 0,
    grade13Count: 0,
    maleCount: 0,
    femaleCount: 0,
    newAdmissionsThisYear: 0,
    streamCounts: {},
    recentStudents: [],
};

export function useDashboard() {
    const [stats, setStats] = useState<DashboardStatsData>(defaultStats);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get<DashboardStatsData>("/dashboard/stats");
            setStats(res.data);
        } catch {
            setError("Failed to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, isLoading, error, refresh: fetchStats };
}
