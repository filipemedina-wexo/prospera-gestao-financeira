
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
import { Pessoas } from "@/components/modules/Pessoas";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";
import { menuItems } from "@/config/menu";
import { TrendingUp } from "lucide-react";
import { useClient } from "@/contexts/ClientContext";

const Index = () => {
  const {
    hasPermission
  } = useAuth();
  const getInitialModule = () => {
    const visibleItems = menuItems.filter(item => hasPermission(item.permission));
    return visibleItems.length > 0 ? visibleItems[0].id : "";
  };
  const [activeModule, setActiveModule] = useState(getInitialModule);
  const {
    propostas,
    setPropostas,
    vendedores,
    contasAReceber,
    setContasAReceber,
    contasAPagar,
    setContasAPagar,
    handlePropostaAceita,
    clients,
    setClients,
    produtosServicos,
    setProdutosServicos,
    funcionarios,
    setFuncionarios,
    departamentos,
    setDepartamentos,
    cargos,
    setCargos,
  } = useAppData();
  const {
    clientName,
    clientSubtitle
  } = useClient();
  const getModuleTitle = () => {
    if (!activeModule) {
      return "Acesso Restrito";
    }
    const module = menuItems.find(item => item.id === activeModule);
    return module ? module.title : "Dashboard";
  };
  const renderContent = () => {
    switch (activeModule) {
      case "caixa":
        return <Caixa />;
      case "contas-pagar":
        return <ContasPagarModule contas={contasAPagar} setContas={setContasAPagar} />;
      case "contas-receber":
        return <ContasReceberModule contas={contasAReceber} setContas={setContasAReceber} />;
      case "comercial":
        return <Comercial propostas={propostas} setPropostas={setPropostas} vendedores={vendedores} onPropostaAceita={handlePropostaAceita} clients={clients} setClients={setClients} produtosServicos={produtosServicos} />;
      case "produtos-servicos":
        return <ProdutosServicos produtos={produtosServicos} />;
      case "relatorios":
        return <Relatorios />;
      case "dre":
        return <DRE contasPagar={contasAPagar} contasReceber={contasAReceber} />;
      case "configuracoes":
        return <Configuracoes />;
      case "crm":
        return <CRM clients={clients} setClients={setClients} />;
      case "pessoas":
        return <Pessoas funcionarios={funcionarios} setFuncionarios={setFuncionarios} departamentos={departamentos} setDepartamentos={setDepartamentos} cargos={cargos} setCargos={setCargos} />;
      case "dashboard":
        return <Dashboard onNavigate={setActiveModule} contasPagar={contasAPagar} contasReceber={contasAReceber} />;
      default:
        return <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">Você não tem permissão para visualizar nenhum módulo. <br />Por favor, entre em contato com o administrador.</p>
          </div>;
    }
  };
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <AppSidebar onMenuChange={setActiveModule} />
        <main className="flex-1 p-6 overflow-auto">
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              
            </div>
            <div className="hidden md:flex items-center gap-2">
              
              <div>
                <h1 className="text-xl text-sky-950 text-right font-extrabold">{clientName}</h1>
                
              </div>
            </div>
          </header>
          {renderContent()}
        </main>
        <Toaster />
      </div>
    </SidebarProvider>;
};
export default Index;
