"use client"

import { z } from "zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounceValue, useIntersectionObserver } from "usehooks-ts";
import {
    formatDate,
    getStatusColor,
    globalNotificationSchema,
} from "@/lib/utils";
import {
    useGetNotifications,
    useCreateGlobalNotification,
} from "@/hooks/adminHooks";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
    Search,
    Filter,
    Calendar as CalendarIcon,
} from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";


export const Notifications = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sort, setSort] = useState({ sortBy: "createdAt", sortOrder: "DESC" });
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [debouncedSearch] = useDebounceValue(searchTerm, 500);

    const filters = {
        search: debouncedSearch,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
        startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    };

    const { ref, isIntersecting } = useIntersectionObserver({
        threshold: 0.5,
    });

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetNotifications(filters);
    const { mutate: sendNotification, isPending } = useCreateGlobalNotification();

    const form = useForm<z.infer<typeof globalNotificationSchema>>({
        resolver: zodResolver(globalNotificationSchema),
        defaultValues: { content: "", type: "general" },
    });

    const onSubmit = (values: z.infer<typeof globalNotificationSchema>) => {
        sendNotification(values, { onSuccess: () => form.reset() });
    };

    useEffect(() => {
        if (isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const allNotifications = data?.pages.flatMap(page => page.notifications) ?? [];

    return (
        <div>
            <Toaster />
            <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-8">
                <div className="w-full">
                    <h1 className="title-text mb-2">Уведомление</h1>
                    <p className="text-sm text-gray-500 mb-6">Отправка push-уведомлений пользователям.</p>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="component space-y-6 p-6 rounded-lg border">
                            <h1 className="text-xl font-bold">Создать уведомление</h1>
                            <FormField control={form.control} name="content" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Содержание</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Текст уведомления..."
                                            className="min-h-[60px] component-dark"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="type" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Тип уведомления</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="component-dark">
                                                <SelectValue placeholder="Выберите тип" className="component-dark" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="general">General</SelectItem>
                                            <SelectItem value="trips">Trips</SelectItem>
                                            <SelectItem value="promotionAndDiscounts">Promotions</SelectItem>
                                            <SelectItem value="newsAndAgreement">News</SelectItem>
                                            <SelectItem value="messages">Messages</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button
                                type="submit"
                                className="w-full btn-primary shadow-glow"
                                disabled={isPending}>
                                {isPending ? "Отправка..." : "Отправить"}
                            </Button>
                        </form>
                    </Form>
                </div>
                <div className="w-full">
                    <h2 className="title-text mb-6">История отправленных</h2>

                    <div className="flex justify-between items-center gap-2 my-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Поиск по содержанию..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : format(dateRange.from, "LLL dd, y")) : <span>Выберите дату</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar autoFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                                </PopoverContent>
                            </Popover>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSort({ sortBy: "createdAt", sortOrder: "DESC" })}>Сначала новые</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSort({ sortBy: "createdAt", sortOrder: "ASC" })}>Сначала старые</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="border rounded-lg component">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Сообщение</TableHead>
                                    <TableHead>Тип</TableHead>
                                    <TableHead>Дата</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={3}><Skeleton className="h-8 w-full" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : allNotifications.length > 0 ? (
                                    allNotifications.map((notif: any) => (
                                        <TableRow key={notif.createdAt}>
                                            <TableCell className="font-medium">{notif.message}</TableCell>
                                            <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notif.type)}`}>{notif.type}</span></TableCell>
                                            <TableCell>{formatDate(notif.createdAt)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={3} className="text-center h-24">Уведомлений пока нет.</TableCell></TableRow>
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
            </div>
        </div>
    );
};