import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    GraduationCap,
    Lock,
    User,
    Loader2,
    AlertCircle,
    Eye,
    EyeOff,
} from "lucide-react";

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

    const from = (location.state as { from?: { pathname: string } })?.from
        ?.pathname ?? "/";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            setError(null);
            await login(data.username, data.password);
            navigate(from, { replace: true });
        } catch (err: unknown) {
            const axiosErr = err as { response?: { status?: number } };
            if (axiosErr.response?.status === 401) {
                setError("Invalid username or password. Please try again.");
            } else {
                setError("Unable to connect to the server. Please try again later.");
            }
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
            {/* Animated gradient background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl animate-pulse [animation-delay:1s]" />
            </div>

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 -z-10 opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                    backgroundSize: "24px 24px",
                }}
            />

            <div className="w-full max-w-md px-4 animate-fade-in">
                {/* Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-lg shadow-primary/25">
                        <GraduationCap className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        SIMS
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Student Information Management System
                    </p>
                </div>

                {/* Login card */}
                <Card className="border-border/50 shadow-xl shadow-black/5 backdrop-blur-sm bg-card/80">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl text-center">Welcome back</CardTitle>
                        <CardDescription className="text-center">
                            Sign in to your account to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Error alert */}
                            {error && (
                                <Alert variant="destructive" className="animate-fade-in">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Username field */}
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        placeholder="Enter your username"
                                        className="pl-10 h-11"
                                        autoComplete="username"
                                        autoFocus
                                        {...register("username")}
                                    />
                                </div>
                                {errors.username && (
                                    <p className="text-sm text-destructive">
                                        {errors.username.message}
                                    </p>
                                )}
                            </div>

                            {/* Password field */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="pl-10 pr-10 h-11"
                                        autoComplete="current-password"
                                        {...register("password")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-destructive">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full h-11 text-base font-medium mt-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in…
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>

                        {/* Footer hint */}
                        <p className="text-xs text-muted-foreground text-center mt-6">
                            Contact your administrator if you need access
                        </p>
                    </CardContent>
                </Card>

                {/* Bottom text */}
                <p className="text-xs text-muted-foreground/60 text-center mt-6">
                    Advanced Level Student Information System
                </p>
            </div>
        </div>
    );
}
