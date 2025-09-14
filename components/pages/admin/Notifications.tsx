"use client"

import { z } from "zod";
import { useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { DateRange } from "react-day-picker";
import { useDebounceValue } from "usehooks-ts";
import { zodResolver } from "@hookform/resolvers/zod";
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
    RadioGroup,
    RadioGroupItem
} from "@/components/ui/radio-group";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
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
    const debouncedSearch = useDebounceValue(searchTerm, 500);

    const filters = {
        search: debouncedSearch,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
        startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    };

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetNotifications(filters);
    const { mutate: sendNotification, isPending } = useCreateGlobalNotification();

    const form = useForm<z.infer<typeof globalNotificationSchema>>({
        resolver: zodResolver(globalNotificationSchema),
        defaultValues: { content: "", type: "GENERAL" },
    });

    const onSubmit = (values: z.infer<typeof globalNotificationSchema>) => {
        sendNotification(values, { onSuccess: () => form.reset() });
    };

    const allNotifications = data?.pages.flatMap(page => page.notifications) ?? [];

    return (
        <div>
            <Toaster />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h1 className="title-text mb-2">Отправить Уведомление</h1>
                    <p className="text-sm text-gray-500 mb-6">Отправьте глобальное уведомление всем пользователям.</p>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg border">
                            <FormField control={form.control} name="content" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Содержание</FormLabel>
                                    <FormControl><Textarea placeholder="Текст вашего уведомления..." className="min-h-[120px]" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="type" render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Тип уведомления</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                                            <FormItem className="flex items-center space-x-3"><FormControl><RadioGroupItem value="GENERAL" /></FormControl><FormLabel className="font-normal">General</FormLabel></FormItem>
                                            <FormItem className="flex items-center space-x-3"><FormControl><RadioGroupItem value="TRIPS" /></FormControl><FormLabel className="font-normal">Trips</FormLabel></FormItem>
                                            <FormItem className="flex items-center space-x-3"><FormControl><RadioGroupItem value="PROMOTION_AND_DISCOUNTS" /></FormControl><FormLabel className="font-normal">Promotions</FormLabel></FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isPending}>
                                {isPending ? "Отправка..." : "Отправить"}
                            </Button>
                        </form>
                    </Form>
                </div>
                <div className="md:col-span-2">
                    <h2 className="title-text mb-6">История уведомлений</h2>

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

                    <div className="border rounded-lg">
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
                                        <TableRow key={i}><TableCell colSpan={3}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                                    ))
                                ) : allNotifications.length > 0 ? (
                                    allNotifications.map((notif: any) => (
                                        <TableRow key={notif.id}>
                                            <TableCell className="font-medium">{notif.message}</TableCell>
                                            <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notif.type)}`}>{notif.type}</span></TableCell>
                                            <TableCell>{formatDate(notif.createdAt)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={3} className="text-center h-24">Уведомлений пока нет.</TableCell></TableRow>
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
            </div>
        </div>
    );
};