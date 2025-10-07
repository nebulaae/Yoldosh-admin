import z from "zod";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Admin Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Почта необходима")
    .email("Введите правильную почту")
    .refine(
      (email) => email.endsWith("@yoldosh.uz"),
      "Разрешены только корпоративные почты (@yoldosh.uz)"
    ),
  password: z
    .string()
    .min(1, "Пароль необходим")
    .min(6, "Пароль должен быть хотя бы из 6 символов"),
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
  reportId: z.string().min(1, "Report ID is required"),
  reason: z
    .string()
    .min(10, "Причина бана должна быть не менее 10 символов")
    .max(500, "Причина бана не должна превышать 500 символов"),
  durationInDays: z
    .number()
    .int()
    .positive("Срок должен быть положительным числом")
    .optional()
    .nullable(),
});

// Global Notification Schema
export const globalNotificationSchema = z.object({
  content: z
    .string()
    .min(10, "Сообщение должно быть не менее 10 символов.")
    .max(1000, "Сообщение не должно превышать 1000 символов."),
  type: z.enum(["trips", "newsAndAgreement", "promotionAndDiscounts", "messages", "general"]),
});


// Car Model Schema - CORRECTED
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
    .refine(
      (email) => email.endsWith("@yoldosh.uz"),
      "Only corporate emails are allowed (@yoldosh.uz)"
    ),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must not exceed 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must not exceed 50 characters"),
});

// Promocode Grant Schema
export const promoCodeGrantSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  discountPercentage: z.number().min(1, "Скидка должна быть не менее 1%").max(30, "Скидка не может превышать 30%"),
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
    PENDING: "bg-yellow-200 text-yellow-800",
    VERIFIED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-200/20 text-red-800 dark:bg-red-400/20 dark:text-red-500",
    RESOLVED: "bg-blue-100 text-blue-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    COMPLETED: "bg-gray-100 text-gray-800",
    // Notification Types from enum
    TRIPS: "bg-sky-100 text-sky-800",
    NEWS_AND_AGREEMENT: "bg-indigo-100 text-indigo-800",
    PROMOTION_AND_DISCOUNTS: "bg-purple-100 text-purple-800",
    MESSAGES: "bg-pink-100 text-pink-800",
    GENERAL: "bg-gray-100 text-gray-800",
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
    all: ['admin'] as const,
    profile: () => [...queryKeys.admin.all, 'profile'] as const,
    driverApplications: (filters: any) => [...queryKeys.admin.all, 'driver-applications', filters] as const,
    reports: (filters: any) => [...queryKeys.admin.all, 'reports', filters] as const,
    trips: (filters: any = {}) => [...queryKeys.admin.all, 'trips', filters] as const,
    notifications: (filters: any = {}) => [...queryKeys.admin.all, 'notifications', filters] as const,
    carModels: (filters: any = {}) => [...queryKeys.admin.all, 'car-models', filters] as const,
    restrictedWords: (filters: any = {}) => [...queryKeys.admin.all, 'restricted-words', filters] as const,
    users: (filters: any = {}) => [...queryKeys.admin.all, 'users', filters] as const,
    promoCodes: (filters: any = {}) => [...queryKeys.admin.all, 'promo-codes', filters] as const,
  },
  superAdmin: {
    all: ['super-admin'] as const,
    profile: () => [...queryKeys.superAdmin.all, 'profile'] as const,
    admins: (filters: any) => [...queryKeys.superAdmin.all, 'admins', filters] as const,
    stats: () => [...queryKeys.superAdmin.all, 'stats'] as const,
    logs: (adminId: string, filters: any) => [...queryKeys.superAdmin.all, 'logs', adminId, filters] as const,
  },
} as const;