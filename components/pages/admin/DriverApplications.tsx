"use client"

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

import { getStatusColor } from "@/lib/utils";
import {
    useGetDriverApplications,
    useUpdateApplicationStatus,
} from "@/hooks/adminHooks";

export const DriverApplications = () => {
    const { data, isLoading, isError } = useGetDriverApplications();
    const { mutate: updateStatus, isPending } = useUpdateApplicationStatus();

    const handleStatusUpdate = (userId: string, status: "VERIFIED" | "REJECTED") => {
        updateStatus({ userId, status });
    };

    if (isLoading) {
        return (
            <div className="p-8 space-y-4">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    if (isError) {
        toast.error("Failed to load driver applications.");
        return <div className="p-8 text-red-500">Ошибка при загрузке данных.</div>
    }

    return (
        <div>
            <Toaster richColors />
            <h1 className="title-text mb-6">Заявки водителей</h1>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User ID</TableHead>
                            <TableHead>Пасспорт</TableHead>
                            <TableHead>Пасспорт машины</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.rows?.length > 0 ? (
                            data.rows.map((app: any) => (
                                <TableRow key={app.id}>
                                    <TableCell>{app.userId}</TableCell>
                                    <TableCell><a href={app.passport_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a></TableCell>
                                    <TableCell><a href={app.car_passport_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a></TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="space-x-2">
                                        <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-100" onClick={() => handleStatusUpdate(app.userId, "VERIFIED")} disabled={isPending}>Подтвердить</Button>
                                        <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-100" onClick={() => handleStatusUpdate(app.userId, "REJECTED")} disabled={isPending}>Отказать</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">Нет активных заявок.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
