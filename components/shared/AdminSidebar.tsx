"use client"

import Link from "next/link";

import {
    Bell,
    Car,
    CarFront,
    Flag,
    Home,
    LogOut,
    Route,
    ShieldAlert
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
import { Button } from "../ui/button";

import { usePathname } from "next/navigation";
import { useAdminLogout } from "@/hooks/adminHooks";

// Menu items.
const items = [
    {
        title: "Главное",
        url: "/admin",
        icon: Home,
    },
    {
        title: "Заявки водителей",
        url: "/admin/driver-applications",
        icon: Car,
    },
    {
        title: "Жалобы",
        url: "/admin/reports",
        icon: Flag,
    },
    {
        title: "Поездки",
        url: "/admin/trips",
        icon: Route,
    },
    {
        title: "Уведомления",
        url: "/admin/notifications",
        icon: Bell,
    },
    {
        title: "Модели машин",
        url: "/admin/car-models",
        icon: CarFront,
    },
    {
        title: "Модерация",
        url: "/admin/moderation",
        icon: ShieldAlert,
    }
]

export const AdminSidebar = () => {
    const pathname = usePathname();
    const { mutate: logout, isPending } = useAdminLogout();

    const handleLogout = () => {
        logout();
    }

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup className="h-full">
                    <SidebarGroupLabel>Yoldosh Admin</SidebarGroupLabel>
                    <SidebarGroupContent className="h-full">
                        <SidebarMenu className="flex flex-col justify-between h-full py-4">
                            <div className="space-y-2">
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.url} className={`${pathname === item.url ? 'bg-neutral-200' : ''}`}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </div>
                            <div>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild className="hover:bg-red-200 hover:text-red-800 transition">
                                        <Button onClick={handleLogout} disabled={isPending} className="bg-red-200/50 text-red-800 cursor-pointer">
                                            <LogOut />
                                            {isPending ? "Завершаем сессию..." : "Завершить сессию"}
                                        </Button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </div>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}