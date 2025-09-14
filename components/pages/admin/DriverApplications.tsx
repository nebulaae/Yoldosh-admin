"use client"

import { useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { getStatusColor } from "@/lib/utils";
import { useDebounceValue } from "usehooks-ts";
import {
    useGetDriverApplications,
    useUpdateApplicationStatus
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

export const DriverApplications = () => {
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

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetDriverApplications(filters);
    const { mutate: updateStatus, isPending } = useUpdateApplicationStatus();

    const handleStatusUpdate = (userId: string, status: "VERIFIED" | "REJECTED") => {
        updateStatus({ userId, status });
    };

    const allApplications = data?.pages.flatMap(page => page.applications) ?? [];

    return (
        <div>
            <Toaster richColors />
            <h1 className="title-text mb-6">Заявки водителей</h1>

            <div className="flex flex-col sm:flex-row w-full justify-between items-center gap-2 my-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Поиск по User ID или статусу..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : format(dateRange.from, "LLL dd, y")) : <span>Выберите дату</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar autoFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
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

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Паспорт</TableHead>
                            <TableHead>Паспорт машины</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                            ))
                        ) : allApplications.length > 0 ? (
                            allApplications.map((app: any) => (
                                <TableRow key={app.id}>
                                    <TableCell>{app.userId}</TableCell>
                                    <TableCell><a href={app.passport_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a></TableCell>
                                    <TableCell><a href={app.car_passport_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a></TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(app.status)}`}>{app.status}</span>
                                    </TableCell>
                                    <TableCell className="space-x-2">
                                        <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-100" onClick={() => handleStatusUpdate(app.userId, "VERIFIED")} disabled={isPending}>Подтвердить</Button>
                                        <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-100" onClick={() => handleStatusUpdate(app.userId, "REJECTED")} disabled={isPending}>Отказать</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={5} className="text-center h-24">Нет активных заявок.</TableCell></TableRow>
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