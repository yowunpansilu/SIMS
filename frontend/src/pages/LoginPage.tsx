import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data: LoginFormData) => {
        try {
            setError(null);
            await login(data.username, data.password);
            navigate(from, { replace: true });
        } catch (err: unknown) {
            const axiosErr = err as { response?: { status?: number } };
            if (axiosErr.response?.status === 401) {
                setError("Invalid username or password.");
            } else {
                setError("Unable to connect to the server. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left panel — dark identity */}
            <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 flex-col justify-between p-12">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white">
                        <GraduationCap className="h-5 w-5 text-zinc-950" />
                    </div>
                    <span className="text-sm font-bold tracking-widest text-white uppercase">SIMS</span>
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-white leading-tight">
                        Student Information<br />Management System
                    </h2>
                    <p className="text-zinc-400 text-base leading-relaxed max-w-sm">
                        A centralized platform for managing Advanced Level student records, analytics, and reporting for Sri Lankan secondary schools.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: "Role-Based Access", sub: "4 access levels" },
                        { label: "Bulk Import", sub: "CSV & Excel" },
                        { label: "Real-Time Analytics", sub: "Live dashboards" },
                    ].map(({ label, sub }) => (
                        <div key={label} className="rounded-lg border border-zinc-800 p-3">
                            <p className="text-xs font-semibold text-white">{label}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right panel — white form */}
            <div className="flex flex-1 flex-col items-center justify-center px-6 lg:px-16 bg-white">
                <div className="w-full max-w-sm">
                    {/* Mobile brand */}
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-950">
                            <GraduationCap className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-bold tracking-widest uppercase">SIMS</span>
                    </div>

                    <h1 className="text-2xl font-bold text-zinc-900 mb-1">Sign in</h1>
                    <p className="text-sm text-zinc-500 mb-8">Enter your credentials to access the system.</p>

                    {error && (
                        <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="username" className="text-sm font-medium text-zinc-700">
                                Username
                            </Label>
                            <Input
                                id="username"
                                placeholder="Enter username"
                                className="h-11 border-zinc-200 bg-zinc-50 focus:bg-white"
                                autoComplete="username"
                                autoFocus
                                {...register("username")}
                            />
                            {errors.username && (
                                <p className="text-xs text-red-600">{errors.username.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter password"
                                    className="h-11 border-zinc-200 bg-zinc-50 focus:bg-white pr-10"
                                    autoComplete="current-password"
                                    {...register("password")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 bg-zinc-950 text-white hover:bg-zinc-800 font-medium"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-xs text-zinc-400 text-center">
                        Contact your administrator if you need access.
                    </p>
                </div>
            </div>
        </div>
    );
}
