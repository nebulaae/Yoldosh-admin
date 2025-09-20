"use client"

import z from "zod";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { DateRange } from "react-day-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import { editTripSchema, formatDate } from "@/lib/utils";
import {
    useDebounceValue,
    useIntersectionObserver
} from "usehooks-ts";
import {
    useGetTrips,
    useDeleteTrip,
    useEditTrip
} from "@/hooks/adminHooks";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import {
    Filter,
    Pencil,
    Search,
    Trash2,
    Calendar as CalendarIcon
} from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

type Trip = {
    id: string;
    driver: { firstName: string, lastName: string, phoneNumber: string };
    fromVillage: { nameRu: string };
    toVillage: { nameRu: string };
    departure_ts: string;
};

export const Trips = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sort, setSort] = useState({ sortBy: "departure_ts", sortOrder: "DESC" });
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [debouncedSearch] = useDebounceValue(searchTerm, 500);
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

    const filters = {
        search: debouncedSearch,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
        startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    };

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetTrips(filters);
    const { mutate: deleteTrip, isPending: isDeleting } = useDeleteTrip();
    const { mutate: editTrip, isPending: isEditing } = useEditTrip();

    const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.5 });

    useEffect(() => {
        if (isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const form = useForm<z.infer<typeof editTripSchema>>({
        resolver: zodResolver(editTripSchema),
    });

    const handleEditClick = (trip: Trip) => {
        setSelectedTrip(trip);
        form.reset({ tripId: trip.id, departure_ts: trip.departure_ts ? new Date(trip.departure_ts).toISOString().slice(0, 16) : undefined });
    }

    const onEditSubmit = (values: z.infer<typeof editTripSchema>) => {
        if (!selectedTrip) return;
        const submissionData = { ...values, departure_ts: values.departure_ts ? new Date(values.departure_ts).toISOString() : undefined };
        editTrip(submissionData, {
            onSuccess: () => setSelectedTrip(null)
        });
    }

    const handleDelete = (tripId: string) => {
        if (window.confirm("Вы уверены удалять данную поездку?")) {
            deleteTrip(tripId);
        }
    };

    const allTrips = data?.pages.flatMap(page => page.trips) ?? [];

    return (
        <div>
            <Toaster richColors />
            <h1 className="title-text mb-6">Поездки</h1>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 my-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Поиск по маршруту, номеру водителя и по имени водителя..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from
                                    ? (dateRange.to
                                        ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
                                        : format(dateRange.from, "LLL dd, y"))
                                    : <span>
                                        Выбрать дату
                                    </span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end"><Calendar autoFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} /></PopoverContent>
                    </Popover>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSort({ sortBy: "departure_ts", sortOrder: "DESC" })}>Сначала новые</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSort({ sortBy: "departure_ts", sortOrder: "ASC" })}>Сначала старые</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedTrip(null)}>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Маршрут</TableHead>
                                <TableHead>Водитель</TableHead>
                                <TableHead>Номер водителя</TableHead>
                                <TableHead>Дата прибытия</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : allTrips.length > 0 ? (
                                allTrips.map((trip: any) => (
                                    <TableRow key={trip.id}>
                                        <TableCell className="font-medium">{trip.fromVillage?.nameRu} → {trip.toVillage?.nameRu}</TableCell>
                                        <TableCell>{trip.driver.firstName} {trip.driver.lastName}</TableCell>
                                        <TableCell>{trip.driver.phoneNumber}</TableCell>
                                        <TableCell>{formatDate(trip.departure_ts)}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(trip)}><Pencil className="h-4 w-4" /></Button>
                                            </DialogTrigger>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(trip.id)} disabled={isDeleting}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center">Поездок не найдено.</TableCell></TableRow>
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

                {selectedTrip && (
                    <DialogContent>
                        <DialogHeader><DialogTitle>Изменить поездку</DialogTitle></DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
                                <FormField control={form.control} name="departure_ts" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Время прибытия</FormLabel>
                                        <FormControl><Input type="Выберите дату" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <Button type="submit" disabled={isEditing}>{isEditing ? "Сохраняется..." : "Сохранить"}</Button>
                            </form>
                        </Form>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    );
};