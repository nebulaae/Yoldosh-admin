import { apiClient } from './client';
import { Admin, CreateAdminData, AdminLog } from '../types/admin.types';

export const superAdminAPI = {
    // Admin Management
    createAdmin: async (data: CreateAdminData): Promise<Admin> => {
        const response = await apiClient.post('/super-admin/admins', data);
        return response.data.data;
    },

    deleteAdmin: async (adminId: string): Promise<void> => {
        await apiClient.delete(`/super-admin/admins/${adminId}`);
    },

    getAdmins: async (): Promise<Admin[]> => {
        const response = await apiClient.get('/super-admin/admins');
        return response.data.data;
    },

    getAdminStats: async (): Promise<{ totalAdmins: number }> => {
        const response = await apiClient.get('/super-admin/admins/stats');
        return response.data.data;
    },

    getAdminLogs: async (adminId: string): Promise<AdminLog[]> => {
        const response = await apiClient.get(`/super-admin/admins/${adminId}/logs`);
        return response.data.data;
    },
};