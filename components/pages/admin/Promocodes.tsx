"use client";

import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle, Ticket, Trash2, UserCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    useDeletePromoCode,
    useGetGlobalPromoCodes,
    useGetUserPromoCodes,
    useGrantPromoCode,
} from "@/hooks/adminHooks";
import { formatDate, getStatusColor, globalPromoCodeSchema, personalPromoCodeSchema } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

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
        grantPromoCode(
            { ...values, type: "SINGLE_USER" },
            {
                onSuccess: () => {
                    personalForm.reset();
                    setIsPersonalDialogOpen(false);
                },
            }
        );
    };

    const onGlobalSubmit = (values: z.infer<typeof globalPromoCodeSchema>) => {
        grantPromoCode(
            { ...values, type: "GLOBAL" },
            {
                onSuccess: () => {
                    globalForm.reset();
                    setIsGlobalDialogOpen(false);
                },
            }
        );
    };

    return (
        <div>
            <Toaster />
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <div className="mb-4 sm:mb-0">
                    <h1 className="title-text">Промокоды</h1>
                    <p className="subtitle-text">Управление промокодами и скидками</p>
                </div>
                <div className="flex flex-col sm:flex-row  gap-2">
                    <Dialog open={isPersonalDialogOpen} onOpenChange={setIsPersonalDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gray-200 dark:bg-gray-800 text-black dark:text-white cursor-pointer">
                                <UserCheck />
                                Персональный промокод
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Выдать персональный промокод</DialogTitle>
                            </DialogHeader>
                            <Form {...personalForm}>
                                <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="space-y-4">
                                    <FormField
                                        control={personalForm.control}
                                        name="userId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ID Пользователя</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="User ID..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={personalForm.control}
                                        name="discountPercentage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Процент скидки</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={(e) =>
                                                            field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={personalForm.control}
                                        name="expiresAt"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Срок действия (необязательно)</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button variant={"outline"} className="justify-start text-left font-normal">
                                                                {field.value ? format(field.value, "PPP") : <span>Выберите дату</span>}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={isGranting} className="btn-primary shadow-glow">
                                        {isGranting ? "Выдача..." : "Выдать"}
                                    </Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isGlobalDialogOpen} onOpenChange={setIsGlobalDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="btn-primary shadow-glow">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Создать промокод
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Создать глобальный промокод</DialogTitle>
                            </DialogHeader>
                            <Form {...globalForm}>
                                <form onSubmit={globalForm.handleSubmit(onGlobalSubmit)} className="space-y-4">
                                    <FormField
                                        control={globalForm.control}
                                        name="discountPercentage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Процент скидки</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={(e) =>
                                                            field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={globalForm.control}
                                        name="useAmount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Количество использований</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={(e) =>
                                                            field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={globalForm.control}
                                        name="expiresAt"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Срок действия (необязательно)</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button variant={"outline"} className="justify-start text-left font-normal">
                                                                {field.value ? format(field.value, "PPP") : <span>Выберите дату</span>}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        disabled={isGranting}
                                        className="btn-primary shadow-glow"
                                    >
                                        {isGranting ? "Создание..." : "Создать"}
                                    </Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="global" className="w-full">
                <TabsList className="flex items-center justify-center w-64 sm:w-96 px-1">
                    <TabsTrigger value="global">Глобальные</TabsTrigger>
                    <TabsTrigger value="personal">Персональные</TabsTrigger>
                </TabsList>
                <TabsContent value="global">
                    <PromoCodesTable type="GLOBAL" />
                </TabsContent>
                <TabsContent value="personal">
                    <PromoCodesTable type="SINGLE_USER" />
                </TabsContent>
            </Tabs>
        </div>
    );
};

const PromoCodesTable = ({ type }: { type: "SINGLE_USER" | "GLOBAL" }) => {
    const [promocodeProgress, setPromocodeProgress] = useState();
    const { data: promoCodes, isLoading } = type === "SINGLE_USER" ? useGetUserPromoCodes() : useGetGlobalPromoCodes();
    const { mutate: deletePromoCode, isPending: isDeleting } = useDeletePromoCode();

    return (
        <div className="flex flex-col component border rounded-2xl mt-4 px-6 py-4">
            {isLoading ? (
                <div className="grid-default">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton className="h-8 w-full" key={i} />
                    ))}
                </div>
            ) : promoCodes && promoCodes.length > 0 ? (
                <div className="grid-2">
                    {promoCodes.map((pc: any) => (
                        <div
                            className="flex flex-col gap-3 component border hover:border-emerald-500 dark:hover:border-emerald-600 transition rounded-xl p-6"
                            key={pc.id}
                        >
                            {/* Code */}
                            <div className="flex flex-row items-center justify-start gap-3">
                                <div className="bg-gradient-to-br from-emerald-400 to-teal-700 text-white rounded-xl p-3">
                                    <Ticket className="size-7" />
                                </div>
                                <div>
                                    <div className="font-mono font-semibold">{pc.code}</div>
                                    {/* Status */}
                                    <div>
                                        {pc.isActive ? (
                                            <span className={`px-3 py-0.5 rounded-full text-xs ${getStatusColor("ACTIVE")}`}>Активен</span>
                                        ) : (
                                            <span className={getStatusColor("INACTIVE")}>Истек</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Percentage */}
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Скидка:</span>
                                <span className="text-lg font-bold text-emerald-500">{pc.discountPercentage}%</span>
                            </div>
                            {/* Owner */}
                            {type === "SINGLE_USER" && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Владелец:</span>
                                    <span className="font-semibold">{pc.user?.firstName || pc.userId.substring(0, 8)}</span>
                                </div>
                            )}
                            {/* Amount of usage */}
                            {type === "GLOBAL" && (
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Осталось:</span>
                                    <span className="font-semibold">{pc.useAmount ?? "∞"}</span>
                                </div>
                            )}
                            {/* Expiration date */}
                            <div className="flex flex-col sm:flex-row items-center justify-between">
                                <span className="text-muted-foreground">Действителен до:</span>
                                <time className="font-semibold">{pc.expiresAt ? formatDate(pc.expiresAt) : "Бессрочный"}</time>
                            </div>
                            <Progress
                                max={100}
                                value={pc.discountPercentage}
                                className="w-full"
                            />
                            {/* Delete btn */}
                            <div className="text-right">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => deletePromoCode(pc.id)} disabled={isDeleting}
                                    className="w-full"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center w-full mt-8">
                    <span className="subtitle-text">Промокоды не найдены.</span>
                </div>
            )}
        </div>
    );
};
