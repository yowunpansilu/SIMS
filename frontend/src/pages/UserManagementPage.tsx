import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import type { UserSchemaType } from "@/lib/userValidators";
import type { User } from "@/types";
import PageContainer from "@/components/layout/PageContainer";
import DataTable from "@/components/shared/DataTable";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import UserForm from "@/components/forms/UserForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, Shield, BookOpen, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";

const roleConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline"; icon: React.ElementType }> = {
    ADMIN: { label: "Admin", variant: "default", icon: Shield },
    TEACHER: { label: "Teacher", variant: "secondary", icon: BookOpen },
    CLERK: { label: "Clerk", variant: "outline", icon: ClipboardList },
};

export default function UserManagementPage() {
    const { users, isLoading, error, refresh, createUser, updateUser, deleteUser } = useUsers();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>();
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const openCreate = () => {
        setEditingUser(undefined);
        setSheetOpen(true);
    };

    const openEdit = (user: User) => {
        setEditingUser(user);
        setSheetOpen(true);
    };

    const handleSubmit = async (data: UserSchemaType) => {
        setIsSubmitting(true);
        try {
            if (editingUser) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const payload: any = { ...data };
                if (!payload.password) delete payload.password;
                await updateUser(editingUser.id, payload);
                toast.success("User updated successfully");
            } else {
                await createUser(data);
                toast.success("User created successfully");
            }
            setSheetOpen(false);
        } catch {
            toast.error(editingUser ? "Failed to update user" : "Failed to create user");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await deleteUser(deleteTarget.id);
            toast.success("User deleted");
            setDeleteTarget(null);
        } catch {
            toast.error("Failed to delete user");
        } finally {
            setIsDeleting(false);
        }
    };

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: "username",
            header: "Username",
            cell: ({ row }) => (
                <span className="font-medium">{row.original.username}</span>
            ),
        },
        {
            accessorKey: "fullName",
            header: "Full Name",
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.original.email}</span>
            ),
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => {
                const cfg = roleConfig[row.original.role] || roleConfig.CLERK;
                const Icon = cfg.icon;
                return (
                    <Badge variant={cfg.variant} className="gap-1">
                        <Icon className="h-3 w-3" />
                        {cfg.label}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(row.original)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(row.original)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <PageContainer
            title="User Management"
            description="Manage user accounts and access roles"
            actions={
                <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            }
        >
            {error && (
                <div className="mb-4 flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <p className="text-sm text-destructive">{error}</p>
                    <Button variant="outline" size="sm" onClick={refresh}>
                        Retry
                    </Button>
                </div>
            )}

            <DataTable
                columns={columns}
                data={users}
                isLoading={isLoading}
                searchPlaceholder="Search users…"
                emptyMessage="No users found"
            />

            {/* Create / Edit Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{editingUser ? "Edit User" : "Add New User"}</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                        <UserForm
                            user={editingUser}
                            onSubmit={handleSubmit}
                            onCancel={() => setSheetOpen(false)}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Delete User"
                description={`Are you sure you want to delete "${deleteTarget?.fullName}"? This action cannot be undone.`}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                destructive
            />
        </PageContainer>
    );
}
