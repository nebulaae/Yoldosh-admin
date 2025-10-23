export const queryKeys = {
    admin: {
        all: ["admin"] as const,
        profile: () => [...queryKeys.admin.all, "profile"] as const,
        stats: () => [...queryKeys.admin.all, "stats"] as const,
        // Renamed driverApplications to carApplications
        carApplications: (filters: any = {}) => [...queryKeys.admin.all, "car-applications", filters] as const,
        reports: (filters: any = {}) => [...queryKeys.admin.all, "reports", filters] as const,
        trips: (filters: any = {}) => [...queryKeys.admin.all, "trips", filters] as const,
        tripDetails: (tripId: string) => [...queryKeys.admin.all, "trips", tripId] as const,
        notifications: (filters: any = {}) => [...queryKeys.admin.all, "notifications", filters] as const,
        carModels: (filters: any = {}) => [...queryKeys.admin.all, "car-models", filters] as const,
        restrictedWords: (filters: any = {}) => [...queryKeys.admin.all, "restricted-words", filters] as const,
        users: (filters: any = {}) => [...queryKeys.admin.all, "users", filters] as const,
        userDetails: (userId: string) => [...queryKeys.admin.all, "users", userId] as const,
        searchUsers: (query: string) => [...queryKeys.admin.all, "users", "search", query] as const,
        promoCodes: (type: string) => [...queryKeys.admin.all, "promo-codes", type] as const,
        // Add specific key for banned users if needed
        // bannedUsers: (filters: any = {}) => [...queryKeys.admin.all, "users", "banned", filters] as const,
    },
    superAdmin: {
        all: ["super-admin"] as const,
        profile: () => [...queryKeys.superAdmin.all, "profile"] as const,
        admins: (filters: any = {}) => [...queryKeys.superAdmin.all, "admins", filters] as const,
        stats: () => [...queryKeys.superAdmin.all, "stats"] as const,
        logs: (adminId: string, filters: any = {}) => [...queryKeys.superAdmin.all, "logs", adminId, filters] as const,
    },
    // Add other top-level keys if needed (e.g., 'user', 'public')
} as const;
