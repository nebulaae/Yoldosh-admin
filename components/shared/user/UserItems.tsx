import Image from "next/image";

import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatDocUrl, getStatusColor } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const InfoItem = ({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode | null | undefined;
  valueClassName?: string;
}) => {
  const renderValue = () => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "Да" : "Нет";
    if (typeof value === "string" || typeof value === "number") return String(value);
    return value;
  };

  return (
    <div className="flex items-start gap-4">
      {icon && <div className="text-muted-foreground mt-1">{icon}</div>}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`font-semibold break-all ${valueClassName || ""}`}>{renderValue()}</p>
      </div>
    </div>
  );
};

export const TripCard = ({ trip }: { trip: any }) => (
  <Card className="component">
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
      <InfoItem label="Откуда" value={trip.fromVillage?.nameRu ?? "N/A"} />
      <InfoItem label="Куда" value={trip.toVillage?.nameRu ?? "N/A"} />
      <InfoItem
        label="Стоимость"
        value={`${parseFloat(trip.price_per_person).toLocaleString("ru-RU")} UZS`}
      />
    </CardContent>
  </Card>
);

export const BookingCard = ({ booking }: { booking: any }) => (
  <Card className="component">
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle className="font-mono text-base">Бронь #{booking.id.substring(0, 6)}</CardTitle>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
          {booking.status}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{formatDate(booking.createdAt)}</p>
    </CardHeader>
    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InfoItem label="Общая стоимость" value={`${parseFloat(booking.totalPrice).toLocaleString("ru-RU")} UZS`} />
      <InfoItem label="Мест забронировано" value={booking.seatsBooked} />
      <InfoItem label="Причина отмены" value={booking.cancellationReason ?? "—"} />
    </CardContent>
  </Card>
);

export const CarCard = ({ car }: { car: any }) => (
  <Card className="component">
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle className="text-base">
          {car.modelDetails?.make} {car.modelDetails?.model}
        </CardTitle>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(car.status)}`}>
          {car.status}
        </span>
      </div>
      <p className="text-sm text-muted-foreground font-mono">Номер машины: {car.license_plate}</p>
    </CardHeader>
    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InfoItem label="Цвет" value={car.color} />
      <InfoItem label="Год" value={car.carYear} />
      <InfoItem label="Причина отклонения" value={car.rejectionReason ?? "—"} />
      <InfoItem
        label="Техпаспорт"
        value={
          car.tech_passport ? (
            <a href={car.tech_passport} className="link-text" target="_blank">
              Открыть
            </a>
          ) : (
            "—"
          )
        }
      />
      {/* Documents */}
      <div className="flex gap-2 items-center justify-start flex-wrap">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              <ImageIcon className="mr-1 h-3 w-3" /> Документ Спереди
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md p-0">
            <DialogTitle className="sr-only">Передняя часть документа</DialogTitle>
            <Image
              src={formatDocUrl(car.documentFront)}
              alt="Document Front"
              className="rounded-lg w-full max-h-[80vh] object-contain"
              width={2048}
              height={2048}
            />
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              <ImageIcon className="mr-1 h-3 w-3" /> Документ Сзади
            </Button>
          </DialogTrigger>
          <DialogTitle className="sr-only">Задняя часть документа</DialogTitle>
          <DialogContent className="max-w-md p-0">
            <Image
              src={formatDocUrl(car.documentBack)}
              alt="Document Back"
              className="rounded-lg w-full max-h-[80vh] object-contain"
              width={2048}
              height={2048}
            />
          </DialogContent>
        </Dialog>
      </div>
    </CardContent>
  </Card>
);

export const ReportCard = ({ report }: { report: any }) => (
  <Card className="component">
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle className="font-mono text-base">Жалоба #{report.id.substring(0, 6)}</CardTitle>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
          {report.status}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        От: {report.reportingUser?.firstName || "N/A"} — {formatDate(report.createdAt)}
      </p>
    </CardHeader>
    <CardContent className="grid gap-2">
      <InfoItem label="Причина" value={report.reason} />
      <InfoItem label="Комментарий" value={report.comment ?? "—"} />
    </CardContent>
  </Card>
);

export const UserDetailsSkeleton = () => (
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
