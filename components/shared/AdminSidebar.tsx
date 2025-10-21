"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CarFront,
  CarIcon,
  Flag,
  Home,
  LogOut,
  Route,
  Search,
  ShieldAlert,
  TicketPercent,
  UserRoundCheck,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAdminLogout, useGetAdminProfile } from "@/hooks/adminHooks";
import { Separator } from "../ui/separator";
import { AdminPermission } from "@/lib/utils";

const items = [
  { title: "Главное", url: "/admin", icon: Home },
  { title: "Заявки водителей", url: "/admin/driver-applications", icon: UserRoundCheck, permission: AdminPermission.DRIVER_APPLICATIONS },
  { title: "Жалобы", url: "/admin/reports", icon: Flag, permission: AdminPermission.REPORTS },
  { title: "Поездки", url: "/admin/trips", icon: Route, permission: AdminPermission.TRIPS },
  { title: "Уведомления", url: "/admin/notifications", icon: Bell, permission: AdminPermission.NOTIFICATIONS },
  { title: "Модели машин", url: "/admin/car-models", icon: CarFront, permission: AdminPermission.CAR_MODELS },
  { title: "Промокоды", url: "/admin/promocodes", icon: TicketPercent, permission: AdminPermission.PROMOCODES },
  { title: "Модерация", url: "/admin/moderation", icon: ShieldAlert, permission: AdminPermission.MODERATION },
];

export const AdminSidebar = () => {
  const pathname = usePathname();
  const { mutate: logout, isPending } = useAdminLogout();

  const { data: profile } = useGetAdminProfile();
  const permissions = profile?.permissions ?? {};

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-gray-50 dark:bg-gray-950">
        <SidebarGroup className="h-full">
          <SidebarGroupLabel>
            <div className="flex flex-row items-center justify-center gap-2 mt-6">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-700 text-white rounded-xl p-2">
                <CarIcon className="size-5" />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-lg font-bold text-black dark:text-white">Yoldosh</h1>
                <p>Admin</p>
              </div>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-8 h-full">
            <Separator orientation="horizontal" />
            <SidebarMenu className="flex flex-col h-full py-4">
              <div>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-700 cursor-pointer"
                  >
                    <Link href="/admin/users-search">
                      <button className="flex items-center justify-center py-4 gap-2 w-full">
                        <Search className="ml-2 size-4" />
                        <span>Поиск пользователя</span>
                      </button>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <Separator orientation="horizontal" className="mt-4" />
              </div>

              <div className="mt-2 space-y-1">
                {items.map((item) => {
                  const allowed =
                    !item.permission || permissions[item.permission] === true;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        disabled={!allowed}
                        className={`${allowed
                            ? "hover:bg-emerald-700/40 text-emerald-950 dark:text-emerald-500 dark:hover:bg-gray-50/10 dark:hover:text-white"
                            : "opacity-50 pointer-events-none"
                          }`}
                      >
                        {allowed ? (
                          <Link
                            href={item.url}
                            className={`${pathname === item.url
                                ? "bg-emerald-800/20 text-emerald-900"
                                : "text-emerald-800"
                              } flex items-center gap-2`}
                          >
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-2 px-2">
                            <item.icon />
                            <span>{item.title}</span>
                          </div>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </div>

              <div className="flex justify-center items-end h-full w-full">
                <SidebarMenuItem className="w-full">
                  <SidebarMenuButton
                    asChild
                    className="hover:text-red-800 dark:hover:bg-gray-50/10 dark:hover:text-white transition"
                  >
                    <button onClick={handleLogout} disabled={isPending} className="text-red-500 cursor-pointer">
                      <LogOut />
                      {isPending ? "Завершаем сессию..." : "Завершить сессию"}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};