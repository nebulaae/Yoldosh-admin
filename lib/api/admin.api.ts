import { apiClient } from './client';
import {
    AdminLogin,
    AdminLoginResponse,
    DriverApplication,
    Report,
    Trip,
    CarModel,
    CreateCarModelData,
    UpdateApplicationStatusData,
    UpdateReportStatusData,
    BanUserData,
    UpdateTripData,
    GlobalNotificationData,
} from '../types/admin.types';

export const adminAPI = {
    // Auth
    login: async (data: AdminLogin): Promise<AdminLoginResponse> => {
        const response = await apiClient.post('/admin/login', data);
        return response.data.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/admin/logout');
    },

    // Driver Applications
    getDriverApplications: async (): Promise<{ rows: DriverApplication[]; count: number }> => {
        const response = await apiClient.get('/admin/driver-applications');
        return response.data.data;
    },

    updateApplicationStatus: async (
        userId: string,
        data: UpdateApplicationStatusData
    ): Promise<DriverApplication> => {
        const response = await apiClient.patch(
            `/admin/driver-applications/${userId}/status`,
            data
        );
        return response.data.data.application;
    },

    // Reports
    getReports: async (params: {
        status: 'PENDING' | 'RESOLVED' | 'REJECTED';
        page?: number;
        limit?: number;
    }): Promise<{
        reports: Report[];
        total: number;
        totalPages: number;
        currentPage: number;
    }> => {
        const response = await apiClient.get('/admin/reports', { params });
        return response.data.data;
    },

    updateReportStatus: async (
        reportId: string,
        data: UpdateReportStatusData
    ): Promise<Report> => {
        const response = await apiClient.patch(`/admin/reports/${reportId}`, data);
        return response.data.data;
    },

    banUserByReport: async (
        reportId: string,
        data: BanUserData
    ): Promise<{ message: string }> => {
        const response = await apiClient.post(`/admin/reports/${reportId}/ban`, data);
        return response.data.data;
    },

    // Trip Management
    updateTrip: async (tripId: string, data: UpdateTripData): Promise<Trip> => {
        const response = await apiClient.patch(`/admin/trips/${tripId}`, data);
        return response.data.data;
    },

    deleteTrip: async (tripId: string): Promise<{ message: string }> => {
        const response = await apiClient.delete(`/admin/trips/${tripId}`);
        return response.data.data;
    },

    // Global Notifications
    createGlobalNotification: async (
        data: GlobalNotificationData
    ): Promise<{ message: string }> => {
        const response = await apiClient.post('/admin/notifications/global', data);
        return response.data.data;
    },

    // Car Models
    createCarModel: async (data: CreateCarModelData): Promise<CarModel> => {
        const response = await apiClient.post('/admin/car-models', data);
        return response.data.data;
    },
};