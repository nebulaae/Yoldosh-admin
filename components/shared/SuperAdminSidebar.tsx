"use client"

import Link from "next/link";

import {
    Home,
    LogOut,
    Logs,
    UserStar
} from "lucide-react";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
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

import { useAdminLogout } from "@/hooks/adminHooks";

const items = [
    {
        title: "Главная",
        url: "/super-admin",
        icon: Home,
    },
    {
        title: "Администраторы",
        url: "/super-admin/admins",
        icon: UserStar,
    },
    {
        title: "Логи",
        url: "/super-admin/logs",
        icon: Logs,
    },
]

export const SuperAdminSidebar = () => {
    const pathname = usePathname();
    const { mutate: logout, isPending } = useAdminLogout();

    return (
        <Sidebar className="bg-white border-r border-gray-200 shadow-sm fixed h-full">
            <SidebarContent>
                <SidebarGroup className="h-full">
                    <SidebarGroupLabel>Yoldosh Super Admin</SidebarGroupLabel>
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
                            <div className="px-2">
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild className="hover:bg-red-200 hover:text-red-800 transition">
                                        <Button
                                            onClick={() => logout()}
                                            disabled={isPending}
                                            className="bg-red-200/50 text-red-800 cursor-pointer"
                                        >
                                            <LogOut className="h-5 w-5" />
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

