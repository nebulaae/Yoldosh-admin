"use client";

import Link from "next/link";

import { useState } from "react";
import { Car, Phone, Search, User } from "lucide-react";
import { useDebounceValue } from "usehooks-ts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllUsers } from "@/hooks/adminHooks";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatar: string | null;
  role: "Passenger" | "Driver";
  isBanned: boolean;
};

export const UsersSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounceValue(searchTerm, 500);

  const {
    data: userData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAllUsers({ search: debouncedSearchTerm });

  const users = userData?.pages.flatMap((page) => page.users) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="title-text">Поиск пользователя</h1>
        <p className="subtitle-text">Найдите пользователя и просмотрите всю информацию о нем</p>
      </div>

      <div className="relative w-full max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Поиск по имени, фамилии, номеру телефона..."
          className="pl-10 h-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      )}

      {isError && <p className="text-destructive">Не удалось загрузить пользователей. Попробуйте снова.</p>}

      {!isLoading && users && users.length > 0 && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map((user: User) => (
              <Link href={`/admin/users-search/${user.id}`} key={user.id}>
                <Card className="hover:border-primary transition-colors cursor-pointer dark:bg-slate-900 h-full flex flex-col">
                  <CardHeader className="items-center text-center">
                    <div className="relative">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-10 h-10 text-muted-foreground" />
                        </div>
                      )}
                      {user.isBanned && (
                        <div className="absolute bottom-0 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 text-xs leading-none">
                          Заб.
                        </div>
                      )}
                    </div>
                    <CardTitle>
                      {user.firstName} {user.lastName}
                    </CardTitle>
                    <p className="font-mono text-xs text-muted-foreground">ID: {user.id.substring(0, 8)}</p>
                  </CardHeader>
                  <CardContent className="text-center text-sm text-muted-foreground space-y-2 flex-grow flex flex-col justify-center">
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{user.phoneNumber}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Car className="w-4 h-4" />
                      <span>{user.role === "Driver" ? "Водитель" : "Пассажир"}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!isLoading && users?.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Пользователи не найдены.</p>
        </div>
      )}
    </div>
  );
};
