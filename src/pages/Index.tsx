
import { useState, useEffect } from "react";
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
import { AlertsPopup } from "@/components/AlertsPopup";
import { useMultiTenant } from "@/contexts/MultiTenantContext";
import { useAppData } from "@/hooks/useAppData";
import { alertsService } from "@/services/alertsService";
import { Alert } from "@/types/alert";
import { Funcionario, Departamento, Cargo, Holerite } from "@/components/modules/pessoas/types";

const Index = () => {
  const { hasPermission } = useAuth();
  const { isSupperAdmin } = useMultiTenant();
  const {
    propostas,
    setPropostas,
    vendedores,
    handlePropostaAceita,
    clients,
    setClients,
    produtosServicos,
  } = useAppData();

  const visibleMenuItems = menuItems.filter((item) => hasPermission(item.permission));
  const [activeMenu, setActiveMenu] = useState(
    isSupperAdmin ? "admin-saas" : visibleMenuItems.length > 0 ? visibleMenuItems[0].id : ""
  );

  // Alerts popup state
  const [showAlertsPopup, setShowAlertsPopup] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Mock data for Pessoas module
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [holerites, setHolerites] = useState<Holerite[]>([]);

  // Load alerts
  useEffect(() => {
    const loadAlerts = async () => {
      const alertsData = await alertsService.getAll();
      setAlerts(alertsData);
      if (alertsData.length > 0) {
        setShowAlertsPopup(true);
      }
    };

    loadAlerts();
  }, []);

  const handleAlertResolve = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, resolved: true } : alert
    ));
  };

  const handleViewAlertDetails = (alert: Alert) => {
    if (alert.category === 'contas-pagar') {
      setActiveMenu('contas-pagar');
    } else if (alert.category === 'contas-receber') {
      setActiveMenu('contas-receber');
    }
    setShowAlertsPopup(false);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <DashboardPrincipal onAlertsClick={() => setShowAlertsPopup(true)} />;
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
        return <CRM clients={clients} setClients={setClients} />;
      case "comercial":
        return (
          <Comercial 
            propostas={propostas}
            setPropostas={setPropostas}
            vendedores={vendedores}
            onPropostaAceita={handlePropostaAceita}
            clients={clients}
            setClients={setClients}
            produtosServicos={produtosServicos}
          />
        );
      case "produtos-servicos":
        return <ProdutosServicos produtos={produtosServicos} />;
      case "pessoas":
        return (
          <Pessoas 
            funcionarios={funcionarios}
            setFuncionarios={setFuncionarios}
            departamentos={departamentos}
            setDepartamentos={setDepartamentos}
            cargos={cargos}
            setCargos={setCargos}
            holerites={holerites}
            setHolerites={setHolerites}
          />
        );
      case "admin-saas":
        return <SuperAdminDashboard />;
      case "dre":
        return <DRE />;
      default:
        return <DashboardPrincipal onAlertsClick={() => setShowAlertsPopup(true)} />;
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
            {renderContent()}
          </div>
        </main>
        <AlertsPopup 
          open={showAlertsPopup}
          alerts={alerts}
          onClose={() => setShowAlertsPopup(false)}
          onResolve={handleAlertResolve}
          onViewDetails={handleViewAlertDetails}
        />
      </div>
    </SidebarProvider>
  );
};

export default Index;
