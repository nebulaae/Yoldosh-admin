"use client";

import { BookUser, Car, FileText, ShieldAlert, Users } from "lucide-react";
import { useTheme } from "next-themes";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSuperAdminProfile, useGetSuperAdminStats } from "@/hooks/superAdminHooks";

export const Home = () => {
  const { theme } = useTheme();
  const { data: superAdmin, isLoading: isAdminLoading, isError: isAdminError } = useGetSuperAdminProfile();
  const { data: stats, isLoading: isStatsLoading, isError: isStatsError } = useGetSuperAdminStats();

  if (isAdminLoading || isStatsLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (isAdminError || !superAdmin || isStatsError || !stats) {
    return <div className="text-red-500">Ошибка загрузки данных. Попробуйте обновить страницу.</div>;
  }

  const chartColor = theme === "dark" ? "#A1A1AA" : "#334155"; // zinc-400 and slate-700
  const barFill = theme === "dark" ? "#22c55e" : "#16a34a"; // green-500 and green-600
  const lineStroke = theme === "dark" ? "#38bdf8" : "#0ea5e9"; // sky-400 and sky-500

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="title-text">
          Добро пожаловать {superAdmin.firstName} {superAdmin.lastName}!
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего Пользователей</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.users.drivers} водителей, {stats.users.passengers} пассажиров
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего Поездок</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trips.total}</div>
            <p className="text-xs text-muted-foreground">{stats.trips.completed} завершено</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего Бронирований</CardTitle>
            <BookUser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookings.total}</div>
            <p className="text-xs text-muted-foreground">Всего активных и завершенных</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего Жалоб</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reports.total}</div>
            <p className="text-xs text-muted-foreground">Требуют рассмотрения</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Заявки Водителей</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.applications.total}</div>
            <p className="text-xs text-muted-foreground">Всего подано заявок</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Рост пользователей (за последний год)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.users.growth}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme === "dark" ? "hsl(var(--border))" : "hsl(var(--border))"}
                />
                <XAxis dataKey="date" stroke={chartColor} />
                <YAxis stroke={chartColor} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "hsl(var(--background))" : "hsl(var(--background))",
                    borderColor: theme === "dark" ? "hsl(var(--border))" : "hsl(var(--border))",
                  }}
                />
                <Bar dataKey="count" fill={barFill} name="Новые пользователи" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Созданные поездки (за последний год)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.trips.growth}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme === "dark" ? "hsl(var(--border))" : "hsl(var(--border))"}
                />
                <XAxis dataKey="date" stroke={chartColor} />
                <YAxis stroke={chartColor} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "hsl(var(--background))" : "hsl(var(--background))",
                    borderColor: theme === "dark" ? "hsl(var(--border))" : "hsl(var(--border))",
                  }}
                />
                <Line type="monotone" dataKey="count" stroke={lineStroke} name="Новые поездки" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
