import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api/admin.api';
import { UpdateReportStatusData, BanUserData } from '@/lib/types/admin.types';

export const useReports = (params: {
    status: 'PENDING' | 'RESOLVED' | 'REJECTED';
    page?: number;
    limit?: number;
}) => {
    return useQuery({
        queryKey: ['admin', 'reports', params],
        queryFn: () => adminAPI.getReports(params),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

export const useUpdateReportStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reportId, data }: { reportId: string; data: UpdateReportStatusData }) =>
            adminAPI.updateReportStatus(reportId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
        },
    });
};

export const useBanUserByReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reportId, data }: { reportId: string; data: BanUserData }) =>
            adminAPI.banUserByReport(reportId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
        },
    });
};