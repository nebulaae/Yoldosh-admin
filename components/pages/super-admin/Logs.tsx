"use client"

import { useState } from "react";
import { format } from "date-fns";
import { cn, formatDate } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { useDebounceValue } from "usehooks-ts";
import {
    useGetAllAdmins,
    useGetAdminLogs
} from "@/hooks/superAdminHooks";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Filter,
    Search,
    Calendar as CalendarIcon,
} from "lucide-react";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export const Logs = () => {
    const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
    const { data: adminsData, isLoading: isAdminLoading } = useGetAllAdmins({});

    // Filters for logs
    const [searchTerm, setSearchTerm] = useState("");
    const [sort, setSort] = useState({ sortBy: "timestamp", sortOrder: "DESC" });
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [debouncedSearch] = useDebounceValue(searchTerm, 500);

    const filters = {
        search: debouncedSearch,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
        startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    };

    const { data: logsData, isLoading: isLogsLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetAdminLogs(selectedAdminId!, filters);

    const allLogs = logsData?.pages.flatMap((page: any) => page.logs) ?? [];
    const allAdmins = adminsData?.pages.flatMap((page: any) => page.admins) ?? [];

    return (
        <div>
            <h1 className="title-text mb-6">Логи Администраторов</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                    <h2 className="font-semibold mb-3">Администраторы</h2>
                    <div className="border rounded-lg bg-white p-2 space-y-1">
                        {isAdminLoading ? (
                            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                        ) : allAdmins?.length > 0 ? (
                            allAdmins.map((admin: any) => (
                                <button key={admin.id} onClick={() => setSelectedAdminId(admin.id)} className={cn("w-full text-left p-2 rounded-md transition-colors", selectedAdminId === admin.id ? "bg-blue-100 text-blue-800 font-medium" : "hover:bg-gray-100")}>
                                    {admin.firstName} {admin.lastName}
                                </button>
                            ))
                        ) : (
                            <p className="p-2 text-sm text-gray-500">Администраторы не найдены.</p>
                        )}
                    </div>
                </div>
                <div className="md:col-span-3">
                    <h2 className="font-semibold mb-3">
                        {selectedAdminId ? `Логи для ${allAdmins?.find((a: any) => a.id === selectedAdminId)?.firstName}` : "Выберите администратора"}
                    </h2>
                    {selectedAdminId && (
                        <div className="flex justify-between items-center gap-2 my-4">
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Поиск по действию, деталям..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : format(dateRange.from, "LLL dd, y")) : <span>Выберите дату</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end"><Calendar autoFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} /></PopoverContent>
                                </Popover>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setSort({ sortBy: "timestamp", sortOrder: "DESC" })}>Сначала новые</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setSort({ sortBy: "timestamp", sortOrder: "ASC" })}>Сначала старые</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    )}
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Действие</TableHead>
                                    <TableHead>Детали</TableHead>
                                    <TableHead>Дата</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLogsLoading ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <TableRow key={i}><TableCell colSpan={3}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                                    ))
                                ) : allLogs.length > 0 ? (
                                    allLogs.map((log: any) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">{log.action}</TableCell>
                                            <TableCell>{log.details}</TableCell>
                                            <TableCell>{formatDate(log.timestamp)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-48">
                                            {selectedAdminId ? "Логи не найдены." : "Пожалуйста, выберите администратора для просмотра логов."}
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
            </div>
        </div>
    );
};