"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Car, Mail, Phone, ShieldAlert, User, Wallet } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useBanUser, useGetUserDetails } from "@/hooks/adminHooks";
import { banUserSchema, formatDate, getStatusColor } from "@/lib/utils";

export const UserDetail = ({ userId }: { userId: string }) => {
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const { data: user, isLoading, isError } = useGetUserDetails(userId);
  const { mutate: banUser, isPending: isBanning } = useBanUser();

  const form = useForm<z.infer<typeof banUserSchema>>({
    resolver: zodResolver(banUserSchema),
    defaultValues: { userId, reason: "", durationInDays: undefined },
  });

  const onBanSubmit = (values: z.infer<typeof banUserSchema>) => {
    banUser(values, {
      onSuccess: () => {
        setIsBanDialogOpen(false);
        form.reset();
      },
    });
  };

  if (isLoading) return <UserDetailsSkeleton />;
  if (isError || !user) return <div className="text-destructive">Не удалось загрузить данные пользователя.</div>;

  const totalSpent =
    user.bookingsAsPassenger?.reduce((acc: any, booking: any) => {
      if (booking.status === "COMPLETED") {
        return acc + parseFloat(booking.totalPrice);
      }
      return acc;
    }, 0) || 0;

  return (
    <div className="flex flex-col gap-6">
      <Toaster richColors />
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
          <div>
            <h1 className="title-text">
              {user.firstName} {user.lastName}
            </h1>
            <p className="subtitle-text font-mono">ID: {user.id}</p>
            <p className="text-sm text-muted-foreground">Регистрация: {formatDate(user.createdAt)}</p>
          </div>
        </div>
        <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" disabled={user.isBanned}>
              <ShieldAlert className="mr-2 h-4 w-4" />
              {user.isBanned ? "Заблокирован" : "Заблокировать"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Заблокировать {user.firstName}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onBanSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Причина</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Причина блокировки..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="durationInDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Срок (в днях, необязательно)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Например, 7"
                          {...field}
                          value={field.value === undefined || field.value === null ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" variant="destructive" disabled={isBanning}>
                  {isBanning ? "Блокировка..." : "Заблокировать"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="dark:bg-slate-900">
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <InfoItem
            icon={<ShieldAlert />}
            label="Статус"
            value={user.isBanned ? "Заблокирован" : "Активен"}
            valueClassName={user.isBanned ? "text-destructive" : "text-green-500"}
          />
          <InfoItem icon={<Phone />} label="Телефон" value={user.phoneNumber} />
          <InfoItem
            icon={<Car />}
            label="Всего поездок"
            value={user.role === "Driver" ? user.drivenTrips?.length || 0 : user.bookingsAsPassenger?.length || 0}
          />
          <InfoItem icon={<Wallet />} label="Всего потрачено" value={`${totalSpent.toLocaleString("ru-RU")} UZS`} />
        </CardContent>
      </Card>

      <Tabs defaultValue="trips">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trips">{user.role === "Driver" ? "Поездки водителя" : "Поездки пассажира"}</TabsTrigger>
          <TabsTrigger value="cars">Машины</TabsTrigger>
          <TabsTrigger value="reports">Жалобы на пользователя</TabsTrigger>
        </TabsList>
        <TabsContent value="trips" className="space-y-4 mt-4">
          {user.role === "Driver" &&
            (user.drivenTrips?.length > 0 ? (
              user.drivenTrips.map((trip: any) => <TripCard key={trip.id} trip={trip} />)
            ) : (
              <p className="text-muted-foreground p-4 text-center">У водителя нет поездок.</p>
            ))}
          {user.role === "Passenger" &&
            (user.bookingsAsPassenger?.length > 0 ? (
              user.bookingsAsPassenger.map((booking: any) => <BookingCard key={booking.id} booking={booking} />)
            ) : (
              <p className="text-muted-foreground p-4 text-center">У пассажира нет поездок.</p>
            ))}
        </TabsContent>
        <TabsContent value="cars" className="space-y-4 mt-4">
          {user.cars?.length > 0 ? (
            user.cars.map((car: any) => <CarCard key={car.id} car={car} />)
          ) : (
            <p className="text-muted-foreground p-4 text-center">У пользователя нет машин.</p>
          )}
        </TabsContent>
        <TabsContent value="reports" className="space-y-4 mt-4">
          {user.receivedReports?.length > 0 ? (
            user.receivedReports.map((report: any) => <ReportCard key={report.id} report={report} />)
          ) : (
            <p className="text-muted-foreground p-4 text-center">На пользователя нет жалоб.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ... UI Components (InfoItem, TripCard, etc.)
const InfoItem = ({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  valueClassName?: string;
}) => (
  <div className="flex items-center gap-4">
    <div className="text-muted-foreground">{icon}</div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-semibold ${valueClassName}`}>{value}</p>
    </div>
  </div>
);

const TripCard = ({ trip }: { trip: any }) => (
  <Card className="dark:bg-slate-900">
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle className="font-mono text-base">Поездка #{trip.id.substring(0, 6)}</CardTitle>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
          {trip.status}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{formatDate(trip.departure_ts)}</p>
    </CardHeader>
    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Откуда</p>
        <p>{trip.fromVillage?.nameRu ?? "N/A"}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Куда</p>
        <p>{trip.toVillage?.nameRu ?? "N/A"}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Стоимость</p>
        <p>{parseFloat(trip.price_per_person).toLocaleString("ru-RU")} UZS</p>
      </div>
    </CardContent>
  </Card>
);

const BookingCard = ({ booking }: { booking: any }) => (
  <Card className="dark:bg-slate-900">
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle className="font-mono text-base">Бронь #{booking.id.substring(0, 6)}</CardTitle>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
          {booking.status}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{formatDate(booking.createdAt)}</p>
    </CardHeader>
    <CardContent>
      <div>
        <p className="text-sm text-muted-foreground">Стоимость</p>
        <p>{parseFloat(booking.totalPrice).toLocaleString("ru-RU")} UZS</p>
      </div>
    </CardContent>
  </Card>
);

const CarCard = ({ car }: { car: any }) => (
  <Card className="dark:bg-slate-900">
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle className="text-base">
          {car.modelDetails?.make} {car.modelDetails?.model}
        </CardTitle>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(car.status)}`}>{car.status}</span>
      </div>
      <p className="text-sm text-muted-foreground font-mono">{car.license_plate}</p>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">
        Цвет: {car.color}, Год: {car.carYear}
      </p>
    </CardContent>
  </Card>
);

const ReportCard = ({ report }: { report: any }) => (
  <Card className="dark:bg-slate-900">
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle className="font-mono text-base">Жалоба #{report.id.substring(0, 6)}</CardTitle>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
          {report.status}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        От: {report.reportingUser?.firstName || "N/A"} - {formatDate(report.createdAt)}
      </p>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">Причина</p>
      <p>{report.reason}</p>
    </CardContent>
  </Card>
);

const UserDetailsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-40 mt-1" />
        </div>
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    <Skeleton className="h-24 w-full" />
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  </div>
);
