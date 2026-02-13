import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import api from "@/lib/api";
import type { User } from "@/types";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "sims_user";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setUser(JSON.parse(stored));
            }
        } catch {
            localStorage.removeItem(STORAGE_KEY);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(async (username: string, password: string) => {
        const res = await api.post("/auth/login", { username, password });

        // Backend currently returns { message, role }
        // We'll construct a user object from the response
        const data = res.data;
        const loggedInUser: User = {
            id: data.user?.id ?? 0,
            username: data.user?.username ?? username,
            fullName: data.user?.fullName ?? username,
            email: data.user?.email ?? "",
            role: data.user?.role ?? data.role ?? "CLERK",
        };

        setUser(loggedInUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
