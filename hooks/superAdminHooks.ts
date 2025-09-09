import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";

import api from "@/lib/api";
import { createAdminSchema, queryKeys } from "@/lib/utils";

export const useGetSuperAdminProfile = (enabled: boolean = true) => {
    return useQuery({
        queryKey: queryKeys.superAdmin.profile(),
        queryFn: async () => {
            const { data } = await api.get("/super-admin/me");
            return data.data; // Backend nests data
        },
        retry: false,
        enabled,
    });
};

// Admins
export const useGetAllAdmins = () => {
    return useQuery({
        queryKey: queryKeys.superAdmin.admins(),
        queryFn: async () => {
            const { data } = await api.get("/super-admin/admins");
            return data.data;
        },
    });
};

export const useCreateAdmin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (values: z.infer<typeof createAdminSchema>) => {
            const { data } = await api.post("/super-admin/admins", values);
            return data;
        },
        onSuccess: () => {
            toast.success("Администратор успешно создан");
            queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.admins() });
        },
    });
};

export const useDeleteAdmin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (adminId: string) => {
            await api.delete(`/super-admin/admins/${adminId}`);
        },
        onSuccess: () => {
            toast.success("Администратор успешно удален");
            queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.admins() });
        },
    });
};

// Stats
export const useGetAdminStats = () => {
    return useQuery({
        queryKey: queryKeys.superAdmin.stats(),
        queryFn: async () => {
            const { data } = await api.get("/super-admin/admins/stats");
            return data.data;
        },
    });
};

// Logs
export const useGetAdminLogs = (adminId: string) => {
    return useQuery({
        queryKey: queryKeys.superAdmin.logs(adminId),
        queryFn: async () => {
            const { data } = await api.get(`/super-admin/admins/${adminId}/logs`);
            return data.data;
        },
        enabled: !!adminId, // Only run query if adminId is provided
    });
};

