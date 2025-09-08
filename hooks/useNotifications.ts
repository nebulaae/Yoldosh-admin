import { adminAPI } from '@/lib/api/admin.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateGlobalNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminAPI.createGlobalNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
        },
    });
};
