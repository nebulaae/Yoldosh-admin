"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Image as ImageIcon, Info, Send, ShieldX } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { rejectionSchema } from "@/lib/schemas";
import { formatDate, getStatusColor } from "@/lib/utils";
import { CarApplication } from "@/types";

// Component for displaying a single application card
export const ApplicationCard = ({
  application,
  onApprove,
  onReject,
  isUpdating,
}: {
  application: CarApplication;
  onApprove: (carId: string) => void;
  onReject: (carId: string, reason: string) => void;
  isUpdating: boolean; // To disable buttons during update
}) => {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof rejectionSchema>>({
    resolver: zodResolver(rejectionSchema),
    defaultValues: { reason: "" },
  });

  const handleRejectSubmit = (values: z.infer<typeof rejectionSchema>) => {
    onReject(application.id, values.reason);
    setIsRejectDialogOpen(false); // Close dialog on submit
    form.reset();
  };

  const formatDocUrl = (url?: string) => {
    if (!url) return "https://placehold.co/300x200/EEE/AAA?text=No+Image";
    const baseUrl = "http://localhost:5000";
    return `${baseUrl}${url}`;
  };

  return (
    <Card className="component border hover:border-emerald-500 dark:hover:border-emerald-600 transition rounded-xl shadow-md overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-semibold">
            {application.modelDetails.make} {application.modelDetails.model} ({application.carYear})
          </CardTitle>
          <CardDescription className="font-mono text-xs">{application.license_plate}</CardDescription>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(application.status)}`}
        >
          {application.status}
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Driver Info */}
        <div className="flex items-center gap-2 text-sm">
          <img
            src={
              application.driver.avatar ||
              `https://placehold.co/40x40/000000/FFF?text=${application.driver.firstName[0]}`
            }
            alt="Driver Avatar"
            className="w-6 h-6 rounded-full object-cover"
          />
          <div>
            <p className="font-medium">
              {application.driver.firstName} {application.driver.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{application.driver.phoneNumber}</p>
          </div>
        </div>

        {/* Car Details */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Color: {application.color || "N/A"}</p>
          <p>Tech Passport: {application.tech_passport}</p>
          <time className="text-sm text-muted-foreground">{formatDate(application.createdAt)}</time>
        </div>

        {/* Documents */}
        <div className="flex gap-2 items-center justify-start flex-wrap">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <ImageIcon className="mr-1 h-3 w-3" /> Front Doc
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-0">
              <img
                src={formatDocUrl(application.documentFront)}
                alt="Document Front"
                className="rounded-lg w-full max-h-[80vh] object-contain"
              />
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <ImageIcon className="mr-1 h-3 w-3" /> Back Doc
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md p-0">
              <img
                src={formatDocUrl(application.documentBack)}
                alt="Document Back"
                className="rounded-lg w-full max-h-[80vh] object-contain"
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Rejection Reason */}
        {application.status === "REJECTED" && application.rejectionReason && (
          <div className="text-xs text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-900/20 p-2 rounded-md flex items-start gap-2">
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>Reason: {application.rejectionReason}</span>
          </div>
        )}
      </CardContent>

      {/* Actions only for PENDING status */}
      {application.status === "PENDING" && (
        <CardFooter className="flex justify-end gap-2">
          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-100/50 dark:hover:bg-red-900/30"
                disabled={isUpdating}
              >
                <ShieldX className="mr-1 h-4 w-4" /> Reject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Application</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleRejectSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Rejection</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Explain why the application is being rejected..."
                            {...field}
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="ghost">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" variant="destructive" disabled={form.formState.isSubmitting}>
                      <Send className="mr-1 h-4 w-4" /> Submit Rejection
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Button
            size="sm"
            variant="outline"
            className="text-green-600 border-green-600 hover:bg-green-100/50 dark:hover:bg-green-900/30"
            onClick={() => onApprove(application.id)}
            disabled={isUpdating}
          >
            <Check className="mr-1 h-4 w-4" /> Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
