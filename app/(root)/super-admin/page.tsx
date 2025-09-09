"use client";

import { useGetSuperAdminProfile } from "@/hooks/superAdminHooks";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const { data: data, isLoading } = useGetSuperAdminProfile();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Total Admins</h2>
          {isLoading ? <Skeleton className="h-8 w-1/2 mt-2" /> : <p className="text-3xl font-bold mt-2">{data.role}</p>}
        </div>
        {/* You can add more stats cards here */}
      </div>
    </div>
  );
};

export default Page;
