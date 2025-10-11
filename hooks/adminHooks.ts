import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import api from "@/lib/api";
import {
  banUserSchema,
  carModelSchema,
  editTripSchema,
  globalNotificationSchema,
  globalPromoCodeSchema,
  loginSchema,
  personalPromoCodeSchema,
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
    },
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
      return data.data;
    },
    retry: false,
    enabled,
  });
};

export const useGetAdminStats = () => {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: async () => {
      const { data } = await api.get("/admin/stats");
      return data.data;
    },
  });
};

// Driver Applications
export const useGetDriverApplications = (filters: { [key: string]: any }) => {
  return useInfiniteQuery({
    queryKey: queryKeys.admin.driverApplications(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get("/admin/driver-applications", {
        params: { ...filters, page: pageParam },
      });
      return data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;
    },
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: z.infer<typeof updateApplicationStatusSchema>) => {
      const { data } = await api.patch(`/admin/driver-applications/${values.userId}/status`, { status: values.status });
      return data;
    },
    onSuccess: () => {
      toast.success("Статус заявки успешно обновлен");
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.driverApplications({}),
      });
    },
  });
};

// Reports
export const useGetReports = (filters: { [key: string]: any }) => {
  return useInfiniteQuery({
    queryKey: queryKeys.admin.reports(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get("/admin/reports", { params: { ...filters, page: pageParam } });
      return data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;
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
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.reports({}) });
    },
  });
};

// Users, Search, Ban
export const useGetAllUsers = (filters: { [key: string]: any }) => {
  return useInfiniteQuery({
    queryKey: queryKeys.admin.users(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get("/admin/users", {
        params: { ...filters, page: pageParam, limit: 12 },
      });
      return data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;
    },
  });
};

export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: queryKeys.admin.searchUsers(query),
    queryFn: async () => {
      const { data } = await api.get("/admin/users/search", { params: { query } });
      return data.data;
    },
    enabled: !!query && query.length > 2,
  });
};

export const useGetUserDetails = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.admin.userDetails(userId),
    queryFn: async () => {
      const { data } = await api.get(`/admin/users/${userId}`);
      return data.data;
    },
    enabled: !!userId,
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: z.infer<typeof banUserSchema>) => {
      await api.post(`/admin/users/${values.userId}/ban`, {
        reason: values.reason,
        durationInDays: values.durationInDays,
      });
    },
    onSuccess: (_, variables) => {
      toast.success("Пользователь успешно забанен");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.userDetails(variables.userId) });
    },
  });
};

// Trips
export const useGetTrips = (filters: { [key: string]: any }) => {
  return useInfiniteQuery({
    queryKey: queryKeys.admin.trips(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get("/admin/trips", { params: { ...filters, page: pageParam } });
      return data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;
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
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.trips({}) });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.trips({}) });
    },
  });
};

// Notifications
export const useGetNotifications = (filters: { [key: string]: any }) => {
  return useInfiniteQuery({
    queryKey: queryKeys.admin.notifications(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get("/admin/notifications/global", { params: { ...filters, page: pageParam } });
      return data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;
    },
  });
};

export const useCreateGlobalNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: z.infer<typeof globalNotificationSchema>) => {
      await api.post("/admin/notifications/global", values);
    },
    onSuccess: () => {
      toast.success("Глобальное уведомление отправлено");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.notifications({}) });
    },
  });
};

// Car Models
export const useGetCarModels = (filters: { [key: string]: any }) => {
  return useInfiniteQuery({
    queryKey: queryKeys.admin.carModels(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get("/admin/car-models", { params: { ...filters, page: pageParam } });
      return data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;
    },
  });
};

export const useCreateCarModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: z.infer<typeof carModelSchema>) => {
      await api.post("/admin/car-models", values);
    },
    onSuccess: () => {
      toast.success("Модель машины успешно создана");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.carModels({}) });
    },
  });
};

export const useUpdateCarModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }: z.infer<typeof carModelSchema> & { id: number }) => {
      await api.patch(`/admin/car-models/${id}`, values);
    },
    onSuccess: () => {
      toast.success("Модель машины успешно обновлена");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.carModels({}) });
    },
  });
};

export const useDeleteCarModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/car-models/${id}`);
    },
    onSuccess: () => {
      toast.success("Модель машины успешно удалена.");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.carModels({}) });
    },
  });
};

// Word Moderation
export const useGetRestrictedWords = (filters: { [key: string]: any }) => {
  return useInfiniteQuery({
    queryKey: queryKeys.admin.restrictedWords(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get("/admin/moderation/words", {
        params: { ...filters, page: pageParam },
      });
      return data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;
    },
  });
};

export const useCreateRestrictedWord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: { word: string }) => {
      await api.post("/admin/moderation/words", values);
    },
    onSuccess: () => {
      toast.success("Слово успешно добавлен в список.");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.restrictedWords({}) });
    },
  });
};

export const useDeleteRestrictedWord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (wordId: number) => {
      await api.delete(`/admin/moderation/words/${wordId}`);
    },
    onSuccess: () => {
      toast.success("Слово успешно удалено.");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.restrictedWords({}) });
    },
  });
};

// Promocodes
export const useGetUserPromoCodes = () => {
  return useQuery({
    queryKey: queryKeys.admin.promoCodes("user"),
    queryFn: async () => {
      const { data } = await api.get("/admin/user-promocodes");
      return data.data.promoCodes;
    },
  });
};

export const useGetGlobalPromoCodes = () => {
  return useQuery({
    queryKey: queryKeys.admin.promoCodes("global"),
    queryFn: async () => {
      const { data } = await api.get("/admin/promocodes");
      return data.data.promoCodes;
    },
  });
};

type GrantPromoCodePayload =
  | (z.infer<typeof personalPromoCodeSchema> & { type: "SINGLE_USER" })
  | (z.infer<typeof globalPromoCodeSchema> & { type: "GLOBAL" });

export const useGrantPromoCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: GrantPromoCodePayload) => {
      await api.post(`/admin/promocodes`, values);
    },
    onSuccess: () => {
      toast.success("Промокод успешно создан");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.promoCodes("user") });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.promoCodes("global") });
    },
  });
};

export const useEditPromocode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (promoCodeId: string) => {
      await api.put(`/admin/promocodes/${promoCodeId}`);
    },
    onSuccess: () => {
      toast.success("Промокод успешно изменен");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.promoCodes("user") });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.promoCodes("global") });
    }
  });
};

export const useDeletePromoCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (promoCodeId: string) => {
      await api.delete(`/admin/promocodes/${promoCodeId}`);
    },
    onSuccess: () => {
      toast.success("Промокод успешно удален");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.promoCodes("user") });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.promoCodes("global") });
    },
  });
};