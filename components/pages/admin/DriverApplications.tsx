"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, Filter, Image as ImageIcon, Info, Search, Send, ShieldX, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useDebounceValue, useIntersectionObserver } from "usehooks-ts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCarApplications, useUpdateCarApplicationStatus } from "@/hooks/adminHooks"; // Updated hook names
import { formatDate, getStatusColor } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Define the structure of a Car Application based on backend response
type CarApplication = {
  id: string; // Car ID
  driver_id: string;
  license_plate: string;
  color?: string;
  carYear: number;
  tech_passport: string;
  documentFront?: string;
  documentBack?: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  driver: { // Included driver details
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    avatar?: string;
    role: string;
  };
  modelDetails: { // Included model details
    make: string;
    model: string;
  };
};

// Schema for the rejection reason form
const rejectionSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters.").max(500, "Reason too long."),
});

// Component for displaying a single application card
const ApplicationCard = ({ application, onApprove, onReject, isUpdating }: {
  application: CarApplication;
  onApprove: (carId: string) => void;
  onReject: (carId: string, reason: string) => void;
  isUpdating: boolean; // To disable buttons during update
}) => {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof rejectionSchema>>({
    resolver: zodResolver(rejectionSchema),
    defaultValues: { reason: "" },
  });

  const handleRejectSubmit = (values: z.infer<typeof rejectionSchema>) => {
    onReject(application.id, values.reason);
    setIsRejectDialogOpen(false); // Close dialog on submit
    form.reset();
  };

  const formatDocUrl = (url?: string) => {
    if (!url) return 'https://placehold.co/300x200/EEE/AAA?text=No+Image';
    // Assuming backend returns relative paths like /users/documents/front/doc-front-...
    // Adjust base URL if needed
    const baseUrl = "http://localhost:5000"; // Replace with your actual backend URL if different
    return `${baseUrl}${url}`;
  };

  return (
    <Card className="component border hover:border-emerald-500 dark:hover:border-emerald-600 transition rounded-xl shadow-md overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-semibold">
            {application.modelDetails.make} {application.modelDetails.model} ({application.carYear})
          </CardTitle>
          <CardDescription className="font-mono text-xs">{application.license_plate}</CardDescription>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(application.status)}`}>
          {application.status}
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Driver Info */}
        <div className="flex items-center gap-2 text-sm">
          <img src={application.driver.avatar || `https://placehold.co/40x40/000000/FFF?text=${application.driver.firstName[0]}`} alt="Driver Avatar" className="w-6 h-6 rounded-full object-cover" />
          <div>
            <p className="font-medium">{application.driver.firstName} {application.driver.lastName}</p>
            <p className="text-xs text-muted-foreground">{application.driver.phoneNumber}</p>
          </div>
        </div>

        {/* Car Details */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Color: {application.color || 'N/A'}</p>
          <p>Tech Passport: {application.tech_passport}</p>
          <time className="text-sm text-muted-foreground">{formatDate(application.createdAt)}</time>
        </div>

        {/* Documents */}
        <div className="flex gap-2 items-center justify-start flex-wrap">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <ImageIcon className="mr-1 h-3 w-3" /> Front Doc
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-0">
              <img src={formatDocUrl(application.documentFront)} alt="Document Front" className="rounded-lg w-full max-h-[80vh] object-contain" />
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <ImageIcon className="mr-1 h-3 w-3" /> Back Doc
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-0">
              <img src={formatDocUrl(application.documentBack)} alt="Document Back" className="rounded-lg w-full max-h-[80vh] object-contain" />
            </DialogContent>
          </Dialog>
        </div>

        {/* Rejection Reason */}
        {application.status === "REJECTED" && application.rejectionReason && (
          <div className="text-xs text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-900/20 p-2 rounded-md flex items-start gap-2">
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>Reason: {application.rejectionReason}</span>
          </div>
        )}
      </CardContent>

      {/* Actions only for PENDING status */}
      {application.status === "PENDING" && (
        <CardFooter className="flex justify-end gap-2">
          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-100/50 dark:hover:bg-red-900/30" disabled={isUpdating}>
                <ShieldX className="mr-1 h-4 w-4" /> Reject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Application</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleRejectSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Rejection</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Explain why the application is being rejected..." {...field} className="min-h-[80px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" variant="destructive" disabled={form.formState.isSubmitting}>
                      <Send className="mr-1 h-4 w-4" /> Submit Rejection
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-100/50 dark:hover:bg-green-900/30" onClick={() => onApprove(application.id)} disabled={isUpdating}>
            <Check className="mr-1 h-4 w-4" /> Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};


// Main page component
export const DriverApplications = () => {
  const [activeTab, setActiveTab] = useState<"PENDING" | "VERIFIED" | "REJECTED">("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<{ sortBy: string; sortOrder: "ASC" | "DESC" }>({ sortBy: "createdAt", sortOrder: "DESC" });
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [debouncedSearch] = useDebounceValue(searchTerm, 500);

  const filters = {
    status: activeTab,
    search: debouncedSearch,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, error } = useGetCarApplications(filters); // Use updated hook
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateCarApplicationStatus(); // Use updated mutation hook

  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 }); // Lower threshold might trigger loading sooner

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      console.log("Загрузка следующей страницы");
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleStatusUpdate = (carId: string, newStatus: "VERIFIED" | "REJECTED", reason?: string) => {
    updateStatus({ carId, status: newStatus, rejectionReason: reason });
  };

  const allApplications = data?.pages?.flatMap((page) => page.applications ?? []) ?? [];

  return (
    <div>
      <Toaster richColors />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="title-text">Заявки водителей</h1>
          <p className="subtitle-text">Управление заявками на регистрацию водителей.</p>
        </div>
      </div>

      <Tabs defaultValue="PENDING" className="w-full" onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="w-64 sm:w-96 px-1">
          <TabsTrigger value="PENDING" className="w-4 text-xs sm:text-md">В ожидании</TabsTrigger>
          <TabsTrigger value="VERIFIED" className="w-4 text-xs sm:text-md">Подтвержденные</TabsTrigger>
          <TabsTrigger value="REJECTED" className="w-4 text-xs sm:text-md">Отклоненные</TabsTrigger>
        </TabsList>

        {/* Filters Section */}
        <div className="flex flex-col component border rounded-2xl mt-4 px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 my-4 px-1">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени, номеру телефона, номерному знаку"
                className="pl-8 component-dark w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="component-dark w-full sm:w-auto justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, "LLL dd")} - ${format(dateRange.to, "LLL dd, y")}`
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
                  <Button variant="outline" size="icon" className="component-dark">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSort({ sortBy: "createdAt", sortOrder: "DESC" })}>
                    Сначала новые {sort.sortBy === "createdAt" && sort.sortOrder === "DESC" && "✓"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSort({ sortBy: "createdAt", sortOrder: "ASC" })}>
                    Сначала старые {sort.sortBy === "createdAt" && sort.sortOrder === "ASC" && "✓"}
                  </DropdownMenuItem>
                  {/* Add other sort options if needed */}
                  {/* <DropdownMenuItem onClick={() => setSort({ sortBy: "driverName", sortOrder: "ASC" })}>
                      Driver Name A-Z {sort.sortBy === "driverName" && sort.sortOrder === "ASC" && "✓"}
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => setSort({ sortBy: "driverName", sortOrder: "DESC" })}>
                        Driver Name Z-A {sort.sortBy === "driverName" && sort.sortOrder === "DESC" && "✓"}
                    </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Content for each tab */}
          {["PENDING", "VERIFIED", "REJECTED"].map((statusValue) => (
            <TabsContent key={statusValue} value={statusValue} className="mt-0">
              {isLoading && !data ? ( // Show skeleton only on initial load
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-xl" />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-10 text-destructive">
                  Ошибка загрузки заявок. Попробуйте перезайти
                </div>
              ) : allApplications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allApplications.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      onApprove={(carId) => handleStatusUpdate(carId, "VERIFIED")}
                      onReject={(carId, reason) => handleStatusUpdate(carId, "REJECTED", reason)}
                      isUpdating={isUpdatingStatus}
                    />
                  ))}
                  {/* Infinite scroll trigger */}
                  {hasNextPage && (
                    <div ref={ref} className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center py-4">
                      {isFetchingNextPage && <p>Загрузка...</p>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  Заявки не найдены
                </div>
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};
