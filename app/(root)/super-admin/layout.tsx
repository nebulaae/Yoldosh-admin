import { AuthGuard } from "@/components/shared/AuthGuard";
import { Navbar } from "@/components/shared/Navbar";
import { SuperAdminSidebar } from "@/components/shared/SuperAdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard requiredRole="SuperAdmin">
      <SidebarProvider>
        <SuperAdminSidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
