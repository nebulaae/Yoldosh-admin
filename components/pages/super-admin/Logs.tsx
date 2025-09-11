"use client";

import { useState } from "react";
import { useGetAllAdmins, useGetAdminLogs } from "@/hooks/superAdminHooks";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const Logs = () => {
    const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
    const { data: admins, isLoading: isAdminLoading } = useGetAllAdmins();
    const { data: logs, isLoading: isLogsLoading } = useGetAdminLogs(selectedAdminId!);

    return (
        <div>
            <h1 className="title-text mb-6">Логи Администраторов</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1">
                    <h2 className="font-semibold mb-3">Администраторы</h2>
                    <div className="border rounded-lg bg-white p-2 space-y-1">
                        {isAdminLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                            ))
                        ) : admins?.length > 0 ? (
                            admins.map((admin: any) => (
                                <button
                                    key={admin.id}
                                    onClick={() => setSelectedAdminId(admin.id)}
                                    className={cn(
                                        "w-full text-left p-2 rounded-md transition-colors",
                                        selectedAdminId === admin.id
                                            ? "bg-blue-100 text-blue-800 font-medium"
                                            : "hover:bg-gray-100"
                                    )}
                                >
                                    {admin.firstName} {admin.lastName}
                                </button>
                            ))
                        ) : (
                            <p className="p-2 text-sm text-gray-500">Администраторы не найдены.</p>
                        )}
                    </div>
                </div>
                <div className="md:col-span-3">
                    <h2 className="font-semibold mb-3">
                        {selectedAdminId ? `Логи для ${admins?.find((a: any) => a.id === selectedAdminId)?.firstName}` : "Выберите администратора"}
                    </h2>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Действие</TableHead>
                                    <TableHead>Детали</TableHead>
                                    <TableHead>Дата</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLogsLoading ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : logs?.length > 0 ? (
                                    logs.map((log: any) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">{log.action}</TableCell>
                                            <TableCell>{log.details}</TableCell>
                                            <TableCell>{formatDate(log.createdAt)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-48">
                                            {selectedAdminId ? "Логи не найдены." : "Пожалуйста, выберите администратора для просмотра логов."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
};
