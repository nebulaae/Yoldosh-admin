import { AuthGuard } from "@/components/pages/auth/AuthGuard";
import { AdminSidebar } from "@/components/shared/admin/AdminSidebar";
import { Navbar } from "@/components/shared/admin/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";

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
          <main className="flex-1">{children}</main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
