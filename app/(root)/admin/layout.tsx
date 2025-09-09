import { AuthGuard } from "@/components/shared/AuthGuard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/shared/AdminSidebar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AuthGuard requiredRole="Admin">
            <SidebarProvider>
                <AdminSidebar />
                {children}
            </SidebarProvider>
        </AuthGuard>
    );
};