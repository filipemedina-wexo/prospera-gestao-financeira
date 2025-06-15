import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Dashboard } from "@/components/Dashboard";
import { ContasPagar } from "@/components/modules/ContasPagar";
import { ContasReceber } from "@/components/modules/ContasReceber";
import { Caixa } from "@/components/modules/Caixa";
import { Comercial } from "@/components/modules/Comercial";
import { Relatorios } from "@/components/modules/Relatorios";
import { DRE } from "@/components/modules/DRE";
import { ProdutosServicos } from "@/components/modules/ProdutosServicos";
import { Configuracoes } from "@/components/modules/Configuracoes";
import { CRM } from "@/components/modules/CRM";
import { useState } from "react";

const Index = () => {
  const [activeModule, setActiveModule] = useState("dashboard");

  const renderContent = () => {
    switch (activeModule) {
      case "caixa":
        return <Caixa />;
      case "contas-pagar":
        return <ContasPagar />;
      case "contas-receber":
        return <ContasReceber />;
      case "comercial":
        return <Comercial />;
      case "produtos-servicos":
        return <ProdutosServicos />;
      case "relatorios":
        return <Relatorios />;
      case "dre":
        return <DRE />;
      case "configuracoes":
        return <Configuracoes />;
      case "crm":
        return <CRM />;
      default:
        return <Dashboard onNavigate={setActiveModule} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <AppSidebar onMenuChange={setActiveModule} />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <SidebarTrigger />
          </div>
          {renderContent()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
