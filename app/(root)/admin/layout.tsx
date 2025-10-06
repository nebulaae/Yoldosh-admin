import { Navbar } from "@/components/shared/Navbar";
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
                <div className="flex-1 flex flex-col">
                    <Navbar />
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </SidebarProvider>
        </AuthGuard>
    );
};