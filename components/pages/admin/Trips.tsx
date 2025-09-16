"use client"

import { z } from "zod";
import { useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { DateRange } from "react-day-picker";
import { useDebounceValue } from "usehooks-ts";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    editTripSchema,
    formatDate
} from "@/lib/utils";
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
    Calendar as CalendarIcon,
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
import { Separator } from "@/components/ui/separator";

type Trip = {
    id: string;
    driver: { firstName: string, lastName: string };
    departure_location: string;
    arrival_location: string;
    departure_ts: string;
    seats_available: number;
    price_per_person: number;
};

export const Trips = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sort, setSort] = useState({ sortBy: "departure_ts", sortOrder: "DESC" });
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const [debouncedSearch] = useDebounceValue(searchTerm, 500);

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
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

    const form = useForm<z.infer<typeof editTripSchema>>({
        resolver: zodResolver(editTripSchema),
    });

    const handleEditClick = (trip: Trip) => {
        setSelectedTrip(trip);
        form.reset({
            tripId: trip.id,
            departure_ts: trip.departure_ts ? new Date(trip.departure_ts).toISOString().slice(0, 16) : undefined,
            seats_available: trip.seats_available,
            price_per_person: trip.price_per_person,
        });
    }

    const onEditSubmit = (values: z.infer<typeof editTripSchema>) => {
        if (!selectedTrip) return;
        const submissionData = { ...values, departure_ts: values.departure_ts ? new Date(values.departure_ts).toISOString() : undefined };
        editTrip(submissionData, {
            onSuccess: () => setSelectedTrip(null)
        });
    }

    const handleDelete = (tripId: string) => {
        if (window.confirm("Вы уверены, что хотите удалить эту поездку?")) {
            deleteTrip(tripId);
        }
    };

    const allTrips = data?.pages.flatMap(page => page.trips) ?? [];

    return (
        <div>
            <Toaster richColors />
            <h1 className="title-text">Управление поездками</h1>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 my-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Поиск по ID, маршруту, водителю..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                            <DropdownMenuItem onClick={() => setSort({ sortBy: "departure_ts", sortOrder: "DESC" })}>Сначала новые</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSort({ sortBy: "departure_ts", sortOrder: "ASC" })}>Сначала старые</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
                </div>
            ) : (
                <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedTrip(null)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allTrips.length > 0 ? (
                            allTrips.map((trip: any) => (
                                <div key={trip.id} className="bg-white p-4 rounded-lg border flex flex-col justify-between">
                                    <div>
                                        <div className="font-bold text-lg">{trip.fromVillage?.nameRu} → {trip.toVillage?.nameRu}</div>
                                        <Separator orientation="horizontal" className="my-2" />
                                        <div className="text-sm text-gray-500">Водитель: {trip.driver.firstName}</div>
                                        <div className="text-sm text-gray-500">Отправление: {formatDate(trip.departure_ts)}</div>
                                        <div className="text-sm text-gray-500">Места: {trip.seats_available}</div>
                                        <div className="text-sm text-gray-500">Цена: {trip.price_per_person} UZS</div>
                                    </div>
                                    <div className="flex items-center justify-between space-x-2 mt-4">
                                        <DialogTrigger asChild>
                                            <div className="w-full">
                                                <Button
                                                    size="icon"
                                                    onClick={() => handleEditClick(trip)}
                                                    className="w-full"
                                                >
                                                    Редактировать
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </DialogTrigger>
                                        <div className="w-full">
                                            <Button
                                                size="icon"
                                                onClick={() => handleDelete(trip.id)}
                                                disabled={isDeleting}
                                                className="btn-danger w-full"
                                            >
                                                Удалить
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="col-span-full text-center py-10">Поездки не найдены.</p>
                        )}
                    </div>
                    {selectedTrip && (
                        <DialogContent>
                            <DialogHeader><DialogTitle>Редактировать поездку</DialogTitle></DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
                                    <FormField control={form.control} name="departure_ts" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Дата и время отправления</FormLabel>
                                            <FormControl><Input type="datetime-local" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="seats_available" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Свободные места</FormLabel>
                                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="price_per_person" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Цена за место</FormLabel>
                                            <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <Button type="submit" disabled={isEditing}>{isEditing ? "Сохранение..." : "Сохранить"}</Button>
                                </form>
                            </Form>
                        </DialogContent>
                    )}
                </Dialog>
            )}

            {hasNextPage && (
                <div className="mt-6 flex justify-center">
                    <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                        {isFetchingNextPage ? 'Загрузка...' : 'Загрузить еще'}
                    </Button>
                </div>
            )}
        </div>
    );
};