import {
    Bell,
    Car,
    CarFront,
    Flag,
    Home,
    LogOut,
    Route
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "../ui/button"

// Menu items.
const items = [
    {
        title: "Главное",
        url: "#",
        icon: Home,
    },
    {
        title: "Заявки водителей",
        url: "#",
        icon: Car,
    },
    {
        title: "Жалобы",
        url: "#",
        icon: Flag,
    },
    {
        title: "Поездки",
        url: "#",
        icon: Route,
    },
    {
        title: "Уведомления",
        url: "#",
        icon: Bell,
    },
    {
        title: "Модели машин",
        url: "#",
        icon: CarFront,
    }
]

export const AdminSidebar = () => {
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