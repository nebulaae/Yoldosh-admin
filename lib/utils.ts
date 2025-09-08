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
    .min(1, "Email is required")
    .email("Please enter a valid email")
    .refine(
      (email) => email.endsWith("@yoldosh.uz"),
      "Only corporate emails are allowed (@yoldosh.uz)"
    ),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// Application Status Update Schema
export const updateApplicationStatusSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"], "Status is required"),
});

// Report Status Update Schema
export const updateReportStatusSchema = z.object({
  reportId: z.string().min(1, "Report ID is required"),
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"], "Status is required"),
});

// Ban User Schema
export const banUserSchema = z.object({
  reportId: z.string().min(1, "Report ID is required"),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason must not exceed 500 characters"),
  durationInDays: z
    .number()
    .int()
    .positive("Duration must be positive")
    .optional()
    .nullable(),
});

// Global Notification Schema
export const globalNotificationSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(1000, "Content must not exceed 1000 characters"),
  type: z.enum(["PENDING", "VERIFIED", "REJECTED"], "Type is required"),
});

// Trip Edit Schema
export const editTripSchema = z.object({
  tripId: z.string().min(1, "Trip ID is required"),
  departure_ts: z.string().datetime().optional(),
  seats_available: z.number().int().positive().max(8).optional(),
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
  return new Date(dateString).toLocaleDateString("en-US", {
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
    PENDING: "bg-yellow-100 text-yellow-800",
    VERIFIED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    RESOLVED: "bg-blue-100 text-blue-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    COMPLETED: "bg-gray-100 text-gray-800",
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
    driverApplications: () => [...queryKeys.admin.all, 'driver-applications'] as const,
    reports: (params: Record<string, any>) => [...queryKeys.admin.all, 'reports', params] as const,
    trips: () => [...queryKeys.admin.all, 'trips'] as const,
    notifications: () => [...queryKeys.admin.all, 'notifications'] as const,
    carModels: () => [...queryKeys.admin.all, 'car-models'] as const,
  },
  superAdmin: {
    all: ['super-admin'] as const,
    admins: () => [...queryKeys.superAdmin.all, 'admins'] as const,
    stats: () => [...queryKeys.superAdmin.all, 'stats'] as const,
    logs: (adminId: string) => [...queryKeys.superAdmin.all, 'logs', adminId] as const,
  },
} as const;