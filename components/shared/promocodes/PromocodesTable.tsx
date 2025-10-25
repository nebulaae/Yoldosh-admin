"use client";

import { useState } from "react";
import { Ticket, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeletePromoCode, useGetGlobalPromoCodes, useGetUserPromoCodes } from "@/hooks/adminHooks";
import { formatDate, getStatusColor } from "@/lib/utils";

export const PromoCodesTable = ({ type }: { type: "SINGLE_USER" | "GLOBAL" }) => {
  const [promocodeProgress, setPromocodeProgress] = useState();
  const { data: promoCodes, isLoading } = type === "SINGLE_USER" ? useGetUserPromoCodes() : useGetGlobalPromoCodes();
  const { mutate: deletePromoCode, isPending: isDeleting } = useDeletePromoCode();

  return (
    <div className="flex flex-col component border rounded-2xl mt-4 px-6 py-4">
      {isLoading ? (
        <div className="grid-default">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton className="h-8 w-full" key={i} />
          ))}
        </div>
      ) : promoCodes && promoCodes.length > 0 ? (
        <div className="grid-2">
          {promoCodes.map((pc: any) => (
            <div
              className="flex flex-col gap-3 component border hover:border-emerald-500 dark:hover:border-emerald-600 transition rounded-xl p-6"
              key={pc.id}
            >
              {/* Code */}
              <div className="flex flex-row items-center justify-start gap-3">
                <div className="bg-gradient-to-br from-emerald-400 to-teal-700 text-white rounded-xl p-3">
                  <Ticket className="size-7" />
                </div>
                <div>
                  <div className="font-mono font-semibold">{pc.code}</div>
                  {/* Status */}
                  <div>
                    {pc.isActive ? (
                      <span className={`px-3 py-0.5 rounded-full text-xs ${getStatusColor("ACTIVE")}`}>Активен</span>
                    ) : (
                      <span className={getStatusColor("INACTIVE")}>Истек</span>
                    )}
                  </div>
                </div>
              </div>
              {/* Percentage */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Скидка:</span>
                <span className="text-lg font-bold text-emerald-500">{pc.discountPercentage}%</span>
              </div>
              {/* Owner */}
              {type === "SINGLE_USER" && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Владелец:</span>
                  <span className="font-semibold">{pc.user?.firstName || pc.userId.substring(0, 8)}</span>
                </div>
              )}
              {/* Amount of usage */}
              {type === "GLOBAL" && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Осталось:</span>
                  <span className="font-semibold">{pc.useAmount ?? "∞"}</span>
                </div>
              )}
              {/* Expiration date */}
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <span className="text-muted-foreground">Действителен до:</span>
                <time className="font-semibold">{pc.expiresAt ? formatDate(pc.expiresAt) : "Бессрочный"}</time>
              </div>
              <Progress max={100} value={pc.discountPercentage} className="w-full" />
              {/* Delete btn */}
              <div className="text-right">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deletePromoCode(pc.id)}
                  disabled={isDeleting}
                  className="w-full"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center w-full mt-8">
          <span className="subtitle-text">Промокоды не найдены.</span>
        </div>
      )}
    </div>
  );
};
