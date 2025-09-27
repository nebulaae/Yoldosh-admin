"use client"

import { z } from "zod";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounceValue, useIntersectionObserver } from "usehooks-ts";
import { promoCodeGrantSchema } from "@/lib/utils";
import {
    useGetAllUsers,
    useGrantPromoCode,
    useDeletePromoCode
} from "@/hooks/adminHooks";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Trash2 } from "lucide-react";
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";

type User = {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    promoCode: {
        id: string;
        discountPercentage: number;
    } | null;
};

export const Promocodes = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch] = useDebounceValue(searchTerm, 500);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const filters = { search: debouncedSearch };

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetAllUsers(filters);
    const { mutate: grantPromoCode, isPending: isGranting } = useGrantPromoCode();
    const { mutate: deletePromoCode, isPending: isDeleting } = useDeletePromoCode();

    const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.5 });

    const form = useForm<z.infer<typeof promoCodeGrantSchema>>({
        resolver: zodResolver(promoCodeGrantSchema),
        defaultValues: { discountPercentage: 10 },
    });

    useEffect(() => {
        if (selectedUser) {
            form.setValue("userId", selectedUser.id);
        }
    }, [selectedUser, form]);

    useEffect(() => {
        if (isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const onGrantSubmit = (values: z.infer<typeof promoCodeGrantSchema>) => {
        grantPromoCode(values, {
            onSuccess: () => setSelectedUser(null),
        });
    };

    const allUsers = data?.pages.flatMap(page => page.users) ?? [];

    return (
        <div>
            <Toaster richColors />
            <div className="flex justify-between items-center mb-6">
                <h1 className="title-text">Промокоды пользователей</h1>
            </div>
            <div className="relative w-full max-w-sm mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Поиск по имени, фамилии, номеру..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedUser(null)}>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Имя</TableHead>
                                <TableHead>Фамилия</TableHead>
                                <TableHead>Телефон</TableHead>
                                <TableHead>Скидка (%)</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                                ))
                            ) : allUsers.length > 0 ? (
                                allUsers.map((user: User) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.firstName}</TableCell>
                                        <TableCell>{user.lastName}</TableCell>
                                        <TableCell>{user.phoneNumber}</TableCell>
                                        <TableCell>{user.promoCode?.discountPercentage || 0}%</TableCell>
                                        <TableCell className="text-right">
                                            {user.promoCode ? (
                                                <Button variant="ghost" size="icon" onClick={() => deletePromoCode(user.promoCode!.id)} disabled={isDeleting}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            ) : (
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>Выдать</Button>
                                                </DialogTrigger>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center">Пользователи не найдены.</TableCell></TableRow>
                            )}
                            {hasNextPage && (
                                <TableRow>
                                    <TableCell colSpan={5} ref={ref}>
                                        {isFetchingNextPage && <div className='flex justify-center p-4'><p>Загрузка...</p></div>}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {selectedUser && (
                    <DialogContent>
                        <DialogHeader><DialogTitle>Выдать промокод для {selectedUser.firstName}</DialogTitle></DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onGrantSubmit)} className="space-y-4">
                                <FormField control={form.control} name="discountPercentage" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Процент скидки (1-30%)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="30"
                                                {...field}
                                                value={field.value ?? ""}
                                                onChange={e => {
                                                    const val = e.target.value === "" ? "" : Number(e.target.value);
                                                    field.onChange(val);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="submit" disabled={isGranting}>{isGranting ? 'Выдача...' : 'Выдать промокод'}</Button>
                            </form>
                        </Form>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    );
};