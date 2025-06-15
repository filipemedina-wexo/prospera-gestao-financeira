
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
import { Toaster } from "@/components/ui/toaster";
import { Proposta, Vendedor } from "@/components/modules/comercial/types";
import { ContaReceber } from "@/components/modules/contas-receber/types";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const { toast } = useToast();

  const [propostas, setPropostas] = useState<Proposta[]>([
    {
      id: "1",
      titulo: "Proposta Website Empresa ABC",
      cliente: "Empresa ABC Ltda",
      valorTotal: 15800.00,
      dataCriacao: new Date(2024, 5, 10),
      dataValidade: new Date(2024, 6, 10),
      status: "enviada",
      vendedor: "João Silva",
      faturada: false,
      itens: [
        {
          id: "1",
          descricao: "Desenvolvimento Website Responsivo",
          quantidade: 1,
          valorUnitario: 12000.00,
          valorTotal: 12000.00
        },
        {
          id: "2",
          descricao: "Sistema de Gerenciamento de Conteúdo",
          quantidade: 1,
          valorUnitario: 3800.00,
          valorTotal: 3800.00
        }
      ],
      observacoes: "Prazo de entrega: 45 dias úteis"
    },
    {
      id: "2",
      titulo: "Consultoria Marketing Digital",
      cliente: "StartupXYZ",
      valorTotal: 8500.00,
      dataCriacao: new Date(2024, 5, 12),
      dataValidade: new Date(2024, 6, 12),
      status: "aceita",
      vendedor: "Maria Santos",
      faturada: true,
      itens: [
        {
          id: "3",
          descricao: "Auditoria Completa Marketing Digital",
          quantidade: 1,
          valorUnitario: 2500.00,
          valorTotal: 2500.00
        },
        {
          id: "4",
          descricao: "Implementação Estratégia SEO",
          quantidade: 1,
          valorUnitario: 6000.00,
          valorTotal: 6000.00
        }
      ]
    }
  ]);

  const [vendedores] = useState<Vendedor[]>([
    {
      id: "1",
      nome: "João Silva",
      email: "joao@empresa.com",
      percentualComissao: 5.0,
      metaMensal: 50000.00,
      vendasMes: 23800.00,
      comissaoAcumulada: 1190.00
    },
    {
      id: "2",
      nome: "Maria Santos", 
      email: "maria@empresa.com",
      percentualComissao: 6.0,
      metaMensal: 40000.00,
      vendasMes: 45200.00,
      comissaoAcumulada: 2712.00
    }
  ]);

  const [contasAReceber, setContasAReceber] = useState<ContaReceber[]>([
    {
      id: "1",
      descricao: "Cliente XYZ - Projeto Website",
      valor: 5800.00,
      dataVencimento: new Date(2024, 5, 18),
      status: "pendente",
      cliente: "XYZ Ltda",
      categoria: "Vendas de Serviços",
      numeroFatura: "FAT-001"
    },
    {
      id: "2", 
      descricao: "Venda de Produtos - Lote 123",
      valor: 3200.00,
      dataVencimento: new Date(2024, 5, 20),
      status: "recebido",
      cliente: "Cliente ABC",
      categoria: "Vendas de Produtos",
      numeroFatura: "NF-456",
      dataRecebimento: new Date(2024, 5, 19),
      formaRecebimento: "PIX"
    },
    {
      id: "3",
      descricao: "Mensalidade Software - Maio",
      valor: 299.90,
      dataVencimento: new Date(2024, 5, 10),
      status: "atrasado",
      cliente: "Empresa DEF",
      categoria: "Mensalidades",
      numeroFatura: "REC-789"
    },
    {
      id: "prop-2",
      descricao: "Recebimento da Proposta: Consultoria Marketing Digital",
      valor: 8500.00,
      dataVencimento: new Date(2024, 6, 12),
      status: "pendente",
      cliente: "StartupXYZ",
      categoria: "Venda de Projeto",
    }
  ]);

  const handlePropostaAceita = (proposta: Proposta) => {
    const novaConta: ContaReceber = {
      id: `prop-${proposta.id}-${Date.now()}`,
      descricao: `Recebimento da Proposta: ${proposta.titulo}`,
      valor: proposta.valorTotal,
      dataVencimento: proposta.dataValidade,
      status: 'pendente',
      cliente: proposta.cliente,
      categoria: 'Venda de Projeto',
    };

    setContasAReceber(prevContas => [...prevContas, novaConta]);
    toast({
        title: "Sucesso!",
        description: `Conta a Receber para "${proposta.titulo}" foi criada.`,
        className: "bg-green-100 text-green-800",
      });
  };

  const renderContent = () => {
    switch (activeModule) {
      case "caixa":
        return <Caixa />;
      case "contas-pagar":
        return <ContasPagar />;
      case "contas-receber":
        return <ContasReceber contas={contasAReceber} setContas={setContasAReceber} />;
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
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default Index;
