"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter, Search } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useDebounceValue, useIntersectionObserver } from "usehooks-ts";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetDriverApplications, useUpdateApplicationStatus } from "@/hooks/adminHooks";
import { getStatusColor } from "@/lib/utils";

type ApplicationStatus = "PENDING" | "VERIFIED" | "REJECTED";

const ApplicationsTable = ({ status }: { status: ApplicationStatus }) => {
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

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetDriverApplications(filters);
  const { mutate: updateStatus, isPending } = useUpdateApplicationStatus();

  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.5 });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleStatusUpdate = (userId: string, newStatus: "VERIFIED" | "REJECTED") => {
    updateStatus({ userId, status: newStatus });
  };

  const allApplications = data?.pages.flatMap((page) => page.applications) ?? [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row w-full justify-between items-center gap-2 my-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени, фамилии, телефону..."
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
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSort({ sortBy: "createdAt", sortOrder: "DESC" })}>
                Сначала новые
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort({ sortBy: "createdAt", sortOrder: "ASC" })}>
                Сначала старые
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead>Фамилия</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Паспорт</TableHead>
              <TableHead>Паспорт машины</TableHead>
              <TableHead>Статус</TableHead>
              {status === "PENDING" && <TableHead>Действия</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={status === "PENDING" ? 7 : 6}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : allApplications.length > 0 ? (
              allApplications.map((app: any) => (
                <TableRow key={app.id}>
                  <TableCell>{app.user.firstName}</TableCell>
                  <TableCell>{app.user.lastName}</TableCell>
                  <TableCell>{app.user.phoneNumber}</TableCell>
                  <TableCell>
                    <a
                      href={app.passport_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Посмотреть
                    </a>
                  </TableCell>
                  <TableCell>
                    <a
                      href={app.car_passport_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Посмотреть
                    </a>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(app.status)}`}>{app.status}</span>
                  </TableCell>
                  {status === "PENDING" && (
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-100"
                        onClick={() => handleStatusUpdate(app.userId, "VERIFIED")}
                        disabled={isPending}
                      >
                        Подтвердить
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-100"
                        onClick={() => handleStatusUpdate(app.userId, "REJECTED")}
                        disabled={isPending}
                      >
                        Отказать
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={status === "PENDING" ? 7 : 6} className="text-center h-24">
                  Нет заявок.
                </TableCell>
              </TableRow>
            )}
            {hasNextPage && (
              <TableRow>
                <TableCell colSpan={status === "PENDING" ? 7 : 6} ref={ref}>
                  {isFetchingNextPage && (
                    <div className="flex justify-center p-4">
                      <p>Загрузка...</p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export const DriverApplications = () => {
  return (
    <div>
      <Toaster richColors />
      <h1 className="title-text mb-6">Заявки водителей</h1>
      <Tabs defaultValue="PENDING" className="w-full mt-4">
        <TabsList className="w-full sm:w-96 grid grid-cols-3">
          <TabsTrigger value="PENDING">В процессе</TabsTrigger>
          <TabsTrigger value="VERIFIED">Подтверждено</TabsTrigger>
          <TabsTrigger value="REJECTED">Отказано</TabsTrigger>
        </TabsList>
        <TabsContent value="PENDING">
          <ApplicationsTable status="PENDING" />
        </TabsContent>
        <TabsContent value="VERIFIED">
          <ApplicationsTable status="VERIFIED" />
        </TabsContent>
        <TabsContent value="REJECTED">
          <ApplicationsTable status="REJECTED" />
        </TabsContent>
      </Tabs>
    </div>
  );
};
