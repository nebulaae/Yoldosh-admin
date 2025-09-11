"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetAdminProfile } from "@/hooks/adminHooks";
import { useGetSuperAdminProfile } from "@/hooks/superAdminHooks";

type Role = "Admin" | "SuperAdmin";

interface AuthGuardProps {
    children: React.ReactNode;
    requiredRole: Role;
}

export const AuthGuard = ({ children, requiredRole }: AuthGuardProps) => {
    const router = useRouter();

    const isSuperAdminRoute = requiredRole === 'SuperAdmin';

    const { data: adminData, isLoading: isAdminLoading, isError: isAdminError } = useGetAdminProfile(!isSuperAdminRoute);
    const { data: superAdminData, isLoading: isSuperAdminLoading, isError: isSuperAdminError } = useGetSuperAdminProfile(isSuperAdminRoute);

    const user = isSuperAdminRoute ? superAdminData : adminData;
    const isLoading = isSuperAdminRoute ? isSuperAdminLoading : isAdminLoading;
    const isError = isSuperAdminRoute ? isSuperAdminError : isAdminError;

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem("admin-token") : null;
        if (!token) {
            router.replace("/");
            return;
        }

        if (!isLoading && (isError || !user)) {
            localStorage.removeItem("admin-token");
            router.replace("/");
        }

        if (!isLoading && user) {
            const roleHierarchy = { Admin: 1, SuperAdmin: 2 };
            const userLevel = roleHierarchy[user.role as Role] || 0;
            const requiredLevel = roleHierarchy[requiredRole];

            if (userLevel < requiredLevel) {
                if (user.role === 'Admin') {
                    router.replace('/admin');
                } else {
                    router.replace("/");
                }
            }
        }
    }, [isLoading, isError, user, router, requiredRole]);

    if (isLoading || !user) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Skeleton className="h-screen w-64 hidden md:block" />
                <div className="flex-1 p-8 space-y-6">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

