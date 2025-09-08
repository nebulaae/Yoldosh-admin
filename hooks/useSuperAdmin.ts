import { superAdminAPI } from '@/lib/api/super-admin.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useAdmins = () => {
    return useQuery({
        queryKey: ['super-admin', 'admins'],
        queryFn: superAdminAPI.getAdmins,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useCreateAdmin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: superAdminAPI.createAdmin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['super-admin', 'admins'] });
        },
    });
};

export const useDeleteAdmin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: superAdminAPI.deleteAdmin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['super-admin', 'admins'] });
        },
    });
};

export const useAdminStats = () => {
    return useQuery({
        queryKey: ['super-admin', 'stats'],
        queryFn: superAdminAPI.getAdminStats,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};

export const useAdminLogs = (adminId: string) => {
    return useQuery({
        queryKey: ['super-admin', 'logs', adminId],
        queryFn: () => superAdminAPI.getAdminLogs(adminId),
        enabled: !!adminId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};