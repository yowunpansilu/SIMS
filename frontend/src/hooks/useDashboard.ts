import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { Student } from "@/types";

interface DashboardStats {
    totalStudents: number;
    grade12Count: number;
    grade13Count: number;
    maleCount: number;
    femaleCount: number;
    streamCounts: Record<string, number>;
    recentStudents: Student[];
}

const defaultStats: DashboardStats = {
    totalStudents: 0,
    grade12Count: 0,
    grade13Count: 0,
    maleCount: 0,
    femaleCount: 0,
    streamCounts: {},
    recentStudents: [],
};

export function useDashboard() {
    const [stats, setStats] = useState<DashboardStats>(defaultStats);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch all students and compute stats client-side
            // (until dedicated dashboard endpoints exist on the backend)
            const res = await api.get<Student[]>("/students");
            const students = res.data;

            const grade12 = students.filter((s) => s.grade === 12);
            const grade13 = students.filter((s) => s.grade === 13);
            const males = students.filter((s) => s.gender === "MALE");
            const females = students.filter((s) => s.gender === "FEMALE");

            const streamCounts: Record<string, number> = {};
            students.forEach((s) => {
                streamCounts[s.stream] = (streamCounts[s.stream] || 0) + 1;
            });

            // Most recently added (assume highest ID = newest)
            const sorted = [...students].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
            const recentStudents = sorted.slice(0, 5);

            setStats({
                totalStudents: students.length,
                grade12Count: grade12.length,
                grade13Count: grade13.length,
                maleCount: males.length,
                femaleCount: females.length,
                streamCounts,
                recentStudents,
            });
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
