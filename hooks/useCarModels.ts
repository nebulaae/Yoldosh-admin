import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api/admin.api';

export const useCreateCarModel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminAPI.createCarModel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'car-models'] });
        },
    });
};