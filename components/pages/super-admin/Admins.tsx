"use client"

import { z } from "zod";
import { useState } from "react"
import { useForm } from "react-hook-form";
import { useDebounceValue } from "usehooks-ts";
import { createAdminSchema } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export const Admins = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [sort, setSort] = useState({ sortBy: "createdAt", sortOrder: "DESC" });
    const debouncedSearch = useDebounceValue(searchTerm, 500);

    const filters = {
        search: debouncedSearch[0],
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
    };

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetAllAdmins(filters);
    const { mutate: createAdmin, isPending: isCreating } = useCreateAdmin();
    const { mutate: deleteAdmin, isPending: isDeleting } = useDeleteAdmin();

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
    }

    const allAdmins = data?.pages.flatMap((page: any) => page.admins) ?? [];

    return (
        <div>
            <Toaster richColors />
            <div className="flex flex-col md:flex-row gap-2 justify-between items-center mb-6">
                <h1 className="title-text">Управление администраторами</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild><Button>Создать админа</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Создать нового админа</DialogTitle></DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Почта</FormLabel><FormControl><Input placeholder="admin@yoldosh.uz" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="firstName" render={({ field }) => (
                                    <FormItem><FormLabel>Имя</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="lastName" render={({ field }) => (
                                    <FormItem><FormLabel>Фамилия</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <Button
                                    type="submit"
                                    disabled={isCreating}>
                                    {isCreating ? "Создание..." : "Создать"}
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex justify-between items-center gap-2 my-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Поиск по имени, почте..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSort({ sortBy: "createdAt", sortOrder: "DESC" })}>Сначала новые</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSort({ sortBy: "createdAt", sortOrder: "ASC" })}>Сначала старые</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
                                        <Button size="sm" variant="destructive" disabled={isDeleting} onClick={() => handleDelete(admin.id)}>Удалить</Button>
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
                    </TableBody>
                </Table>
            </div>
            {hasNextPage && (
                <div className="mt-4 flex justify-center">
                    <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                        {isFetchingNextPage ? 'Загрузка...' : 'Загрузить еще'}
                    </Button>
                </div>
            )}
        </div>
    );
};