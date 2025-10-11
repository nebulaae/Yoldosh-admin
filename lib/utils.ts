import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Admin Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Почта необходима")
    .email("Введите правильную почту")
    .refine((email) => email.endsWith("@yoldosh.uz"), "Разрешены только корпоративные почты (@yoldosh.uz)"),
  password: z.string().min(1, "Пароль необходим").min(6, "Пароль должен быть хотя бы из 6 символов"),
});

// Application Status Update Schema
export const updateApplicationStatusSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  status: z.enum(["VERIFIED", "REJECTED"], "Status is required"),
});

// Report Status Update Schema
export const updateReportStatusSchema = z.object({
  reportId: z.string().min(1, "Report ID is required"),
  status: z.enum(["RESOLVED", "REJECTED"], "Status is required"),
});

// Ban User Schema
export const banUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  reason: z
    .string()
    .min(10, "Причина бана должна быть не менее 10 символов")
    .max(500, "Причина бана не должна превышать 500 символов"),
  durationInDays: z.number().int().positive("Срок должен быть положительным числом").optional().nullable(),
});

// Global Notification Schema
export const globalNotificationSchema = z.object({
  content: z.string().min(1, "Содержание обязательно"),
  type: z.enum(["general", "trips", "promotionAndDiscounts", "newsAndAgreement", "messages"]),
  targetAudience: z.enum(["ALL", "DRIVERS", "PASSENGERS"]),
});

// Car Model Schema
export const carModelSchema = z.object({
  make: z.string().min(1, "Производитель обязателен").max(50),
  model: z.string().min(1, "Модель обязательна").max(50),
  seats_std: z.number().min(1, "Минимум 1 место").max(20, "Максимум 20 мест"),
});

// Trip Edit Schema
export const editTripSchema = z.object({
  tripId: z.string().min(1, "Trip ID is required"),
  departure_ts: z.string().optional(),
  seats_available: z.number().int().min(0).max(8).optional(),
  price_per_person: z.number().positive().optional(),
  max_two_back: z.boolean().optional(),
  comment: z.string().max(500).optional(),
});

// Super Admin Create Admin Schema
export const createAdminSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email")
    .refine((email) => email.endsWith("@yoldosh.uz"), "Only corporate emails are allowed (@yoldosh.uz)"),
  firstName: z.string().min(1, "First name is required").max(50, "First name must not exceed 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must not exceed 50 characters"),
});

// Promocode Schemas
export const personalPromoCodeSchema = z.object({
  userId: z.string(),
  discountPercentage: z.number().min(1, "Скидка должна быть не менее 1%").max(100, "Скидка не может превышать 100%"),
  expiresAt: z.date().optional(),
});

export const globalPromoCodeSchema = z.object({
  discountPercentage: z.number().min(1, "Скидка должна быть не менее 1%").max(100, "Скидка не может превышать 100%"),
  useAmount: z.number().min(1, "Количество использований должно быть не менее 1"),
  expiresAt: z.date().optional(),
});

// Utility function to format error messages
export const formatErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return "An unexpected error occurred";
};
// Utility function to format dates
export const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Status color utilities
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-200/20 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400",
    VERIFIED: "bg-green-200/20 text-green-800 dark:bg-green-800/20 dark:text-green-400",
    REJECTED: "bg-red-200/20 text-red-800 dark:bg-red-800/20 dark:text-red-400",
    RESOLVED: "bg-blue-200/20 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400",
    CONFIRMED: "bg-green-200/20 text-green-800 dark:bg-green-800/20 dark:text-green-400",
    CANCELLED: "bg-red-200/20 text-red-800 dark:bg-red-800/20 dark:text-red-400",
    COMPLETED: "bg-green-200/20 text-green-800 dark:bg-green-800/20 dark:text-green-400",
    // Notification Types from enum
    trips: "bg-sky-200/20 text-sky-800 dark:bg-sky-800/20 dark:text-sky-400",
    newsAndAgreement: "bg-indigo-200/20 text-indigo-800 dark:bg-indigo-800/20 dark:text-indigo-400",
    promotionAndDiscounts: "bg-purple-200/20 text-purple-800 dark:bg-purple-800/20 dark:text-purple-400",
    messages: "bg-pink-200/20 text-pink-800 dark:bg-pink-800/20 dark:text-pink-400",
    general: "bg-amber-200/20 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400",
    // Trips
    CREATED: "bg-blue-200/20 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400",
    IN_PROGRESS: "bg-yellow-200/20 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400",
    // Auditory types
    DRIVERS: "bg-blue-200/20 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400",
    PASSENGERS: "bg-red-200/20 text-red-800 dark:bg-red-800/20 dark:text-red-400",
    ALL: "bg-cyan-200/20 text-cyan-800 dark:bg-cyan-800/20 dark:text-cyan-400",
    // Promocodes
    ACTIVE: "bg-emerald-500 text-white",
    INACTIVE: "bg-red-500 text-white"
  };
  return statusColors[status] || "bg-gray-100 text-gray-800";
};

// Role-based access control
export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy: Record<string, number> = {
    Admin: 1,
    SuperAdmin: 2,
  };
  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
};

export const queryKeys = {
  admin: {
    all: ["admin"] as const,
    profile: () => [...queryKeys.admin.all, "profile"] as const,
    stats: () => [...queryKeys.admin.all, "stats"] as const,
    driverApplications: (filters: any) => [...queryKeys.admin.all, "driver-applications", filters] as const,
    reports: (filters: any) => [...queryKeys.admin.all, "reports", filters] as const,
    trips: (filters: any = {}) => [...queryKeys.admin.all, "trips", filters] as const,
    notifications: (filters: any = {}) => [...queryKeys.admin.all, "notifications", filters] as const,
    carModels: (filters: any = {}) => [...queryKeys.admin.all, "car-models", filters] as const,
    restrictedWords: (filters: any = {}) => [...queryKeys.admin.all, "restricted-words", filters] as const,
    users: (filters: any = {}) => [...queryKeys.admin.all, "users", filters] as const,
    userDetails: (userId: string) => [...queryKeys.admin.all, "users", userId] as const,
    searchUsers: (query: string) => [...queryKeys.admin.all, "users", "search", query] as const,
    promoCodes: (type: string) => [...queryKeys.admin.all, "promo-codes", type] as const,
  },
  superAdmin: {
    all: ["super-admin"] as const,
    profile: () => [...queryKeys.superAdmin.all, "profile"] as const,
    admins: (filters: any) => [...queryKeys.superAdmin.all, "admins", filters] as const,
    stats: () => [...queryKeys.superAdmin.all, "stats"] as const,
    logs: (adminId: string, filters: any) => [...queryKeys.superAdmin.all, "logs", adminId, filters] as const,
  },
} as const;
