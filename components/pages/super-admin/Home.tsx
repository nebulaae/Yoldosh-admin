"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useGetSuperAdminProfile } from "@/hooks/superAdminHooks";

export const Home = () => {
    const { data: superAdmin, isLoading, isError } = useGetSuperAdminProfile();

    if (isLoading) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">Админ панель</h1>
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-6 w-64" />
            </div>
        );
    }

    if (isError || !superAdmin) {
        return (
            <div className="p-8 text-red-500">
                Ошибка загрузки профиля. Попробуйте зайти снова.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <h2 className="title-text">Добро пожаловать {superAdmin.firstName} {superAdmin.lastName}!</h2>
            <p className="text-base">Ваша роль: {superAdmin.role}</p>
        </div>
    );
};