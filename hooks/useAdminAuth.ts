import { adminAPI } from '@/lib/api/admin.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useAdminLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminAPI.login,
        onSuccess: (data) => {
            // Store token in localStorage
            localStorage.setItem('admin-access-token', data.accessToken);
            localStorage.setItem('admin-user', JSON.stringify(data.admin));

            // Invalidate and refetch user queries
            queryClient.invalidateQueries({ queryKey: ['admin', 'profile'] });
        },
        onError: (error) => {
            console.error('Login failed:', error);
        },
    });
};

export const useAdminLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminAPI.logout,
        onSuccess: () => {
            // Clear local storage
            localStorage.removeItem('admin-access-token');
            localStorage.removeItem('admin-user');

            // Clear all queries
            queryClient.clear();
        },
    });
};

export const useCurrentAdmin = () => {
    return useQuery({
        queryKey: ['admin', 'profile'],
        queryFn: () => {
            const adminData = localStorage.getItem('admin-user');
            return adminData ? JSON.parse(adminData) : null;
        },
        staleTime: Infinity, // Don't refetch automatically
    });
};