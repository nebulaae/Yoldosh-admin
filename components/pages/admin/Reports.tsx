"use client"

import React from "react";

import { z } from "zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { useDebounceValue } from "usehooks-ts";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    formatDate,
    banUserSchema,
    getStatusColor,
} from "@/lib/utils";
import {
    useBanUser,
    useGetReports,
    useUpdateReportStatus,
} from "@/hooks/adminHooks";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Filter,
    Search,
    Calendar as CalendarIcon,
} from "lucide-react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Report = {
    id: string;
    reportingUser: { id: string, firstName: string };
    reportedUser: { id: string, firstName: string };
    reason: string;
    status: "PENDING" | "RESOLVED" | "REJECTED";
    createdAt: string;
};

const ReportsTable = ({ status }: { status: "PENDING" | "RESOLVED" | "REJECTED" }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sort, setSort] = useState({ sortBy: "createdAt", sortOrder: "DESC" });
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const [debouncedSearch] = useDebounceValue(searchTerm, 500);

    const filters = {
        status,
        search: debouncedSearch,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
        startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    };

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetReports(filters);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const { mutate: updateStatus, isPending: isUpdating } = useUpdateReportStatus();
    const { mutate: banUser, isPending: isBanning } = useBanUser();

    const form = useForm<z.infer<typeof banUserSchema>>({
        resolver: zodResolver(banUserSchema),
        defaultValues: { reason: "", durationInDays: undefined },
    });

    useEffect(() => {
        if (selectedReport) {
            form.setValue("reportId", selectedReport.id);
        }
    }, [selectedReport, form]);

    const onBanSubmit = (values: z.infer<typeof banUserSchema>) => {
        if (!selectedReport) return;
        banUser(values, {
            onSuccess: () => setSelectedReport(null),
        });
    };

    const allReports = data?.pages.flatMap(page => page.reports) ?? [];


    return (
        <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedReport(null)}>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 my-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Поиск по ID, причине, имени..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Выберите дату</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                autoFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSort({ sortBy: "createdAt", sortOrder: "DESC" })}>Сначала новые</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSort({ sortBy: "createdAt", sortOrder: "ASC" })}>Сначала старые</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="border rounded-lg bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Пожаловался</TableHead>
                            <TableHead>На кого</TableHead>
                            <TableHead>Причина</TableHead>
                            <TableHead>Дата</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : allReports.length > 0 ? (
                            data!.pages.map((page, i) => (
                                <React.Fragment key={i}>
                                    {page.reports.map((report: Report) => (
                                        <TableRow key={report.id}>
                                            <TableCell>{report.reportingUser?.firstName || 'N/A'}</TableCell>
                                            <TableCell>{report.reportedUser?.firstName || 'N/A'}</TableCell>
                                            <TableCell className="truncate max-w-xs">{report.reason}</TableCell>
                                            <TableCell>{formatDate(report.createdAt)}</TableCell>
                                            <TableCell>
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                                    {report.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {report.status === 'PENDING' && (
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>Рассмотреть</Button>
                                                    </DialogTrigger>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={6} className="text-center h-24">Жалобы не найдены.</TableCell></TableRow>
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

            {selectedReport && (
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Рассмотрение жалобы #{selectedReport.id.substring(0, 8)}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p><strong>От:</strong> {selectedReport.reportingUser.firstName}</p>
                        <p><strong>На:</strong> {selectedReport.reportedUser.firstName}</p>
                        <p><strong>Причина:</strong> {selectedReport.reason}</p>
                        {selectedReport.status === 'PENDING' && (
                            <div className="pt-4">
                                <h3 className="font-semibold mb-2">Действия по жалобе</h3>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onBanSubmit)} className="space-y-4">
                                        <FormField control={form.control} name="reason" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Причина бана</FormLabel>
                                                <FormControl><Input placeholder="Нарушение правил сообщества" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="durationInDays" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Срок бана (в днях, необязательно)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <div className="flex justify-end space-x-2">
                                            <Button type="button" variant="outline" onClick={() => updateStatus({ reportId: selectedReport.id, status: 'REJECTED' }, { onSuccess: () => setSelectedReport(null) })} disabled={isUpdating || isBanning}>Отклонить жалобу</Button>
                                            <Button type="submit" variant="destructive" disabled={isBanning || isUpdating}>Забанить и решить</Button>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        )}
                    </div>
                </DialogContent>
            )}
        </Dialog>
    );
};

export const Reports = () => {
    return (
        <div>
            <Toaster />
            <h1 className="title-text">Жалобы</h1>
            <Tabs defaultValue="PENDING" className="w-full mt-4">
                <TabsList className="w-64 sm:w-96 px-1">
                    <TabsTrigger value="PENDING" className="w-4 text-xs sm:text-md">В ожидании</TabsTrigger>
                    <TabsTrigger value="RESOLVED" className="w-4 text-xs sm:text-md">Решенные</TabsTrigger>
                    <TabsTrigger value="REJECTED" className="w-4 text-xs sm:text-md">Отклоненные</TabsTrigger>
                </TabsList>
                <TabsContent value="PENDING"><ReportsTable status="PENDING" /></TabsContent>
                <TabsContent value="RESOLVED"><ReportsTable status="RESOLVED" /></TabsContent>
                <TabsContent value="REJECTED"><ReportsTable status="REJECTED" /></TabsContent>
            </Tabs>
        </div>
    );
};