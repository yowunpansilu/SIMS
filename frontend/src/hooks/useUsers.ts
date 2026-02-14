import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import type { User, UserRole } from "@/types";

export interface UserFormData {
    username: string;
    fullName: string;
    email: string;
    role: UserRole;
    password?: string;
}

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get<User[]>("/users");
            setUsers(res.data);
        } catch {
            setError("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const createUser = async (data: UserFormData) => {
        const res = await api.post<User>("/users", data);
        setUsers((prev) => [...prev, res.data]);
        return res.data;
    };

    const updateUser = async (id: number, data: Partial<UserFormData>) => {
        const res = await api.put<User>(`/users/${id}`, data);
        setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
        return res.data;
    };

    const deleteUser = async (id: number) => {
        await api.delete(`/users/${id}`);
        setUsers((prev) => prev.filter((u) => u.id !== id));
    };

    return {
        users,
        isLoading,
        error,
        refresh: fetchUsers,
        createUser,
        updateUser,
        deleteUser,
    };
}
