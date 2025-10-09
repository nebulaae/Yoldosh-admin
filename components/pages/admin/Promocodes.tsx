"use client"

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
    useGetUserPromoCodes,
    useGetGlobalPromoCodes,
    useGrantPromoCode,
    useDeletePromoCode
} from "@/hooks/adminHooks";
import { personalPromoCodeSchema, globalPromoCodeSchema, formatDate } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar as CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Promocodes = () => {
    const [isPersonalDialogOpen, setIsPersonalDialogOpen] = useState(false);
    const [isGlobalDialogOpen, setIsGlobalDialogOpen] = useState(false);

    const personalForm = useForm<z.infer<typeof personalPromoCodeSchema>>({
        resolver: zodResolver(personalPromoCodeSchema),
        defaultValues: { userId: "", discountPercentage: 10 },
    });

    const globalForm = useForm<z.infer<typeof globalPromoCodeSchema>>({
        resolver: zodResolver(globalPromoCodeSchema),
        defaultValues: { discountPercentage: 10, useAmount: 100 },
    });

    const { mutate: grantPromoCode, isPending: isGranting } = useGrantPromoCode();

    const onPersonalSubmit = (values: z.infer<typeof personalPromoCodeSchema>) => {
        grantPromoCode({ ...values, type: 'SINGLE_USER' }, {
            onSuccess: () => {
                personalForm.reset();
                setIsPersonalDialogOpen(false);
            }
        });
    };

    const onGlobalSubmit = (values: z.infer<typeof globalPromoCodeSchema>) => {
        grantPromoCode({ ...values, type: 'GLOBAL' }, {
            onSuccess: () => {
                globalForm.reset();
                setIsGlobalDialogOpen(false);
            }
        });
    };

    return (
        <div>
            <Toaster richColors />
            <div className="flex justify-between items-center mb-6">
                <h1 className="title-text">Промокоды</h1>
                <div className="flex gap-2">
                    <Dialog open={isPersonalDialogOpen} onOpenChange={setIsPersonalDialogOpen}>
                        <DialogTrigger asChild><Button>Персональный промокод</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Выдать персональный промокод</DialogTitle></DialogHeader>
                            <Form {...personalForm}>
                                <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="space-y-4">
                                    <FormField control={personalForm.control} name="userId" render={({ field }) => (
                                        <FormItem><FormLabel>ID Пользователя</FormLabel><FormControl><Input placeholder="User ID..." {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={personalForm.control} name="discountPercentage" render={({ field }) => (
                                        <FormItem><FormLabel>Процент скидки</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={personalForm.control} name="expiresAt" render={({ field }) => (
                                        <FormItem className="flex flex-col"><FormLabel>Срок действия (необязательно)</FormLabel>
                                            <Popover><PopoverTrigger asChild>
                                                <FormControl><Button variant={"outline"} className="justify-start text-left font-normal">{field.value ? format(field.value, "PPP") : <span>Выберите дату</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl>
                                            </PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>
                                        <FormMessage /></FormItem>
                                    )} />
                                    <Button type="submit" disabled={isGranting}>{isGranting ? 'Выдача...' : 'Выдать'}</Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isGlobalDialogOpen} onOpenChange={setIsGlobalDialogOpen}>
                        <DialogTrigger asChild><Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" />Создать промокод</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Создать глобальный промокод</DialogTitle></DialogHeader>
                            <Form {...globalForm}>
                                <form onSubmit={globalForm.handleSubmit(onGlobalSubmit)} className="space-y-4">
                                     <FormField control={globalForm.control} name="discountPercentage" render={({ field }) => (
                                        <FormItem><FormLabel>Процент скидки</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                     <FormField control={globalForm.control} name="useAmount" render={({ field }) => (
                                        <FormItem><FormLabel>Количество использований</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                     <FormField control={globalForm.control} name="expiresAt" render={({ field }) => (
                                        <FormItem className="flex flex-col"><FormLabel>Срок действия (необязательно)</FormLabel>
                                            <Popover><PopoverTrigger asChild>
                                                <FormControl><Button variant={"outline"} className="justify-start text-left font-normal">{field.value ? format(field.value, "PPP") : <span>Выберите дату</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl>
                                            </PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>
                                        <FormMessage /></FormItem>
                                    )} />
                                    <Button type="submit" disabled={isGranting}>{isGranting ? 'Создание...' : 'Создать'}</Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="personal">Персональные</TabsTrigger>
                    <TabsTrigger value="global">Глобальные</TabsTrigger>
                </TabsList>
                <TabsContent value="personal"><PromoCodesTable type="SINGLE_USER" /></TabsContent>
                <TabsContent value="global"><PromoCodesTable type="GLOBAL" /></TabsContent>
            </Tabs>
        </div>
    );
};

const PromoCodesTable = ({ type }: { type: 'SINGLE_USER' | 'GLOBAL' }) => {
    const { data: promoCodes, isLoading } = type === 'SINGLE_USER' ? useGetUserPromoCodes() : useGetGlobalPromoCodes();
    const { mutate: deletePromoCode, isPending: isDeleting } = useDeletePromoCode();

    return (
        <div className="border rounded-lg mt-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Код</TableHead>
                        {type === 'SINGLE_USER' && <TableHead>Пользователь</TableHead>}
                        <TableHead>Скидка (%)</TableHead>
                        <TableHead>Срок действия</TableHead>
                        {type === 'GLOBAL' && <TableHead>Осталось</TableHead>}
                        <TableHead>Статус</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}><TableCell colSpan={type === 'SINGLE_USER' ? 6 : 5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                        ))
                    ) : promoCodes && promoCodes.length > 0 ? (
                        promoCodes.map((pc: any) => (
                            <TableRow key={pc.id}>
                                <TableCell className="font-mono">{pc.code}</TableCell>
                                {type === 'SINGLE_USER' && <TableCell>{pc.user?.firstName || pc.userId.substring(0,8)}</TableCell>}
                                <TableCell>{pc.discountPercentage}%</TableCell>
                                <TableCell>{pc.expiresAt ? formatDate(pc.expiresAt) : 'Бессрочный'}</TableCell>
                                {type === 'GLOBAL' && <TableCell>{pc.useAmount ?? '∞'}</TableCell>}
                                <TableCell>{pc.isActive ? <span className="text-green-500">Активен</span> : <span className="text-red-500">Неактивен</span>}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => deletePromoCode(pc.id)} disabled={isDeleting}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={type === 'SINGLE_USER' ? 6 : 5} className="h-24 text-center">Промокоды не найдены.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

