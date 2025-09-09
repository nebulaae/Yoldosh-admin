import { AuthGuard } from "@/components/shared/AuthGuard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SuperAdminSidebar } from "@/components/shared/SuperAdminSidebar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AuthGuard requiredRole="SuperAdmin">
            <SidebarProvider>
                <SuperAdminSidebar />
                {children}
            </SidebarProvider>
        </AuthGuard>
    );
};