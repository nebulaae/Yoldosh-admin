import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/shared/AdminSidebar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <section>
                {children}
            </section>
        </SidebarProvider>
    );
};