import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, type UserSchemaType } from "@/lib/userValidators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { User } from "@/types";

interface UserFormProps {
    user?: User;
    onSubmit: (data: UserSchemaType) => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export default function UserForm({
    user,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: UserFormProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<any>({
        resolver: zodResolver(userSchema),
        defaultValues: user
            ? {
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                password: "",
            }
            : {
                username: "",
                fullName: "",
                email: "",
                role: "",
                password: "",
            },
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = form;

    const selectedRole = watch("role");

    const onFormSubmit = (data: Record<string, unknown>) => {
        return onSubmit(data as UserSchemaType);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                    id="username"
                    placeholder="e.g. john_doe"
                    disabled={!!user}
                    {...register("username")}
                />
                {errors.username && (
                    <p className="text-xs text-destructive">{errors.username.message as string}</p>
                )}
                {user && (
                    <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                )}
            </div>

            {/* Full Name */}
            <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" placeholder="John Doe" {...register("fullName")} />
                {errors.fullName && (
                    <p className="text-xs text-destructive">{errors.fullName.message as string}</p>
                )}
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" placeholder="john@school.edu" {...register("email")} />
                {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message as string}</p>
                )}
            </div>

            {/* Role */}
            <div className="space-y-2">
                <Label>Role *</Label>
                <Select
                    value={selectedRole}
                    onValueChange={(val) => setValue("role", val, { shouldValidate: true })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="TEACHER">Teacher</SelectItem>
                        <SelectItem value="CLERK">Clerk</SelectItem>
                    </SelectContent>
                </Select>
                {errors.role && (
                    <p className="text-xs text-destructive">{errors.role.message as string}</p>
                )}
            </div>

            {/* Password */}
            <div className="space-y-2">
                <Label htmlFor="password">
                    {user ? "New Password" : "Password *"}
                </Label>
                <Input
                    id="password"
                    type="password"
                    placeholder={user ? "Leave blank to keep current" : "Min 6 characters"}
                    {...register("password")}
                />
                {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message as string}</p>
                )}
                {user && (
                    <p className="text-xs text-muted-foreground">
                        Leave blank to keep the current password
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {user ? "Update User" : "Create User"}
                </Button>
            </div>
        </form>
    );
}
