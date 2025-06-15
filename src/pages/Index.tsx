
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Dashboard } from "@/components/Dashboard";
import { ContasPagar as ContasPagarModule } from "@/components/modules/ContasPagar";
import { ContasReceber as ContasReceberModule } from "@/components/modules/ContasReceber";
import { Caixa } from "@/components/modules/Caixa";
import { Comercial } from "@/components/modules/Comercial";
import { Relatorios } from "@/components/modules/Relatorios";
import { DRE } from "@/components/modules/DRE";
import { ProdutosServicos } from "@/components/modules/ProdutosServicos";
import { Configuracoes } from "@/components/modules/Configuracoes";
import { CRM } from "@/components/modules/CRM";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useAppData } from "@/hooks/useAppData";

const Index = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const {
    propostas,
    setPropostas,
    vendedores,
    contasAReceber,
    setContasAReceber,
    contasAPagar,
    setContasAPagar,
    handlePropostaAceita,
  } = useAppData();

  const renderContent = () => {
    switch (activeModule) {
      case "caixa":
        return <Caixa />;
      case "contas-pagar":
        return <ContasPagarModule contas={contasAPagar} setContas={setContasAPagar} />;
      case "contas-receber":
        return <ContasReceberModule contas={contasAReceber} setContas={setContasAReceber} />;
      case "comercial":
        return <Comercial 
          propostas={propostas}
          setPropostas={setPropostas}
          vendedores={vendedores}
          onPropostaAceita={handlePropostaAceita}
        />;
      case "produtos-servicos":
        return <ProdutosServicos />;
      case "relatorios":
        return <Relatorios />;
      case "dre":
        return <DRE contasPagar={contasAPagar} contasReceber={contasAReceber} />;
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
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default Index;
