
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { menuItems } from "@/config/menu";
import { useAuth } from "@/contexts/AuthContext";
import { ClientSelector } from "@/components/ClientSelector";

// Import all module components
import CRM from "@/components/modules/CRM";
import Caixa from "@/components/modules/Caixa";
import ContasPagar from "@/components/modules/ContasPagar";
import ContasReceber from "@/components/modules/ContasReceber";
import DRE from "@/components/modules/DRE";
import Relatorios from "@/components/modules/Relatorios";
import Fornecedores from "@/components/modules/Fornecedores";
import Configuracoes from "@/components/modules/Configuracoes";
import ProdutosServicos from "@/components/modules/ProdutosServicos";
import Comercial from "@/components/modules/Comercial";
import Pessoas from "@/components/modules/Pessoas";
import { UsersManagement } from "@/components/modules/gestao-usuarios";
import { SuperAdminDashboard } from "@/components/modules/gestao-saas";

const Dashboard = () => {
  const { hasPermission } = useAuth();
  const visibleMenuItems = menuItems.filter((item) => hasPermission(item.permission));
  const [activeMenu, setActiveMenu] = useState(
    visibleMenuItems.length > 0 ? visibleMenuItems[0].id : ""
  );

  const renderContent = () => {
    switch (activeMenu) {
      case "crm":
        return <CRM />;
      case "caixa":
        return <Caixa />;
      case "contas-pagar":
        return <ContasPagar />;
      case "contas-receber":
        return <ContasReceber />;
      case "dre":
        return <DRE />;
      case "relatorios":
        return <Relatorios />;
      case "fornecedores":
        return <Fornecedores />;
      case "configuracoes":
        return <Configuracoes />;
      case "produtos-servicos":
        return <ProdutosServicos />;
      case "comercial":
        return <Comercial />;
      case "pessoas":
        return <Pessoas />;
      case "gestao-usuarios":
        return <UsersManagement />;
      case "gestao-saas":
        return <SuperAdminDashboard />;
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Bem-vindo ao Prospera</h1>
            <p className="text-muted-foreground mt-2">
              Selecione um módulo no menu lateral para começar.
            </p>
          </div>
        );
    }
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
