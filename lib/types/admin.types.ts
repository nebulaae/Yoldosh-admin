export interface Admin {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'Admin' | 'SuperAdmin';
    createdAt: string;
    updatedAt: string;
}

export interface AdminLogin {
    email: string;
    password: string;
}

export interface AdminLoginResponse {
    admin: Admin;
    accessToken: string;
}

export interface DriverApplication {
    id: number;
    userId: string;
    status: 'NOT_APPLIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
    passport_link: string;
    car_passport_link: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
    };
}

export interface Report {
    id: string;
    reportingUserId: string;
    reportedUserId: string;
    tripId?: string;
    reason: string;
    description?: string;
    status: 'PENDING' | 'RESOLVED' | 'REJECTED';
    createdAt: string;
    reportingUser: {
        id: string;
        firstName: string;
    };
    reportedUser: {
        id: string;
        firstName: string;
    };
}

export interface AdminLog {
    id: string;
    adminId: string;
    action: string;
    adminName?: string;
    details?: string;
    timestamp: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
    isReverted?: boolean;
    revertedBy?: string;
    revertedAt?: string;
}

export interface Trip {
    id: string;
    driver_id: string;
    car_id: string;
    from_village_id: string;
    to_village_id: string;
    departure_ts: string;
    seats_available: number;
    price_per_person: number;
    max_two_back: boolean;
    status: string;
    comment?: string;
    totalPricePaid?: number;
}

export interface CarModel {
    id: string;
    brand: string;
    model: string;
    year?: number;
}

export interface CreateCarModelData {
    brand: string;
    model: string;
    year?: number;
}

export interface UpdateApplicationStatusData {
    status: 'VERIFIED' | 'REJECTED';
    adminId: string;
}

export interface UpdateReportStatusData {
    status: 'RESOLVED' | 'REJECTED';
}

export interface BanUserData {
    reason: string;
    durationInDays?: number | null;
}

export interface UpdateTripData {
    departure_ts?: string;
    seats_available?: number;
    price_per_person?: number;
    max_two_back?: boolean;
    comment?: string;
}

export interface GlobalNotificationData {
    content: string;
    type: 'GENERAL' | 'TRIPS' | 'BOOKING' | 'PAYMENT' | 'CHAT';
}

export interface CreateAdminData {
    email: string;
    firstName: string;
    lastName: string;
}