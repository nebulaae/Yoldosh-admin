"use client";

import { useGetDriverApplications, useUpdateApplicationStatus } from "@/hooks/adminHooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getStatusColor } from "@/lib/utils";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const Page = () => {
  const { data, isLoading, isError } = useGetDriverApplications();
  const { mutate: updateStatus, isPending } = useUpdateApplicationStatus();

  const handleStatusUpdate = (userId: string, status: "VERIFIED" | "REJECTED") => {
    updateStatus({ userId, status });
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (isError) {
    toast.error("Failed to load driver applications.");
    return <div className="p-8 text-red-500">Error loading data.</div>
  }

  return (
    <div className="w-full p-8">
      <Toaster richColors />
      <h1 className="text-2xl font-bold mb-4">Driver Applications</h1>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Passport</TableHead>
              <TableHead>Car Passport</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.rows?.length > 0 ? (
              data.rows.map((app: any) => (
                <TableRow key={app.id}>
                  <TableCell>{app.userId}</TableCell>
                  <TableCell><a href={app.passport_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a></TableCell>
                  <TableCell><a href={app.car_passport_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a></TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-100" onClick={() => handleStatusUpdate(app.userId, "VERIFIED")} disabled={isPending}>Approve</Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-100" onClick={() => handleStatusUpdate(app.userId, "REJECTED")} disabled={isPending}>Reject</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No pending applications found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Page;
