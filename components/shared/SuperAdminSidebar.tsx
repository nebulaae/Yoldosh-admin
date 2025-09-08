import { Home, LogOut, Logs, UserStar } from "lucide-react";

import { Button } from "../ui/button";
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

// Menu items.
const items = [
    {
        title: "Главная",
        url: "#",
        icon: Home,
    },
    {
        title: "Администраторы",
        url: "#",
        icon: UserStar,
    },
    {
        title: "Логи",
        url: "#",
        icon: Logs,
    },
]

export const SuperAdminSidebar = () => {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup className="h-full">
                    <SidebarGroupLabel>Yoldosh Super Admin</SidebarGroupLabel>
                    <SidebarGroupContent className="h-full">
                        <SidebarMenu className="flex flex-col justify-between h-full py-4">
                            <div className="space-y-2">
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <a href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </div>
                            <div>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Button className="bg-red-200/50 text-red-800 cursor-pointer">
                                            <LogOut />
                                            Завершить сессию
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