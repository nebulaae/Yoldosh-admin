import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, getStatusColor } from "@/lib/utils";

export const InfoItem = ({
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

export const TripCard = ({ trip }: { trip: any }) => (
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

export const BookingCard = ({ booking }: { booking: any }) => (
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

export const CarCard = ({ car }: { car: any }) => (
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

export const ReportCard = ({ report }: { report: any }) => (
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
