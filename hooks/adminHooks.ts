import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";

import api from "@/lib/api";
import {
    banUserSchema,
    editTripSchema,
    globalNotificationSchema,
    loginSchema,
    queryKeys,
    updateApplicationStatusSchema,
    updateReportStatusSchema,
} from "@/lib/utils";

// Auth
export const useAdminLogin = () => {
    return useMutation({
        mutationFn: async (values: z.infer<typeof loginSchema>) => {
            const { data } = await api.post("/admin/login", values);
            return data;
        },
        onSuccess: () => {
            toast.success("Вы успешно вошли в систему.");
        }
    });
};

export const useAdminLogout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            await api.post("/admin/logout");
        },
        onSuccess: () => {
            localStorage.removeItem("admin-token");
            queryClient.clear();
            window.location.href = "/";
        },
    });
};

export const useGetAdminProfile = (enabled: boolean = true) => {
    return useQuery({
        queryKey: queryKeys.admin.profile(),
        queryFn: async () => {
            const { data } = await api.get("/admin/me");
            return data.data; // Backend nests data
        },
        retry: false, // Don't retry on auth errors
        enabled,
    });
};
// Driver Applications
export const useGetDriverApplications = () => {
    return useQuery({
        queryKey: queryKeys.admin.driverApplications(),
        queryFn: async () => {
            const { data } = await api.get("/admin/driver-applications");
            return data.data;
        },
    });
};

export const useUpdateApplicationStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (
            values: z.infer<typeof updateApplicationStatusSchema>
        ) => {
            const { data } = await api.patch(
                `/admin/driver-applications/${values.userId}/status`,
                { status: values.status, adminId: "temp-admin-id" } // Pass adminId if needed
            );
            return data;
        },
        onSuccess: () => {
            toast.success("Статус заявки успешно обновлен");
            queryClient.invalidateQueries({
                queryKey: queryKeys.admin.driverApplications(),
            });
        },
    });
};

// Reports
export const useGetReports = (params: { status: string; page?: number, limit?: number }) => {
    return useQuery({
        queryKey: queryKeys.admin.reports(params),
        queryFn: async () => {
            const { data } = await api.get("/admin/reports", { params });
            return data.data;
        },
    });
};

export const useUpdateReportStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (values: z.infer<typeof updateReportStatusSchema>) => {
            await api.patch(`/admin/reports/${values.reportId}`, {
                status: values.status,
            });
        },
        onSuccess: () => {
            toast.success("Статус жалобы успешно обновлен");
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.reports({ status: 'PENDING' }) });
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.reports({ status: 'RESOLVED' }) });
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.reports({ status: 'REJECTED' }) });
        },
    });
};

export const useBanUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (values: z.infer<typeof banUserSchema>) => {
            await api.post(`/admin/reports/${values.reportId}/ban`, {
                reason: values.reason,
                durationInDays: values.durationInDays,
            });
        },
        onSuccess: () => {
            toast.success("Пользователь успешно забанен");
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
        },
    });
};

// Trips
export const useGetTrips = () => {
    return useQuery({
        queryKey: queryKeys.admin.trips(),
        queryFn: async () => {
            const { data } = await api.get("/trips"); // General trips endpoint
            return data;
        },
    });
};

export const useEditTrip = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (values: z.infer<typeof editTripSchema>) => {
            await api.patch(`/admin/trips/${values.tripId}`, values);
        },
        onSuccess: () => {
            toast.success("Поездка успешно обновлена");
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.trips() });
        },
    });
};

export const useDeleteTrip = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (tripId: string) => {
            await api.delete(`/admin/trips/${tripId}`);
        },
        onSuccess: () => {
            toast.success("Поездка успешно удалена");
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.trips() });
        }
    });
}

// Notifications
export const useCreateGlobalNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (values: z.infer<typeof globalNotificationSchema>) => {
            await api.post("/admin/notifications/global", values);
        },
        onSuccess: () => {
            toast.success("Глобальное уведомление отправлено");
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.notifications() });
        },
    });
};

// Car Models
export const useGetCarModels = () => {
    return useQuery({
        queryKey: queryKeys.admin.carModels(),
        queryFn: async () => {
            const { data } = await api.get("/car-models");
            return data;
        },
    });
};

export const useCreateCarModel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (name: string) => {
            await api.post("/admin/car-models", { name });
        },
        onSuccess: () => {
            toast.success("Модель машины успешно создана");
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.carModels() });
        },
    });
};

