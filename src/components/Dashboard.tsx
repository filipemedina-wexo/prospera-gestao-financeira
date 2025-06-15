
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { menuItems } from "@/config/menu";
import { useAuth } from "@/contexts/AuthContext";
import { ClientSelector } from "@/components/ClientSelector";

const Dashboard = () => {
  const { hasPermission } = useAuth();
  const visibleMenuItems = menuItems.filter((item) => hasPermission(item.permission));
  const [activeMenu, setActiveMenu] = useState(
    visibleMenuItems.length > 0 ? visibleMenuItems[0].id : ""
  );

  const renderContent = () => {
    // This is a simplified dashboard that just shows welcome message
    // The actual module rendering with data is handled in Index.tsx
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Bem-vindo ao Prospera</h1>
        <p className="text-muted-foreground mt-2">
          Selecione um módulo no menu lateral para começar.
        </p>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar onMenuChange={setActiveMenu} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex flex-1 items-center justify-between">
              <h1 className="text-lg font-semibold">
                {visibleMenuItems.find(item => item.id === activeMenu)?.title || 'Dashboard'}
              </h1>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4">
            <ClientSelector />
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
