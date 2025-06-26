
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ContasPagar } from "@/components/modules/ContasPagar";
import { ContasReceber } from "@/components/modules/ContasReceber";
import { Caixa } from "@/components/modules/Caixa";
import { Relatorios } from "@/components/modules/Relatorios";
import { Configuracoes } from "@/components/modules/Configuracoes";
import { Fornecedores } from "@/components/modules/Fornecedores";
import { CRM } from "@/components/modules/CRM";
import { Comercial } from "@/components/modules/Comercial";
import { ProdutosServicos } from "@/components/modules/ProdutosServicos";
import { Pessoas } from "@/components/modules/Pessoas";
import { SuperAdminDashboard } from "@/components/modules/gestao-saas/SuperAdminDashboard";
import { DRE } from "@/components/modules/DRE";
import { DashboardPrincipal } from "@/components/modules/DashboardPrincipal";
import { menuItems } from "@/config/menu";
import { useAuth } from "@/contexts/AuthContext";
import { ClientSelector } from "@/components/ClientSelector";
import { AlertsPopup } from "@/components/AlertsPopup";
import { useMultiTenant } from "@/contexts/MultiTenantContext";

const Index = () => {
  const { hasPermission } = useAuth();
  const { isSupperAdmin } = useMultiTenant();
  const visibleMenuItems = menuItems.filter((item) => hasPermission(item.permission));
  const [activeMenu, setActiveMenu] = useState(
    isSupperAdmin ? "gestao-saas" : visibleMenuItems.length > 0 ? visibleMenuItems[0].id : ""
  );

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <DashboardPrincipal />;
      case "contas-pagar":
        return <ContasPagar />;
      case "contas-receber":
        return <ContasReceber />;
      case "caixa":
        return <Caixa />;
      case "relatorios":
        return <Relatorios />;
      case "configuracoes":
        return <Configuracoes />;
      case "fornecedores":
        return <Fornecedores />;
      case "crm":
        return <CRM />;
      case "comercial":
        return <Comercial />;
      case "produtos-servicos":
        return <ProdutosServicos />;
      case "pessoas":
        return <Pessoas />;
      case "gestao-saas":
        return <SuperAdminDashboard />;
      case "dre":
        return <DRE />;
      default:
        return <DashboardPrincipal />;
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
              <ClientSelector />
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4">
            {renderContent()}
          </div>
        </main>
        <AlertsPopup />
      </div>
    </SidebarProvider>
  );
};

export default Index;
