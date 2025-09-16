import api from "@/lib/api";
import { z } from "zod";
import { toast } from "sonner";
import {
    createAdminSchema,
    queryKeys
} from "@/lib/utils";
import {
    useMutation,
    useQuery,
    useQueryClient,
    useInfiniteQuery
} from "@tanstack/react-query";

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
export const useGetAllAdmins = (filters: any) => {
    return useInfiniteQuery({
        queryKey: queryKeys.superAdmin.admins(filters),
        queryFn: async ({ pageParam = 1 }) => {
            const { data } = await api.get("/super-admin/admins", {
                params: { ...filters, page: pageParam, limit: 10 }
            });
            return data.data; // FIX: Return the nested data object
        },
        // FIX: Correctly calculate the next page based on backend response
        getNextPageParam: (lastPage: any) => {
            return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;
        },
        initialPageParam: 1,
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
            queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.admins({}) });
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
            queryClient.invalidateQueries({ queryKey: queryKeys.superAdmin.admins({}) });
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
export const useGetAdminLogs = (adminId: string, filters: any) => {
    return useInfiniteQuery({
        queryKey: queryKeys.superAdmin.logs(adminId, filters),
        queryFn: async ({ pageParam = 1 }) => {
            const { data } = await api.get(`/super-admin/admins/${adminId}/logs`, {
                params: { ...filters, page: pageParam, limit: 20 }
            });
            return data.data; // FIX: Return the nested data object
        },
        // FIX: Correctly calculate the next page
        getNextPageParam: (lastPage: any) => {
            return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;
        },
        initialPageParam: 1,
        enabled: !!adminId,
    });
};