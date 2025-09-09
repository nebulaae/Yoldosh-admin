"use client"

import { Home, LogOut, Logs, UserStar } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
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
                            <div className="space-y-1 px-2">
                                {items.map((item) => {
                                    const isActive = pathname.startsWith(item.url);
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <Link href={item.url} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                                                <item.icon className="h-5 w-5" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </div>
                            <div className="px-2">
                                <SidebarMenuItem>
                                    <Button onClick={() => logout()} disabled={isPending} variant="ghost" className="w-full justify-start gap-3 text-gray-600 hover:bg-red-50 hover:text-red-600">
                                        <LogOut className="h-5 w-5" />
                                        {isPending ? "Выход..." : "Выйти"}
                                    </Button>
                                </SidebarMenuItem>
                            </div>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}

