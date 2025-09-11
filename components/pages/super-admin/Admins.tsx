"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createAdminSchema } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    useGetAllAdmins,
    useCreateAdmin,
    useDeleteAdmin
} from "@/hooks/superAdminHooks";

export const Admins = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { data: admins, isLoading } = useGetAllAdmins();
    const { mutate: createAdmin, isPending: isCreating } = useCreateAdmin();
    const { mutate: deleteAdmin, isPending: isDeleting } = useDeleteAdmin();

    const form = useForm<z.infer<typeof createAdminSchema>>({
        resolver: zodResolver(createAdminSchema),
        defaultValues: {
            email: "",
            firstName: "",
            lastName: "",
        },
    });

    const onSubmit = (values: z.infer<typeof createAdminSchema>) => {
        createAdmin(values, {
            onSuccess: () => {
                form.reset();
                setIsDialogOpen(false);
            },
        });
    };

    const handleDelete = (adminId: string) => {
        if (window.confirm("Are you sure you want to delete this admin?")) {
            deleteAdmin(adminId);
        }
    }

    return (
        <div>
            <Toaster richColors />
            <div className="flex flex-col md:flex-row gap-2 justify-between items-center mb-6">
                <h1 className="title-text">Управление администраторами</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-200/50 text-blue-800 hover:bg-blue-200 cursor-pointer" >Создать админа</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Создать нового админа</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Почта</FormLabel>
                                            <FormControl>
                                                <Input placeholder="admin@yoldosh.uz" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Имя</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Фамилия</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    disabled={isCreating}
                                    className="bg-blue-200/50 text-blue-800 hover:bg-blue-200 cursor-pointer"
                                >
                                    {isCreating ? "Создание..." : "Создать"}
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ФИО</TableHead>
                            <TableHead>Почта</TableHead>
                            <TableHead>Роль</TableHead>
                            <TableHead>Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            admins?.map((admin: any) => (
                                <TableRow key={admin.id}>
                                    <TableCell>{admin.firstName} {admin.lastName}</TableCell>
                                    <TableCell>{admin.email}</TableCell>
                                    <TableCell>{admin.role}</TableCell>
                                    <TableCell className="w-32">
                                        <Button
                                            size="sm"
                                            disabled={isDeleting}
                                            onClick={() => handleDelete(admin.id)}
                                            className="w-full bg-red-200/50 text-red-800 hover:bg-red-200 cursor-pointer"
                                        >
                                            Удалить
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};