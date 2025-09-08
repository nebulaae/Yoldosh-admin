import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api/admin.api';
import { UpdateApplicationStatusData } from '@/lib/types/admin.types';

export const useDriverApplications = () => {
    return useQuery({
        queryKey: ['admin', 'driver-applications'],
        queryFn: adminAPI.getDriverApplications,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useUpdateApplicationStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, data }: { userId: string; data: UpdateApplicationStatusData }) =>
            adminAPI.updateApplicationStatus(userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'driver-applications'] });
        },
    });
};