"use client"

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
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

import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { banUserSchema } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { getStatusColor, formatDate } from "@/lib/utils";
import {
    useGetReports,
    useUpdateReportStatus,
    useBanUser
} from "@/hooks/adminHooks";

type Report = {
    id: string;
    reportingUser: { firstName: string };
    reportedUser: { firstName: string };
    reason: string;
    status: "PENDING" | "RESOLVED" | "REJECTED";
    createdAt: string;
};

export const ReportsTable = ({ status }: { status: "PENDING" | "RESOLVED" | "REJECTED" }) => {
    const { data, isLoading } = useGetReports({ status, limit: 100 });
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const { mutate: updateStatus, isPending: isUpdating } = useUpdateReportStatus();
    const { mutate: banUser, isPending: isBanning } = useBanUser();

    const form = useForm<z.infer<typeof banUserSchema>>({
        resolver: zodResolver(banUserSchema),
        defaultValues: {
            reason: "",
            durationInDays: undefined,
        },
    });

    const onBanSubmit = (values: z.infer<typeof banUserSchema>) => {
        if (!selectedReport) return;
        banUser({ ...values, reportId: selectedReport.id }, {
            onSuccess: () => setSelectedReport(null)
        });
    };

    if (isLoading) {
        return (
            <div className="space-y-2 mt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        );
    }

    return (
        <Dialog>
            <div className="border rounded-lg bg-white mt-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Пожаловался</TableHead>
                            <TableHead>На кого</TableHead>
                            <TableHead>Причина</TableHead>
                            <TableHead>Дата</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.reports?.length > 0 ? (
                            data.reports.map((report: Report) => (
                                <TableRow key={report.id}>
                                    <TableCell>{report.reportingUser.firstName}</TableCell>
                                    <TableCell>{report.reportedUser.firstName}</TableCell>
                                    <TableCell className="truncate max-w-xs">{report.reason}</TableCell>
                                    <TableCell>{formatDate(report.createdAt)}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                            {report.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {report.status === 'PENDING' && (
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                                                    Рассмотреть
                                                </Button>
                                            </DialogTrigger>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">Жалобы не найдены.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {selectedReport && (
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Рассмотрение жалобы #{selectedReport.id.substring(0, 8)}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p><strong>От:</strong> {selectedReport.reportingUser.firstName}</p>
                        <p><strong>На:</strong> {selectedReport.reportedUser.firstName}</p>
                        <p><strong>Причина:</strong> {selectedReport.reason}</p>

                        {selectedReport.status === 'PENDING' && (
                            <div className="pt-4">
                                <h3 className="font-semibold mb-2">Заблокировать пользователя?</h3>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onBanSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="reason"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Причина бана</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Например, нарушение правил" {...field} />
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
                                                    <FormLabel>Срок бана (в днях, необязательно)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            value={field.value ?? ""}
                                                            onChange={e => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex justify-end space-x-2">
                                            <Button type="button" variant="outline" onClick={() => updateStatus({ reportId: selectedReport.id, status: 'REJECTED' })} disabled={isUpdating || isBanning}>Отклонить жалобу</Button>
                                            <Button type="submit" variant="destructive" disabled={isBanning || isUpdating}>Забанить и решить</Button>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        )}
                    </div>
                </DialogContent>
            )}
        </Dialog>
    );
};

export const Reports = () => {
    return (
        <div>
            <Toaster richColors />
            <div>
                <h1 className="title-text">Жалобы</h1>
            </div>
            <Tabs defaultValue="PENDING" className="w-full mt-4">
                <TabsList>
                    <TabsTrigger value="PENDING">В ожидании</TabsTrigger>
                    <TabsTrigger value="RESOLVED">Решенные</TabsTrigger>
                    <TabsTrigger value="REJECTED">Отклоненные</TabsTrigger>
                </TabsList>
                <TabsContent value="PENDING"><ReportsTable status="PENDING" /></TabsContent>
                <TabsContent value="RESOLVED"><ReportsTable status="RESOLVED" /></TabsContent>
                <TabsContent value="REJECTED"><ReportsTable status="REJECTED" /></TabsContent>
            </Tabs>
        </div>
    );
};