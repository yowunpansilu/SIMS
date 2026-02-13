import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { Student, StudentFormData } from "@/types";

export function useStudents() {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStudents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get<Student[]>("/students");
            setStudents(res.data);
        } catch {
            setError("Failed to load students");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const createStudent = async (data: StudentFormData) => {
        const res = await api.post<Student>("/students", data);
        setStudents((prev) => [...prev, res.data]);
        return res.data;
    };

    const updateStudent = async (id: number, data: StudentFormData) => {
        const res = await api.put<Student>(`/students/${id}`, data);
        setStudents((prev) => prev.map((s) => (s.id === id ? res.data : s)));
        return res.data;
    };

    const deleteStudent = async (id: number) => {
        await api.delete(`/students/${id}`);
        setStudents((prev) => prev.filter((s) => s.id !== id));
    };

    const getById = async (id: number) => {
        const res = await api.get<Student>(`/students/${id}`);
        return res.data;
    };

    return {
        students,
        isLoading,
        error,
        refresh: fetchStudents,
        createStudent,
        updateStudent,
        deleteStudent,
        getById,
    };
}
