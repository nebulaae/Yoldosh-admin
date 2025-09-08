import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api/admin.api';
import { UpdateTripData } from '@/lib/types/admin.types';

export const useUpdateTrip = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ tripId, data }: { tripId: string; data: UpdateTripData }) =>
            adminAPI.updateTrip(tripId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'trips'] });
        },
    });
};

export const useDeleteTrip = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminAPI.deleteTrip,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'trips'] });
        },
    });
};