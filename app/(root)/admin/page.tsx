"use client";

import { useGetAdminProfile } from "@/hooks/adminHooks";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const { data: admin, isLoading, isError } = useGetAdminProfile();

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-6 w-64" />
      </div>
    );
  }

  if (isError || !admin) {
    return (
      <div className="p-8 text-red-500">
        Failed to load admin profile. You might be logged out.
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {admin.firstName} {admin.lastName}!
      </h1>
      <p className="text-gray-600">
        You are logged in as an {admin.role}.
      </p>
      {/* Add more dashboard widgets here */}
    </div>
  );
};

export default Page;
