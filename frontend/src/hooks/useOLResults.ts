import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface OLResult {
    id: number;
    subject: string;
    grade: string;
    examYear: number | null;
}

export function useOLResults(studentId: number) {
    const [results, setResults] = useState<OLResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchResults = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get<OLResult[]>(`/students/${studentId}/ol-results`);
            setResults(res.data);
        } catch {
            setError("Failed to load O/L results");
        } finally {
            setIsLoading(false);
        }
    }, [studentId]);

    useEffect(() => { fetchResults(); }, [fetchResults]);

    const addResult = async (data: Omit<OLResult, "id">) => {
        const res = await api.post<OLResult>(`/students/${studentId}/ol-results`, data);
        setResults((prev) => [...prev, res.data]);
        return res.data;
    };

    const updateResult = async (resultId: number, data: Omit<OLResult, "id">) => {
        const res = await api.put<OLResult>(`/students/${studentId}/ol-results/${resultId}`, data);
        setResults((prev) => prev.map((r) => (r.id === resultId ? res.data : r)));
        return res.data;
    };

    const deleteResult = async (resultId: number) => {
        await api.delete(`/students/${studentId}/ol-results/${resultId}`);
        setResults((prev) => prev.filter((r) => r.id !== resultId));
    };

    return { results, isLoading, error, refresh: fetchResults, addResult, updateResult, deleteResult };
}
