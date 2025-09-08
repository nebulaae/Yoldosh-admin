import { SidebarProvider } from "@/components/ui/sidebar";
import { SuperAdminSidebar } from "@/components/shared/SuperAdminSidebar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <SuperAdminSidebar />
            <section>
                {children}
            </section>
        </SidebarProvider>
    );
};