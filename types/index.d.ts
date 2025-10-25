export type CarApplication = {
  id: string; // Car ID
  driver_id: string;
  license_plate: string;
  color?: string;
  carYear: number;
  tech_passport: string;
  documentFront?: string;
  documentBack?: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  driver: {
    // Included driver details
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    avatar?: string;
    role: string;
  };
  modelDetails: {
    // Included model details
    make: string;
    model: string;
  };
};

export type Report = {
  id: string;
  reportingUser: { id: string; firstName: string };
  reportedUser: { id: string; firstName: string };
  reason: string;
  status: "PENDING" | "RESOLVED" | "REJECTED";
  createdAt: string;
};

export type Trip = {
  id: string;
  driver: { firstName: string; lastName: string; phoneNumber: string };
  fromVillage: { nameRu: string };
  toVillage: { nameRu: string };
  departure_ts: string;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatar: string | null;
  role: "Passenger" | "Driver";
  isBanned: boolean;
};

export type Admin = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "Admin" | "SuperAdmin";
  permissions: Partial<Record<(typeof AdminPermission)[keyof typeof AdminPermission], boolean>>;
};
