"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useGetAdminProfile } from "@/hooks/adminHooks";

export const Home = () => {
    const { data: admin, isLoading, isError } = useGetAdminProfile();

    if (isLoading) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">Админ панель</h1>
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-6 w-64" />
            </div>
        );
    }

    if (isError || !admin) {
        return (
            <div className="p-8 text-red-500">
                Ошибка загрузки профиля. Попробуйте зайти снова.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            <h2 className="title-text">Главное</h2>
            <p className="subtitle-text">Обзор основных показателей</p>
        </div>
    );
};