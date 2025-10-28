"use client";

import React from "react";
import { format } from "date-fns";
import { Loader2, MapPin } from "lucide-react";
import { getStatusColor } from "@/lib/utils";
import { useGetTripDetails } from "@/hooks/adminHooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const TripDetails = ({ tripId }: { tripId: string }) => {
    const { data, isLoading, isError } = useGetTripDetails(tripId);

    if (isLoading)
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );

    if (isError || !data?.trip)
        return (
            <div className="text-center text-muted-foreground py-12">
                Не удалось загрузить данные о поездке
            </div>
        );

    const trip = data.trip;
    const { driver, car, fromVillage, toVillage } = trip;

    const formatDate = (date: string | null) => {
        if (!date) return "—";
        try {
            return format(new Date(date), "dd.MM.yyyy HH:mm");
        } catch {
            return "—";
        }
    };

    return (
        <div className="space-y-8 p-6">
            {/* --- Основная информация --- */}
            <Card className="component shadow-none">
                <CardHeader>
                    <CardTitle className="title-text">Информация о поездке</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <p><span className="text-muted-foreground">ID:</span> {trip.id}</p>
                    <p><span className="text-muted-foreground">Статус:</span> <span className={`${getStatusColor(trip.status)} py-1 px-1.5  rounded-full`}>{trip.status}</span></p>
                    <p><span className="text-muted-foreground">Дата отправления:</span> {formatDate(trip.departure_ts)}</p>
                    <p><span className="text-muted-foreground">Свободных мест:</span> {trip.seats_available}</p>
                    <p><span className="text-muted-foreground">Цена за место:</span> {parseFloat(trip.price_per_person).toLocaleString("ru-RU")} UZS</p>
                    <p><span className="text-muted-foreground">Два сзади максимум:</span> {trip.max_two_back ? "Да" : "Нет"}</p>
                    <p><span className="text-muted-foreground">Комментарий:</span> {trip.comment ?? "—"}</p>
                    <p><span className="text-muted-foreground">Дата создания:</span> {formatDate(trip.createdAt)}</p>
                </CardContent>
            </Card>

            {/* --- Водитель --- */}
            <Card className="component shadow-none">
                <CardHeader>
                    <CardTitle className="title-text link-text">
                        <Link href={`/admin/users-search/${trip.driver.id}`}>
                            Водитель
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <p><span className="text-muted-foreground">Имя:</span> {driver?.firstName ?? "—"}</p>
                    <p><span className="text-muted-foreground">Фамилия:</span> {driver?.lastName ?? "—"}</p>
                    <p><span className="text-muted-foreground">Рейтинг:</span> {driver?.rating ?? "—"}</p>
                    <p><span className="text-muted-foreground">Курение:</span> {driver?.smoking_allowed ? "Разрешено" : "Запрещено"}</p>
                    <p><span className="text-muted-foreground">Животные:</span> {driver?.pets_allowed ? "Да" : "Нет"}</p>
                    <p><span className="text-muted-foreground">Музыка:</span> {driver?.music_allowed ? "Да" : "Нет"}</p>
                    <p><span className="text-muted-foreground">Разговорчивость:</span> {driver?.talkative ? "Да" : "Нет"}</p>
                </CardContent>
            </Card>

            {/* --- Автомобиль --- */}
            {car && (
                <Card className="component shadow-none">
                    <CardHeader>
                        <CardTitle className="title-text">Автомобиль</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <p>
                            <span>Модель:</span> {car.modelDetails?.make} {car.modelDetails?.model}
                        </p>
                        <p><span>Цвет:</span> {car.color}</p>
                        <p><span>Гос. номер:</span> {car.license_plate}</p>
                    </CardContent>
                </Card>
            )}

            {/* --- Маршрут --- */}
            <Card className="component">
                <CardHeader>
                    <CardTitle className="title-text">Маршрут</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-start gap-8 text-sm">
                    <div className="flex flex-row gap-2">
                        <MapPin className="size-4 text-green-500" />
                        <div>
                            <span className="text-muted-foreground text-sm">Откуда:</span>
                            <p>{fromVillage?.nameRu ?? "—"}</p>
                            {fromVillage?.district && (
                                <p className="text-muted-foreground">
                                    {fromVillage.district.nameRu},{" "}
                                    {fromVillage.district.region?.nameRu}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-row gap-2">
                        <MapPin className="size-4 text-red-500" />
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground text-sm">Куда:</span>
                            <span className="font-thin">
                                {trip.toVillage?.nameRu} - {toVillage?.district && (
                                    <p className="text-muted-foreground">
                                        {toVillage.district.nameRu},{" "}
                                        {toVillage.district.region?.nameRu}
                                    </p>
                                )}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* --- Бронирования --- */}
            <Card className="component shadow-none">
                <CardHeader>
                    <CardTitle className="title-text">Бронирования</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                    {trip.bookings?.length ? (
                        trip.bookings.map((b: any) => (
                            <div key={b.id} className="border-b py-2">
                                <p><span>ID:</span> {b.id}</p>
                                <p><span>Мест:</span> {b.seatsBooked}</p>
                                <p><span>Цена:</span> {b.totalPrice} UZS</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground">Нет бронирований</p>
                    )}
                </CardContent>
            </Card>
        </div >
    );
};