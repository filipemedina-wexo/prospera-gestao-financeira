import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ContasPagar as ContasPagarModule } from "@/components/modules/ContasPagar";
import { ContasReceber as ContasReceberModule } from "@/components/modules/ContasReceber";
import { Caixa } from "@/components/modules/Caixa";
import { Comercial } from "@/components/modules/Comercial";
import { Fornecedores } from "@/components/modules/Fornecedores";
import { Relatorios } from "@/components/modules/Relatorios";
import { DRE } from "@/components/modules/DRE";
import { ProdutosServicos } from "@/components/modules/ProdutosServicos";
import { Configuracoes } from "@/components/modules/Configuracoes";
import { CRM } from "@/components/modules/CRM";
import { UsersManagement } from "@/components/modules/gestao-usuarios";
import SuperAdminDashboard from "@/components/modules/gestao-saas";
import { Pessoas } from "@/components/modules/Pessoas";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useAppData } from "@/hooks/useAppData";
import { useAuth } from "@/contexts/AuthContext";
import { menuItems } from "@/config/menu";
import { useConfig } from "@/contexts/ConfigContext";
import { useMultiTenant } from "@/contexts/MultiTenantContext";
import QuickChartsSection from "@/components/QuickChartsSection";

const Index = () => {
  const { user, hasPermission } = useAuth();
  const { isSupperAdmin } = useMultiTenant();
  
  const getInitialModule = () => {
    // Garante que o dashboard seja sempre a tela inicial ao carregar
    return "dashboard";
  };
  
  const [activeModule, setActiveModule] = useState(getInitialModule);
  
  // Removemos a gestão de dados financeiros daqui, pois cada módulo agora é independente
  const {
    propostas,
    setPropostas,
    vendedores,
    handlePropostaAceita,
    clients,
    setClients,
    produtosServicos,
    setProdutosServicos,
  } = useAppData();
  const { companyName } = useConfig();
  
  // Mock data para Pessoas (pode ser refatorado no futuro)
  const [funcionarios, setFuncionarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [holerites, setHolerites] = useState([]);
  
  const renderContent = () => {
    switch (activeModule) {
      case "dashboard":
        return <QuickChartsSection />;
      case "caixa":
        return <Caixa />;
      case "contas-pagar":
        return <ContasPagarModule />;
      case "contas-receber":
        return <ContasReceberModule />;
      case "comercial":
        return <Comercial propostas={propostas} setPropostas={setPropostas} vendedores={vendedores} onPropostaAceita={handlePropostaAceita} clients={clients} setClients={setClients} produtosServicos={produtosServicos} />;
      case "fornecedores":
        return <Fornecedores />;
      case "produtos-servicos":
        return <ProdutosServicos produtos={produtosServicos} />;
      case "relatorios":
        return <Relatorios />;
      case "dre":
        return <DRE />;
      case "crm":
        return <CRM clients={clients} setClients={setClients} />;
      case "pessoas":
        return <Pessoas 
          funcionarios={funcionarios} 
          setFuncionarios={setFuncionarios}
          departamentos={departamentos}
          setDepartamentos={setDepartamentos}
          cargos={cargos}
          setCargos={setCargos}
          holerites={holerites}
          setHolerites={setHolerites}
        />;
      case "gestao-usuarios":
        // Passa a prop `isActive` para controlar a busca de dados
        return <UsersManagement isActive={activeModule === 'gestao-usuarios'} />;
      case "gestao-saas":
        return isSupperAdmin ? <SuperAdminDashboard /> : null;
      case "configuracoes":
        return <Configuracoes />;
      default:
        return <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">Você não tem permissão para visualizar nenhum módulo. <br />Por favor, entre em contato com o administrador.</p>
          </div>;
    }
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <AppSidebar onMenuChange={setActiveModule} />
        <main className="flex-1 p-6 overflow-auto">
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div><h1 className="text-xl text-sky-950 text-right font-extrabold">{companyName}</h1></div>
            </div>
          </header>
          {renderContent()}
        </main>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};
export default Index;