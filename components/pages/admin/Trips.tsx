"use client"

import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";


import { z } from "zod";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { editTripSchema } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    useGetTrips,
    useDeleteTrip,
    useEditTrip
} from "@/hooks/adminHooks";

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
    const { data, isLoading } = useGetTrips();
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
            // Convert date to a format suitable for datetime-local input
            departure_ts: trip.departure_ts ? new Date(trip.departure_ts).toISOString().slice(0, 16) : undefined,
            seats_available: trip.seats_available,
            price_per_person: trip.price_per_person,
        });
    }

    const onEditSubmit = (values: z.infer<typeof editTripSchema>) => {
        if (!selectedTrip) return;
        const submissionData = {
            ...values,
            departure_ts: values.departure_ts ? new Date(values.departure_ts).toISOString() : undefined
        }
        editTrip(submissionData, {
            onSuccess: () => setSelectedTrip(null)
        });
    }

    const handleDelete = (tripId: string) => {
        if (window.confirm("Вы уверены, что хотите удалить эту поездку?")) {
            deleteTrip(tripId);
        }
    };

    return (
        <div>
            <Toaster richColors />
            <div>
                <h1 className="title-text">Управление поездками</h1>
            </div>
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
                </div>
            ) : (
                <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedTrip(null)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data?.trips?.length > 0 ? (
                            data.trips.map((trip: Trip) => (
                                <div key={trip.id} className="bg-white p-4 rounded-lg border shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="font-bold text-lg">{trip.departure_location} → {trip.arrival_location}</div>
                                        <div className="text-sm text-gray-500">Водитель: {trip.driver.firstName} {trip.driver.lastName}</div>
                                        <div className="text-sm text-gray-500">Отправление: {formatDate(trip.departure_ts)}</div>
                                        <div className="text-sm text-gray-500">Места: {trip.seats_available}</div>
                                        <div className="text-sm text-gray-500">Цена: {trip.price_per_person} UZS</div>
                                    </div>
                                    <div className="flex justify-end space-x-2 mt-4">
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => handleEditClick(trip)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(trip.id)} disabled={isDeleting}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="col-span-full text-center">Поездки не найдены.</p>
                        )}
                    </div>
                    {selectedTrip && (
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Редактировать поездку</DialogTitle>
                            </DialogHeader>
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
        </div>
    );
};