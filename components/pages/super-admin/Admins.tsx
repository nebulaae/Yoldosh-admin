"use client"

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { createAdminSchema } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIntersectionObserver } from "usehooks-ts";
import {
    useGetAllAdmins,
    useCreateAdmin,
    useDeleteAdmin
} from "@/hooks/superAdminHooks";

import { Input } from "@/components/ui/input";
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";

export const Admins = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetAllAdmins({});
    const { mutate: createAdmin, isPending: isCreating } = useCreateAdmin();
    const { mutate: deleteAdmin, isPending: isDeleting } = useDeleteAdmin();

    const { ref, isIntersecting } = useIntersectionObserver({
        threshold: 0.5,
    });

    const form = useForm<z.infer<typeof createAdminSchema>>({
        resolver: zodResolver(createAdminSchema),
        defaultValues: { email: "", firstName: "", lastName: "" },
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
    };

    useEffect(() => {
        if (isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const allAdmins = data?.pages.flatMap((page: any) => page.admins.rows) ?? [];

    return (
        <div>
            <Toaster richColors />
            <div className="flex gap-2 justify-between items-center mb-6">
                <h1 className="title-text">Управление админами</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-primary shadow-glow">Создать админа</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Создать нового админа
                            </DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Почта
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="admin@yoldosh.uz"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Имя
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="John"
                                                    {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Фамилия
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Doe"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                <Button
                                    type="submit"
                                    className="btn-primary shadow-glow"
                                    disabled={isCreating}>
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
                                    <TableCell colSpan={4}>
                                        <Skeleton className="h-8 w-full" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : allAdmins.length > 0 ? (
                            allAdmins.map((admin: any) => (
                                <TableRow key={admin.id}>
                                    <TableCell>{admin.firstName} {admin.lastName}</TableCell>
                                    <TableCell>{admin.email}</TableCell>
                                    <TableCell>{admin.role}</TableCell>
                                    <TableCell className="w-32">
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            disabled={isDeleting}
                                            onClick={() => handleDelete(admin.id)}
                                        >
                                            Удалить</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    Администраторы не найдены.
                                </TableCell>
                            </TableRow>
                        )}
                        {hasNextPage && (
                            <TableRow>
                                <TableCell colSpan={4} ref={ref}>
                                    {isFetchingNextPage && (
                                        <div className='flex justify-center items-center p-4'>
                                            <p>Загрузка...</p>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};